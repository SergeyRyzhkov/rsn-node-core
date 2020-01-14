import { BaseController } from '../BaseController';
import * as passport from 'passport';
import { Request, Response } from 'express';
import { LogonResult, LogonStatus } from '@/entities/users/LogonResult';
import { Param, Post, Req, Res, JsonController, Get, BodyParam, OnUndefined } from 'routing-controllers';
import ServiceContainer from '@/services/ServiceContainer';
import TokenUtil from '@/utils/TokenUtil';
import { Unauthorized } from '@/exceptions/authErrors/Unauthorized';
import Guid from '@/utils/Guid';
import PassportProviders from '@/services/user/PassportProviders';
import { BadRequest } from '@/exceptions/clientErrors/BadRequest';

@JsonController('/auth')
export default class AuthController extends BaseController {

  @Post('/login')
  public async authenticateLocal (
    @BodyParam('useremail') useremail: string,
    @BodyParam('password') password: string,
    @Req() request: Request,
    @Res() response: Response) {

    return this.authenticateResponsePromise(PassportProviders.LOCAL, request, response);
  }

  @Get('/:authType')
  public async startSocialNetAuthentication (
    @Param('authType') authStrategyType: string,
    @Req() request: Request,
    @Res() response: Response) {

    if (!PassportProviders.getProviderNameByAuthType(authStrategyType)) {
      const logonResult = new LogonResult();
      BaseController.addJWTCookie(response, logonResult, null);
      logonResult.makeErrorResult(new BadRequest('Invalid passport provider'));
      return BaseController.setLocationToClient(response, `/auth/callback/login`)
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
        async (logonResult: LogonResult) => {

          let newAccessToken = null;

          BaseController.setCurrentUserAnonymous(request, response);

          if (!logonResult) {
            logonResult = new LogonResult();
            logonResult.makeErrorResult(new Unauthorized(`${request.ip} unauthorized`));
          }

          if (logonResult.logonStatus === LogonStatus.OK) {
            const newSession = await ServiceContainer.UserSessionService.createSession(logonResult.sessionUser.appUserId);
            newAccessToken = TokenUtil.generateAccessToken(logonResult.sessionUser, newSession.userSessionToken);
          }

          if (logonResult.logonStatus === LogonStatus.UserNotFoundButSocialNetworkAuthOK) {
            newAccessToken = TokenUtil.generateAccessToken(logonResult.sessionUser, Guid.newGuid());
          }

          if (authStrategyType === PassportProviders.LOCAL) {
            BaseController.setJWTHeader(response, newAccessToken);
            resolve(BaseController.createSuccessResponse(logonResult, response, 200, '/auth/callback/login'));
          } else {
            BaseController.addJWTCookie(response, logonResult, newAccessToken);
            resolve(BaseController.setLocationToClient(response, `/auth/callback/login`));
          }

        })(request, response, null);
    });
  }
}
