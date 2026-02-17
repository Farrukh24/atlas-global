import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLoadStore } from '@/stores/loadStore';
import { useLanguage } from '@/i18n/LanguageContext';
import api from '@/services/api';
import {
    TrendingUp,
    Package,
    DollarSign,
    Calendar,
    BarChart3,
    PieChart as PieIcon,
    Award,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { format } from 'date-fns';

const COLORS = ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444'];

export default function ReportsPage() {
    const { t, language } = useLanguage();
    const { user } = useAuthStore();
    const { loads, fetchLoads, isLoading: loadsLoading } = useLoadStore();
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState<{ monthly_spend: any[], status_distribution: any[] }>({
        monthly_spend: [],
        status_distribution: []
    });

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const response = await api.get('/analytics/reports');
                setReportData(response.data.data);
            } catch (error) {
                console.error('Failed to fetch report data', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.id) {
            fetchLoads({ shipper_party_id: user.id });
            fetchReportData();
        }
    }, [user?.id, fetchLoads]);

    if (isLoading || loadsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    // Calculate statistics
    const totalLoads = loads?.length || 0;
    const deliveredLoads = loads?.filter(l => l.status === 'delivered').length || 0;
    const activeLoads = loads?.filter(l => ['posted', 'booked', 'in_transit'].includes(l.status)).length || 0;
    const totalSpent = loads?.filter(l => l.status === 'delivered' || l.status === 'in_transit')
        .reduce((acc, curr) => acc + (Number(curr.booked_rate_amount || curr.quoted_rate_amount || 0)), 0) || 0;
    const avgLoadValue = totalLoads > 0 ? totalSpent / totalLoads : 0;

    const { monthly_spend, status_distribution } = reportData;

    // Map status codes to translated labels
    const mappedStatusData = status_distribution.map(item => ({
        name: t(`dashboard.status_${item.name}`),
        value: parseInt(item.value)
    }));

    return (
        <div className="min-h-screen p-6 lg:p-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                    {t('reports.title')} <span className="text-blue-600 italic">{t('reports.performance')}</span>
                </h1>
                <p className="text-gray-500 font-bold mt-2">{t('reports.subtitle')}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <Package className="text-blue-600" size={24} />
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('reports.total_loads')}</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{totalLoads}</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <TrendingUp className="text-emerald-600" size={24} />
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('reports.delivered')}</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{deliveredLoads}</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <DollarSign className="text-blue-600" size={24} />
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('reports.total_spent')}</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">${totalSpent.toLocaleString()}</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <Calendar className="text-violet-600" size={24} />
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('reports.active')}</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{activeLoads}</p>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Shipments by Month Chart */}
                <GlassCard className="p-8 h-[400px]">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="text-blue-600" size={24} />
                        <h3 className="text-2xl font-black tracking-tighter">{t('reports.by_month')}</h3>
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthly_spend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Status Distribution */}
                <GlassCard className="p-8 h-[400px]">
                    <div className="flex items-center gap-3 mb-6">
                        <PieIcon className="text-blue-600" size={24} />
                        <h3 className="text-2xl font-black tracking-tighter">{t('reports.status_dist')}</h3>
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mappedStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {mappedStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Average Load Value */}
                <GlassCard className="p-8 flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl font-black tracking-tighter mb-4">{t('reports.avg_value')}</h3>
                    <p className="text-5xl font-black text-blue-600 mb-2">${avgLoadValue.toFixed(0)}</p>
                    <p className="text-sm text-gray-500 font-bold">{t('reports.per_shipment')}</p>
                </GlassCard>

                {/* Carrier Reliability Mock Segment */}
                <GlassCard className="p-8 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <Award className="text-amber-500" size={24} />
                        <h3 className="text-2xl font-black tracking-tighter">{t('reports.carrier_reliability')}</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center rounded-xl font-black text-blue-600 text-sm">S</div>
                                <span className="font-bold">Silk Road Express</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs font-black text-gray-400">ONT-TIME</p>
                                    <p className="font-black text-emerald-500">98.2%</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase">Platinum</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center rounded-xl font-black text-amber-600 text-sm">G</div>
                                <span className="font-bold">Global Trucking LLC</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs font-black text-gray-400">ONT-TIME</p>
                                    <p className="font-black text-blue-500">94.5%</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase">Gold</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
