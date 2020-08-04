import { serviceRegistry } from '../../../ServiceRegistry';
import { logger } from '@/utils/Logger';
import { BaseService } from '../../BaseService';
import bcrypt from 'bcrypt';
import { InternalServerError } from '@/exceptions/serverErrors/InternalServerError';
import { AuthResult, LogonStatus } from './AuthResult';
import { PassportProviders } from '../PassportProviders';
import { UserSessionService } from '../user/UserSessionService';
import { UserService } from '../user/UserService';
import { JWTHelper } from '../JWTHelper';
import { SessionUser } from '../user/SessionUser';
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

      const user = this.options.isLoginByPhone ? await serviceRegistry.getService(UserService).getByPhone(login) : await serviceRegistry.getService(UserService).getByLogin(login);

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
          const userSocProfile = await serviceRegistry.getService(UserService).linkSessionUserToSocialNetwork(unlinkedSocialProfile.userSnProfileType, unlinkedSocialProfile);
          if (userSocProfile) {
            sessionUser = serviceRegistry.getService(UserService).convertAppUserSocialNetProfileToSessionUser(userSocProfile);
            sessionUser.appUserRegVerifiedInd = user.appUserRegVerifiedInd;
            sessionUser.appUserRegDate = user.appUserRegDate;
          }
        }

        // Все нормально (пароль валидный).
        if (!sessionUser) {
          sessionUser = serviceRegistry.getService(UserService).convertAppUserToSessionUser(user);
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
        sessionUser = await serviceRegistry.getService(UserService).getSessionUserByProfileCode(authStrategyType, profile.id);
        if (sessionUser && sessionUser.appUserId !== 0) {
          appUser = await serviceRegistry.getService(UserService).getByLogin(sessionUser.appUserLogin);
        }
      }

      // Профиля в базе нет, но аутентификация через соцсеть прошла
      // Есть почта в профиле?
      if (logonResult.logonStatus === LogonStatus.Unknown && !appUser) {
        const tryEmail = profile.email ? profile.email : (profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null);
        if (tryEmail) {
          appUser = await serviceRegistry.getService(UserService).getByLogin(tryEmail);
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
        sessionUser = serviceRegistry.getService(UserService).convertProfileToSessionUser(authStrategyType, profile)
        logonResult.makeUserNotFoundButSocialNetworkAuthOk(sessionUser);
        logonResult.message = this.options.userNotFoundButSocialNetworkAuthOkMessage + socialNetworkName;
      }

      // Есть пользователе с почтой или ранее профиль был связан, линкуем или обновляем профиль
      if (logonResult.logonStatus === LogonStatus.Unknown && appUser) {
        const userSocProfile = await serviceRegistry.getService(UserService).linkToSocialNetwork(appUser.appUserId, authStrategyType, profile);
        if (userSocProfile) {
          sessionUser = serviceRegistry.getService(UserService).convertAppUserSocialNetProfileToSessionUser(userSocProfile);
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
        verifiedUser.appUserRegVerifiedInd = 1;
        verifiedUser.appUserRegToken = null;
        verifiedUser.appUserSmsCode = null;
        await serviceRegistry.getService(UserService).save(verifiedUser);

        const sessionUser = serviceRegistry.getService(UserService).convertAppUserToSessionUser(verifiedUser);
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
    const newSession = await serviceRegistry.getService(UserSessionService).createSession(sessionUser.appUserId);
    const newAccessToken = JWTHelper.generateAccessToken(sessionUser, newSession.userSessionToken);
    return newAccessToken;
  }

  public async logout (sessionToken: string) {
    return serviceRegistry.getService(UserSessionService).delete(sessionToken);
  }

  public async logoutFromAll (appUserId: number) {
    return serviceRegistry.getService(UserSessionService).deleteAllByUser(appUserId)
  }

  // Используется в мидлваре при каждом запросе для проверки и обновления токена
  public async verifyAndUpdateAccessToken (accessToken: string) {
    if (!accessToken) {
      throw new InvalidTokenException({ message: 'Invalid access token' });
    }
    try {
      // Токен валидный и не истекло время жизни, просто обновляем время жизни (и создается новый JWT)
      JWTHelper.verifyAccessToken(accessToken);
      return JWTHelper.refreshAccessToken(accessToken);
    } catch (error) {

      // Истекло время жизни Access токена
      if (error instanceof TokenExpiredError) {
        const tokenUser = JWTHelper.getTokenUser(accessToken);
        if (!tokenUser) {
          throw new InvalidTokenException({ message: 'Invalid access token payload' });
        }

        const sessionToken = JWTHelper.getJwtId(accessToken);
        const session: AppUserSession = await serviceRegistry.getService(UserSessionService).getByToken(sessionToken);
        // Если сессия не акутальна (протухла) или ее нет - на авторизацию
        if (!session) {
          serviceRegistry.getService(UserSessionService).delete(sessionToken);
          throw new UserSessionExpiredException('Session not found');
        }

        if (serviceRegistry.getService(UserSessionService).isExpired(session)) {
          serviceRegistry.getService(UserSessionService).delete(sessionToken);
          throw new UserSessionExpiredException('Session is expired');
        }

        // FIXME: Учесть время подтверждения по SMS
        // Если не подтвержден email
        if (session.appUserId > 0 && session.appUserRegVerifiedInd !== 1 && ((Date.now() - Date.parse(session.appUserRegDate)) > AppConfig.authConfig.emailVerify.options.expiresIn * 1000)) {
          serviceRegistry.getService(UserService).delete(session.appUserId);
          throw new UserSessionExpiredException('Registration is not verified');
        }

        // Все хорошо - увеличиваем дату окончания сессии
        serviceRegistry.getService(UserSessionService).refreshSession(session);
        return JWTHelper.generateAccessToken(tokenUser, session.userSessionToken);
      }

      // Ошибка в токене в принципе (невалидна подпись и т.д.)
      if (error instanceof JsonWebTokenError) {
        throw new InvalidTokenException({ message: 'Invalid access token' });
      }

      // Ошибка необработанная
      throw new InternalServerError('Authorization error');
    }
  }

  // Отправка смс - для подтверждения входа
  private async sendSmsConfirmRegistrationMessage (user: AppUser) {
    user.appUserSmsCode = 55555;
    return await serviceRegistry.getService(UserService).save(user);
  }
}

