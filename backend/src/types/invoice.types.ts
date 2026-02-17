export interface Invoice {
    id: number;
    invoice_number: string;
    issuer_party_id: number;
    recipient_party_id: number;
    load_id?: number;
    total_amount: number;
    total_currency: string;
    status: string;
    due_date: Date;
    created_at: Date;
    updated_at: Date;
}
