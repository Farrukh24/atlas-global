import { Router } from 'express';
import { OffersController } from './offers.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/load/:loadId', OffersController.getByLoad);
router.get('/shipper', authorize('shipper', 'broker'), OffersController.getShipperOffers);
router.get('/carrier/notifications', authorize('carrier', 'broker'), OffersController.getCarrierNotifications);
router.get('/', OffersController.getOffers);
router.post('/', authorize('carrier', 'broker'), OffersController.submitBid);
router.post('/:id/accept', authorize('shipper', 'broker'), OffersController.accept);
router.post('/:id/accept-counter', authorize('carrier', 'broker'), OffersController.acceptCounterOffer);
router.post('/:id/reject', authorize('shipper', 'broker'), OffersController.reject);
router.post('/:id/counter', authorize('shipper', 'broker'), OffersController.counter);

export default router;
