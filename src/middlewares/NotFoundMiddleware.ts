
import { Request, Response, NextFunction } from 'express';
import { ResponseWrapper } from '@/controllers/ResponseWrapper';
import { NotFound } from '@/exceptions/clientErrors/NotFound';

export const notFoundMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const error = new NotFound(req.originalUrl);
    const response = ResponseWrapper.createFailure(error);
    res.status(error.status).json(response);
  }
}
