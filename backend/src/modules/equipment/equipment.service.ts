import * as EquipmentQueries from './equipment.queries.js';
import { EquipmentAsset, EquipmentType } from '../../types';
import { NotFoundError } from '../../utils/errors.js';

export class EquipmentService {
    static async getAsset(id: number): Promise<EquipmentAsset> {
        const asset = await EquipmentQueries.findEquipmentById(id);
        if (!asset) throw new NotFoundError('Equipment Asset');
        return asset;
    }

    static async getPartyAssets(partyId: number): Promise<EquipmentAsset[]> {
        return await EquipmentQueries.findEquipmentByParty(partyId);
    }

    static async getTypes(): Promise<EquipmentType[]> {
        return await EquipmentQueries.findAllEquipmentTypes();
    }

    static async getTypeByCode(code: string): Promise<EquipmentType> {
        const type = await EquipmentQueries.findEquipmentTypeByCode(code);
        if (!type) throw new NotFoundError(`Equipment Type: ${code}`);
        return type;
    }
}
