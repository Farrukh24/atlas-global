import { Router } from 'express';
import { LocationsController } from './locations.controller.js';

const router = Router();

router.get('/search', LocationsController.searchNearby);
router.get('/:id', LocationsController.getById);
router.post('/', LocationsController.create);

export default router;
