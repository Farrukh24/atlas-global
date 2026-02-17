import * as LocationQueries from './locations.queries.js';
import { Location } from '../../types';
import { NotFoundError } from '../../utils/errors.js';

export class LocationsService {
    static async getLocation(id: number): Promise<Location> {
        const location = await LocationQueries.findLocationById(id);
        if (!location) throw new NotFoundError('Location');
        return location;
    }

    static async findNearby(lng: number, lat: number, radiusKm: number): Promise<Location[]> {
        return await LocationQueries.searchNearbyLocations(lng, lat, radiusKm * 1000);
    }

    static async createOrFind(data: any): Promise<Location> {
        return await LocationQueries.createOrFindLocation(data);
    }
}
