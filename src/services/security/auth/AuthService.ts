import { logger } from '@/utils/Logger';
import { BaseService } from '../../BaseService';
import bcrypt from 'bcrypt';
import { InternalServerError } from '@/exceptions/serverErrors/InternalServerError';
import { AuthResult, LogonStatus } from './AuthResult';
import { PassportProviders } from '../PassportProviders';
import { AppUserSessionService } from '../user/AppUserSessionService';
import { AppUserService } from '../user/AppUserService';
import { JWTHelper } from '../JWTHelper';
import { SessionUser } from '../../../models/security/SessionUser';
import { InvalidTokenException } from '@/exceptions/authErrors/InvalidTokenException';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { AppUserSession } from '@/models/security/AppUserSession';
import { UserSessionExpiredException } from '@/exceptions/authErrors/UserSessionExpiredException';
import { AppConfig } from '@/utils/Config';
import { AuthOptions } from './AuthOptions';
import { AppUser } from '@/models/security/AppUser';
import { TwoFactorVerifier } from '../TwoFactorVerifier';
import { ServiceRegistry } from '@/ServiceRegistry';
import { Unauthorized } from '@/exceptions/authErrors/Unauthorized';

// FIXME: Проверять подтверждена ли регистрация
// FIXME: Поле для подтвержденного кода логина - и использовать это в this.isUserAuthorized
export class AuthService extends BaseService {

  private options: AuthOptions;
  private twoFactorVerifier: TwoFactorVerifier = new TwoFactorVerifier();

  constructor(options?: AuthOptions) {
    super();
    this.options = !!options ? options : new AuthOptions();
  }

  // Вход по логину и паролю (логин или логин, или телефон, определяектся в настрйоках)
  public async loginByPassword (login: string, password: string, unlinkedSocialProfile: SessionUser): Promise<AuthResult> {
    let sessionUser = null;
    const logonResult: AuthResult = new AuthResult();
    logonResult.makeUnknownResult();

    try {

      const user = await ServiceRegistry.instance.getService(AppUserService).getByLogin(login);

      // Нет такого пользователя (с логином)
      if (!user) {
        return logonResult.makeFailedResult(this.options.failedMessage);
      }

      // Проверяем пароль
      if (bcrypt.compareSync(password, user.appUserPwdHash)) {
        // Пароль верный (и не вывалилсь в exception)
        // Проверим на блокировку
        if (user.appUserBlockedInd === 1) {
          return logonResult.makeBlockedResult(this.options.userBlockedMessage);
        }

        // Если на клиенте был авторизованный профиль соц.сети - линкуем
        if (!!unlinkedSocialProfile && unlinkedSocialProfile.userSnProfileId > 0) {
          unlinkedSocialProfile.appUserId = user.appUserId;
          const userSocProfile = await ServiceRegistry.instance.getService(AppUserService).linkSessionUserToSocialNetwork(unlinkedSocialProfile.userSnProfileType, unlinkedSocialProfile);
          if (userSocProfile) {
            sessionUser = ServiceRegistry.instance.getService(AppUserService).convertAppUserSocialNetProfileToSessionUser(userSocProfile);
            sessionUser.appUserRegVerifiedInd = user.appUserRegVerifiedInd;
            sessionUser.appUserRegDate = user.appUserRegDate;

          }
        }

        // Если не было свзяи с соц.сетью, сессионого пользоваиеля сделаем из регистрации
        if (!sessionUser) {
          sessionUser = ServiceRegistry.instance.getService(AppUserService).convertAppUserToSessionUser(user);
        }

        // Все нормально (пароль валидный).
        logonResult.newAccessToken = await ServiceRegistry.instance.getService(AppUserSessionService).saveUserSessionAndCreateJwt(sessionUser);

        // Требуется подтверждение по SMS
        if (this.options.isRequireConfirmationBySms) {
          // FIXME: Нужны свой поля для признка подтверждения логина
          user.appUserRegVerifiedInd = 0;
          user.appUserRegDate = new Date(Date.now()).toUTCString();
          await ServiceRegistry.instance.getService(AppUserService).save(user);

          this.sendSmsConfirmRegistrationMessage(user);
          return logonResult.makeRequereConfirmBySmsCode(sessionUser, this.options.requireSmsConfirmationMessage);
        }

        return logonResult.makeOKResult(sessionUser, this.options.authOkMessage);
      } else {
        return logonResult.makeFailedResult(this.options.failedMessage);
      }
    } catch (err) {
      if (err && err.includes && err.includes('BCrypt')) {
        return logonResult.makeFailedResult(this.options.failedMessage);
      } else {
        logonResult.makeErrorResult(new InternalServerError(err.message, err));
        logonResult.message = this.options.errorMessage;
        logger.error(err);
        return logonResult;
      }
    }
  }


  /// -------------------------------------------------------------------------------------------------

  public async loginBySocialNetwork (authStrategyType: string, profile: any, done: (logonResult: AuthResult | string, user: unknown) => void) {
    const logonResult: AuthResult = new AuthResult();
    logonResult.makeUnknownResult();

    let socialNetworkName = null;
    let appUser = null;
    let sessionUser = SessionUser.anonymousUser;

    try {
      if (!profile || !profile.id) {
        logonResult.makeFailedResult();
      }

      if (logonResult.logonStatus === LogonStatus.Unknown) {
        // Есть ли у нас такой провайдер
        socialNetworkName = PassportProviders.getProviderNameByAuthType(authStrategyType);
        if (!socialNetworkName) {
          logonResult.makeFailedResult();
        }
      }

      if (logonResult.logonStatus === LogonStatus.Unknown) {
        // Ищем пользователя по идентификатору профиля
        sessionUser = await ServiceRegistry.instance.getService(AppUserService).getSessionUserByProfileCode(authStrategyType, profile.id);
        if (sessionUser && sessionUser.appUserId !== 0) {
          appUser = await ServiceRegistry.instance.getService(AppUserService).getByLogin(sessionUser.appUserName);
        }
      }

      // Профиля в базе нет, но аутентификация через соцсеть прошла
      // Есть почта в профиле?
      if (logonResult.logonStatus === LogonStatus.Unknown && !appUser) {
        const tryEmail = profile.email ? profile.email : (profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null);
        if (tryEmail) {
          appUser = await ServiceRegistry.instance.getService(AppUserService).getByLogin(tryEmail);
        }
      }

      // Есть пользователе с почтой или ранее профиль был связан - проверяем блокировку
      if (logonResult.logonStatus === LogonStatus.Unknown && appUser) {

        // FIXME: Вынести в отдельный метод проверку блокировки, подтверждения регистрации и т.д.
        // Если блокирован
        if (logonResult.logonStatus === LogonStatus.Unknown && appUser.appUserBlockedInd === 1) {
          logonResult.makeBlockedResult(this.options.userBlockedMessage);
        }
      }

      // Профиля в базе нет, Почты нет или не нашли в базе, но аутентификация через соц сеть прошла
      if (logonResult.logonStatus === LogonStatus.Unknown && !appUser && socialNetworkName) {
        sessionUser = ServiceRegistry.instance.getService(AppUserService).convertProfileToSessionUser(authStrategyType, profile)
        logonResult.makeUserNotFoundButSocialNetworkAuthOk(sessionUser);
        logonResult.message = this.options.userNotFoundButSocialNetworkAuthOkMessage + socialNetworkName;
      }

      // Есть пользователе с почтой или ранее профиль был связан, линкуем или обновляем профиль
      if (logonResult.logonStatus === LogonStatus.Unknown && appUser) {
        const userSocProfile = await ServiceRegistry.instance.getService(AppUserService).linkToSocialNetwork(appUser.appUserId, authStrategyType, profile);
        if (userSocProfile) {
          sessionUser = ServiceRegistry.instance.getService(AppUserService).convertAppUserSocialNetProfileToSessionUser(userSocProfile);
          sessionUser.appUserRegVerifiedInd = appUser.appUserRegVerifiedInd;
          sessionUser.appUserRegDate = appUser.appUserRegDate;
          logonResult.makeOKResult(sessionUser, this.options.authOkMessage);
        }
      }

    } catch (err) {
      logonResult.makeErrorResult(new InternalServerError(err.message, err));
      logger.error(err);
    } finally {
      done(logonResult, null)
    }
  }


  public async confirmLoginByCode (code: number, sessionUser: SessionUser) {
    const result: AuthResult = new AuthResult();
    const user = await this.twoFactorVerifier.verifyByCode(code, sessionUser.appUserId);

    try {
      if (!!user) {
        // FIXME: Переименовать это поле - appUserRegVerifiedInd Это проверка кода не только для регистрации
        user.appUserRegVerifiedInd = 1;
        user.appUserRegToken = null;
        user.appUserSmsCode = null;
        await ServiceRegistry.instance.getService(AppUserService).save(user);

        const sessionUser = ServiceRegistry.instance.getService(AppUserService).convertAppUserToSessionUser(user);
        result.makeOKResult(sessionUser, this.options.authOkMessage);
      } else {
        result.makeFailedResult(this.options.invalidConfirmationCodeMessage);
      }
    } catch (err) {
      logger.error(err);
      result.makeFailedResult(this.options.invalidConfirmationCodeMessage);
    } finally {
      return result;
    }
  }

  public async logout (sessionToken: string) {
    return ServiceRegistry.instance.getService(AppUserSessionService).delete(sessionToken);
  }

  public async logoutFromAll (appUserId: number) {
    return ServiceRegistry.instance.getService(AppUserSessionService).deleteAllByUser(appUserId)
  }

  // Используется в мидлваре при каждом запросе для проверки или обновления токена
  public async verifyUpdateAccessToken (accessToken: string) {
    if (!accessToken) {
      throw new InvalidTokenException('Invalid access token');
    }
    try {
      // Токен валидный и не истекло время жизни
      JWTHelper.verifyAccessToken(accessToken);
      return accessToken;
    } catch (error) {
      const sessionToken = JWTHelper.getJwtId(accessToken);
      const session: AppUserSession = await ServiceRegistry.instance.getService(AppUserSessionService).getByToken(sessionToken);

      // Истекло время жизни Access токена
      if (error instanceof TokenExpiredError) {
        const tokenUser = JWTHelper.getTokenUser(accessToken);
        if (!tokenUser) {
          throw new InvalidTokenException('Invalid access token payload');
        }

        // Если сессия не акутальна (протухла) или ее нет - на авторизацию
        if (!session) {
          ServiceRegistry.instance.getService(AppUserSessionService).delete(sessionToken);
          throw new UserSessionExpiredException('Session not found');
        }

        if (ServiceRegistry.instance.getService(AppUserSessionService).isExpired(session)) {
          ServiceRegistry.instance.getService(AppUserSessionService).delete(sessionToken);
          throw new UserSessionExpiredException('Session is expired');
        }

        // FIXME: Учесть время подтверждения по SMS и другой Exception
        // Если не подтвержден email
        if (session.appUserId > 0 && session.appUserRegVerifiedInd !== 1 && ((Date.now() - Date.parse(session.appUserRegDate)) > AppConfig.authConfig.emailVerify.options.expiresIn * 1000)) {
          ServiceRegistry.instance.getService(AppUserService).delete(session.appUserId);
          throw new UserSessionExpiredException('Registration is not verified');
        }

        // Все хорошо - увеличиваем дату окончания сессии
        ServiceRegistry.instance.getService(AppUserSessionService).refreshSession(session);
        return JWTHelper.createAndSignJwt(tokenUser, session.userSessionToken);
      }

      // Выше не вернули токен новый, значит что-то не так, чистим все сессии пользователя
      ServiceRegistry.instance.getService(AppUserSessionService).deleteAllByUser(session.appUserId);

      // Ошибка в токене в принципе (невалидна подпись и т.д.)
      if (error instanceof JsonWebTokenError) {
        throw new InvalidTokenException('Invalid access token');
      }

      // Ошибка необработанная
      throw new Unauthorized(error);
    }
  }

  public isUserAuthorized (sessionUser: SessionUser) {
    return !!sessionUser && sessionUser.appUserId > 0 && sessionUser.appUserRegVerifiedInd === 1;
  }

  // Юзверь залогинился, но еще не подтвердил регистрацию кодом или логин кодом
  public isUserTemporaryAuthorized (sessionUser: SessionUser) {
    return !!sessionUser && sessionUser.appUserId > 0;
  }


  // Отправка смс - для подтверждения входа
  private async sendSmsConfirmRegistrationMessage (user: AppUser) {
    user.appUserSmsCode = 77777;
    return await ServiceRegistry.instance.getService(AppUserService).save(user);
  }
}

