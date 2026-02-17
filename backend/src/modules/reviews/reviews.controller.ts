
import { Response, NextFunction } from 'express';
import { ReviewsService } from './reviews.service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class ReviewsController {
    static async getReviews(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const reviews = await ReviewsService.getCarrierReviews(req.user.partyId);
            res.status(200).json(reviews);
        } catch (error) {
            next(error);
        }
    }

    static async getRating(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const rating = await ReviewsService.getCarrierRating(req.user.partyId);
            res.status(200).json(rating);
        } catch (error) {
            next(error);
        }
    }

    static async submitReview(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');
            const { shipment_id, subject_party_id, rating, comment } = req.body;

            const review = await ReviewsService.createReview({
                shipment_id,
                reviewer_party_id: req.user.partyId,
                subject_party_id,
                rating,
                comment
            });

            res.status(201).json({
                status: 'success',
                data: review
            });
        } catch (error) {
            next(error);
        }
    }
}
