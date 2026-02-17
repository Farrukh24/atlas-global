import { Router } from 'express';
import { PartiesController } from './parties.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/me', PartiesController.getMyProfile);
router.get('/', PartiesController.getAllParties);
router.patch('/:id/status', PartiesController.updateStatus);
router.patch('/settings', PartiesController.updateMySettings);

export default router;
