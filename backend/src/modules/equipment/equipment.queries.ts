import { query } from '../../config/database.js';
import { EquipmentAsset, EquipmentType } from '../../types';

export const findEquipmentById = async (id: number): Promise<EquipmentAsset | null> => {
    const result = await query(
        'SELECT * FROM equipment_assets WHERE id = $1 AND deleted_at IS NULL',
        [id]
    );
    return result.rows[0] || null;
};

export const findEquipmentByParty = async (partyId: number): Promise<EquipmentAsset[]> => {
    const result = await query(
        'SELECT * FROM equipment_assets WHERE owner_party_id = $1 AND deleted_at IS NULL',
        [partyId]
    );
    return result.rows;
};

export const findAllEquipmentTypes = async (): Promise<EquipmentType[]> => {
    const result = await query(
        'SELECT * FROM equipment_types WHERE is_active = true ORDER BY code ASC'
    );
    return result.rows;
};

export const findEquipmentTypeByCode = async (code: string): Promise<EquipmentType | null> => {
    const result = await query(
        'SELECT * FROM equipment_types WHERE code = $1',
        [code]
    );
    return result.rows[0] || null;
};
