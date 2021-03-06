import { Request, Response, NextFunction } from "express";
import { logger } from "@/utils/Logger";
import { ResponseWrapper } from "@/controllers/ResponseWrapper";

export const errorMiddleware = () => {
    return (err: any, req: Request, res: Response, next: NextFunction) => {
        logger.error(err.message);
        logger.error(`ErrorMiddleware: originalUrl': ${req.originalUrl}`);
        if (res.headersSent) {
            next(err);
        } else {
            const response = ResponseWrapper.createFailure(err);
            res.status(response.status).json(response);
        }
    };
};
