import { Request, Response, NextFunction } from 'express';
import { ServiceRegistry } from '@/ServiceRegistry';
import { AuthService } from '@/services/security/auth/AuthService';
import { Unauthorized } from '@/exceptions/authErrors/Unauthorized';
import { SecurityHelper } from '@/controllers/security/SecurityHelper';

export const authorized = (errorMessage?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!SecurityHelper.isUserAuthorized(req)) {
      next(new Unauthorized(errorMessage));
    } else {
      next();
    }
  }
}


// Юзверь залогинился, но еще не подтвердил регистрацию кодом или логин кодом
export const temporaryAuthorized = (errorMessage?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!SecurityHelper.isUserTemporaryAuthorized(req)) {
      next(new Unauthorized(errorMessage));
    } else {
      next();
    }
  }
}


// // FIXME: Исправить на массив ролей у юзверя
// export const permit = (...allowedRoles: number[]) => {
//   // Ищем пересечение ролей на входе замыкания и ролей юзверя
//   // const isAllowed = (userRoles: number[]) => {
//   //   if (!!userRoles && !!allowedRoles) {
//   //     return allowedRoles.filter(x => userRoles.includes(x)).length > 0;
//   //   }
//   //   return false;
//   // }
//   const isAllowed = (roleId: number) => {
//     return !!allowedRoles ? allowedRoles.indexOf(roleId) > -1 : false;
//   }

//   return async (req: Request, res: Response, next: NextFunction) => {
//     const user = SecurityHelper.getSessionUserFromToken(req);

//     if (!!user && SecurityHelper.isUserAuthorized(req) && isAllowed(user.roleIdList)) {
//       next();
//     } else {
//       next();
//       // next(new ForbiddenException());
//     }
//   }
// }

export const verifyUpdateAccessToken = () => {
  return async (req: Request, res: Response, next: NextFunction) => {

    const jwt = SecurityHelper.getAccessToken(req);

    if (!!jwt) {
      try {
        const newAccessToken = await ServiceRegistry.instance.getService(AuthService).verifyUpdateAccessToken(jwt);
        SecurityHelper.setJWTCookie(res, newAccessToken);
      } catch (err) {
        SecurityHelper.clearJWTCookie(res);
      }
    }

    next();
  }
}
