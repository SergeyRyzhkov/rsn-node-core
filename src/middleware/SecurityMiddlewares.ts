import { Request, Response, NextFunction } from 'express';
import { JWTHelper } from '@/services/security/JWTHelper';
import { serviceRegistry } from '@/ServiceRegistry';
import { AuthService } from '@/services/security/auth/AuthService';
import { AppConfig } from '@/utils/Config';
import { Unauthorized } from '@/exceptions/authErrors/Unauthorized';
import { SecurityControllerHelper } from '@/controllers/security/SecurityControllerHelper';
import { ForbiddenException } from '@/exceptions/authErrors/ForbiddenException';

// FIXME: А если пользователь зарегеисрировался, но не подтвердил и это можно (пока не истечет время подтверждения), то не пустет все равно :(
export const authorized = (errorMessage?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!SecurityControllerHelper.isUserAuthorized(req)) {
      next(new Unauthorized(errorMessage));
    } else {
      next();
    }
  }
}


// Юзверь залогинился, но еще не подтвердил регистрацию кодом или логин кодом
export const temporaryAuthorized = (errorMessage?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!SecurityControllerHelper.isUserTemporaryAuthorized(req)) {
      next(new Unauthorized(errorMessage));
    } else {
      next();
    }
  }
}

// FIXME: Исправить на массив ролей у юзверя
export const permit = (...allowedRoles: number[]) => {
  // Ищем пересечение ролей на входе замыкания и ролей юзверя
  // const isAllowed = (userRoles: number[]) => {
  //   if (!!userRoles && !!allowedRoles) {
  //     return allowedRoles.filter(x => userRoles.includes(x)).length > 0;
  //   }
  //   return false;
  // }
  const isAllowed = (roleId: number) => {
    return !!allowedRoles ? allowedRoles.indexOf(roleId) > -1 : false;
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    const user = SecurityControllerHelper.getSessionUser(req);

    if (SecurityControllerHelper.isUserAuthorized(req) && isAllowed(user.roleIdList)) {

      next();
    } else {
      next(new ForbiddenException());
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
        SecurityControllerHelper.setSessionUserAnonymous(req, res);
      }
    }
    next();
  }
}
