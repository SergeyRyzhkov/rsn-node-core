import { Request, Response } from "express";
import { SessionUser } from "@/models/security/SessionUser";
import { AuthService } from "@/services/security/auth/AuthService";
import { ServiceRegistry } from "@/ServiceRegistry";
import { JWTHelper } from "@/services/security/JWTHelper";
import { ConfigManager } from "@/ConfigManager";
import { SecurityConfig } from "@/services/security/SecurityConfig";
import { AuthResult } from "@/services/security/auth/AuthResult";
import { logger } from "@/utils/Logger";

export class SecurityHelper {
    private static securityConfig = ConfigManager.instance.getOptionsAsClass(SecurityConfig, "SecurityConfig");

    // FIXME: Кука время жизни истечет
    public static setRemeberMeCookie(res: Response, accessToken: string) {
        if (!!accessToken) {
            const cookieOptions: any = {};
            cookieOptions.expires = new Date(Date.now() + this.securityConfig.refreshTokenAgeInSeconds * 1000);
            cookieOptions.maxAge = this.securityConfig.refreshTokenAgeInSeconds * 1000;
            cookieOptions.httpOnly = true;

            if (this.securityConfig.cookieSecure) {
                cookieOptions.secure = res.app.get("env") === "production";
            }

            if (!!this.securityConfig.cookieDomain) {
                cookieOptions.domain = this.securityConfig.cookieDomain;
            }

            res.cookie(this.securityConfig.jwtCookieName, accessToken, cookieOptions);
        }
    }

    public static clearRemeberMeCookie(res: Response) {
        res.clearCookie(this.securityConfig.jwtCookieName);
    }

    public static getAccessTokenFromHeader(req: Request) {
        const tokenHeader = req.get("x-access-token") || req.get("authorization");
        if (tokenHeader && tokenHeader.startsWith("Bearer ")) {
            return tokenHeader.slice(7, tokenHeader.length);
        }
        return null;
    }

    public static setJWTHeader(res: Response, jwt: string) {
        res.header(this.securityConfig.jwtHeaderName, jwt);
    }

    public static removeJWTHeader(res: Response) {
        res.removeHeader(this.securityConfig.jwtHeaderName);
    }

    public static getSessionUserFromToken(req: Request): SessionUser {
        let sessionUser = SessionUser.anonymousUser;
        const token = this.getAccessTokenFromHeader(req);
        if (!!token) {
            sessionUser = JWTHelper.getTokenUser(token);
        }
        return sessionUser;
    }

    // Вспомнить меня. В куке должен быть юзвер и старый access token
    public static async getLogonResultFromCookie(req: Request): Promise<AuthResult> {
        const logonResult: AuthResult = new AuthResult();
        try {
            if (!!req.cookies) {
                const token = req.cookies[this.securityConfig.jwtCookieName];
                if (!!token) {
                    const sessionUser = JWTHelper.getTokenUser(token);
                    const newAccessToken = await ServiceRegistry.instance.getService(AuthService).verifyUpdateAccessToken(token);
                    logonResult.newAccessToken = newAccessToken;
                    logonResult.makeOK(sessionUser, "");
                }
            }
        } catch (err) {
            logger.error(err);
        }
        return logonResult;
    }

    public static isUserAuthorized(req: Request) {
        return ServiceRegistry.instance.getService(AuthService).isUserAuthorized(this.getSessionUserFromToken(req));
    }

    // Юзверь залогинился, но еще не подтвердил регистрацию кодом или логин кодом
    public static isUserTemporaryAuthorized(req: Request) {
        return ServiceRegistry.instance.getService(AuthService).isUserTemporaryAuthorized(this.getSessionUserFromToken(req));
    }

    public static setCurrentUserAnonymous(res: Response) {
        this.removeJWTHeader(res);
    }
}
