import { JsonController, Post, BodyParam, Req, Res, Get, Param, UseBefore } from 'routing-controllers';
import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { ServiceRegistry } from '@/ServiceRegistry';
import { RegistrationStatus, RegistrationResult } from '@/services/security/registration/RegistrationResult';
import { RegistrationService } from '@/services/security/registration/RegistrationService';
import { temporaryAuthorized } from '@/middleware/SecurityMiddlewares';
import { SecurityHelper } from './SecurityHelper';

@JsonController('/user')
export class RegistrationController extends BaseController {

    @Post('/signup')
    public async registerNewUser (
        @BodyParam('login') login: string,
        @BodyParam('password') password: string,
        @Req() request: Request,
        @Res() response: Response) {

        SecurityHelper.setCurrentUserAnonymous(response);

        try {

            const registrationResult = await ServiceRegistry.instance.getService(RegistrationService).registerUser(login, password, request.body.unlinkedSocialUser);

            if (registrationResult.registrationStatus === RegistrationStatus.OK) {
                SecurityHelper.setJWTCookie(response, registrationResult.newAccessToken);
            }

            if (registrationResult.registrationStatus === RegistrationStatus.RequereConfirmBySmsCode) {
                SecurityHelper.setJWTCookie(response, registrationResult.newAccessToken);
                delete registrationResult.sessionUser;
            }

            delete registrationResult.newAccessToken;
            return this.createSuccessResponse(registrationResult, response);

        } catch (err) {
            const result = new RegistrationResult();
            result.makeInvalid();
            return this.createSuccessResponse(result, response);
        }
    }

    // FIXME: Схлопнуть два метода. Нет разницы это ссылка или код-смс
    @UseBefore(temporaryAuthorized())
    @Get('/registration/confirm/mail/:token')
    public async confirmRegistrationByEmail (
        @Param('token') token: string,
        @Req() request: Request,
        @Res() response: Response) {

        SecurityHelper.setCurrentUserAnonymous(response);

        try {
            const result = await ServiceRegistry.instance.getService(RegistrationService).confirmRegistrationByEmail(token);

            if (result.registrationStatus === RegistrationStatus.OK) {
                SecurityHelper.setJWTCookie(response, result.newAccessToken);
            }

            delete result.newAccessToken;
            return this.createSuccessResponse(result, response);

        } catch (err) {
            const result = new RegistrationResult();
            result.makeInvalid();
            return this.createSuccessResponse(result, response);
        }
    }

    @UseBefore(temporaryAuthorized())
    @Get('/registration/confirm/code/:code')
    public async confirmRegistrationByCode (
        @Param('code') code: number,
        @Req() request: Request,
        @Res() response: Response) {

        try {
            const sessionUser = SecurityHelper.getSessionUserFromToken(request);
            const result = await ServiceRegistry.instance.getService(RegistrationService).confirmRegistrationByCode(code, sessionUser.appUserId);

            if (result.registrationStatus === RegistrationStatus.OK) {
                SecurityHelper.setJWTCookie(response, result.newAccessToken);
            }

            delete result.newAccessToken;
            return this.createSuccessResponse(result, response);

        } catch (err) {
            const result = new RegistrationResult();
            result.makeInvalid();
            return this.createSuccessResponse(result, response);
        }
    }
}
