import { BaseController } from '@/controllers/BaseController';
import { Request, Response } from 'express';
import { AuthResult, LogonStatus } from '@/services/security/auth/AuthResult';
import { Param, Post, Req, Res, JsonController, Get, BodyParam, UseBefore } from 'routing-controllers';
import { ServiceRegistry } from '@/ServiceRegistry';
import { AuthService } from '@/services/security/auth/AuthService';
import { temporaryAuthorized, authorized } from '@/middleware/SecurityMiddlewares';
import { SecurityHelper } from './SecurityHelper';
import { SessionUser } from '@/models/security/SessionUser';

@JsonController('/auth')
export class AuthController extends BaseController {

  @Get('/user')
  public async getCurrentSessionUser (
    @Req() request: Request,
    @Res() response: Response,) {

    // Получим пользователя из токена, но он может еще не прошел проверку по коду (логина или регистрации, если нужна была)
    let sessionUser = SecurityHelper.getSessionUserFromToken(request);
    sessionUser = ServiceRegistry.instance.getService(AuthService).isUserAuthorized(sessionUser) ? sessionUser : SessionUser.anonymousUser;
    return this.createSuccessResponse(sessionUser, response);
  }

  @Post('/login')
  public async authenticateLocal (
    @Req() request: Request,
    @Res() response: Response,
    @BodyParam('login') login: string,
    @BodyParam('password') password: string,
    @BodyParam('rememberMe') rememberMe?: boolean,
    @BodyParam('unlinkedSocialUser') unlinkedSocialUser?: SessionUser) {

    SecurityHelper.setCurrentUserAnonymous(response);

    try {

      const logonResult = await ServiceRegistry.instance.getService(AuthService).loginByPassword(login, password, unlinkedSocialUser);

      if (logonResult.logonStatus === LogonStatus.OK) {
        SecurityHelper.setJWTCookie(response, logonResult.newAccessToken, rememberMe);
      }

      // Если требуется подтверждение по SMS, то сбрасываем юзверя (на клиенте должен быть выставлен ананимус), будем ждать подтверждения
      if (logonResult.logonStatus === LogonStatus.RequereConfirmBySmsCode) {
        SecurityHelper.setJWTCookie(response, logonResult.newAccessToken);
        delete logonResult.sessionUser;
      }

      delete logonResult.newAccessToken;

      return this.createSuccessResponse(logonResult, response);
    } catch (err) {
      const result = new AuthResult();
      result.makeFailed();
      return this.createSuccessResponse(result, response);
    }
  }


  @UseBefore(temporaryAuthorized())
  @Get('/confirm/code/:code')
  public async confirmLoginByCode (
    @Param('code') code: number,
    @Req() request: Request,
    @Res() response: Response) {

    try {
      const sessionUser = SecurityHelper.getSessionUserFromToken(request);
      const result = await ServiceRegistry.instance.getService(AuthService).confirmLoginByCode(code, sessionUser.appUserId);

      if (result.logonStatus === LogonStatus.OK) {
        SecurityHelper.setJWTCookie(response, result.newAccessToken);
      }

      delete result.newAccessToken;

      return this.createSuccessResponse(result, response);

    } catch (err) {
      const result = new AuthResult();
      result.makeFailed();
      return this.createSuccessResponse(result, response);
    }
  }

  @Get('/logout')
  public async logout (
    @Req() request: Request,
    @Res() response: Response) {

    try {
      const userId = SecurityHelper.getSessionUserFromToken(request)?.appUserId
      await ServiceRegistry.instance.getService(AuthService).logout(userId);

      SecurityHelper.setCurrentUserAnonymous(response);

      return this.createSuccessResponse({}, response);
    } catch (err) {
      return this.createFailureResponse(err, response);
    }
  }

  @UseBefore(authorized())
  @Post('/password/change')
  public async changePassword (
    @Req() request: Request,
    @Res() response: Response,
    @BodyParam('password') newPassword: string) {

    try {
      const userId = SecurityHelper.getSessionUserFromToken(request)?.appUserId
      const result = await ServiceRegistry.instance.getService(AuthService).changePassword(userId, newPassword);

      if (result.logonStatus === LogonStatus.PasswordChanged) {
        SecurityHelper.setJWTCookie(response, result.newAccessToken);
      }

      delete result.newAccessToken;

      return this.createSuccessResponse(result, response);

    } catch (err) {
      return this.createFailureResponse(err, response);
    }
  }

}
