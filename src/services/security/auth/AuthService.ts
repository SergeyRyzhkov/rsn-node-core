import { serviceRegistry } from '../../../ServiceRegistry';
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

// FIXME: Проверять подтверждена ли регистрация
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

      const user = await serviceRegistry.getService(AppUserService).getByLogin(login);

      // Нет такого пользователя (с логином)
      if (!user) {
        return logonResult.makeFailedResult(this.options.failedMessage);
      }

      if (bcrypt.compareSync(password, user.appUserPwdHash)) {
        // Пароль верный (и не вывалилсь в exception)
        // Проверим на блокировку
        if (user.appUserBlockedInd === 1) {
          return logonResult.makeBlockedResult(this.options.userBlockedMessage);
        }

        // Если на клиенте был авторизованный профиль соц.сети - линкуем
        if (!!unlinkedSocialProfile && unlinkedSocialProfile.userSnProfileId > 0) {
          unlinkedSocialProfile.appUserId = user.appUserId;
          const userSocProfile = await serviceRegistry.getService(AppUserService).linkSessionUserToSocialNetwork(unlinkedSocialProfile.userSnProfileType, unlinkedSocialProfile);
          if (userSocProfile) {
            sessionUser = serviceRegistry.getService(AppUserService).convertAppUserSocialNetProfileToSessionUser(userSocProfile);
            sessionUser.appUserRegVerifiedInd = user.appUserRegVerifiedInd;
            sessionUser.appUserRegDate = user.appUserRegDate;
          }
        }

        // Все нормально (пароль валидный).
        if (!sessionUser) {
          sessionUser = serviceRegistry.getService(AppUserService).convertAppUserToSessionUser(user);
        }

        // Требуется подтверждение по SMS
        if (this.options.isRequireConfirmationBySms) {
          this.sendSmsConfirmRegistrationMessage(user);
          return logonResult.makeRequereConfirmBySmsCode(sessionUser, this.options.requireSmsConfirmationMessage);
        } else {
          // Если подтверждения не требуется, то автолигинем юзверя, в результат записываем токен (контроллер его выставит в куку)
          logonResult.makeOKResult(sessionUser, this.options.authOkMessage);
          logonResult.newAccessToken = await this.autoLoginUser(sessionUser);
          return logonResult;
        }
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
        sessionUser = await serviceRegistry.getService(AppUserService).getSessionUserByProfileCode(authStrategyType, profile.id);
        if (sessionUser && sessionUser.appUserId !== 0) {
          appUser = await serviceRegistry.getService(AppUserService).getByLogin(sessionUser.appUserName);
        }
      }

      // Профиля в базе нет, но аутентификация через соцсеть прошла
      // Есть почта в профиле?
      if (logonResult.logonStatus === LogonStatus.Unknown && !appUser) {
        const tryEmail = profile.email ? profile.email : (profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null);
        if (tryEmail) {
          appUser = await serviceRegistry.getService(AppUserService).getByLogin(tryEmail);
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
        sessionUser = serviceRegistry.getService(AppUserService).convertProfileToSessionUser(authStrategyType, profile)
        logonResult.makeUserNotFoundButSocialNetworkAuthOk(sessionUser);
        logonResult.message = this.options.userNotFoundButSocialNetworkAuthOkMessage + socialNetworkName;
      }

      // Есть пользователе с почтой или ранее профиль был связан, линкуем или обновляем профиль
      if (logonResult.logonStatus === LogonStatus.Unknown && appUser) {
        const userSocProfile = await serviceRegistry.getService(AppUserService).linkToSocialNetwork(appUser.appUserId, authStrategyType, profile);
        if (userSocProfile) {
          sessionUser = serviceRegistry.getService(AppUserService).convertAppUserSocialNetProfileToSessionUser(userSocProfile);
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


  public async confirmLoginByCode (code: number, userId: number) {
    const user = await this.twoFactorVerifier.verifyByCode(code, userId);
    return this.autoLogonUserAfter2FA(user);
  }

  private async autoLogonUserAfter2FA (verifiedUser: AppUser) {
    const result: AuthResult = new AuthResult();

    try {
      if (!!verifiedUser) {
        // FIXME: Переименовать это роле - appUserRegVerifiedInd Это проверка кода не только для регистрации
        verifiedUser.appUserRegVerifiedInd = 1;
        verifiedUser.appUserRegToken = null;
        verifiedUser.appUserSmsCode = null;
        await serviceRegistry.getService(AppUserService).save(verifiedUser);

        const sessionUser = serviceRegistry.getService(AppUserService).convertAppUserToSessionUser(verifiedUser);
        result.newAccessToken = await this.autoLoginUser(sessionUser);
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

  // Логиним пользоваиеля после логина, регистрации, или подтверждения через почту (смс), или смене пароля
  public async autoLoginUser (sessionUser: SessionUser) {
    const newSession = await serviceRegistry.getService(AppUserSessionService).createSession(sessionUser.appUserId);
    const newAccessToken = JWTHelper.createAndSignJwt(sessionUser, newSession.userSessionToken);
    return newAccessToken;
  }

  public async logout (sessionToken: string) {
    return serviceRegistry.getService(AppUserSessionService).delete(sessionToken);
  }

  public async logoutFromAll (appUserId: number) {
    return serviceRegistry.getService(AppUserSessionService).deleteAllByUser(appUserId)
  }

  // Используется в мидлваре при каждом запросе для проверки и обновления токена
  public async verifyAndUpdateAccessToken (accessToken: string) {
    if (!accessToken) {
      throw new InvalidTokenException('Invalid access token');
    }
    try {
      // Токен валидный и не истекло время жизни, просто обновляем время жизни (и создается новый JWT)
      JWTHelper.verifyAccessToken(accessToken);
      return JWTHelper.extendAccessToken(accessToken);
    } catch (error) {

      // Истекло время жизни Access токена
      if (error instanceof TokenExpiredError) {
        const tokenUser = JWTHelper.getTokenUser(accessToken);
        if (!tokenUser) {
          throw new InvalidTokenException('Invalid access token payload');
        }

        const sessionToken = JWTHelper.getJwtId(accessToken);
        const session: AppUserSession = await serviceRegistry.getService(AppUserSessionService).getByToken(sessionToken);
        // Если сессия не акутальна (протухла) или ее нет - на авторизацию
        if (!session) {
          serviceRegistry.getService(AppUserSessionService).delete(sessionToken);
          throw new UserSessionExpiredException('Session not found');
        }

        if (serviceRegistry.getService(AppUserSessionService).isExpired(session)) {
          serviceRegistry.getService(AppUserSessionService).delete(sessionToken);
          throw new UserSessionExpiredException('Session is expired');
        }

        // FIXME: Учесть время подтверждения по SMS
        // Если не подтвержден email
        if (session.appUserId > 0 && session.appUserRegVerifiedInd !== 1 && ((Date.now() - Date.parse(session.appUserRegDate)) > AppConfig.authConfig.emailVerify.options.expiresIn * 1000)) {
          serviceRegistry.getService(AppUserService).delete(session.appUserId);
          throw new UserSessionExpiredException('Registration is not verified');
        }

        // Все хорошо - увеличиваем дату окончания сессии
        serviceRegistry.getService(AppUserSessionService).refreshSession(session);
        return JWTHelper.createAndSignJwt(tokenUser, session.userSessionToken);
      }

      // Ошибка в токене в принципе (невалидна подпись и т.д.)
      if (error instanceof JsonWebTokenError) {
        throw new InvalidTokenException('Invalid access token');
      }

      // Ошибка необработанная
      throw new InternalServerError('Authorization error');
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
    return await serviceRegistry.getService(AppUserService).save(user);
  }
}

