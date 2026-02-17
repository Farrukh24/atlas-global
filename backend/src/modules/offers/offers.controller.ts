import { Request, Response, NextFunction } from 'express';
import { OffersService } from './offers.service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class OffersController {
    static async getByLoad(req: Request, res: Response, next: NextFunction) {
        try {
            const offers = await OffersService.getLoadOffers(Number(req.params.loadId));
            res.status(200).json({ status: 'success', data: offers });
        } catch (error) {
            next(error);
        }
    }

    static async getOffers(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const offers = await OffersService.getCarrierOffers(req.user.partyId);
            res.status(200).json({ status: 'success', data: offers });
        } catch (error) {
            next(error);
        }
    }

    static async getShipperOffers(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const offers = await OffersService.getShipperOffers(req.user.partyId);
            res.status(200).json({ status: 'success', data: offers });
        } catch (error) {
            next(error);
        }
    }

    static async getCarrierNotifications(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const offers = await OffersService.getCarrierNotifications(req.user.partyId);
            res.status(200).json({ status: 'success', data: offers });
        } catch (error) {
            next(error);
        }
    }

    static async acceptCounterOffer(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await OffersService.acceptCounterOffer(Number(req.params.id));
            res.status(200).json({ status: 'success', message: 'Counter offer accepted' });
        } catch (error) {
            next(error);
        }
    }

    static async submitBid(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const bidData = { ...req.body, carrier_party_id: req.user.partyId };
            const offer = await OffersService.submitBid(bidData);
            res.status(201).json({ status: 'success', data: offer });
        } catch (error) {
            next(error);
        }
    }

    static async accept(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await OffersService.acceptOffer(Number(req.params.id));
            res.status(200).json({ status: 'success', message: 'Offer accepted' });
        } catch (error) {
            next(error);
        }
    }

    static async reject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await OffersService.rejectOffer(Number(req.params.id));
            res.status(200).json({ status: 'success', message: 'Offer rejected' });
        } catch (error) {
            next(error);
        }
    }

    static async counter(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { amount, notes } = req.body;
            if (!amount) {
                res.status(400).json({ status: 'error', message: 'Counter amount is required' });
                return;
            }
            await OffersService.counterOffer(Number(req.params.id), amount, notes || '');
            res.status(200).json({ status: 'success', message: 'Counter offer sent' });
        } catch (error) {
            next(error);
        }
    }
}
