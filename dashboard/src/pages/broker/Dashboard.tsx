import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLoadStore } from '@/stores/loadStore';
import {
    TrendingUp,
    Package,
    DollarSign,
    Users,
    Award,
    Clock,
    CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import { format } from 'date-fns';

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

export default function BrokerDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { loads, fetchLoads, isLoading } = useLoadStore();

    useEffect(() => {
        // Fetch all loads for broker overview
        fetchLoads({});
    }, [fetchLoads]);

    const stats = [
        { label: 'Active Bids', value: '12', icon: Clock, color: 'text-violet-600' },
        { label: 'Won Bids', value: '45', icon: Award, color: 'text-emerald-600' },
        { label: 'Commission', value: '$18,400', icon: DollarSign, color: 'text-violet-600' },
        { label: 'Success Rate', value: '78%', icon: TrendingUp, color: 'text-emerald-600' },
    ];

    const activeLoads = loads?.filter(l => l.status === 'posted' || l.status === 'pending_offer').slice(0, 5) || [];

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
                    Broker <span className="text-violet-600 italic">Hub</span>
                </h1>
                <p className="text-gray-500 font-bold mt-2">Manage bids, find carriers, and maximize profits</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, idx) => (
                    <StatCard
                        key={idx}
                        title={s.label}
                        value={s.value}
                        icon={s.icon}
                        trend={idx === 2 ? "+15%" : ""}
                        delay={idx * 0.1}
                    />
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Available Loads */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <GlassCard className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                                <Package className="text-violet-600" />
                                Available Loads
                            </h3>
                            <button
                                onClick={() => navigate('/loads')}
                                className="text-violet-600 font-black text-sm hover:underline"
                            >
                                View All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <p className="text-gray-500 text-center py-8">Loading loads...</p>
                            ) : activeLoads.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No available loads at the moment.</p>
                            ) : (
                                activeLoads.map((load) => (
                                    <div key={load.id} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors cursor-pointer">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-black text-violet-600 text-xs mb-1">{load.load_number}</p>
                                                <p className="font-bold text-lg">{load.origin_city} → {load.destination_city}</p>
                                                <p className="text-sm text-gray-500 font-bold">{load.equipment_code}</p>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-violet-100 text-violet-600 dark:bg-violet-900/20">
                                                {load.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <span className="text-gray-500 font-bold">
                                                {load.pickup_earliest ? format(new Date(load.pickup_earliest), 'MMM dd, yyyy') : 'TBD'}
                                            </span>
                                            <span className="font-black text-violet-600">${load.quoted_rate_amount?.toLocaleString() || 'N/A'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Sidebar */}
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* Active Bids */}
                    <GlassCard className="p-6">
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                            Active Auctions
                        </h4>
                        <div className="space-y-3">
                            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-violet-600">AT-1045</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase">3 Bids</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Almaty → Baku</p>
                                <p className="text-xs text-gray-500 font-bold mt-2">Best Bid: $3,200</p>
                            </div>
                            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-violet-600">AT-1048</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase">5 Bids</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Istanbul → Munich</p>
                                <p className="text-xs text-gray-500 font-bold mt-2">Best Bid: $4,100</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Performance Card */}
                    <GlassCard className="p-8 bg-violet-600 text-white border-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000" />
                        <h4 className="text-xl font-black tracking-tighter mb-4 relative z-10 flex items-center gap-2">
                            <Award size={20} />
                            This Month
                        </h4>
                        <div className="space-y-3 relative z-10">
                            <div>
                                <p className="text-xs text-violet-100 uppercase font-bold">Total Commission</p>
                                <p className="text-2xl font-black">$18,400</p>
                            </div>
                            <div>
                                <p className="text-xs text-violet-100 uppercase font-bold">Profit Margin</p>
                                <p className="text-2xl font-black">12.5%</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Quick Actions */}
                    <GlassCard className="p-6">
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                            Quick Actions
                        </h4>
                        <div className="space-y-2">
                            <button className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors text-sm">
                                View Carriers DB
                            </button>
                            <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl transition-colors text-sm">
                                Analytics
                            </button>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </motion.div>
    );
}
