import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/Logger';
import { ResponseWrapper } from '@/controllers/ResponseWrapper';

// FIXME: Implement

export const errorMiddleware = () => {
  return async (error: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(error);
    logger.error(req.originalUrl);
    const response = ResponseWrapper.createFailure(error);
    res.status(response.status).json(response);
  }
}


