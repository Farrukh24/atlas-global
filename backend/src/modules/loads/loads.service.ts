import { EquipmentService } from '../equipment/equipment.service.js';
import * as LoadQueries from './loads.queries.js';
import { Load, LoadSearchParams, LoadWithRelations } from '../../types';
import { NotFoundError } from '../../utils/errors.js';

export class LoadsService {
    static async getLoad(id: number): Promise<LoadWithRelations> {
        const load = await LoadQueries.findLoadById(id);
        if (!load) throw new NotFoundError('Load');
        return load;
    }

    static async findLoads(params: LoadSearchParams): Promise<LoadWithRelations[]> {
        return await LoadQueries.searchLoads(params);
    }

    static async postLoad(data: any): Promise<Load> {
        // Generate load number format: ATLAS-YYYYMMDD-XXXX
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        data.load_number = `ATLAS-${dateStr}-${randomSuffix}`;

        // Handle Equipment Code -> ID
        if (data.equipment_code && !data.equipment_type_id) {
            const equipmentType = await EquipmentService.getTypeByCode(data.equipment_code);
            data.equipment_type_id = equipmentType.id;
            delete data.equipment_code; // Remove so it doesn't fail insert
        }

        // Ensure dates are valid
        if (data.pickup_earliest) data.pickup_earliest = new Date(data.pickup_earliest);
        if (data.delivery_earliest) data.delivery_earliest = new Date(data.delivery_earliest);
        // Default latest dates if missing (e.g. +4 hours window)
        if (!data.pickup_latest && data.pickup_earliest) {
            data.pickup_latest = new Date(new Date(data.pickup_earliest).getTime() + 4 * 60 * 60 * 1000);
        }
        if (!data.delivery_latest && data.delivery_earliest) {
            data.delivery_latest = new Date(new Date(data.delivery_earliest).getTime() + 4 * 60 * 60 * 1000);
        }

        return await LoadQueries.createLoad(data);
    }

    static async updateLoad(id: number, data: any, userId: number): Promise<Load> {
        // Check if load exists and belongs to user
        const existingLoad = await LoadQueries.findLoadById(id);
        if (!existingLoad) throw new NotFoundError('Load');

        // Only shipper who created the load can update it
        if (existingLoad.shipper_party_id !== userId) {
            throw new Error('Forbidden: You can only update your own loads');
        }

        // Handle Equipment Code -> ID if provided
        if (data.equipment_code && !data.equipment_type_id) {
            const equipmentType = await EquipmentService.getTypeByCode(data.equipment_code);
            data.equipment_type_id = equipmentType.id;
            delete data.equipment_code;
        }

        // Ensure numeric fields are valid or null
        if (data.cargo_value_amount === '') data.cargo_value_amount = null;
        if (data.weight_kg === '') data.weight_kg = null;
        if (data.cargo_value_amount) data.cargo_value_amount = Number(data.cargo_value_amount);
        if (data.weight_kg) data.weight_kg = Number(data.weight_kg);

        // Ensure dates are valid
        if (data.pickup_earliest) data.pickup_earliest = new Date(data.pickup_earliest);
        if (data.delivery_earliest) data.delivery_earliest = new Date(data.delivery_earliest);
        if (data.pickup_latest) data.pickup_latest = new Date(data.pickup_latest);
        if (data.delivery_latest) data.delivery_latest = new Date(data.delivery_latest);

        return await LoadQueries.updateLoad(id, data);
    }

    static async deleteLoad(id: number, userId: number): Promise<void> {
        // Check if load exists and belongs to user
        const existingLoad = await LoadQueries.findLoadById(id);
        if (!existingLoad) throw new NotFoundError('Load');

        // Only shipper who created the load can delete it
        if (existingLoad.shipper_party_id !== userId) {
            throw new Error('Forbidden: You can only delete your own loads');
        }

        // Only allow deletion of loads in certain statuses
        const deletableStatuses = ['draft', 'posted', 'cancelled'];
        if (!deletableStatuses.includes(existingLoad.status)) {
            throw new Error(`Cannot delete load with status: ${existingLoad.status}`);
        }

        await LoadQueries.deleteLoad(id);
    }
}
