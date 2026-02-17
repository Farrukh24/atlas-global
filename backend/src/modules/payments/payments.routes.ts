
import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('carrier'), PaymentsController.getEarnings);

export default router;
