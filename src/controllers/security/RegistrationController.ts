import { JsonController, Post, BodyParam, Req, Res, Get, Param, UseBefore } from 'routing-controllers';
import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { serviceRegistry } from '@/ServiceRegistry';
import { RegistrationStatus, RegistrationResult } from '@/services/security/registration/RegistrationResult';
import { RegistrationService } from '@/services/security/registration/RegistrationService';
import { authorized } from '@/middlewares/AuthorizeMiddleware';

@JsonController('/user')
export class RegistrationController extends BaseController {

    @Post('/signup')
    public async registerNewUser (
        @BodyParam('login') login: string,
        @BodyParam('password') password: string,
        @Req() request: Request,
        @Res() response: Response) {

        try {

            // Устанавливаем в сесии анонима и чистим куку с токеном
            BaseController.setSessionUserAnonymous(request, response);

            const registrationResult = await serviceRegistry.getService(RegistrationService).registerUser(login, password, request.body.unlinkedSocialUser);

            if (registrationResult.registrationStatus === RegistrationStatus.OK) {
                BaseController.setSessiontUser(registrationResult.sessionUser, request);
                BaseController.setJWTCookie(response, registrationResult.newAccessToken);
            }

            if (registrationResult.registrationStatus === RegistrationStatus.RequereConfirmBySmsCode) {
                BaseController.setSessiontUser(registrationResult.sessionUser, request);
                delete registrationResult.sessionUser;
            }

            delete registrationResult.newAccessToken;
            return BaseController.createSuccessResponse(registrationResult, response);

        } catch (err) {
            const result = new RegistrationResult();
            result.makeInvalid();
            return BaseController.createSuccessResponse(result, response);
        }
    }

    @Get('/registration/confirm/mail/:token')
    public async confirmRegistrationByEmail (
        @Param('token') token: string,
        @Req() request: Request,
        @Res() response: Response) {

        BaseController.setSessionUserAnonymous(request, response);
        try {
            const result = await serviceRegistry.getService(RegistrationService).confirmRegistrationByEmail(token);

            if (result.registrationStatus === RegistrationStatus.OK) {
                BaseController.setSessiontUser(result.sessionUser, request);
                BaseController.setJWTCookie(response, result.newAccessToken);
            }

            delete result.newAccessToken;
            return BaseController.createSuccessResponse(result, response);

        } catch (err) {
            const result = new RegistrationResult();
            result.makeInvalid();
            return BaseController.createSuccessResponse(result, response);
        }
    }

    @UseBefore(authorized())
    @Get('/registration/confirm/code/:code')
    public async confirmRegistrationByCode (
        @Param('code') code: number,
        @Req() request: Request,
        @Res() response: Response) {

        try {
            const sessionUser = BaseController.getSessionUser(request);
            const result = await serviceRegistry.getService(RegistrationService).confirmRegistrationByCode(code, sessionUser.appUserId);

            if (result.registrationStatus === RegistrationStatus.OK) {
                BaseController.setSessiontUser(result.sessionUser, request);
                BaseController.setJWTCookie(response, result.newAccessToken);
            }

            delete result.newAccessToken;
            return BaseController.createSuccessResponse(result, response);

        } catch (err) {
            const result = new RegistrationResult();
            result.makeInvalid();
            return BaseController.createSuccessResponse(result, response);
        }
    }
}
