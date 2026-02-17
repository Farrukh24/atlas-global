import { Request, Response, NextFunction } from 'express';
import { TrackingService } from './tracking.service.js';
import { handleTrackingUpdate } from './tracking.socket.js';
import { AuthRequest } from '../../middleware/auth.js';

export class TrackingController {
    static async getHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const history = await TrackingService.getHistory(Number(req.params.loadId));
            res.status(200).json({ status: 'success', data: history });
        } catch (error) {
            next(error);
        }
    }

    static async submitPosition(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const loadId = Number(req.params.loadId);
            const event = await handleTrackingUpdate(loadId, req.body);
            res.status(201).json({ status: 'success', data: event });
        } catch (error) {
            next(error);
        }
    }
}
