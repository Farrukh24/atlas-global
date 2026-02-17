import { query } from '../../config/database.js';
import { LoadOffer } from '../../types';

export const findOfferById = async (id: number): Promise<LoadOffer | null> => {
    const result = await query(
        'SELECT * FROM load_offers WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
};

export const findOffersByLoad = async (loadId: number): Promise<LoadOffer[]> => {
    const result = await query(
        'SELECT * FROM load_offers WHERE load_id = $1 ORDER BY created_at DESC',
        [loadId]
    );
    return result.rows;
};

export const createLoadOffer = async (data: any): Promise<LoadOffer> => {
    const { load_id, carrier_party_id, amount, currency, carrier_notes, status } = data;
    const result = await query(
        `INSERT INTO load_offers (
            load_id, carrier_party_id, offer_amount, offer_currency, carrier_notes, offer_status
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [load_id, carrier_party_id, amount, currency, carrier_notes, status]
    );
    return result.rows[0];
};

export const updateOfferStatus = async (id: number, status: string): Promise<void> => {
    await query(
        'UPDATE load_offers SET offer_status = $1, updated_at = NOW() WHERE id = $2',
        [status, id]
    );
};

export const findOffersByCarrier = async (carrierId: number): Promise<LoadOffer[]> => {
    const result = await query(
        `SELECT o.*, l.origin_location_id, l.destination_location_id, 
                l.equipment_type_id, l.weight_kg,
                l.load_number
         FROM load_offers o
         JOIN loads l ON o.load_id = l.id
         WHERE o.carrier_party_id = $1
         ORDER BY o.created_at DESC`,
        [carrierId]
    );
    return result.rows;
};

export const findCounteredOffersForCarrier = async (carrierId: number): Promise<LoadOffer[]> => {
    const result = await query(
        `SELECT o.*, 
                l.load_number, l.equipment_type_id, l.weight_kg,
                l.origin_location_id, l.destination_location_id,
                sh.legal_name as shipper_name
         FROM load_offers o
         JOIN loads l ON o.load_id = l.id
         LEFT JOIN parties sh ON l.shipper_party_id = sh.id
         WHERE o.carrier_party_id = $1 AND o.offer_status = 'countered'
         ORDER BY o.updated_at DESC`,
        [carrierId]
    );
    return result.rows;
};

export const findOffersByShipper = async (shipperId: number): Promise<LoadOffer[]> => {
    const result = await query(
        `SELECT o.*, 
                l.load_number, l.equipment_type_id, l.weight_kg,
                l.origin_location_id, l.destination_location_id,
                p.legal_name as carrier_name
         FROM load_offers o
         JOIN loads l ON o.load_id = l.id
         LEFT JOIN parties p ON o.carrier_party_id = p.id
         WHERE l.shipper_party_id = $1 AND o.offer_status = 'pending'
         ORDER BY o.created_at DESC`,
        [shipperId]
    );
    return result.rows;
};

export const rejectOffer = async (id: number): Promise<void> => {
    await query(
        'UPDATE load_offers SET offer_status = $1, updated_at = NOW() WHERE id = $2',
        ['rejected', id]
    );
};

export const counterOffer = async (id: number, amount: number, notes: string): Promise<void> => {
    await query(
        `UPDATE load_offers SET offer_amount = $1, offer_status = 'countered', 
         carrier_notes = COALESCE(carrier_notes, '') || $2, updated_at = NOW() 
         WHERE id = $3`,
        [amount, ` | Shipper counter: $${amount}. ${notes}`, id]
    );
};
