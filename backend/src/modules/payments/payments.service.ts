
import * as PaymentQueries from './payments.queries.js';

export class PaymentsService {
    static async getEarnings(carrierId: number) {
        const history = await PaymentQueries.findPaymentsByPayee(carrierId);
        const balance = await PaymentQueries.getBalance(carrierId);
        return {
            balance: Number(balance.available_balance),
            pending: Number(balance.pending_balance),
            history
        };
    }
}
