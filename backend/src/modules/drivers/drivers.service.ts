import * as DriverQueries from './drivers.queries.js';
import { Driver } from '../../types';
import { NotFoundError } from '../../utils/errors.js';

export class DriversService {
    static async getDriver(id: number): Promise<Driver> {
        const driver = await DriverQueries.findDriverById(id);
        if (!driver) throw new NotFoundError('Driver');
        return driver;
    }

    static async getPartyDrivers(partyId: number): Promise<Driver[]> {
        return await DriverQueries.findDriversByParty(partyId);
    }
}
