import { useState, useEffect } from 'react';
import { TrendingUp, BarChart, Map, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { useLanguage } from '@/i18n/LanguageContext';
import api from '@/services/api';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart as ReBarChart,
    Bar,
    Cell
} from 'recharts';

export default function MarketAnalysis() {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [marketData, setMarketData] = useState<{ trends: any[], volume: any[] }>({ trends: [], volume: [] });

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const response = await api.get('/analytics/market');
                setMarketData(response.data.data);
            } catch (error) {
                console.error('Failed to fetch market data', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMarketData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    const { trends, volume } = marketData;

    return (
        <div className="min-h-screen p-6 lg:p-10 space-y-8">
            <div className="mb-8">
                <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                    {t('nav.market_analysis')} <span className="text-blue-600 italic">Insights</span>
                </h1>
                <p className="text-gray-500 font-bold mt-2">Real-time market intelligence for logistics corridor.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Demand Map / Regional Breakdown */}
                <GlassCard className="lg:col-span-2 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                            <Map className="text-blue-600" /> Regional Volume Distribution
                        </h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={volume} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {volume.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#94A3B8'} />
                                    ))}
                                </Bar>
                            </ReBarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* AI Insights Card */}
                <GlassCard className="p-8 bg-blue-600 text-white border-none space-y-6">
                    <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                        <TrendingUp size={24} /> AI Market Signal
                    </h3>
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                        <p className="text-sm font-bold text-blue-100 italic">
                            "Demand in the Central Asia corridor is up by 14% this week. Capacity is tightening in Tashkent hub. Consider booking next 48 hours to lock current rates."
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold">Market Confidence</span>
                            <span className="font-black">88%</span>
                        </div>
                        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                            <div className="bg-white h-full" style={{ width: '88%' }} />
                        </div>
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                        <BarChart className="text-blue-600" /> Average Rate Trends (USD)
                    </h3>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fontWeight: 'bold' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fontWeight: 'bold' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#3B82F6"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                            />
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>
    );
}
