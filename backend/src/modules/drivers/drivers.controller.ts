import { Request, Response, NextFunction } from 'express';
import { DriversService } from './drivers.service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class DriversController {
    static async getMyDrivers(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const drivers = await DriversService.getPartyDrivers(req.user.partyId);
            res.status(200).json({ status: 'success', data: drivers });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const driver = await DriversService.getDriver(Number(req.params.id));
            res.status(200).json({ status: 'success', data: driver });
        } catch (error) {
            next(error);
        }
    }
}
