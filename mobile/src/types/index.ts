export interface Load {
    id: number;
    origin_city: string;
    origin_state: string;
    destination_city: string;
    destination_state: string;
    weight: number;
    equipment_type: string;
    rate: number;
    distance_km: number;
    pickup_date: string;
    delivery_date: string;
    status: 'available' | 'booked' | 'in_transit' | 'delivered';
}

export interface Invoice {
    id: number;
    invoice_number: string;
    total_amount: number;
    status: 'pending' | 'paid' | 'overdue';
    created_at: string;
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: 'driver' | 'broker' | 'shipper';
}
