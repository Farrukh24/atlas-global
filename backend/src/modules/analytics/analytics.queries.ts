
import { query } from '../../config/database.js';

export const getShipperStats = async (partyId: number) => {
    // Active Loads: Loads created by this shipper that are not delivered/cancelled
    const activeLoadsResult = await query(
        `SELECT COUNT(*) as count FROM loads 
         WHERE shipper_party_id = $1 AND status NOT IN ('delivered', 'cancelled', 'draft')`,
        [partyId]
    );

    // Active Carriers: Unique carriers assigned to active/delivered loads of this shipper
    const activeCarriersResult = await query(
        `SELECT COUNT(DISTINCT carrier_party_id) as count FROM loads 
         WHERE shipper_party_id = $1 AND carrier_party_id IS NOT NULL`,
        [partyId]
    );

    // Total Spend (Month): Sum of booked_rate_amount for loads created this month
    const spendResult = await query(
        `SELECT SUM(booked_rate_amount) as total FROM loads 
         WHERE shipper_party_id = $1 
         AND created_at >= date_trunc('month', CURRENT_DATE)`,
        [partyId]
    );

    // Average Rating (Mock for now as we don't have reviews table fully populated likely)
    // But let's try to join if reviews exist, otherwise return 0 or mock
    // Assuming reviews table structure or just returning 0 for now as 'avg_rating' is requested
    // const ratingResult = ...

    return {
        active_loads_count: parseInt(activeLoadsResult.rows[0].count),
        active_carriers_count: parseInt(activeCarriersResult.rows[0].count),
        total_revenue_month: parseFloat(spendResult.rows[0].total || '0'), // For shipper this is 'penditure' but requested as revenue/finance metric
        avg_rating: 0 // Placeholder until reviews are implemented
    };
};

export const getMarketTrends = async () => {
    const result = await query(
        `SELECT TO_CHAR(created_at, 'DD Mon') as date, 
         AVG(booked_rate_amount) as price 
         FROM loads 
         WHERE booked_rate_amount IS NOT NULL 
         AND created_at >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY date, created_at
         ORDER BY created_at ASC`,
        []
    );
    return result.rows;
};

export const getRegionalVolume = async () => {
    const result = await query(
        `SELECT l.city as name, COUNT(ld.id) as value 
         FROM locations l
         INNER JOIN loads ld ON l.id = ld.origin_location_id
         GROUP BY l.city
         ORDER BY value DESC
         LIMIT 5`,
        []
    );
    return result.rows;
};

export const getReportData = async (partyId: number) => {
    const monthlySpend = await query(
        `SELECT TO_CHAR(created_at, 'Mon') as name, 
         SUM(booked_rate_amount) as total 
         FROM loads 
         WHERE shipper_party_id = $1 
         AND created_at >= CURRENT_DATE - INTERVAL '6 months'
         GROUP BY name, date_trunc('month', created_at)
         ORDER BY date_trunc('month', created_at) ASC`,
        [partyId]
    );

    const statusDist = await query(
        `SELECT status as name, COUNT(*) as value 
         FROM loads 
         WHERE shipper_party_id = $1 
         GROUP BY status`,
        [partyId]
    );

    return {
        monthly_spend: monthlySpend.rows,
        status_distribution: statusDist.rows
    };
};
