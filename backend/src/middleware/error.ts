import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    console.error(`[ERROR] ${req.method} ${req.url}:`, err);

    res.status(statusCode).json({
        status: 'error',
        message,
        stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
