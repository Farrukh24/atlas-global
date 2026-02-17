import * as InvoiceQueries from './invoices.queries.js';
import { Invoice } from '../../types';

export class InvoicesService {
    static async getPartyInvoices(partyId: number): Promise<Invoice[]> {
        return await InvoiceQueries.findInvoicesByParty(partyId);
    }

    static async create(data: any): Promise<Invoice> {
        // Generate invoice number: INV-YYYYMMDD-XXXX
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        data.invoice_number = `INV-${dateStr}-${randomSuffix}`;
        data.status = 'issued';

        return await InvoiceQueries.createInvoice(data);
    }
}
