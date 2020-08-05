import { Request, Response, NextFunction } from 'express';
import { JWTHelper } from '@/services/security/JWTHelper';
import { ResponseWrapper } from '@/controllers/ResponseWrapper';
import { serviceRegistry } from '@/ServiceRegistry';
import { AuthService } from '@/services/security/auth/AuthService';
import { AppConfig } from '@/utils/Config';
import { ForbiddenException } from '@/exceptions/authErrors/ForbiddenException';
import { SecurityControllerHelper } from '@/controllers/security/SecurityControllerHelper';


export const authorized = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!SecurityControllerHelper.isUserAuthorized(req)) {
      next(new ForbiddenException('ForbiddenException'));
    } else {
      next();
    }
  }
}



export const authorizedOrEmptyResult = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!SecurityControllerHelper.isUserAuthorized(req)) {
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

        SecurityControllerHelper.setSessiontUser(sessionUser, req);
        SecurityControllerHelper.setJWTCookie(res, newAccessToken);

      } catch (err) {
        SecurityControllerHelper.setSessionUserAnonymous(req, res)
      }
    }
    next();
  }
}
