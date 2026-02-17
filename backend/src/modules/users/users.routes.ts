
import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/language', authenticate, UsersController.getLanguage);
router.post('/language', authenticate, UsersController.updateLanguage);

export default router;
