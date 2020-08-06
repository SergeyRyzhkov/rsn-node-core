import { serviceRegistry } from '@/ServiceRegistry';
import { AppUserService } from './user/AppUserService';
import { AppUser } from '@/models/security/AppUser';
import { logger } from '@/utils/Logger';

export class TwoFactorVerifier {

    public async verifyByEmailLink (emailCode: string): Promise<AppUser> {
        return this.verify(emailCode, -1);
    }

    public async verifyByCode (code: number, userId = 0): Promise<AppUser> {
        return this.verify(code, userId);
    }

    private async verify (smsCodeOrToken: number | string, userId = 0): Promise<AppUser> {
        const userService = serviceRegistry.getService(AppUserService);

        if (!smsCodeOrToken) {
            return Promise.resolve(null);
        }

        try {

            let verifiedUser: AppUser;

            // Подтверждение через код (например SMS) (с контроллера вызвали с SessionUser), проверим у пользователя ранее высталенный код
            if (userId > 0) {
                verifiedUser = await userService.getById(userId);
                return !!verifiedUser && verifiedUser.appUserSmsCode === smsCodeOrToken && !this.isRegistrationCodeExpired(verifiedUser) ? verifiedUser : null;
            } else {
                // Подтверждение через почту/ Проверяем токен
                verifiedUser = await userService.getByEmailCode(smsCodeOrToken);
                return !!verifiedUser && this.isRegistrationCodeExpired(verifiedUser) ? verifiedUser : null;
            }

        } catch (error) {
            Promise.resolve(null);
            logger.error(error);
        }
    }

    // FIXME: учитывать способ подтверждения смс или почта
    private isRegistrationCodeExpired (user: AppUser) {
        return false;
        // return !user || ((Date.now() - Date.parse(user.appUserRegDate)) > this.options.emailConfirmationLifetime * 1000);
    }

}