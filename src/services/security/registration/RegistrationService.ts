import { BaseService } from '../../BaseService';
import { RegistrationResult } from '@/services/security/registration/RegistrationResult';
import { serviceRegistry } from '@/ServiceRegistry';
import { UserService } from '../user/UserService';
import { AppUser } from '@/models/security/AppUser';
import { AuthService } from '../auth/AuthService';
import { logger } from '@/utils/Logger';
import bcrypt from 'bcrypt';
import { RegistrationOptions } from './RegistrationOptions';
import { MailSender } from '@/services/mail/MailSender';
import { AppConfig } from '@/utils/Config';
import { Guid } from '@/utils/Guid';
import { SessionUser } from '../../../models/security/SessionUser';
import { TwoFactorVerifier } from '../TwoFactorVerifier';

export class RegistrationService extends BaseService {
    private options: RegistrationOptions;
    private mailSender: MailSender = new MailSender(AppConfig.mail);
    private twoFactorVerifier: TwoFactorVerifier = new TwoFactorVerifier();

    constructor(options?: RegistrationOptions) {
        super();
        this.options = !!options ? options : new RegistrationOptions();
    }

    public async registerUser (login: string, password: string, unlinkedSocialProfile: SessionUser): Promise<RegistrationResult> {
        const registrationResult: RegistrationResult = new RegistrationResult();

        let sessionUser: SessionUser = null;

        // FIXME: Регулярки проверки в настройки
        // if (!this.options.isLoginByPhone && !isEmailValid(login)) {
        //     return registrationResult.makeInvalid(this.options.invalidEmailMessage);
        // }

        // if (this.options.isLoginByPhone && !isPhoneValid(login.trim())) {
        //     return registrationResult.makeInvalid(this.options.invalidPhoneMessage);
        // }

        // if (!isPasswordStrenght(password)) {
        //     return registrationResult.makeInvalid(this.options.passwordNotStrenghtMessage);
        // }

        try {
            const userService = serviceRegistry.getService(UserService);
            const user = this.options.isLoginByPhone ? await userService.getByPhone(login) : await userService.getByLogin(login);

            // Уже существует с таким логином
            if (!!user) {
                return registrationResult.makeInvalid(this.options.userAlreadyExistsMessage);
            }

            // Создаем и сохраняем в базе нового пользователя
            const newAppUser = new AppUser();
            if (this.options.isLoginByPhone) {
                newAppUser.appUserPhone = login;
            } else {
                newAppUser.appUserLogin = login;
            }

            newAppUser.appUserPwdHash = bcrypt.hashSync(password, this.options.bcryptSaltRounds);
            newAppUser.appUserRegDate = new Date(Date.now()).toUTCString();
            await userService.save(newAppUser);

            // Если на клиенте был авторизованный профиль соц.сети - линкуем
            if (!!unlinkedSocialProfile && unlinkedSocialProfile.userSnProfileId > 0) {
                unlinkedSocialProfile.appUserId = newAppUser.appUserId;
                const userSocProfile = await userService.linkSessionUserToSocialNetwork(unlinkedSocialProfile.userSnProfileType, unlinkedSocialProfile);
                if (!!userSocProfile) {
                    sessionUser = userService.convertAppUserSocialNetProfileToSessionUser(userSocProfile);
                    sessionUser.appUserRegVerifiedInd = newAppUser.appUserRegVerifiedInd;
                    sessionUser.appUserRegDate = newAppUser.appUserRegDate;
                }
            }

            // Если не было свзяи с соц.сетью, сессионого пользоваиеля сделаем из регистрации
            if (!sessionUser) {
                sessionUser = userService.convertAppUserToSessionUser(newAppUser);
            }

            // Отправляем запрос на подтверждение по смс
            if (this.options.isRequireConfirmationBySms) {
                await this.sendSmsConfirmRegistrationMessage(newAppUser);
                return registrationResult.makeRequereConfirmBySmsCode(sessionUser, this.options.requireSmsConfirmationMessage);
            }

            // Отправляем запрос на подтверждение по почте
            if (this.options.isRequireConfirmationByEmail && !this.options.isAutoLogin) {
                await this.sendMailConfirmRegistrationMessage(newAppUser);
                return registrationResult.makeRequereConfirmByEmail(this.options.requireConfirmationEmailMessage);
            }

            // Логиним если в параметрах автологин (то есть подтверждение по почте потом (или не надо)) или не нужно подтверждение вообще
            if (this.options.isAutoLogin) {
                const newAccessToken = await serviceRegistry.getService(AuthService).autoLoginUser(sessionUser);
                registrationResult.newAccessToken = newAccessToken;
                const message = this.options.isRequireConfirmationByEmail ? this.options.requireEmailMessage : this.options.registrationCompliteMessage;
                return registrationResult.makeOK(sessionUser, message);
            }

            return registrationResult;
        } catch (err) {
            logger.error(err);
            return registrationResult.makeInvalid();
        }
    }

    public async confirmRegistrationByEmail (token: string) {
        const user = await this.twoFactorVerifier.verifyByEmailLink(token);
        return this.autoLogonUserAfter2FA(user);
    }

    public async confirmRegistrationByCode (code: number, userId: number) {
        const user = await this.twoFactorVerifier.verifyByCode(code, userId);
        return this.autoLogonUserAfter2FA(user);
    }

    // Отправка почты - для подтверждения регистрации
    public async sendMailConfirmRegistrationMessage (user: AppUser) {
        user.appUserRegToken = Guid.newGuid();
        await serviceRegistry.getService(UserService).save(user);

        const format = (template: string) => {
            const clientConfirmUrl = `${this.options.сonfirMailUrl}/${user.appUserRegToken}`;
            return template.replace(this.options.сonfirmUrlTemplateExpression, clientConfirmUrl);
        }

        const message = {
            from: AppConfig.mail.from,
            to: user.appUserLogin,
            text: '',
            html: '',
            subject: this.options.сonfirmMailHeader
        }
        this.mailSender.sendFromTemplate(message, this.options.сonfirmMailTemplate, format);
    }

    // Отправка смс - для подтверждения регистрации
    public async sendSmsConfirmRegistrationMessage (user: AppUser) {
        user.appUserSmsCode = 55555;
        return await serviceRegistry.getService(UserService).save(user);
    }

    private async autoLogonUserAfter2FA (verifiedUser: AppUser) {
        const registrationResult: RegistrationResult = new RegistrationResult();

        try {
            if (!!verifiedUser) {
                verifiedUser.appUserRegVerifiedInd = 1;
                verifiedUser.appUserRegToken = null;
                verifiedUser.appUserSmsCode = null;
                await serviceRegistry.getService(UserService).save(verifiedUser);

                const sessionUser = serviceRegistry.getService(UserService).convertAppUserToSessionUser(verifiedUser);
                registrationResult.newAccessToken = await serviceRegistry.getService(AuthService).autoLoginUser(sessionUser);
                registrationResult.makeOK(sessionUser, this.options.registrationCompliteMessage);
            } else {
                registrationResult.makeInvalid(this.options.invalidConfirmationCodeMessage);
            }
        } catch (err) {
            logger.error(err);
            registrationResult.makeInvalid(this.options.invalidConfirmationCodeMessage);
        } finally {
            return registrationResult;
        }
    }


}
