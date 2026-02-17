import { Router } from 'express';
import { DriversController } from './drivers.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/my', DriversController.getMyDrivers);
router.get('/:id', DriversController.getById);

export default router;
