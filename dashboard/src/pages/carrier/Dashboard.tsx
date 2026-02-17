import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLoadStore } from '@/stores/loadStore';
import {
    Truck,
    Package,
    DollarSign,
    Star,
    Search,
    Clock,
    CheckCircle,
    TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function CarrierDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { loads, fetchLoads, isLoading } = useLoadStore();

    useEffect(() => {
        if (user?.id) {
            // Fetch loads assigned to this carrier
            fetchLoads({ carrier_party_id: user.id });
        }
    }, [user?.id, fetchLoads]);

    // Calculate stats
    const activeHauls = loads?.filter(l => ['booked', 'at_pickup', 'loaded', 'en_route', 'at_delivery'].includes(l.status)).length || 0;
    const completedHauls = loads?.filter(l => l.status === 'delivered').length || 0;
    const monthlyEarnings = loads?.filter(l => l.status === 'delivered')
        .reduce((acc, curr) => acc + (Number(curr.booked_rate_amount) || 0), 0) || 0;

    const stats = [
        { label: 'Active Hauls', value: activeHauls.toString(), icon: Truck, color: 'text-emerald-600' },
        { label: 'Pending Bids', value: '0', icon: Clock, color: 'text-amber-500' },
        { label: 'Monthly Earnings', value: `$${monthlyEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600' },
        { label: 'My Rating', value: '4.9', icon: Star, color: 'text-yellow-500' },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 p-6 lg:p-10"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                    Carrier <span className="text-emerald-600 italic">Dashboard</span>
                </h1>
                <p className="text-gray-500 font-bold mt-2">Manage your hauls and find new opportunities</p>
            </motion.div>

            {/* Quick Action */}
            <motion.div variants={itemVariants}>
                <button
                    onClick={() => navigate('/dashboard/find-loads')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-[32px] shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-4 group transition-all transform hover:scale-[1.01] active:scale-95"
                >
                    <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                        <Search size={32} strokeWidth={3} />
                    </div>
                    <span className="text-2xl font-black uppercase tracking-tight">Find Available Loads</span>
                </button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, idx) => (
                    <StatCard
                        key={idx}
                        title={s.label}
                        value={s.value}
                        icon={s.icon}
                        trend={idx === 2 ? "+18%" : ""}
                        delay={idx * 0.1}
                    />
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Hauls */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <GlassCard className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                                <Truck className="text-emerald-600" />
                                My Active Hauls
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <p className="text-gray-500 text-center py-8">Loading hauls...</p>
                            ) : loads?.filter(l => ['booked', 'en_route'].includes(l.status)).length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No active hauls. Check the Find Loads page!</p>
                            ) : (
                                loads?.filter(l => ['booked', 'en_route'].includes(l.status)).map((load) => (
                                    <div key={load.id} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors cursor-pointer">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-black text-emerald-600 text-xs mb-1">{load.load_number}</p>
                                                <p className="font-bold text-lg">{load.origin_city} → {load.destination_city}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${load.status === 'booked' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                                                }`}>
                                                {load.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 font-bold">{load.equipment_code}</span>
                                            <span className="font-black text-emerald-600">${load.booked_rate_amount?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Sidebar */}
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* Notifications */}
                    <GlassCard className="p-6">
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                            Recent Notifications
                        </h4>
                        <div className="space-y-4">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={18} />
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">New load available</p>
                                        <p className="text-xs text-gray-500 font-bold mt-1">Almaty → Istanbul route</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Performance */}
                    <GlassCard className="p-8 bg-emerald-600 text-white border-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000" />
                        <h4 className="text-xl font-black tracking-tighter mb-4 relative z-10 flex items-center gap-2">
                            <TrendingUp size={20} />
                            Your Performance
                        </h4>
                        <div className="space-y-3 relative z-10">
                            <div>
                                <p className="text-xs text-emerald-100 uppercase font-bold">On-Time Delivery</p>
                                <p className="text-2xl font-black">98.5%</p>
                            </div>
                            <div>
                                <p className="text-xs text-emerald-100 uppercase font-bold">Completed Hauls</p>
                                <p className="text-2xl font-black">{completedHauls}</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </motion.div>
    );
}
