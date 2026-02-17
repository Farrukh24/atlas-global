export interface Party {
    id: number;
    type: 'carrier' | 'shipper' | 'broker' | 'forwarder' | 'warehouse_operator';
    legal_name: string;
    trading_name?: string;
    tax_id?: string;
    verification_status: string;
    account_status: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface CarrierProfile {
    party_id: number;
    fleet_size?: number;
    safety_rating?: string;
    insurance_verified: boolean;
    mc_number?: string;
    dot_number?: string;
}

export interface ShipperProfile {
    party_id: number;
    industry_sector?: string;
    credit_limit_amount?: number;
    credit_limit_currency?: string;
}

export interface BrokerProfile {
    party_id: number;
    bond_amount?: number;
    bond_currency?: string;
    license_number?: string;
}
