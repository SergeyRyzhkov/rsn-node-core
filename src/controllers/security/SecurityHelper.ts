

import { Request, Response } from 'express';
import { AppConfig } from '@/utils/Config';
import { SessionUser } from '@/models/security/SessionUser';
import { AuthService } from '@/services/security/auth/AuthService';
import { ServiceRegistry } from '@/ServiceRegistry';
import { JWTHelper } from '@/services/security/JWTHelper';

export class SecurityHelper {

    public static setJWTCookie (res: Response, accessToken: string, maxAgeInSeconds = 20 * 24 * 60 * 60) {
        // FIXME: В настройки
        const cookieOptions = {
            expires: new Date(Date.now() + maxAgeInSeconds * 1000),
            httpOnly: true,
            // hostOnly: false,
            // sameSite: true, 
            secure: res.app.get('env') === 'production'
        }

        if (!accessToken) {
            const rrr = ''
        }
        res.cookie(AppConfig.authConfig.cookieName, accessToken, cookieOptions);
    }

    public static clearJWTCookie (res: Response) {
        res.clearCookie(AppConfig.authConfig.cookieName);
    }


    public static getAccessToken (req: Request) {
        return req.cookies[AppConfig.authConfig.cookieName];
    }

    // Получить ререшь токен (он также д.б. в базе), который как ключ в JWT
    public static getSessionToken (req: Request) {
        const token = SecurityHelper.getAccessToken(req);
        return JWTHelper.getJwtId(token);
    }

    public static getSessionUserFromToken (req: Request): SessionUser {
        let sessionUser = SessionUser.anonymousUser
        const token = SecurityHelper.getAccessToken(req);
        if (!!token) {
            sessionUser = JWTHelper.getTokenUser(token);
        }
        return sessionUser;
    }

    public static isUserAuthorized (req: Request) {
        return ServiceRegistry.instance.getService(AuthService).isUserAuthorized(SecurityHelper.getSessionUserFromToken(req));
    }

    // Юзверь залогинился, но еще не подтвердил регистрацию кодом или логин кодом
    public static isUserTemporaryAuthorized (req: Request) {
        return ServiceRegistry.instance.getService(AuthService).isUserTemporaryAuthorized(SecurityHelper.getSessionUserFromToken(req));
    }
}
