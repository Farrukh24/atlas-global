import * as TrackingQueries from './tracking.queries.js';
import { TrackingEvent } from '../../types';

export class TrackingService {
    static async getHistory(loadId: number): Promise<TrackingEvent[]> {
        return await TrackingQueries.findTrackingByLoad(loadId);
    }

    static async recordEvent(data: any): Promise<TrackingEvent> {
        return await TrackingQueries.createTrackingEvent(data);
    }

    static async getLatest(loadId: number): Promise<TrackingEvent | null> {
        return await TrackingQueries.findLatestPosition(loadId);
    }
}
