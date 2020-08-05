import { JsonController, Post, BodyParam, Req, Res, Get, Param } from 'routing-controllers';
import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { serviceRegistry } from '@/ServiceRegistry';
import { ClientNotifyMessage } from '../ClientNotifyMessage';
import { ResetChangePwdService } from '@/services/security/reset/ResetChangePwdService';
import { SecurityControllerHelper } from './SecurityControllerHelper';

@JsonController('/user')
export class ResetChangePwdController extends BaseController {

    @Post('/password/reset')
    public async resetPassword (
        @BodyParam('useremail') login: string,
        @Req() request: Request,
        @Res() response: Response) {

        try {
            SecurityControllerHelper.setSessionUserAnonymous(request, response);
            const appUser = await serviceRegistry.getService(ResetChangePwdService).sendResetPasswordMessage(login);
            const alertText = !appUser
                ? 'Ошибка!'
                : `На адрес ${login} отправлено письмо с инструкциями для восстановления пароля`;
            return this.createSuccessResponseWithMessage({}, response, 200, ClientNotifyMessage.createAlert('Восстановление пароля', alertText), '/');
        } catch (err) {
            return this.createFailureResponse(err, response);
        }
    }

    // @Get('/password/reset/verify/:token')
    // public async verifyResetOrChangePassword (
    //     @Param('token') code: string,
    //     @Req() request: Request,
    //     @Res() response: Response) {

    //     const verifier = (token: string) => serviceRegistry.getService(ResetChangePwdService).checkResetOrChangePasswordCode(code);
    //     return this.verifyUserByToken(request, response, token, verifier, LogonStatus.ShouldChangePassword, `/auth/callback/login`, true)
    // }
}