
import { Response, NextFunction } from 'express';
import { PaymentsService } from './payments.service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class PaymentsController {
    static async getEarnings(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const data = await PaymentsService.getEarnings(req.user.partyId);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
}
