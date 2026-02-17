export interface LoadOffer {
    id: number;
    load_id: number;
    carrier_party_id: number;
    equipment_asset_id?: number;    
    driver_id?: number;              
    offer_amount: number;
    offer_currency: string;
    offer_status: string;
    valid_until?: Date;
    created_at: Date;
    updated_at: Date;
}
