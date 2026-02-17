export interface Driver {
    id: number;
    carrier_party_id: number;
    first_name: string;
    last_name: string;
    license_number: string;
    license_country: string;
    license_expiry: Date;
    contact_phone: string;
    current_status: string;
    current_location?: any;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
