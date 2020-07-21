import { BaseController } from '../BaseController';
import { JsonController, Post, BodyParam, Req, Res, Get, Param, UseBefore } from 'routing-controllers';
import { Request, Response } from 'express';
import { TokenUtil } from '@/utils/TokenUtil';
import { RegistrationStatus } from '@/entities/users/RegistrationResult';
import { SessionUser } from '@/entities/users/SessionUser';
import { LogonResult, LogonStatus } from '@/entities/users/LogonResult';
import { ClientNotifyMessage } from '../ClientNotifyMessage';
import { authorized } from '@/middlewares/AuthorizeMiddleware';
import { logger } from '@/utils/Logger';
import { ChangePasswordStatus } from '@/entities/users/ChangePasswordResult';
import { AppUser } from '@/entities/users/AppUser';
import { serviceRegistry } from '@/ServiceRegistry';
import { AuthService } from '@/services/auth/AuthService';
import { UserSessionService } from '@/services/auth/UserSessionService';
import { UserService } from '@/services/auth/UserService';

@JsonController('/user')
export class UserController extends BaseController {

  @Post('/register')
  public async registerNewUser (
    @BodyParam('useremail') useremail: string,
    @BodyParam('password') password: string,
    @Req() request: Request,
    @Res() response: Response) {

    try {

      BaseController.setCurrentUserAnonymous(request, response);

      const registrationResult = await serviceRegistry.getService(AuthService).registerNewUser(useremail, password, request.body.unlinkedSocialUser);
      if (registrationResult.registrationStatus === RegistrationStatus.OK) {
        const newAccessToken = await this.autoLogonUser(registrationResult.sessionUser);
        BaseController.setJWTHeader(response, newAccessToken);

        const message = ClientNotifyMessage.createAlert('Регистрация', `Регистрация прошла успешно! <br>
        На адрес ${useremail} отправлено письмо для проверки электронной почты. Перейдите по ссылке из письма, иначе через сутки аккаунт будет удален`);

        return BaseController.createSuccessResponseWithMessage(registrationResult, response, 200, message, '/auth/callback/registration');
      } else {
        return BaseController.createSuccessResponse(registrationResult, response, 200, '/auth/callback/registration');
      }
    } catch (err) {
      return BaseController.createFailureResponse(err, response);
    }
  }

  @Get('/register/verify/:token')
  public async verifyRegistration (
    @Param('token') token: string,
    @Req() request: Request,
    @Res() response: Response) {

    const verifier = (token: string) => serviceRegistry.getService(AuthService).confirmRegistration(token);
    return this.verifyUserByToken(request, response, token, verifier, LogonStatus.OK, `/auth/callback/login`)
  }

  @Get('/password/reset/verify/:token')
  public async verifyResetPassword (
    @Param('token') token: string,
    @Req() request: Request,
    @Res() response: Response) {

    const verifier = (token: string) => serviceRegistry.getService(AuthService).confirmResetPassword(token);
    return this.verifyUserByToken(request, response, token, verifier, LogonStatus.ShouldChangePassword, `/auth/callback/login`, true)
  }

  @Get('/logoff')
  public async logoff (
    @Req() request: Request,
    @Res() response: Response) {

    BaseController.setCurrentUserAnonymous(request, response);
    const sessionToken = BaseController.getUserSessionId(request);
    if (sessionToken) {
      await serviceRegistry.getService(AuthService).logout(sessionToken)
    }
    return BaseController.createSuccessResponse({}, response, 200, '/auth/callback/logoff');
  }

  @Post('/password/reset')
  public async resetPassword (
    @BodyParam('useremail') useremail: string,
    @Req() request: Request,
    @Res() response: Response) {

    try {
      BaseController.setCurrentUserAnonymous(request, response);
      const appUser = await serviceRegistry.getService(AuthService).resetPassword(useremail);
      const alertText = !appUser
        ? 'Ошибка!'
        : `На адрес ${useremail} отправлено письмо с инструкциями для восстановления пароля`;
      return BaseController.createSuccessResponseWithMessage({}, response, 200, ClientNotifyMessage.createAlert('Восстановление пароля', alertText), '/');
    } catch (err) {
      return BaseController.createFailureResponse(err, response);
    }
  }


  @UseBefore(authorized())
  @Post('/password/change')
  public async changePassword (
    @BodyParam('password') password: string,
    @BodyParam('newpassword') newPassword: string,
    @Req() request: Request,
    @Res() response: Response) {

    try {
      const сhangePasswordResult = await serviceRegistry.getService(AuthService).changePassword(BaseController.getSessionUser(request), password, newPassword);
      if (сhangePasswordResult.status === ChangePasswordStatus.OK) {
        сhangePasswordResult.sessionUser.reset = false;
        const newAccessToken = await this.autoLogonUser(сhangePasswordResult.sessionUser);
        BaseController.setJWTHeader(response, newAccessToken);

        const message = ClientNotifyMessage.createNotify('Пароль успешно изменен !');
        return BaseController.createSuccessResponseWithMessage(сhangePasswordResult, response, 200, message, '/');
      } else {
        return BaseController.createSuccessResponse(сhangePasswordResult, response, 200, '/user/password/change');
      }
    } catch (err) {
      return BaseController.createFailureResponse(err, response);
    }
  }

  @UseBefore(authorized())
  @Post('/register/sendconfirm')
  public async sendConfirmRegistrationEmail (
    @BodyParam('useremail') useremail: string,
    @Res() response: Response) {

    try {
      serviceRegistry.getService(AuthService).sendConfirmRegistrationMessage(useremail);
      const alertText = ` На адрес ${useremail} отправлено письмо для проверки электронной почты. Перейдите по ссылке из письма, иначе через сутки аккаунт будет удален`;
      return BaseController.createSuccessResponseWithMessage({}, response, 200, ClientNotifyMessage.createAlert('Регистрация', alertText));
    } catch (err) {
      return BaseController.createFailureResponse(err, response);
    }
  }

  // Логиним пользоваиеля после регистрации или подтверждения еиайл через почту (по ссылке) или смене пароля
  private async autoLogonUser (sessionUser: SessionUser) {
    const newSession = await serviceRegistry.getService(UserSessionService).createSession(sessionUser.appUserId);
    const newAccessToken = TokenUtil.generateAccessToken(sessionUser, newSession.userSessionToken);
    return newAccessToken;
  }

  private async verifyUserByToken (request: Request, response: Response, token: string, verifier: (token: string) => Promise<AppUser>, onValidLogonStatus: LogonStatus, clientRedirectLocation: string, isResetPwdState = false): Promise<Response> {
    let newAccessToken = null;
    const logonResult = new LogonResult();
    BaseController.setCurrentUserAnonymous(request, response);

    // Проверяем токен
    // Если токен валидный автологинем юзверяи (переделав)
    try {
      if (!token) {
        logonResult.makeFailedResult();
      }
      if (token) {
        const verifiedUser = await verifier(token);
        if (verifiedUser) {
          const sessionUser = serviceRegistry.getService(UserService).convertAppUserToSessionUser(verifiedUser);
          sessionUser.reset = isResetPwdState;
          newAccessToken = await this.autoLogonUser(sessionUser);
          logonResult.logonStatus = onValidLogonStatus;
          logonResult.exception = null;
          logonResult.sessionUser = sessionUser;
        } else {
          logonResult.makeFailedResult()
          logonResult.message = 'Неверный код подтверждения или истек срок действия ссылки, или аккаунт был удален';
        }
      }
    } catch (error) {
      logonResult.makeErrorResult(error);
      logger.error(error);
    }

    BaseController.addJWTCookie(response, logonResult, newAccessToken);
    return BaseController.createRedirectResponse(response, clientRedirectLocation);
  }


}
