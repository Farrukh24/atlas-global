export interface Location {
    id: number;
    location_name?: string;
    location_type: string;
    address_line1?: string;
    city?: string;
    country_code: string;
    geolocation: any;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
