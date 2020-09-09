import { ServiceRegistry } from '@/ServiceRegistry';
import { AppUserService } from '../user/AppUserService';
import { ResetPasswordResult } from '@/services/security/reset/ResetPasswordResult';
import { AppUser } from '../../../models/security/AppUser';
import { BaseService } from '@/services/BaseService';
import { ResetPasswordOptions } from './ResetPasswordOptions';
import { ConfigManager } from '@/ConfigManager';
import { SecurityConfig } from '../SecurityConfig';
import { SmtpOptions } from '@/services/mail/SmtpOptions';
import { Guid } from '@/utils/Guid';
import { MailSender } from '@/services/mail/MailSender';
import { AppUserSessionService } from '../user/AppUserSessionService';

export class ResetPasswordService extends BaseService {
    private mailSender: MailSender = new MailSender();
    private options: ResetPasswordOptions;

    constructor(options?: ResetPasswordOptions) {
        super();
        this.options = options || ConfigManager.instance.getOptions(SecurityConfig)?.resetPasswordOptions;
        this.options = this.options || new ResetPasswordOptions();
    }

    // Запрос на восстановление пароля
    public async sendResetPasswordMessage (login: string) {
        const result: ResetPasswordResult = new ResetPasswordResult();

        // Ищем пользователя по логину
        const appUser = await ServiceRegistry.instance.getService(AppUserService).getByLogin(login);

        if (!appUser) {
            return result.makeFailed(this.options.resetPasswordUserNotFoundMessage);
        }

        if (this.options.resetPasswordEmailConfirm) {
            await this.sendMail(appUser);
            return result.makeRequereConfirmBySmsCode(this.options.resetPasswordMailSendMessage);
        } else {
            await this.sendSms(appUser);
            return result.makeRequereConfirmBySmsCode(this.options.resetPasswordSmsSendMessage);
        }

    }

    // Проверка кода (токена) на восстановление пароля
    public async confirmResetPasswordByCode (code: string) {
        const result = new ResetPasswordResult();

        // Ищщем пользователя по токену (коду)
        const appUser = await ServiceRegistry.instance.getService(AppUserService).getByResetPasswordToken(code);
        if (!appUser) {
            return result.makeFailed(this.options.resetPasswordUserNotFoundMessage);
        }

        if (appUser.appUserResetPwd !== code) {
            return result.makeFailed(this.options.resetPasswordInvalidCodeMessage);
        }

        const isExpared = Date.now() - Date.parse(appUser.appUserResetPwdDate) > this.options.resetPasswordLifetimeInSeconds * 1000;

        if (isExpared) {
            appUser.appUserResetPwdDate = null;
            appUser.appUserResetPwd = null;
            await ServiceRegistry.instance.getService(AppUserService).save(appUser);
            return result.makeResetPasswordExpaired(this.options.resetPasswordExpareddMessage);
        }

        // Все нормально - создаем
        appUser.appUserResetPwd = null;
        appUser.appUserResetPwdDate = null;
        await ServiceRegistry.instance.getService(AppUserService).save(appUser);

        const sessionUser = ServiceRegistry.instance.getService(AppUserService).convertAppUserToSessionUser(appUser);
        result.newAccessToken = await ServiceRegistry.instance.getService(AppUserSessionService).saveUserSessionAndCreateJwt(sessionUser);
        result.makeResetPasswordOK(sessionUser, this.options.resetPasswordOKMessage);

    }

    // Отправка смс - для сброса пароля
    public async sendSms (user: AppUser) {
        user.appUserResetPwdDate = new Date(Date.now()).toUTCString();
        user.appUserResetPwd = '77777';
        return await ServiceRegistry.instance.getService(AppUserService).save(user);
    }

    // Отправка письма - для сброса пароля
    public async sendMail (user: AppUser) {
        user.appUserResetPwdDate = new Date(Date.now()).toUTCString();
        user.appUserResetPwd = Guid.newGuid();

        const format = (template: string) => {
            const url = `${this.options.resetPasswordUrl}/${user.appUserResetPwd}`;
            return template.replace(this.options.resetPasswordUrlTemplateExpression, url);
        }

        const message = {
            from: ConfigManager.instance.getOptions(SmtpOptions).from,
            to: user.appUserMail,
            text: '',
            html: '',
            subject: this.options.resetPasswordMailHeader
        }
        this.mailSender.sendFromTemplate(message, this.options.resetPasswordMailTemplate, format);
        return await ServiceRegistry.instance.getService(AppUserService).save(user);
    }
}