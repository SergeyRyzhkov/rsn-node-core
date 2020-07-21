import { serviceRegistry } from '../../ServiceRegistry';
import { logger } from '@/utils/Logger';
import { AppConfig } from '@/utils/Config';
import { BaseService } from '../BaseService';
import * as bcrypt from 'bcrypt';
import { TokenUtil } from '@/utils/TokenUtil';
import { InternalServerError } from '@/exceptions/serverErrors/InternalServerError';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { AppUserSession } from '@/entities/users/AppUserSession';
import { UserSessionExpiredException } from '@/exceptions/authErrors/UserSessionExpiredException';
import { InvalidTokenException } from '@/exceptions/authErrors/InvalidTokenException';
import { LogonResult, LogonStatus } from '../../entities/users/LogonResult';
import { SessionUser } from '@/entities/users/SessionUser';
import { PassportProviders } from './PassportProviders';
import { AppUser } from '@/entities/users/AppUser';
import { Guid } from '@/utils/Guid';
import { isEmailValid, isPasswordStrenght, isEmpty } from '@/utils/Validators';
import { RegistrationResult, RegistrationStatus } from '@/entities/users/RegistrationResult';
import { ChangePasswordResult, ChangePasswordStatus } from '@/entities/users/ChangePasswordResult';
import { UserSessionService } from './UserSessionService';
import { UserService } from './UserService';
import { AuthEmailService } from './AuthEmailService';

export class AuthService extends BaseService {
  private static bcryptSaltRounds = 10;

  public async refreshAccessToken (accessToken: string) {
    if (!accessToken) {
      throw new InvalidTokenException('Invalid access token');
    }
    try {
      // Токен валидный и не истекло время жизни, просто обновляем время жизни (и создается новый JWT)
      TokenUtil.verifyAccessToken(accessToken);
      return TokenUtil.refreshAccessToken(accessToken);
    } catch (error) {

      // Истекло время жизни Access токена
      if (error instanceof TokenExpiredError) {
        const reqUser = TokenUtil.getSessionUser(accessToken);
        if (!reqUser) {
          throw new InvalidTokenException('Invalid access token payload');
        }

        const sessionToken = TokenUtil.getJwtId(accessToken);
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

        // Если не подтвержден email
        if (session.appUserId > 0 && session.appUserRegVerifiedInd !== 1 && ((Date.now() - Date.parse(session.appUserRegDate)) > AppConfig.authConfig.emailVerify.options.expiresIn * 1000)) {
          serviceRegistry.getService(UserService).delete(session.appUserId);
          throw new UserSessionExpiredException('Registration is not verified');
        }

        // Все хорошо - увеличиваем дату окончания сессии
        serviceRegistry.getService(UserSessionService).refreshSession(session);
        return TokenUtil.generateAccessToken(reqUser, session.userSessionToken);
      }

      // Ошибка в токене в принципе (невалидна подпись и т.д.)
      if (error instanceof JsonWebTokenError) {
        throw new InvalidTokenException('Invalid access token');
      }

      // Ошибка необработанная
      throw new InternalServerError('Authorization error', error);
    }
  }

  public async verifyBySocialNetwork (authStrategyType: string, profile: any, done: (logonResult: LogonResult | string, user: unknown) => void) {
    const logonResult: LogonResult = new LogonResult();

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
          appUser = await serviceRegistry.getService(UserService).getByEmail(sessionUser.appUserEmail);
        }
      }

      // Профиля в базе нет, но аутентификация через соцсеть прошла
      // Есть почта в профиле?
      if (logonResult.logonStatus === LogonStatus.Unknown && !appUser) {
        const tryEmail = profile.email ? profile.email : (profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null);
        if (tryEmail) {
          appUser = await serviceRegistry.getService(UserService).getByEmail(tryEmail);
        }
      }

      // Есть пользователе с почтой или ранее профиль был связан - проверяем блокировку
      if (logonResult.logonStatus === LogonStatus.Unknown && appUser) {
        // Если блокирован
        if (logonResult.logonStatus === LogonStatus.Unknown && appUser.appUserBlockedInd === 1) {
          logonResult.makeBlockedResult();
        }
      }

      // Профиля в базе нет, Почты нет или не нашли в базе, но аутентификация через соц сеть прошла
      if (logonResult.logonStatus === LogonStatus.Unknown && !appUser && socialNetworkName) {
        sessionUser = serviceRegistry.getService(UserService).convertProfileToSessionUser(authStrategyType, profile)
        logonResult.makeUserNotFoundButSocialNetworkAuthOk(sessionUser, socialNetworkName);
      }

      // Есть пользователе с почтой или ранее профиль был связан, линкуем или обновляем профиль
      if (logonResult.logonStatus === LogonStatus.Unknown && appUser) {
        const userSocProfile = await serviceRegistry.getService(UserService).linkToSocialNetwork(appUser.appUserId, authStrategyType, profile);
        if (userSocProfile) {
          sessionUser = serviceRegistry.getService(UserService).convertAppUserSocialNetProfileToSessionUser(userSocProfile);
          sessionUser.appUserRegVerifiedInd = appUser.appUserRegVerifiedInd;
          sessionUser.appUserRegDate = appUser.appUserRegDate;
          logonResult.makeOKResult(sessionUser);
        }
      }

    } catch (err) {
      logonResult.makeErrorResult(new InternalServerError(err.message, err));
      logger.error(err);
    } finally {
      done(logonResult, null)
    }
  }

  public async verifyByPassword (username: string, password: string, unlinkedSocialProfile: SessionUser, done: (logonResult: LogonResult) => void) {
    let sessionUser = null;
    const logonResult: LogonResult = new LogonResult();
    logonResult.makeUnknownResult();

    try {
      const user = await serviceRegistry.getService(UserService).getByEmail(username);

      if (!user) {
        logonResult.makeFailedResult();
      }

      if (user) {
        if (bcrypt.compareSync(password, user.appUserPwdHash)) {
          // Пароль верный (и не вывалилсь в exception)

          // Проверим на блокировку
          if (logonResult.logonStatus === LogonStatus.Unknown && user.appUserBlockedInd === 1) {
            logonResult.makeBlockedResult();
          }

          // Если на клиенте был авторизованный профиль соц.сети - линкуем
          if (logonResult.logonStatus === LogonStatus.Unknown && unlinkedSocialProfile && unlinkedSocialProfile.userSnProfileId > 0) {
            unlinkedSocialProfile.appUserId = user.appUserId;
            const userSocProfile = await serviceRegistry.getService(UserService).linkSessionUserToSocialNetwork(unlinkedSocialProfile.userSnProfileType, unlinkedSocialProfile);
            if (userSocProfile) {
              sessionUser = serviceRegistry.getService(UserService).convertAppUserSocialNetProfileToSessionUser(userSocProfile);
              sessionUser.appUserRegVerifiedInd = user.appUserRegVerifiedInd;
              sessionUser.appUserRegDate = user.appUserRegDate;
            }
          }

          // Все нормально.
          if (logonResult.logonStatus === LogonStatus.Unknown) {
            if (!sessionUser) {
              sessionUser = serviceRegistry.getService(UserService).convertAppUserToSessionUser(user);
            }
            logonResult.makeOKResult(sessionUser);
          }

        } else {
          logonResult.makeFailedResult();
        }
      }
    } catch (err) {
      if (err && err.includes && err.includes('BCrypt')) {
        logonResult.makeFailedResult();
      } else {
        logonResult.makeErrorResult(new InternalServerError(err.message, err));
        logger.error(err);
      }
    } finally {
      done(logonResult)
    }
  }

  public async registerNewUser (userEmail: string, password: string, unlinkedSocialProfile: SessionUser): Promise<RegistrationResult> {
    const registrationResult: RegistrationResult = new RegistrationResult();
    let sessionUser = null;

    if (!isEmailValid(userEmail)) {
      registrationResult.makeInvalidEmailResult();
      return registrationResult;
    }

    if (!isPasswordStrenght(password)) {
      registrationResult.makePasswordIsNotStrongResult();
      return registrationResult;
    }

    try {
      const user = await serviceRegistry.getService(UserService).getByEmail(userEmail);
      if (user) {
        registrationResult.makeAlreadyExistsResult();
      } else {
        const newAppUser = new AppUser();
        newAppUser.appUserEmail = userEmail;
        newAppUser.appUserPwdHash = bcrypt.hashSync(password, AuthService.bcryptSaltRounds);
        newAppUser.appUserRegDate = new Date(Date.now()).toUTCString();
        newAppUser.appUserRegVerifiedInd = 0;
        newAppUser.appUserBlockedInd = 0;
        newAppUser.appUserRegToken = Guid.newGuid();
        await serviceRegistry.getService(UserService).save(newAppUser);

        // Если на клиенте был авторизованный профиль соц.сети - линкуем
        if (unlinkedSocialProfile && unlinkedSocialProfile.userSnProfileId > 0) {
          unlinkedSocialProfile.appUserId = newAppUser.appUserId;
          const userSocProfile = await serviceRegistry.getService(UserService).linkSessionUserToSocialNetwork(unlinkedSocialProfile.userSnProfileType, unlinkedSocialProfile);
          if (userSocProfile) {
            sessionUser = serviceRegistry.getService(UserService).convertAppUserSocialNetProfileToSessionUser(userSocProfile);
            sessionUser.appUserRegVerifiedInd = newAppUser.appUserRegVerifiedInd;
            sessionUser.appUserRegDate = newAppUser.appUserRegDate;
          }
        }

        // Если не было свзяи с соц.сетью, сессионого пользоваиеля сделаем из регистрации
        if (!sessionUser) {
          sessionUser = serviceRegistry.getService(UserService).convertAppUserToSessionUser(newAppUser);
        }

        registrationResult.makeOKResult(sessionUser);

        // Отправляем письмо с запросом на подтверждение почты
        serviceRegistry.getService(AuthEmailService).sendVerifyRegistrationEmail(newAppUser.appUserEmail, newAppUser.appUserRegToken);
      }
      return registrationResult;
    } catch (err) {
      logger.error(err);
      registrationResult.makeErrorResult(new InternalServerError(err.message, err));
      return registrationResult;
    }
  }

  // Подтверждение регистрации
  public async confirmRegistration (token: string) {
    const appUser = await serviceRegistry.getService(UserService).getByRegistrationToken(token);

    if (!appUser) {
      return null;
    }

    const tokenExpired = this.isRegistrationVerifyExpired(appUser);
    // Есть пользователь, но токен протух, удаляем его
    if (appUser && tokenExpired) {
      await serviceRegistry.getService(UserService).delete(appUser.appUserId);
      return null;
    }
    // Есть пользователь, и токен НЕ протух
    if (appUser && !tokenExpired) {
      appUser.appUserRegVerifiedInd = 1;
      appUser.appUserRegToken = null;
      const savedUser = await serviceRegistry.getService(UserService).save(appUser);
      return savedUser;
    }
    return null;
  }

  // Сброс восстановление пароля. Проверка кода (токена)
  public async confirmResetPassword (token: string) {
    const appUser = await serviceRegistry.getService(UserService).getByResetPasswordToken(token);

    if (!appUser) {
      return null;
    }
    const tokenExpired = ((Date.now() - Date.parse(appUser.appUserResetPwdDate)) > 86400 * 1000);
    // Сбросим токен и дату
    appUser.appUserResetPwd = null;
    appUser.appUserResetPwdDate = null;
    const savedUser = await serviceRegistry.getService(UserService).save(appUser);

    // Есть пользователь, но токен протух, очистим данные
    if (savedUser && !tokenExpired) {
      if (tokenExpired) {
        return null
      } else {
        return savedUser;
      }
    }
    return null;
  }

  // Сброс.Восстановление пароля
  public async resetPassword (email: string) {
    // Ищем пользователя по мылу
    let appUser = await serviceRegistry.getService(UserService).getByEmail(email);
    if (appUser) {
      // Проверяем есть ли подтверждение регистрации
      const regVerifyExpired = this.isRegistrationVerifyExpired(appUser);
      if (!regVerifyExpired) {
        appUser.appUserResetPwd = Guid.newGuid();
        appUser.appUserResetPwdDate = new Date(Date.now()).toUTCString();
        await serviceRegistry.getService(UserService).save(appUser);

        serviceRegistry.getService(AuthEmailService).sendResetPasswordEmail(appUser.appUserEmail, appUser.appUserResetPwd);
      } else {
        appUser = null;
      }
    }
    return appUser
  }

  public async changePassword (sessionUser: SessionUser, oldPassword: string, newPassword: string) {
    const сhangePasswordResult = new ChangePasswordResult();
    сhangePasswordResult.makeUnknownResult();

    const verifyDone = async (logonResult: LogonResult) => {
      // Если авторизация по предыдущему паролю прошла
      if (logonResult.logonStatus === LogonStatus.OK) {
        if (!isPasswordStrenght(newPassword)) {
          сhangePasswordResult.makePasswordIsNotStrongResult(logonResult.sessionUser);
        } else {
          сhangePasswordResult.makeOKResult(sessionUser);
          sessionUser.reset = false;
          changeUserPassword();
        }
      } else {
        сhangePasswordResult.makeFailedResult(sessionUser);
      }
    }

    const changeUserPassword = () => {
      const appUser = new AppUser();
      appUser.appUserId = sessionUser.appUserId;
      appUser.appUserPwdHash = bcrypt.hashSync(newPassword, AuthService.bcryptSaltRounds);
      serviceRegistry.getService(UserService).save(appUser);
    }

    if (oldPassword === newPassword) {
      сhangePasswordResult.makeOldAndNewPasswordAreEquals(sessionUser);
    }

    if (!isPasswordStrenght(newPassword)) {
      сhangePasswordResult.makePasswordIsNotStrongResult(sessionUser);
    }

    // Пробуем авторизовать, если это не сброс пароля был через ссылку (sessionUser.reset) далее в verifyDone
    if (сhangePasswordResult.status === ChangePasswordStatus.Unknown && !sessionUser.reset) {
      await this.verifyByPassword(sessionUser.appUserEmail, oldPassword, null, verifyDone)
    }

    //  (sessionUser.reset) - был сброс пароля через ссылку - прсото меняем пароль
    if (сhangePasswordResult.status === ChangePasswordStatus.Unknown && sessionUser.reset) {
      sessionUser.reset = false;
      сhangePasswordResult.makeOKResult(sessionUser);
      changeUserPassword();
    }

    return сhangePasswordResult;
  }

  // Отправляем повторное письмо с запросом на подтверждение почты
  public async sendConfirmRegistrationMessage (email: string) {
    // Ищем пользователя по мылу
    const appUser = await serviceRegistry.getService(UserService).getByEmail(email);
    if (appUser && appUser.appUserRegVerifiedInd !== 1) {
      appUser.appUserRegDate = new Date(Date.now()).toUTCString();
      appUser.appUserRegToken = Guid.newGuid();
      await serviceRegistry.getService(UserService).save(appUser);
      serviceRegistry.getService(AuthEmailService).sendVerifyRegistrationEmail(appUser.appUserEmail, appUser.appUserRegToken);
    }
    return appUser;
  }

  public async logout (sessionToken: string) {
    return serviceRegistry.getService(UserSessionService).delete(sessionToken);
  }

  public async logoutFromAll (appUserId: number) {
    return serviceRegistry.getService(UserSessionService).deleteAllByUser(appUserId)
  }

  public isRegistrationVerifyExpired (appUser: AppUser) {
    return appUser.appUserRegVerifiedInd !== 1 && ((Date.now() - Date.parse(appUser.appUserRegDate)) > AppConfig.authConfig.emailVerify.options.expiresIn * 1000);
  }
}
