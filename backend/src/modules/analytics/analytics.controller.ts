
import { Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class AnalyticsController {
    static async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const stats = await AnalyticsService.getDashboardStats(req.user.partyId, req.user.type);
            res.status(200).json({ status: 'success', data: stats });
        } catch (error) {
            next(error);
        }
    }

    static async getMarketData(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await AnalyticsService.getMarketData();
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            next(error);
        }
    }

    static async getReportData(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const data = await AnalyticsService.getReportData(req.user.partyId);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            next(error);
        }
    }
}
