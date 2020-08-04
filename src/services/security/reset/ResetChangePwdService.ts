import { serviceRegistry } from '@/ServiceRegistry';
import { UserService } from '../user/UserService';
import { ChangePasswordStatus, ChangePwdResult } from '@/services/security/reset/ChangePwdResult';
import { AuthResult, LogonStatus } from '../auth/AuthResult';
import { isPasswordStrenght } from '@/utils/Validators';
import { AppUser } from '../../../models/security/AppUser';
import { AuthService } from '../auth/AuthService';
import { BaseService } from '@/services/BaseService';
import { SessionUser } from '../user/SessionUser';

export class ResetChangePwdService extends BaseService {

    // Запрос на восстановление пароля
    public async sendResetPasswordMessage (login: string) {
        // Ищем пользователя по мылу
        const appUser = await serviceRegistry.getService(UserService).getByLogin(login);
        if (appUser) {
            //        const code = await this.twoFactorStrategy.sendResetPasswordMessage(appUser);
            appUser.appUserResetPwdDate = new Date(Date.now()).toUTCString();
            // appUser.appUserResetPwd = code;
            await serviceRegistry.getService(UserService).save(appUser);
        }
        return appUser;
    }

    // Проверка кода (токена) на восстановление
    public async checkResetPasswordCode (code: string) {
        const appUser = await serviceRegistry.getService(UserService).getByResetPasswordToken(code);
        if (!appUser) {
            return null;
        }

        //  const tokenExpired = this.twoFactorStrategy.isResetPasswordCodeExpired(appUser);
        //if (!tokenExpired) {
        //    return null;
        // }

        appUser.appUserResetPwd = null;
        appUser.appUserResetPwdDate = null;
        return await serviceRegistry.getService(UserService).save(appUser);
    }

    // Смена пароля
    public async changePassword (sessionUser: SessionUser, oldPassword: string, newPassword: string) {
        const сhangePasswordResult = new ChangePwdResult();
        сhangePasswordResult.makeUnknownResult();

        const verifyDone = async (logonResult: AuthResult) => {
            // Если авторизация по предыдущему паролю прошла
            if (logonResult.logonStatus === LogonStatus.OK) {
                сhangePasswordResult.makeOKResult(sessionUser);
                sessionUser.reset = false;
                this.saveNewPassword(sessionUser, newPassword);
            } else {
                сhangePasswordResult.makeFailedResult(sessionUser);
            }
        }

        if (oldPassword === newPassword) {
            сhangePasswordResult.makeOldAndNewPasswordAreEquals(sessionUser);
        }

        if (!isPasswordStrenght(newPassword)) {
            сhangePasswordResult.makePasswordIsNotStrongResult(sessionUser);
        }

        // Пробуем авторизовать, если это не сброс пароля был через 2FA (sessionUser.reset) далее в verifyDone
        if (сhangePasswordResult.status === ChangePasswordStatus.Unknown && !sessionUser.reset) {
            await serviceRegistry.getService(AuthService).loginByPassword(sessionUser.appUserLogin, oldPassword, null);
        }

        //  (sessionUser.reset) - был сброс пароля через 2FA - прсото меняем пароль
        if (сhangePasswordResult.status === ChangePasswordStatus.Unknown && sessionUser.reset) {
            sessionUser.reset = false;
            сhangePasswordResult.makeOKResult(sessionUser);
            this.saveNewPassword(sessionUser, newPassword);
        }

        return сhangePasswordResult;
    }


    private saveNewPassword (sessionUser: SessionUser, newPassword: string) {
        const appUser = new AppUser();
        appUser.appUserId = sessionUser.appUserId;
        //  appUser.appUserPwdHash = bcrypt.hashSync(newPassword, AuthService.bcryptSaltRounds);
        serviceRegistry.getService(UserService).save(appUser);
    }

}