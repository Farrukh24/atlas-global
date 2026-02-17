import { Response, NextFunction } from 'express';
import { InvoicesService } from './invoices.service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class InvoicesController {
    static async getMyInvoices(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const invoices = await InvoicesService.getPartyInvoices(req.user.partyId);
            res.status(200).json({ status: 'success', data: invoices });
        } catch (error) {
            next(error);
        }
    }

    static async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const invoice = await InvoicesService.create(req.body);
            res.status(201).json({ status: 'success', data: invoice });
        } catch (error) {
            next(error);
        }
    }
}
