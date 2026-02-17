import { Response, NextFunction } from 'express';
import { PartiesService } from './parties.service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class PartiesController {
    static async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const profile = await PartiesService.getProfile(req.user.partyId);
            res.status(200).json({
                status: 'success',
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateMySettings(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            console.log('Update Settings Request:', {
                partyId: req.user?.partyId,
                body: req.body
            });

            if (!req.user) throw new Error('Unauthorized');
            await PartiesService.updateSettings(req.user.partyId, req.body);
            res.status(200).json({
                status: 'success',
                message: 'Settings updated successfully'
            });
        } catch (error) {
            console.error('Update Settings Error:', error);
            next(error);
        }
    }

    static async getAllParties(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const type = req.query.type as string | undefined;
            const parties = await PartiesService.getAllParties(type);
            res.status(200).json({
                status: 'success',
                data: parties
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            await PartiesService.updateStatus(Number(req.params.id), req.body.status);
            res.status(200).json({
                status: 'success',
                message: 'User status updated'
            });
        } catch (error) {
            next(error);
        }
    }
}
