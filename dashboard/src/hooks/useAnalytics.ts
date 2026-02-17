
import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/services/analytics';

export interface DashboardStats {
    active_loads_count: number;
    active_carriers_count: number;
    total_revenue_month: number;
    avg_rating: number;
}

export function useAnalytics(pollingInterval = 300000) { // Default 5 mins
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const response = await getDashboardStats();
            setStats(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch analytics');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, pollingInterval);
        return () => clearInterval(interval);
    }, [pollingInterval]);

    return { stats, isLoading, error, refetch: fetchData };
}
