import { BaseController } from '@/controllers/BaseController';
import { Request, Response } from 'express';
import { AuthResult, LogonStatus } from '@/services/security/auth/AuthResult';
import { Param, Post, Req, Res, JsonController, Get, BodyParam, UseBefore } from 'routing-controllers';
import { ServiceRegistry } from '@/ServiceRegistry';
import { AuthService } from '@/services/security/auth/AuthService';
import { temporaryAuthorized } from '@/middleware/SecurityMiddlewares';
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
    @BodyParam('password') password: string) {

    // чистим куку с токеном
    SecurityHelper.clearJWTCookie(response);

    try {

      const logonResult = await ServiceRegistry.instance.getService(AuthService).loginByPassword(login, password, request.body.unlinkedSocialUser);

      // Выставляем куку с токеном
      if (logonResult.logonStatus === LogonStatus.OK) {
        SecurityHelper.setJWTCookie(response, logonResult.newAccessToken);
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
      result.makeFailedResult();
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
      result.makeFailedResult();
      return this.createSuccessResponse(result, response);
    }
  }

  @Get('/logout')
  public async logout (
    @Req() request: Request,
    @Res() response: Response) {

    try {
      const sessionToken = SecurityHelper.getSessionToken(request);
      SecurityHelper.clearJWTCookie(response);

      ServiceRegistry.instance.getService(AuthService).logout(sessionToken);

      return this.createSuccessResponse({}, response);
    } catch (err) {
      return this.createFailureResponse(err, response);
    }
  }

  // @Get('/:authType')
  // public async startSocialNetAuthentication (
  //   @Param('authType') authStrategyType: string,
  //   @Req() request: Request,
  //   @Res() response: Response) {

  //   if (!PassportProviders.getProviderNameByAuthType(authStrategyType)) {
  //     const logonResult = new AuthResult();
  //     //  BaseController.addJWTCookie(response, logonResult, null);
  //     logonResult.makeErrorResult(new BadRequest('Invalid passport provider'));
  //     return this.createRedirectResponse(response, `/auth/callback/login`)
  //   }

  //   let scope = {};
  //   if (authStrategyType === 'google') {
  //     scope = { scope: ['email profile'] };
  //   }
  //   return new Promise((resolve) => {
  //     passport.authenticate(authStrategyType, scope,
  //       () => {
  //         resolve({})
  //       })(request, response);
  //   });
  // }

  // @Get('/:authType/callback')
  // public async authenticateSocialNetwork (
  //   @Param('authType') authStrategyType: string,
  //   @Req() request: Request,
  //   @Res() response: Response) {

  //   return this.authenticateResponsePromise(authStrategyType, request, response);
  // }

  // private authenticateResponsePromise (authStrategyType: string, request: Request, response: Response) {
  //   return new Promise((resolve) => {
  //     passport.authenticate(authStrategyType,
  //       async (logonResult: AuthResult) => {

  //         let newAccessToken = null;

  //         // Устанавливаем в сесии анонима и чистим куку с токеном
  //         SecurityControllerHelper.setSessionUserAnonymous(request, response);

  //         if (!logonResult) {
  //           logonResult = new AuthResult();
  //           logonResult.makeErrorResult(new Unauthorized(`${request.ip} unauthorized`));
  //         }

  //         // Выставляем в сессию юзверя сессионого и высталяем куку с токеном
  //         if (logonResult.logonStatus === LogonStatus.OK) {
  //           SecurityControllerHelper.setSessiontUser(logonResult.sessionUser, request);
  //           SecurityControllerHelper.setJWTCookie(response, logonResult.newAccessToken);
  //         }

  //         // Если требуется подтверждение по SMS, то сбрасываем юзверя, будем ждать подтверждения
  //         if (logonResult.logonStatus === LogonStatus.RequereConfirmBySmsCode) {
  //           SecurityControllerHelper.setSessiontUser(logonResult.sessionUser, request);
  //           delete logonResult.sessionUser;
  //         }

  //         if (logonResult.logonStatus === LogonStatus.UserNotFoundButSocialNetworkAuthOK) {
  //           newAccessToken = JWTHelper.createAndSignJwt(logonResult.sessionUser, Guid.newGuid());
  //         }

  //         delete logonResult.newAccessToken;

  //         if (authStrategyType === PassportProviders.LOCAL) {
  //           resolve(this.createSuccessResponse(logonResult, response));
  //         } else {
  //           // BaseController.addJWTCookie(response, logonResult, newAccessToken);
  //           SecurityControllerHelper.setJWTCookie(response, newAccessToken);
  //           resolve(this.createRedirectResponse(response, `/auth/callback/login`));
  //         }

  //       })(request, response, null);
  //   });
  // }
}
