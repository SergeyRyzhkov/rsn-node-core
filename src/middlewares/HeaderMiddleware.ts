import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppConfig } from '@/utils/Config';

export const headerMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PATCH,POST,DELETE,PUT,OPTIONS');
    if (AppConfig.authConfig) {
      res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Requested-With, Accept, Authorization,' + AppConfig.authConfig.jwtHeaderName);
      res.header('Access-Control-Expose-Headers', AppConfig.authConfig.jwtHeaderName);
    }
    next();
  }
}

export const headerNoCacheMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    next();
  }
}

export const headerFeaturePolicy = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.header('Feature-Policy', 'oversized-images=none, unoptimized-lossy-images=none');
    next();
  }
}
