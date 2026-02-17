
import { Router } from 'express';
import { ReviewsController } from './reviews.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('carrier'), ReviewsController.getReviews);
router.get('/rating', authorize('carrier'), ReviewsController.getRating);
router.post('/', authorize('shipper'), ReviewsController.submitReview);

export default router;
