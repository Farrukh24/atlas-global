import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { env } from '../config/env.js';
import { AuthError } from '../utils/errors.js';

export interface AuthRequest extends Request {
    user?: {
        partyId: number;
        type: string;
        verificationStatus: string;
    };
}

export const authenticate = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new AuthError('Authentication required', 401);
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as {
            partyId: number;
            type: string;
        };

        // Verify user still exists and is active
        const result = await query(
        `SELECT id, type, verification_status, account_status 
        FROM parties 
        WHERE id = $1 AND deleted_at IS NULL`,
        [decoded.partyId]
        );

        if (result.rows.length === 0) {
            throw new AuthError('User not found', 401);
        }

        const user = result.rows[0];

        if (user.account_status !== 'active') {
            throw new AuthError('Account is suspended or closed', 403);
        }

        req.user = {
            partyId: user.id,
            type: user.type,
            verificationStatus: user.verification_status
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AuthError('Invalid token', 401));
        } else {
            next(error);
        }
    }
};

export const authorize = (...allowedTypes: string[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            next(new AuthError('Authentication required', 401));
            return;
        }

        if (!allowedTypes.includes(req.user.type)) {
            next(new AuthError('Insufficient permissions', 403));
            return;
        }

        next();
    };
};
