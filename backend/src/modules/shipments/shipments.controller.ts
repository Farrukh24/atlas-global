
import { Response, NextFunction } from 'express';
import { ShipmentsService } from './shipments.service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class ShipmentsController {
    static async getMyHauls(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const hauls = await ShipmentsService.getCarrierShipments(req.user.partyId);
            res.status(200).json(hauls);
        } catch (error) {
            next(error);
        }
    }

    static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const { status } = req.body;
            const updated = await ShipmentsService.updateStatus(
                Number(req.params.id),
                status,
                req.user.partyId
            );
            res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    }
}
