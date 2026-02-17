import { Router } from 'express';
import { LoadsController } from './loads.controller';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { createLoadSchema, searchLoadSchema } from './loads.validation.js';

const router = Router();

router.get('/', validate(searchLoadSchema), LoadsController.search);
router.get('/search', validate(searchLoadSchema), LoadsController.search);
router.get('/:id', LoadsController.getById);

// Restricted to Shippers and Brokers
router.post('/', authenticate, authorize('shipper', 'broker'), validate(createLoadSchema), LoadsController.post);
router.put('/:id', authenticate, authorize('shipper', 'broker'), LoadsController.update);
router.delete('/:id', authenticate, authorize('shipper', 'broker'), LoadsController.delete);

export default router;
