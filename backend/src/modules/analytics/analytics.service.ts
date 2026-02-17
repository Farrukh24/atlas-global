
import * as AnalyticsQueries from './analytics.queries.js';

export class AnalyticsService {
    static async getDashboardStats(partyId: number, role: string) {
        if (role === 'shipper') {
            return await AnalyticsQueries.getShipperStats(partyId);
        }
        return { active_loads_count: 0, active_carriers_count: 0, total_revenue_month: 0, avg_rating: 0 };
    }

    static async getMarketData() {
        const trends = await AnalyticsQueries.getMarketTrends();
        const volume = await AnalyticsQueries.getRegionalVolume();
        return { trends, volume };
    }

    static async getReportData(partyId: number) {
        return await AnalyticsQueries.getReportData(partyId);
    }
}
