import { Router } from 'express';
import { TrackingController } from './tracking.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/:loadId/history', TrackingController.getHistory);
router.post('/:loadId/position', authenticate, TrackingController.submitPosition);

export default router;
