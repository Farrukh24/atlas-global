export interface Payment {
    id: number;
    payment_number: string;
    payer_party_id: number;
    payee_party_id: number;
    invoice_id?: number;
    amount: number;
    currency: string;
    status: string;
    payment_date?: Date;
    created_at: Date;
    updated_at: Date;
}
