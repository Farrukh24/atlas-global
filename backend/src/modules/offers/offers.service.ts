import * as OfferQueries from './offers.queries.js';
import * as LoadQueries from '../loads/loads.queries.js';
import { LoadOffer } from '../../types';
import { NotFoundError } from '../../utils/errors.js';

export class OffersService {
    static async getOffer(id: number): Promise<LoadOffer> {
        const offer = await OfferQueries.findOfferById(id);
        if (!offer) throw new NotFoundError('Offer');
        return offer;
    }

    static async getLoadOffers(loadId: number): Promise<LoadOffer[]> {
        return await OfferQueries.findOffersByLoad(loadId);
    }

    static async getCarrierOffers(carrierId: number): Promise<LoadOffer[]> {
        return await OfferQueries.findOffersByCarrier(carrierId);
    }

    static async getShipperOffers(shipperId: number): Promise<LoadOffer[]> {
        return await OfferQueries.findOffersByShipper(shipperId);
    }

    static async getCarrierNotifications(carrierId: number): Promise<LoadOffer[]> {
        return await OfferQueries.findCounteredOffersForCarrier(carrierId);
    }

    static async acceptCounterOffer(id: number): Promise<void> {
        const offer = await this.getOffer(id);
        // Accept the counter-offer at the new price
        await OfferQueries.updateOfferStatus(id, 'accepted');
        await LoadQueries.bookLoad(
            offer.load_id,
            offer.carrier_party_id,
            offer.equipment_asset_id,
            offer.driver_id,
            offer.offer_amount,
            offer.offer_currency
        );
    }

    static async submitBid(data: any): Promise<LoadOffer> {
        // Map frontend fields to DB schema
        let notes = data.notebook || data.notes || '';
        if (data.pickup_date) notes += ` | Proposed Pickup: ${data.pickup_date}`;
        if (data.delivery_date) notes += ` | Proposed Delivery: ${data.delivery_date}`;

        const offerData = {
            load_id: data.load_id,
            carrier_party_id: data.carrier_party_id,
            amount: data.amount || data.offer_amount,
            currency: data.currency || 'USD',
            carrier_notes: notes,
            status: 'pending'
        };
        return await OfferQueries.createLoadOffer(offerData);
    }

    static async rejectOffer(id: number): Promise<void> {
        const offer = await this.getOffer(id);
        await OfferQueries.rejectOffer(id);
    }

    static async counterOffer(id: number, amount: number, notes: string): Promise<void> {
        const offer = await this.getOffer(id);
        await OfferQueries.counterOffer(id, amount, notes);
    }

    /**
     * Accepts a specific offer.
     */
    static async acceptOffer(id: number): Promise<void> {
        const offer = await this.getOffer(id);

        // 1. Update this offer status
        await OfferQueries.updateOfferStatus(id, 'accepted');

        // 2. Cascade to Load update
        await LoadQueries.bookLoad(
            offer.load_id,
            offer.carrier_party_id,
            offer.equipment_asset_id,
            offer.driver_id,
            offer.offer_amount, // Note: verify this field exists on 'offer' object returned from DB
            offer.offer_currency
        );
    }
}
