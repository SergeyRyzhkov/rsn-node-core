import { Request, Response, NextFunction } from 'express';
import { BaseController } from '@/controllers/BaseController';
import { JWTHelper } from '@/services/security/JWTHelper';
import { ResponseWrapper } from '@/controllers/ResponseWrapper';
import { serviceRegistry } from '@/ServiceRegistry';
import { AuthService } from '@/services/security/auth/AuthService';
import { AppConfig } from '@/utils/Config';
import { ForbiddenException } from '@/exceptions/authErrors/ForbiddenException';


export const authorized = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!BaseController.isUserAuthorized(req)) {
      next(new ForbiddenException('ForbiddenException'));
    } else {
      next();
    }
  }
}



export const authorizedOrEmptyResult = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!BaseController.isUserAuthorized(req)) {
      const response = ResponseWrapper.createSuccsess(null);
      res.status(response.status).json(response);
    } else {
      next();
    }
  }
}


export const verifyAndUpdateAccessToken = () => {
  return async (req: Request, res: Response, next: NextFunction) => {

    const jwtCookie = req.cookies[AppConfig.authConfig.cookieName];
    if (!!jwtCookie) {
      try {
        const jwtObj = JSON.parse(jwtCookie);
        const jwt = jwtObj.accessToken;
        const newAccessToken = await serviceRegistry.getService(AuthService).verifyAndUpdateAccessToken(jwt);
        const sessionUser = JWTHelper.getTokenUser(newAccessToken);

        BaseController.setSessiontUser(sessionUser, req);
        BaseController.setJWTCookie(res, newAccessToken);

      } catch (err) {
        BaseController.setSessionUserAnonymous(req, res)
      }
    }
    next();
  }
}
