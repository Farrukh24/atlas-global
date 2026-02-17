
import { Router } from 'express';
import { ShipmentsController } from './shipments.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('carrier'), ShipmentsController.getMyHauls);
router.put('/:id/status', authorize('carrier'), ShipmentsController.updateStatus);

export default router;
