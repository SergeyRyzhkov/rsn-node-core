

import { Request, Response } from 'express';
import { AppConfig } from '@/utils/Config';
import { SessionUser } from '@/models/security/SessionUser';

export class SecurityControllerHelper {

    public static setJWTCookie (res: Response, accessToken: string) {
        //  public static addJWTCookie (res: Response, payload: any, accessToken?: string) {
        const cookie = {
            //      payload,
            accessToken
        }

        // FIXME: В настройки
        const cookieOptions = {
            // expires: new Date(Date.now() + AppConfig.authConfig.cookieExpires),
            maxAge: 300e3,
            httpOnly: true,
            hostOnly: false,
            secure: false,
            sameSite: true
        }

        if (res.app.get('env') === 'production') {
            cookieOptions.secure = true;
        }

        res.cookie(AppConfig.authConfig.cookieName, JSON.stringify(cookie), cookieOptions);
    }

    public static clearJWTCookie (res: Response) {
        res.clearCookie(AppConfig.authConfig.cookieName);
    }


    public static getAccessToken (req: Request) {
        const jwtCookie = req.cookies[AppConfig.authConfig.cookieName];
        if (!!jwtCookie) {
            try {
                const jwtObj = JSON.parse(jwtCookie);
                return jwtObj.accessToken;
            }
            catch (err) {
            }
        }

        return null;
    }


    public static setSessionUserAnonymous (req: Request, res: Response) {
        if (!!req && !!req.session) {
            req.session.sessionUser = SessionUser.anonymousUser.appUserId;
        }
        this.clearJWTCookie(res);
    }

    public static setSessiontUser (sessionUser: SessionUser, req: Request) {
        if (!!req && !!req.session) {
            req.session.sessionUser = sessionUser;
        }
    }

    public static getSessionUser (req: Request): SessionUser {
        return this.isUserAuthorized(req) ? req.session.sessionUser : SessionUser.anonymousUser;
    }

    public static isUserAuthorized (req: Request) {
        return !!req && !!req.session && !!req && !!req.session.sessionUser && req.session.sessionUser.appUserId !== 0;
    }
}
