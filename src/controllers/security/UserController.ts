import { BaseController } from '../BaseController';
import { JsonController, Post, BodyParam, Req, Res, Get, Param, UseBefore } from 'routing-controllers';
import { Request, Response } from 'express';
import { JWTHelper } from '@/services/security/JWTHelper';
import { AuthResult, LogonStatus } from '@/services/security/auth/AuthResult';
import { authorized } from '@/middlewares/AuthorizeMiddleware';
import { logger } from '@/utils/Logger';
import { AppUser } from '@/models/security/AppUser';
import { serviceRegistry } from '@/ServiceRegistry';
import { AuthService } from '@/services/security/auth/AuthService';
import { UserSessionService } from '@/services/security/user/UserSessionService';
import { UserService } from '@/services/security/user/UserService';
import { SessionUser } from '@/services/security/user/SessionUser';

@JsonController('/user')
export class UserController extends BaseController {

  @Post('/register')
  public async registerNewUser (
    @BodyParam('useremail') useremail: string,
    @BodyParam('password') password: string,
    @Req() request: Request,
    @Res() response: Response) {

    // try {

    //   BaseController.setCurrentUserAnonymous(request, response);

    //   const registrationResult = await serviceRegistry.getService(AuthService).registerNewUser(useremail, password, request.body.unlinkedSocialUser);
    //   if (registrationResult.registrationStatus === RegistrationStatus.OK) {
    //     const newAccessToken = await this.autoLogonUser(registrationResult.sessionUser);
    //     BaseController.setJWTHeader(response, newAccessToken);

    //     const message = ClientNotifyMessage.createAlert('Регистрация', `Регистрация прошла успешно! <br>
    //     На адрес ${useremail} отправлено письмо для проверки электронной почты. Перейдите по ссылке из письма, иначе через сутки аккаунт будет удален`);

    //     return BaseController.createSuccessResponseWithMessage(registrationResult, response, 200, message, '/auth/callback/registration');
    //   } else {
    //     return BaseController.createSuccessResponse(registrationResult, response, 200, '/auth/callback/registration');
    //   }
    // } catch (err) {
    //   return BaseController.createFailureResponse(err, response);
    // }
  }

  @Get('/register/verify/:token')
  public async verifyRegistration (
    @Param('token') token: string,
    @Req() request: Request,
    @Res() response: Response) {

    // const verifier = (token: string) => serviceRegistry.getService(AuthService).confirmRegistration(token);
    // return this.verifyUserByToken(request, response, token, verifier, LogonStatus.OK, `/auth/callback/login`)
  }


  // @Get('/logoff')
  // public async logoff (
  //   @Req() request: Request,
  //   @Res() response: Response) {

  //   BaseController.setSessionUserAnonymous(request, response);
  //   const sessionToken = BaseController.getUserSessionId(request);
  //   if (sessionToken) {
  //     await serviceRegistry.getService(AuthService).logout(sessionToken)
  //   }
  //   return BaseController.createSuccessResponse({}, response, 200, '/auth/callback/logoff');
  // }

  @UseBefore(authorized())
  @Post('/password/change')
  public async changePassword (
    @BodyParam('password') password: string,
    @BodyParam('newpassword') newPassword: string,
    @Req() request: Request,
    @Res() response: Response) {

    // try {
    //   const сhangePasswordResult = await serviceRegistry.getService(AuthService).changePassword(BaseController.getSessionUser(request), password, newPassword);
    //   if (сhangePasswordResult.status === ChangePasswordStatus.OK) {
    //     сhangePasswordResult.sessionUser.reset = false;
    //     const newAccessToken = await this.autoLogonUser(сhangePasswordResult.sessionUser);
    //     BaseController.setJWTHeader(response, newAccessToken);

    //     const message = ClientNotifyMessage.createNotify('Пароль успешно изменен !');
    //     return BaseController.createSuccessResponseWithMessage(сhangePasswordResult, response, 200, message, '/');
    //   } else {
    //     return BaseController.createSuccessResponse(сhangePasswordResult, response, 200, '/user/password/change');
    //   }
    // } catch (err) {
    //   return BaseController.createFailureResponse(err, response);
    // }
  }

  @UseBefore(authorized())
  @Post('/register/sendconfirm')
  public async sendConfirmRegistrationEmail (
    @BodyParam('useremail') useremail: string,
    @Res() response: Response) {

    // try {
    //   serviceRegistry.getService(AuthService).sendConfirmRegistrationMessage(useremail);
    //   const alertText = ` На адрес ${useremail} отправлено письмо для проверки электронной почты. Перейдите по ссылке из письма, иначе через сутки аккаунт будет удален`;
    //   return BaseController.createSuccessResponseWithMessage({}, response, 200, ClientNotifyMessage.createAlert('Регистрация', alertText));
    // } catch (err) {
    //   return BaseController.createFailureResponse(err, response);
    // }
  }

  // Логиним пользоваиеля после регистрации или подтверждения еиайл через почту (по ссылке) или смене пароля
  private async autoLogonUser (sessionUser: SessionUser) {
    const newSession = await serviceRegistry.getService(UserSessionService).createSession(sessionUser.appUserId);
    const newAccessToken = JWTHelper.generateAccessToken(sessionUser, newSession.userSessionToken);
    return newAccessToken;
  }

}
