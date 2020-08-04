import { BaseController } from '@/controllers/BaseController';
import passport from 'passport';
import { Request, Response } from 'express';
import { AuthResult, LogonStatus } from '@/services/security/auth/AuthResult';
import { Param, Post, Req, Res, JsonController, Get, BodyParam, UseBefore } from 'routing-controllers';
import { JWTHelper } from '@/services/security/JWTHelper';
import { Unauthorized } from '@/exceptions/authErrors/Unauthorized';
import { Guid } from '@/utils/Guid';
import { PassportProviders } from '@/services/security/PassportProviders';
import { BadRequest } from '@/exceptions/clientErrors/BadRequest';
import { serviceRegistry } from '@/ServiceRegistry';
import { AuthService } from '@/services/security/auth/AuthService';
import { authorized } from '@/middlewares/AuthorizeMiddleware';

@JsonController('/auth')
export class AuthController extends BaseController {

  @Post('/login')
  public async authenticateLocal (
    @Req() request: Request,
    @Res() response: Response,
    @BodyParam('login') login: string,
    @BodyParam('password') password: string) {

    try {

      const logonResult = await serviceRegistry.getService(AuthService).loginByPassword(login, password, request.body.unlinkedSocialUser);

      // Устанавливаем в сесии анонима и чистим куку с токеном
      BaseController.setSessionUserAnonymous(request, response);

      // Выставляем в сессию юзверя сессионого и высталяем куку с токеном
      if (logonResult.logonStatus === LogonStatus.OK) {
        BaseController.setSessiontUser(logonResult.sessionUser, request);
        BaseController.setJWTCookie(response, logonResult.newAccessToken);
      }

      // Если требуется подтверждение по SMS, то сбрасываем юзверя, будем ждать подтверждения
      if (logonResult.logonStatus === LogonStatus.RequereConfirmBySmsCode) {
        BaseController.setSessiontUser(logonResult.sessionUser, request);
        delete logonResult.sessionUser;
      }

      delete logonResult.newAccessToken;

      BaseController.createSuccessResponse(logonResult, response);
    } catch (err) {
      const result = new AuthResult();
      result.makeFailedResult();
      return BaseController.createSuccessResponse(result, response);
    }
  }


  @UseBefore(authorized())
  @Get('/confirm/code/:code')
  public async confirmLoginByCode (
    @Param('code') code: number,
    @Req() request: Request,
    @Res() response: Response) {

    try {
      const sessionUser = BaseController.getSessionUser(request);
      const result = await serviceRegistry.getService(AuthService).confirmLoginByCode(code, sessionUser.appUserId);

      if (result.logonStatus === LogonStatus.OK) {
        BaseController.setSessiontUser(result.sessionUser, request);
        BaseController.setJWTCookie(response, result.newAccessToken);
      }

      delete result.newAccessToken;
      return BaseController.createSuccessResponse(result, response);

    } catch (err) {
      const result = new AuthResult();
      result.makeFailedResult();
      return BaseController.createSuccessResponse(result, response);
    }
  }


  @Get('/:authType')
  public async startSocialNetAuthentication (
    @Param('authType') authStrategyType: string,
    @Req() request: Request,
    @Res() response: Response) {

    if (!PassportProviders.getProviderNameByAuthType(authStrategyType)) {
      const logonResult = new AuthResult();
      //  BaseController.addJWTCookie(response, logonResult, null);
      logonResult.makeErrorResult(new BadRequest('Invalid passport provider'));
      return BaseController.createRedirectResponse(response, `/auth/callback/login`)
    }

    let scope = {};
    if (authStrategyType === 'google') {
      scope = { scope: ['email profile'] };
    }
    return new Promise((resolve) => {
      passport.authenticate(authStrategyType, scope,
        () => {
          resolve({})
        })(request, response);
    });
  }

  @Get('/:authType/callback')
  public async authenticateSocialNetwork (
    @Param('authType') authStrategyType: string,
    @Req() request: Request,
    @Res() response: Response) {

    return this.authenticateResponsePromise(authStrategyType, request, response);
  }

  private authenticateResponsePromise (authStrategyType: string, request: Request, response: Response) {
    return new Promise((resolve) => {
      passport.authenticate(authStrategyType,
        async (logonResult: AuthResult) => {

          let newAccessToken = null;

          // Устанавливаем в сесии анонима и чистим куку с токеном
          BaseController.setSessionUserAnonymous(request, response);

          if (!logonResult) {
            logonResult = new AuthResult();
            logonResult.makeErrorResult(new Unauthorized(`${request.ip} unauthorized`));
          }

          // Выставляем в сессию юзверя сессионого и высталяем куку с токеном
          if (logonResult.logonStatus === LogonStatus.OK) {
            BaseController.setSessiontUser(logonResult.sessionUser, request);
            BaseController.setJWTCookie(response, logonResult.newAccessToken);
          }

          // Если требуется подтверждение по SMS, то сбрасываем юзверя, будем ждать подтверждения
          if (logonResult.logonStatus === LogonStatus.RequereConfirmBySmsCode) {
            BaseController.setSessiontUser(logonResult.sessionUser, request);
            delete logonResult.sessionUser;
          }

          if (logonResult.logonStatus === LogonStatus.UserNotFoundButSocialNetworkAuthOK) {
            newAccessToken = JWTHelper.generateAccessToken(logonResult.sessionUser, Guid.newGuid());
          }

          delete logonResult.newAccessToken;

          if (authStrategyType === PassportProviders.LOCAL) {
            resolve(BaseController.createSuccessResponse(logonResult, response));
          } else {
            // BaseController.addJWTCookie(response, logonResult, newAccessToken);
            BaseController.setJWTCookie(response, newAccessToken);
            resolve(BaseController.createRedirectResponse(response, `/auth/callback/login`));
          }

        })(request, response, null);
    });
  }
}
