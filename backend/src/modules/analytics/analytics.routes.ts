
import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', AnalyticsController.getDashboardStats);
router.get('/market', AnalyticsController.getMarketData);
router.get('/reports', AnalyticsController.getReportData);

export default router;
