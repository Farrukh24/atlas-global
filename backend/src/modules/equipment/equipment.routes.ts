import { Router } from 'express';
import { EquipmentController } from './equipment.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/types', EquipmentController.getTypes);
router.get('/my', authenticate, EquipmentController.getMyAssets);

export default router;
