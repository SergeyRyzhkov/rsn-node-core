import { logger } from "@/utils/Logger";
import { BaseService } from "../../BaseService";
import bcrypt from "bcryptjs";
import { InternalServerError } from "@/exceptions/serverErrors/InternalServerError";
import { AuthResult } from "./AuthResult";
import { AppUserSessionService } from "../user/AppUserSessionService";
import { AppUserService } from "../user/AppUserService";
import { JWTHelper } from "../JWTHelper";
import { SessionUser } from "../../../models/security/SessionUser";
import { InvalidTokenException } from "@/exceptions/authErrors/InvalidTokenException";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { AppUserSession } from "@/models/security/AppUserSession";
import { UserSessionExpiredException } from "@/exceptions/authErrors/UserSessionExpiredException";
import { AuthOptions } from "./AuthOptions";
import { AppUser } from "@/models/security/AppUser";
import { ServiceRegistry } from "@/ServiceRegistry";
import { Unauthorized } from "@/exceptions/authErrors/Unauthorized";
import { ConfigManager } from "@/ConfigManager";
import { SecurityConfig } from "../SecurityConfig";

// FIXME: Поле для подтвержденного кода логина - и использовать это в this.isUserAuthorized
export class AuthService extends BaseService {
    private options: AuthOptions;

    constructor(options?: AuthOptions) {
        super();
        this.options = options || ConfigManager.instance.getOptionsAsClass(SecurityConfig, "SecurityConfig")?.authOptions;
        this.options = this.options || new AuthOptions();
    }

    // Вход по логину и паролю (логин или логин, или телефон, определяектся в настрйоках)
    public async loginByPassword(login: string, password: string, unlinkedSocialProfile: SessionUser): Promise<AuthResult> {
        let sessionUser = null;
        const logonResult: AuthResult = new AuthResult();

        try {
            const user = await ServiceRegistry.instance.getService(AppUserService).getByLogin(login);

            // Нет такого пользователя (с логином)
            if (!user) {
                return logonResult.makeFailed(this.options.failedMessage);
            }

            // Проверяем пароль
            if (!bcrypt.compareSync(password, user.appUserPwdHash)) {
                return logonResult.makeFailed(this.options.failedMessage);
            }

            // Пароль верный (и не вывалилсь в exception)
            // Проверим на блокировку
            if (user.appUserBlockedInd === 1) {
                return logonResult.makeBlocked(this.options.userBlockedMessage);
            }

            // FIXME: Нужны свой поля для признка подтверждения логина. И не корректно, так как если не подтвердил, и еще раз захожу - то здесь будет отлуп, так как ниже будет 0 выставлен
            // Проверим подтверждение регистрации
            // if (user.appUserRegVerifiedInd !== 1) {
            //   return logonResult.makeRegistrationNotConfirmed(this.options.requireRegistrationConfirmationMessage);
            // }

            // Если на клиенте был авторизованный профиль соц.сети - линкуем
            if (!!unlinkedSocialProfile && unlinkedSocialProfile.userSnProfileId > 0) {
                unlinkedSocialProfile.appUserId = user.appUserId;
                const userSocProfile = await ServiceRegistry.instance
                    .getService(AppUserService)
                    .linkSessionUserToSocialNetwork(unlinkedSocialProfile.userSnProfileType, unlinkedSocialProfile);
                if (userSocProfile) {
                    sessionUser = ServiceRegistry.instance
                        .getService(AppUserService)
                        .convertAppUserSocialNetProfileToSessionUser(userSocProfile);
                    sessionUser.appUserRegVerifiedInd = user.appUserRegVerifiedInd;
                    sessionUser.appUserRegDate = user.appUserRegDate;
                }
            }

            // Если не было свзяи с соц.сетью, сессионого пользоваиеля сделаем из регистрации
            if (!sessionUser) {
                sessionUser = ServiceRegistry.instance.getService(AppUserService).convertAppUserToSessionUser(user);
            }

            // Все нормально (пароль валидный).
            logonResult.newAccessToken = await ServiceRegistry.instance
                .getService(AppUserSessionService)
                .saveUserSessionAndCreateJwt(sessionUser);

            // Требуется подтверждение по SMS
            if (this.options.isRequireConfirmationBySms) {
                // FIXME: Нужны свой поля для признка подтверждения логина
                user.appUserRegVerifiedInd = 0;
                user.appUserRegDate = new Date(Date.now()).toUTCString();
                await ServiceRegistry.instance.getService(AppUserService).save(user);

                this.sendSmsConfirmRegistrationMessage(user);
                return logonResult.makeRequereConfirmBySmsCode(sessionUser, this.options.requireSmsConfirmationMessage);
            }

            return logonResult.makeOK(sessionUser, this.options.authOkMessage);
        } catch (err) {
            if (err && err.includes && err.includes("BCrypt")) {
                return logonResult.makeFailed(this.options.failedMessage);
            } else {
                logonResult.makeError(new InternalServerError(err.message, err));
                logonResult.message = this.options.errorMessage;
                logger.error(err);
                return logonResult;
            }
        } finally {
            return logonResult;
        }
    }

    // Смена пароля
    public async changePassword(userId: number, newPassword: string) {
        const result: AuthResult = new AuthResult();

        // FIXME: Implement this
        // if (!isPasswordStrenght(password)) {
        //     return registrationResult.makeInvalid(this.options.passwordNotStrenghtMessage);
        // }

        try {
            const user = await ServiceRegistry.instance.getService(AppUserService).getById(userId);
            if (!!user) {
                // Проверим подтверждение регистрации
                if (user.appUserRegVerifiedInd !== 1) {
                    return result.makeRegistrationNotConfirmed(this.options.requireRegistrationConfirmationMessage);
                }

                user.appUserPwdHash = bcrypt.hashSync(
                    newPassword,
                    ConfigManager.instance.getOptionsAsClass(SecurityConfig, "SecurityConfig").registrationOptions
                        .bcryptSaltRounds
                );
                await ServiceRegistry.instance.getService(AppUserService).save(user);

                const sessionUser = ServiceRegistry.instance.getService(AppUserService).convertAppUserToSessionUser(user);
                result.newAccessToken = await ServiceRegistry.instance
                    .getService(AppUserSessionService)
                    .saveUserSessionAndCreateJwt(sessionUser);
                result.makePasswordChanged(sessionUser);
            } else {
                result.makeFailed();
            }
        } catch (err) {
            result.makeError(err);
        } finally {
            return result;
        }
    }

    /// -------------------------------------------------------------------------------------------------

    // public async loginBySocialNetwork (authStrategyType: string, profile: any, done: (logonResult: AuthResult | string, user: unknown) => void) {
    //   const logonResult: AuthResult = new AuthResult();
    //   logonResult.makeUnknownResult();

    //   let socialNetworkName = null;
    //   let appUser = null;
    //   let sessionUser = SessionUser.anonymousUser;

    //   try {
    //     if (!profile || !profile.id) {
    //       logonResult.makeFailedResult();
    //     }

    //     if (logonResult.logonStatus === LogonStatus.Unknown) {
    //       // Есть ли у нас такой провайдер
    //       socialNetworkName = PassportProviders.getProviderNameByAuthType(authStrategyType);
    //       if (!socialNetworkName) {
    //         logonResult.makeFailedResult();
    //       }
    //     }

    //     if (logonResult.logonStatus === LogonStatus.Unknown) {
    //       // Ищем пользователя по идентификатору профиля
    //       sessionUser = await ServiceRegistry.instance.getService(AppUserService).getSessionUserByProfileCode(authStrategyType, profile.id);
    //       if (sessionUser && sessionUser.appUserId !== 0) {
    //         appUser = await ServiceRegistry.instance.getService(AppUserService).getByLogin(sessionUser.appUserName);
    //       }
    //     }

    //     // Профиля в базе нет, но аутентификация через соцсеть прошла
    //     // Есть почта в профиле?
    //     if (logonResult.logonStatus === LogonStatus.Unknown && !appUser) {
    //       const tryEmail = profile.email ? profile.email : (profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null);
    //       if (tryEmail) {
    //         appUser = await ServiceRegistry.instance.getService(AppUserService).getByLogin(tryEmail);
    //       }
    //     }

    //     // Есть пользователе с почтой или ранее профиль был связан - проверяем блокировку
    //     if (logonResult.logonStatus === LogonStatus.Unknown && appUser) {

    //       // FIXME: Вынести в отдельный метод проверку блокировки, подтверждения регистрации и т.д.
    //       // Если блокирован
    //       if (logonResult.logonStatus === LogonStatus.Unknown && appUser.appUserBlockedInd === 1) {
    //         logonResult.makeBlockedResult(this.options.userBlockedMessage);
    //       }
    //     }

    //     // Профиля в базе нет, Почты нет или не нашли в базе, но аутентификация через соц сеть прошла
    //     if (logonResult.logonStatus === LogonStatus.Unknown && !appUser && socialNetworkName) {
    //       sessionUser = ServiceRegistry.instance.getService(AppUserService).convertProfileToSessionUser(authStrategyType, profile)
    //       logonResult.makeUserNotFoundButSocialNetworkAuthOk(sessionUser);
    //       logonResult.message = this.options.userNotFoundButSocialNetworkAuthOkMessage + socialNetworkName;
    //     }

    //     // Есть пользователе с почтой или ранее профиль был связан, линкуем или обновляем профиль
    //     if (logonResult.logonStatus === LogonStatus.Unknown && appUser) {
    //       const userSocProfile = await ServiceRegistry.instance.getService(AppUserService).linkToSocialNetwork(appUser.appUserId, authStrategyType, profile);
    //       if (userSocProfile) {
    //         sessionUser = ServiceRegistry.instance.getService(AppUserService).convertAppUserSocialNetProfileToSessionUser(userSocProfile);
    //         sessionUser.appUserRegVerifiedInd = appUser.appUserRegVerifiedInd;
    //         sessionUser.appUserRegDate = appUser.appUserRegDate;
    //         logonResult.makeOKResult(sessionUser, this.options.authOkMessage);
    //       }
    //     }

    //   } catch (err) {
    //     logonResult.makeErrorResult(new InternalServerError(err.message, err));
    //     logger.error(err);
    //   } finally {
    //     done(logonResult, null)
    //   }
    // }

    public async confirmLoginByCode(code: number, appUserId: number) {
        const result: AuthResult = new AuthResult();

        try {
            const user = await ServiceRegistry.instance.getService(AppUserService).getById(appUserId);

            // FIXME:
            // Проверим подтверждение регистрации
            // if (!!user && user.appUserRegVerifiedInd !== 1) {
            // return result.makeRegistrationNotConfirmed(this.options.requireRegistrationConfirmationMessage);
            // }

            // FIXME: После правки в БД, проверить на истечение время жизни кода
            if (!!user && user.appUserSmsCode === code) {
                // FIXME: Переименовать это поле - appUserRegVerifiedInd Это проверка кода только для регистрации
                user.appUserRegVerifiedInd = 1;
                user.appUserRegToken = null;
                user.appUserSmsCode = null;
                await ServiceRegistry.instance.getService(AppUserService).save(user);

                // Все нормально
                const sessionUser = ServiceRegistry.instance.getService(AppUserService).convertAppUserToSessionUser(user);
                result.newAccessToken = await ServiceRegistry.instance
                    .getService(AppUserSessionService)
                    .saveUserSessionAndCreateJwt(sessionUser);
                result.makeOK(sessionUser, this.options.authOkMessage);
            } else {
                result.makeFailed(this.options.invalidConfirmationCodeMessage);
            }
        } catch (err) {
            logger.error(err);
            result.makeFailed(this.options.invalidConfirmationCodeMessage);
        } finally {
            return result;
        }
    }

    public async logout(appUserId: number) {
        return ServiceRegistry.instance.getService(AppUserSessionService).deleteAllByUser(appUserId);
    }

    // Используется в мидлваре при каждом запросе для проверки и\или обновления токена
    public async verifyUpdateAccessToken(accessToken: string) {
        if (!accessToken) {
            throw new InvalidTokenException("Invalid access token");
        }
        try {
            // Токен валидный и не истекло время жизни
            JWTHelper.verifyAccessToken(accessToken);
            return accessToken;
        } catch (error) {
            // В JWT нет рефрешь-токена (id сессии)
            const sessionToken = JWTHelper.getJwtId(accessToken);
            if (!sessionToken) {
                throw new InvalidTokenException("Invalid refresh token");
            }

            // Нет в JWT юзвера (или невалидный paload) или анонимус
            const tokenUser = JWTHelper.getTokenUser(accessToken);
            if (!tokenUser || tokenUser.appUserId === 0) {
                throw new InvalidTokenException("Invalid JWT token");
            }

            // Пользователеь заблокирован
            if (tokenUser.appUserBlockedInd) {
                throw new Unauthorized("User blocked");
            }

            // FIXME: Учесть время подтверждения по SMS
            // Если не подтвержден email
            // if (session.appUserId > 0 && session.appUserRegVerifiedInd !== 1 && ((Date.now() - Date.parse(session.appUserRegDate)) > AppConfig.authConfig.emailVerify.options.expiresIn * 1000)) {
            //   ServiceRegistry.instance.getService(AppUserService).delete(session.appUserId);
            //   throw new Unauthorized('Registration is not verified');
            // }

            // Нет сессии (истекла и удалена, или юзверь вышел)
            const session: AppUserSession = await ServiceRegistry.instance
                .getService(AppUserSessionService)
                .getByToken(sessionToken);
            if (!session) {
                throw new UserSessionExpiredException("Session not found: sessionToken = " + sessionToken);
            }

            // Истекло время жизни сессии (рефреш токена)
            if (ServiceRegistry.instance.getService(AppUserSessionService).isExpired(session)) {
                ServiceRegistry.instance.getService(AppUserSessionService).deleteAllByUser(sessionToken);
                throw new UserSessionExpiredException("Session is expired: sessionToken = " + sessionToken);
            }

            // Все проверки проши и истекло время жизни Access токена - увеличиваем дату окончания сессии и меняем id сессии (рефреш токен)
            if (error instanceof TokenExpiredError) {
                const newSession = await ServiceRegistry.instance.getService(AppUserSessionService).refreshSession(session);
                return JWTHelper.createAndSignJwt(tokenUser, newSession.userSessionToken);
            }

            // Ошибка в токене в принципе (невалидна подпись и т.д.)
            if (error instanceof JsonWebTokenError) {
                throw new InvalidTokenException("Invalid access token: sessionToken = " + sessionToken);
            }

            logger.error("verifyUpdateAccessToken - дошли вниз: sessionToken = " + sessionToken);

            // Выше не вернули токен новый, значит что-то не так, чистим все сессии пользователя
            ServiceRegistry.instance.getService(AppUserSessionService).deleteAllByUser(session.appUserId);
            throw new Unauthorized(error);
        }
    }

    public isUserAuthorized(sessionUser: SessionUser) {
        return !!sessionUser && sessionUser.appUserId > 0 && sessionUser.appUserRegVerifiedInd === 1;
    }

    // Юзверь залогинился, но еще не подтвердил регистрацию кодом или логин кодом
    public isUserTemporaryAuthorized(sessionUser: SessionUser) {
        return !!sessionUser && sessionUser.appUserId > 0;
    }

    // Отправка смс - для подтверждения входа
    // FIXME: Также сделать проверку кода по почте
    private async sendSmsConfirmRegistrationMessage(user: AppUser) {
        user.appUserSmsCode = 1;
        return await ServiceRegistry.instance.getService(AppUserService).save(user);
    }
}
