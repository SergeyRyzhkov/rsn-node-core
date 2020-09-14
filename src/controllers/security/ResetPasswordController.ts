import { JsonController, Post, BodyParam, Req, Res, Get, Param } from 'routing-controllers';
import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { ServiceRegistry } from '@/ServiceRegistry';
import { ResetPasswordService } from '@/services/security/reset/ResetPasswordService';
import { SecurityHelper } from './SecurityHelper';
import { ResetPasswordResult, ResetPasswordStatus } from '@/services/security/reset/ResetPasswordResult';

@JsonController('/user')
export class ResetPasswordController extends BaseController {

    @Post('/password/reset')
    public async resetPassword (
        @BodyParam('login') login: string,
        @Req() request: Request,
        @Res() response: Response) {

        SecurityHelper.clearJWTCookie(response);

        try {
            const result: ResetPasswordResult = await ServiceRegistry.instance.getService(ResetPasswordService).sendResetPasswordMessage(login);
            return this.createSuccessResponse(result, response);

        } catch (err) {
            const result = new ResetPasswordResult();
            result.makeFailed(err);
            return this.createSuccessResponse(result, response);
        }
    }

    @Get('/password/reset/confirm/:code')
    public async confirmResetPasswordByCode (
        @Param('code') code: string,
        @Req() request: Request,
        @Res() response: Response) {

        SecurityHelper.clearJWTCookie(response);

        // FIXME: Cannot read property 'status' of undefined

        try {
            const result: ResetPasswordResult = await ServiceRegistry.instance.getService(ResetPasswordService).confirmResetPasswordByCode(code);
            // Выставляем куку с токеном
            if (result.status === ResetPasswordStatus.OK) {
                SecurityHelper.setJWTCookie(response, result.newAccessToken);
            }

            delete result.newAccessToken;

            return this.createSuccessResponse(result, response);

        } catch (err) {
            const result = new ResetPasswordResult();
            result.makeFailed(err.message);
            return this.createSuccessResponse(result, response);

        }
    }
}