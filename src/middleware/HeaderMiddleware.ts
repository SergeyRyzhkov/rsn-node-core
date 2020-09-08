import { Request, Response, NextFunction } from 'express';

export const headerMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,HEAD,PATCH,POST,DELETE,PUT');
    // if (AppConfig.authConfig) {
    //   // res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Requested-With, Accept, Authorization,' + AppConfig.authConfig.jwtHeaderName);
    //   // res.header('Access-Control-Expose-Headers', AppConfig.authConfig.jwtHeaderName);
    //   res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Requested-With, Accept, Authorization');
    // }
    next();
  }
}

export const headerNoCacheMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    next();
  }
}

// Для хрома, чтобы смотреть какие картинки не в том размере ит.д.
export const headerFeaturePolicy = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.header('Feature-Policy', 'oversized-images=none, unoptimized-lossy-images=none');
    next();
  }
}