export type LoadStatus = 'draft' | 'posted' | 'pending_offer' | 'booked' | 'at_pickup' | 'loaded' | 'en_route' | 'at_delivery' | 'delivered' | 'cancelled' | 'disputed';

export interface Load {
    id: number;
    load_number: string;
    shipper_party_id: number;
    broker_party_id?: number;
    carrier_party_id?: number;
    origin_location_id: number;
    destination_location_id: number;
    pickup_earliest: Date;
    pickup_latest: Date;
    delivery_earliest: Date;
    delivery_latest: Date;
    equipment_type_id: number;
    weight_kg?: number;
    volume_cbm?: number;
    status: LoadStatus;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface LoadSearchParams {
    origin_lat?: number;
    origin_lng?: number;
    radius_km?: number;
    equipment_type_id?: number;
    min_weight?: number;
    max_weight?: number;
    status?: LoadStatus[];
    limit?: number;
    page?: number;
    shipper_party_id?: number;
    carrier_party_id?: number;
    load_number?: string;
    search?: string;
    origin?: string;
    destination?: string;
    equipment_code?: string;
    pickup_date?: string;
}

export interface LoadWithRelations extends Load {
    origin_name: string;
    destination_name: string;
    shipper_name: string;
    carrier_name?: string;
    equipment_code: string;
}
