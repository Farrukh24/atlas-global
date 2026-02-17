
import { Router } from 'express';
import * as DocumentsController from './documents.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.get('/', DocumentsController.getMyDocuments);
router.post('/', upload.single('file'), DocumentsController.uploadDocument);
router.delete('/:id', DocumentsController.deleteDocument);

export default router;
