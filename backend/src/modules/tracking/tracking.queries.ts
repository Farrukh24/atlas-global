import { query } from '../../config/database.js';
import { TrackingEvent } from '../../types';

export const findTrackingByLoad = async (loadId: number): Promise<TrackingEvent[]> => {
    const result = await query(
        'SELECT * FROM tracking_events WHERE load_id = $1 ORDER BY event_timestamp DESC',
        [loadId]
    );
    return result.rows;
};

export const createTrackingEvent = async (data: any): Promise<TrackingEvent> => {
    const columns = Object.keys(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO tracking_events (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await query(sql, Object.values(data));
    return result.rows[0];
};

export const findLatestPosition = async (loadId: number): Promise<TrackingEvent | null> => {
    const result = await query(
        'SELECT * FROM tracking_events WHERE load_id = $1 ORDER BY event_timestamp DESC LIMIT 1',
        [loadId]
    );
    return result.rows[0] || null;
};
