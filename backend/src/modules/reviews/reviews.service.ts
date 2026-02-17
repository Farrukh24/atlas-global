
import * as ReviewQueries from './reviews.queries.js';

export class ReviewsService {
    static async getCarrierReviews(carrierId: number) {
        return await ReviewQueries.findReviewsBySubject(carrierId);
    }

    static async getCarrierRating(carrierId: number) {
        const stats = await ReviewQueries.getRatingStats(carrierId);
        return {
            average: Number(stats.average_rating) || 0,
            count: Number(stats.total_reviews) || 0
        };
    }

    static async createReview(data: any) {
        return await ReviewQueries.createReview(data);
    }
}
