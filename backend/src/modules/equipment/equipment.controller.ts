import { Request, Response, NextFunction } from 'express';
import { EquipmentService } from './equipment.service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class EquipmentController {
    static async getMyAssets(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const assets = await EquipmentService.getPartyAssets(req.user.partyId);
            res.status(200).json({ status: 'success', data: assets });
        } catch (error) {
            next(error);
        }
    }

    static async getTypes(_req: Request, res: Response, next: NextFunction) {
        try {
            const types = await EquipmentService.getTypes();
            res.status(200).json({ status: 'success', data: types });
        } catch (error) {
            next(error);
        }
    }
}
