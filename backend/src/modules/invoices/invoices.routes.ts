import { Router } from 'express';
import { InvoicesController } from './invoices.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/my', InvoicesController.getMyInvoices);
router.post('/', InvoicesController.create);

export default router;
