
import { query } from '../../config/database.js';

export const findShipmentsByCarrier = async (carrierId: number) => {
    const result = await query(
        `SELECT l.*, l.status as current_status
         FROM loads l
         WHERE l.carrier_party_id = $1
         AND l.status IN ('booked', 'dispatched', 'in_transit', 'delivered')
         ORDER BY l.created_at DESC`,
        [carrierId]
    );
    return result.rows;
};

export const updateShipmentStatus = async (id: number, status: string, carrierId: number) => {
    const result = await query(
        `UPDATE loads 
         SET status = $1, updated_at = NOW() 
         WHERE id = $2 AND carrier_party_id = $3
         RETURNING *, status as current_status`,
        [status, id, carrierId]
    );
    return result.rows[0];
};

export const getShipmentById = async (id: number) => {
    const result = await query(
        `SELECT * FROM shipments WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};
