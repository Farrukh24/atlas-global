
import { Response, NextFunction } from 'express';
import { UsersService } from './users.service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class UsersController {
    static async getLanguage(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const language = await UsersService.getLanguage(req.user.partyId);
            res.status(200).json({
                status: 'success',
                data: { language }
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateLanguage(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const { language } = req.body;

            if (!['ru', 'en', 'uz'].includes(language)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid language preference. Supported: ru, en, uz'
                });
            }

            await UsersService.updateLanguage(req.user.partyId, language);
            res.status(200).json({
                status: 'success',
                message: 'Language preference updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}
