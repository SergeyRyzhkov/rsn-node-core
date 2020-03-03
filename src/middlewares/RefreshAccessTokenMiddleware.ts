import { Request, Response, NextFunction } from 'express';
import { SessionUser } from '@/entities/users/SessionUser';
import { TokenUtil } from '@/utils/TokenUtil';
import { BaseController } from '@/controllers/BaseController';
import { ServiceRegistry } from '@/services/ServiceContainer';
import { AuthService } from '@/services/user/AuthService';

export const refreshAccessTokenMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {

    BaseController.setCurrentUserAnonymous(req, res);

    const tokenHeader = req.get('x-access-token') || req.get('authorization');

    if (tokenHeader && tokenHeader.startsWith('Bearer ')) {
      const accessToken = tokenHeader.slice(7, tokenHeader.length);
      try {
        const newAccessToken = await ServiceRegistry.getService(AuthService).refreshAccessToken(accessToken);
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
