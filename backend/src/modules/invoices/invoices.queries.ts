import { query } from '../../config/database.js';
import { Invoice } from '../../types';

export const findInvoicesByParty = async (partyId: number): Promise<Invoice[]> => {
    const result = await query(
        `SELECT * FROM invoices 
     WHERE (issuer_party_id = $1 OR recipient_party_id = $1) 
     AND deleted_at IS NULL ORDER BY created_at DESC`,
        [partyId]
    );
    return result.rows;
};

export const createInvoice = async (data: any): Promise<Invoice> => {
    const columns = Object.keys(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO invoices (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await query(sql, Object.values(data));
    return result.rows[0];
};
