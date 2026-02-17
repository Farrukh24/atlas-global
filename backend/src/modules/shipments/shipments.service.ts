
import * as ShipmentQueries from './shipments.queries.js';

export class ShipmentsService {
    static async getCarrierShipments(carrierId: number) {
        return await ShipmentQueries.findShipmentsByCarrier(carrierId);
    }

    static async updateStatus(id: number, status: string, carrierId: number) {
        return await ShipmentQueries.updateShipmentStatus(id, status, carrierId);
    }

    static async getShipment(id: number) {
        return await ShipmentQueries.getShipmentById(id);
    }
}
