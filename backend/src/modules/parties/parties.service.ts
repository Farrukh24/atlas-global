import * as PartyQueries from './parties.queries.js';
import { NotFoundError } from '../../utils/errors.js';
import { Party, CarrierProfile, ShipperProfile } from '../../types';

export class PartiesService {
    static async getProfile(partyId: number): Promise<Party | CarrierProfile | ShipperProfile> {
        const party = await PartyQueries.findPartyById(partyId);
        if (!party) throw new NotFoundError('Party');

        if (party.type === 'carrier') {
            const carrier = await PartyQueries.findCarrierProfile(partyId);
            return carrier || party;
        }

        if (party.type === 'shipper') {
            const shipper = await PartyQueries.findShipperProfile(partyId);
            return shipper || party;
        }

        return party;
    }

    static async updateSettings(partyId: number, data: any): Promise<void> {
        await PartyQueries.updatePartyDetails(partyId, data);
    }

    static async getAllParties(type?: string): Promise<Party[]> {
        return await PartyQueries.findAllParties(type);
    }

    static async updateStatus(id: number, status: string): Promise<void> {
        await PartyQueries.updatePartyStatus(id, status);
    }
}
