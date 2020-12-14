import { Request, Response } from 'express';
import { SessionUser } from '@/models/security/SessionUser';
import { AuthService } from '@/services/security/auth/AuthService';
import { ServiceRegistry } from '@/ServiceRegistry';
import { JWTHelper } from '@/services/security/JWTHelper';
import { ConfigManager } from '@/ConfigManager';
import { SecurityConfig } from '@/services/security/SecurityConfig';

export class SecurityHelper {

    private static securityConfig = ConfigManager.instance.getOptionsAsClass(SecurityConfig, "SecurityConfig");

    public static setJWTCookie (res: Response, accessToken: string, rememberMe = true) {
        const cookieOptions: any = {};

        if (!!this.securityConfig.cookieDomain) {
            cookieOptions.domain = this.securityConfig.cookieDomain;
        }
        //   cookieOptions.httpOnly = true;
        cookieOptions.secure = res.app.get('env') === 'production';

        //  if (rememberMe === true) {
        cookieOptions.expires = new Date(Date.now() + this.securityConfig.refreshTokenAgeInSeconds * 1000);
        cookieOptions.maxAge = this.securityConfig.refreshTokenAgeInSeconds * 1000;
        //}

        if (!accessToken) {
            this.clearJWTCookie(res);
        } else {
            res.cookie(this.securityConfig.jwtCookieName, accessToken, cookieOptions);
        }
    }

    public static clearJWTCookie (res: Response) {
        res.clearCookie(this.securityConfig.jwtCookieName);
    }


    public static getAccessToken (req: Request) {
        return req.cookies ? req.cookies[this.securityConfig.jwtCookieName] : null;
    }

    public static getSessionUserFromToken (req: Request): SessionUser {
        let sessionUser = SessionUser.anonymousUser
        const token = req.cookies ? req.cookies[this.securityConfig.jwtCookieName] : null;
        if (!!token) {
            sessionUser = JWTHelper.getTokenUser(token);
        }
        return sessionUser;
    }

    public static isUserAuthorized (req: Request) {
        return ServiceRegistry.instance.getService(AuthService).isUserAuthorized(this.getSessionUserFromToken(req));
    }

    // Юзверь залогинился, но еще не подтвердил регистрацию кодом или логин кодом
    public static isUserTemporaryAuthorized (req: Request) {
        return ServiceRegistry.instance.getService(AuthService).isUserTemporaryAuthorized(this.getSessionUserFromToken(req));
    }
}
