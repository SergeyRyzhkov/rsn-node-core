import { Request, Response, NextFunction } from 'express';
import { BaseController } from '@/controllers/BaseController';
import ServiceContainer from '@/services/ServiceContainer';
import TokenUtil from '@/utils/TokenUtil';
import SessionUser from '@/entities/users/SessionUser';
import { Unauthorized } from '@/exceptions/authErrors/Unauthorized';
import { ResponseWrapper } from '@/controllers/ResponseWrapper';

export const authorized = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!BaseController.isUserAuthorized(req)) {
      const error = new Unauthorized(`${req.ip} unauthorized`);
      next(error);
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

export const refreshAccessToken = () => {
  return async (req: Request, res: Response, next: NextFunction) => {

    BaseController.setCurrentUserAnonymous(req, res);

    const tokenHeader = req.get('x-access-token') || req.get('authorization');

    if (tokenHeader && tokenHeader.startsWith('Bearer ')) {
      const accessToken = tokenHeader.slice(7, tokenHeader.length);
      try {
        const newAccessToken = await ServiceContainer.AuthService.refreshAccessToken(accessToken);
        req.user = TokenUtil.getSessionUserId(newAccessToken);
        BaseController.setJWTHeader(res, newAccessToken);
        next();
      } catch (err) {
        req.user = SessionUser.anonymousUser.appUserId;
        next();
      }
    } else {
      BaseController.setCurrentUserAnonymous(req, res)
      next();
    }
  }
}


// Надо отделить.
//   Одно - обновление токена,
//     Другое - проврека авторизованности
//
// заодно может сдесь и провреять, подтверждено ли мыло ?
