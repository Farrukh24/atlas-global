
import { query } from '../../config/database.js';

export const findPaymentsByPayee = async (payeeId: number) => {
    const result = await query(
        `SELECT * FROM payments 
         WHERE payee_party_id = $1 
         ORDER BY created_at DESC`,
        [payeeId]
    );
    return result.rows;
};

export const getBalance = async (payeeId: number) => {
    // Mock calculation or aggregate query
    // In a real system, this would sum up 'paid' vs 'pending' vs 'withdrawals'
    const result = await query(
        `SELECT 
            COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) as available_balance,
            COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as pending_balance
         FROM payments
         WHERE payee_party_id = $1`,
        [payeeId]
    );
    return result.rows[0];
};
