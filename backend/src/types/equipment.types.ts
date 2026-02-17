export interface EquipmentType {
    id: number;
    code: string;
    name: string;
    category: string;
    is_active: boolean;
}

export interface EquipmentAsset {
    id: number;
    owner_party_id: number;
    equipment_type_id: number;
    unit_identifier: string;
    make?: string;
    model?: string;
    year?: number;
    current_status: string;
    last_known_location?: any;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
