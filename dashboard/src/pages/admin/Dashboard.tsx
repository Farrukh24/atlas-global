import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLoadStore } from '@/stores/loadStore';
import { usePartyStore } from '@/stores/partyStore';
import {
    Users,
    Package,
    TrendingUp,
    Shield,
    Activity,
    UserCheck,
    AlertCircle
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

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const { loads, fetchLoads, isLoading: loadsLoading } = useLoadStore();
    const { parties, fetchParties, isLoading: partiesLoading } = usePartyStore();

    useEffect(() => {
        // Fetch all data for admin overview
        fetchLoads({});
        fetchParties();
    }, [fetchLoads, fetchParties]);

    // Calculate system stats
    const totalUsers = parties?.length || 0;
    const totalLoads = loads?.length || 0;
    const activeLoads = loads?.filter(l => l.status === 'posted' || l.status === 'booked' || l.status === 'en_route').length || 0;
    const carriers = parties?.filter(p => p.type === 'carrier').length || 0;
    const shippers = parties?.filter(p => p.type === 'shipper').length || 0;
    const verifiedUsers = parties?.filter(p => p.verification_status === 'verified').length || 0;

    const stats = [
        { label: 'Total Users', value: totalUsers.toString(), icon: Users, color: 'text-blue-600' },
        { label: 'Active Loads', value: activeLoads.toString(), icon: Package, color: 'text-emerald-600' },
        { label: 'Total Volume', value: `${totalLoads}`, icon: TrendingUp, color: 'text-violet-600' },
        { label: 'Platform Health', value: '98%', icon: Shield, color: 'text-emerald-600' },
    ];

    const recentRegistrations = parties?.slice(0, 5) || [];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 p-6 lg:p-10"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center gap-3 mb-2">
                    <div className="px-3 py-1 bg-red-100 dark:bg-red-900/20 rounded-full">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                            <Shield size={12} />
                            Super Admin
                        </span>
                    </div>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                    Admin <span className="text-gray-600 dark:text-gray-400 italic">Control Center</span>
                </h1>
                <p className="text-gray-500 font-bold mt-2">System-wide overview and management</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, idx) => (
                    <StatCard
                        key={idx}
                        title={s.label}
                        value={s.value}
                        icon={s.icon}
                        trend={idx === 2 ? "+24%" : ""}
                        delay={idx * 0.1}
                    />
                ))}
            </motion.div>

            {/* Quick Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase mb-1">Carriers</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{carriers}</p>
                        </div>
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                            <Activity className="text-emerald-600" size={24} />
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase mb-1">Shippers</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{shippers}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                            <Package className="text-blue-600" size={24} />
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase mb-1">Verified</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{verifiedUsers}</p>
                        </div>
                        <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-2xl">
                            <UserCheck className="text-violet-600" size={24} />
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Registrations */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <GlassCard className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                                <Users className="text-gray-600" />
                                Recent Registrations
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <th className="pb-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                                        <th className="pb-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Type</th>
                                        <th className="pb-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                        <th className="pb-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                    {partiesLoading ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">Loading users...</td>
                                        </tr>
                                    ) : recentRegistrations.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">No recent registrations.</td>
                                        </tr>
                                    ) : (
                                        recentRegistrations.map((party) => (
                                            <tr key={party.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="py-4">
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{party.legal_name}</p>
                                                    <p className="text-xs text-gray-500">ID: {party.id}</p>
                                                </td>
                                                <td className="py-4">
                                                    <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                        {party.type}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${party.verification_status === 'verified'
                                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20'
                                                            : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20'
                                                        }`}>
                                                        {party.verification_status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-sm font-bold text-gray-500">
                                                    {party.created_at ? format(new Date(party.created_at), 'MMM dd, yyyy') : '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Sidebar */}
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* System Alerts */}
                    <GlassCard className="p-6">
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertCircle size={14} />
                            System Alerts
                        </h4>
                        <div className="space-y-3">
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-l-4 border-amber-500">
                                <p className="font-bold text-sm text-gray-900 dark:text-white">Pending Verifications</p>
                                <p className="text-xs text-gray-500 font-bold mt-1">{totalUsers - verifiedUsers} users awaiting verification</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Quick Actions */}
                    <GlassCard className="p-6">
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                            Quick Actions
                        </h4>
                        <div className="space-y-2">
                            <button className="w-full px-4 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-bold rounded-xl transition-colors text-sm">
                                User Management
                            </button>
                            <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl transition-colors text-sm">
                                All Loads
                            </button>
                            <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl transition-colors text-sm">
                                Transactions
                            </button>
                        </div>
                    </GlassCard>

                    {/* Platform Status */}
                    <GlassCard className="p-8 bg-emerald-600 text-white border-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000" />
                        <h4 className="text-xl font-black tracking-tighter mb-4 relative z-10 flex items-center gap-2">
                            <Shield size={20} />
                            Platform Status
                        </h4>
                        <div className="space-y-3 relative z-10">
                            <div>
                                <p className="text-xs text-emerald-100 uppercase font-bold">Uptime</p>
                                <p className="text-2xl font-black">99.9%</p>
                            </div>
                            <div>
                                <p className="text-xs text-emerald-100 uppercase font-bold">Active Sessions</p>
                                <p className="text-2xl font-black">147</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </motion.div>
    );
}
