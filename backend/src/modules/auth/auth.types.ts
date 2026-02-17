export interface LoginDTO {
    email: string;
    password: string;
}

export interface RegisterDTO {
    email: string;
    password: string;
    legal_name: string;
    type: 'shipper' | 'carrier' | 'broker';
    tax_id?: string;
    phone?: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        type: string;
        legal_name: string;
        verification_status: string;
    };
}
