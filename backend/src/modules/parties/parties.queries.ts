import { query } from '../../config/database.js';
import { Party, CarrierProfile, ShipperProfile } from '../../types';

export const findPartyById = async (id: number): Promise<Party | null> => {
    const result = await query(
        'SELECT * FROM parties WHERE id = $1 AND deleted_at IS NULL',
        [id]
    );
    return result.rows[0] || null;
};

export const findCarrierProfile = async (partyId: number): Promise<CarrierProfile | null> => {
    const sql = `
    SELECT p.*, c.usdot_number, c.mc_number, c.scac_code, c.fleet_size, c.specialties
    FROM parties p
    JOIN carrier_profiles c ON p.id = c.party_id
    WHERE p.id = $1 AND p.deleted_at IS NULL
  `;
    const result = await query(sql, [partyId]);
    return result.rows[0] || null;
};

export const findShipperProfile = async (partyId: number): Promise<ShipperProfile | null> => {
    const sql = `
    SELECT p.*, s.credit_limit_amount, s.credit_limit_currency, s.industry
    FROM parties p
    JOIN shipper_profiles s ON p.id = s.party_id
    WHERE p.id = $1 AND p.deleted_at IS NULL
  `;
    const result = await query(sql, [partyId]);
    return result.rows[0] || null;
};

export const updatePartyDetails = async (id: number, data: any): Promise<void> => {
    const { legal_name, settings } = data;
    await query(
        `UPDATE parties 
         SET legal_name = COALESCE($1, legal_name), 
             settings = COALESCE(settings, '{}'::jsonb) || $2::jsonb, 
             updated_at = NOW() 
         WHERE id = $3`,
        [legal_name, settings || {}, id]
    );
};

export const findAllParties = async (type?: string): Promise<Party[]> => {
    let sql = 'SELECT * FROM parties WHERE deleted_at IS NULL';
    const values: any[] = [];

    if (type) {
        sql += ' AND type = $1';
        values.push(type);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, values);
    return result.rows;
};

export const updatePartyStatus = async (id: number, status: string): Promise<void> => {
    await query(
        'UPDATE parties SET verification_status = $1, updated_at = NOW() WHERE id = $2',
        [status, id]
    );
};
