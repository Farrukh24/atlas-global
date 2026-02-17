import { query } from '../../config/database.js';
import { Driver } from '../../types';

export const findDriverById = async (id: number): Promise<Driver | null> => {
    const result = await query(
        'SELECT * FROM drivers WHERE id = $1 AND deleted_at IS NULL',
        [id]
    );
    return result.rows[0] || null;
};

export const findDriversByParty = async (partyId: number): Promise<Driver[]> => {
    const result = await query(
        'SELECT * FROM drivers WHERE party_id = $1 AND deleted_at IS NULL',
        [partyId]
    );
    return result.rows;
};
