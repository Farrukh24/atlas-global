import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLoadStore } from '@/stores/loadStore';
import { usePartyStore } from '@/stores/partyStore';
import { useAnalytics } from '@/hooks/useAnalytics';
import RouteMap from '@/components/maps/RouteMap';
import { format } from 'date-fns';
import {
    Plus,
    Package,
    CheckCircle2,
    DollarSign,
    Edit3,
    Eye,
    Star,
    ArrowRight,
    MapPin,
    TrendingUp,
    ChevronRight,
    X,
    Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import toast from 'react-hot-toast';
import { useLanguage } from '@/i18n/LanguageContext';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function ShipperDashboard() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { loads, fetchLoads, updateLoad, isLoading: loadsLoading } = useLoadStore();
    const { carriers, fetchParties, isLoading: carriersLoading } = usePartyStore();
    const [editingLoad, setEditingLoad] = useState<any>(null);
    const [selectedLoadForMap, setSelectedLoadForMap] = useState<any>(null);
    const [selectedCarrier, setSelectedCarrier] = useState<any>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [editFormData, setEditFormData] = useState<any>({});

    useEffect(() => {
        if (loads && loads.length > 0 && !selectedLoadForMap) {
            setSelectedLoadForMap(loads[0]);
        }
    }, [loads]);

    const handleRowClick = (load: any) => {
        setSelectedLoadForMap(load);
    };

    const handleEdit = (load: any, mode: 'view' | 'edit') => {
        setEditingLoad(load);
        setModalMode(mode);
        if (mode === 'edit') {
            setEditFormData({
                equipment_code: load.equipment_code || '',
                cargo_value_amount: load.cargo_value_amount || '',
                weight_kg: load.weight_kg || '',
                status: load.status || 'draft',
            });
        }
    };

    const handleSaveEdit = async () => {
        if (!editingLoad) return;

        try {
            await updateLoad(editingLoad.id, editFormData);
            toast.success('Load updated successfully!');
            setEditingLoad(null);
            fetchLoads({ shipper_party_id: user?.id });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update load');
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchLoads({ shipper_party_id: user.id });
            fetchParties('carrier');
        }
    }, [user?.id, fetchLoads, fetchParties]);

    const { stats: analyticsStats, isLoading: analyticsLoading } = useAnalytics();

    const stats = [
        {
            label: t('dashboard.active_loads'),
            value: analyticsLoading ? '...' : (analyticsStats?.active_loads_count.toString() || '0'),
            icon: Package,
            color: 'text-blue-600'
        },
        {
            label: t('dashboard.active_carriers'),
            value: analyticsLoading ? '...' : (analyticsStats?.active_carriers_count.toString() || '0'),
            icon: TrendingUp,
            color: 'text-amber-500'
        },
        {
            label: t('dashboard.avg_rating'),
            value: analyticsLoading ? '...' : (analyticsStats?.avg_rating?.toFixed(1) || '0.0'),
            icon: Star,
            color: 'text-emerald-500'
        },
        {
            label: t('dashboard.monthly_spend'),
            value: analyticsLoading ? '...' : `$${analyticsStats?.total_revenue_month?.toLocaleString() || '0'}`,
            icon: DollarSign,
            color: 'text-blue-600'
        },
    ];

    const activeLoads = loads || [];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 p-6 lg:p-10"
        >
            {/* Header section with Create button */}
            <motion.div variants={itemVariants} className="flex flex-col gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                        {t('dashboard.shipper')} <span className="text-blue-600 italic">{t('dashboard.workspace')}</span>
                    </h1>
                    <p className="text-gray-500 font-bold mt-2">{t('dashboard.subtitle')}</p>
                </div>

                <button
                    onClick={() => navigate('/dashboard/create-load')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-[32px] shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-4 group transition-all transform hover:scale-[1.01] active:scale-95"
                >
                    <div className="bg-white/20 p-3 rounded-2xl group-hover:rotate-90 transition-transform duration-500">
                        <Plus size={32} strokeWidth={3} />
                    </div>
                    <span className="text-2xl font-black uppercase tracking-tight">{t('nav.create_load')}</span>
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
                        trend={idx === 1 ? "Active" : idx === 3 ? "+12%" : "Stable"}
                        delay={idx * 0.1}
                    />
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Loads Table */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <GlassCard className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                                <Package className="text-blue-600" />
                                {t('dashboard.recent_loads')}
                            </h3>
                            <button
                                onClick={() => navigate('/dashboard/my-loads')}
                                className="text-blue-600 font-black text-sm hover:underline flex items-center gap-1"
                            >
                                {t('common.view_all')} <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('dashboard.load_route')}</th>
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('dashboard.date')}</th>
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('dashboard.status')}</th>
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('dashboard.price')}</th>
                                        <th className="pb-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                    <AnimatePresence>
                                        {loadsLoading ? (
                                            <tr><td colSpan={5} className="py-8 text-center text-gray-500">Loading shipments...</td></tr>
                                        ) : activeLoads.length === 0 ? (
                                            <tr><td colSpan={5} className="py-8 text-center text-gray-500">No active shipments found.</td></tr>
                                        ) : (
                                            activeLoads.map((load) => (
                                                <motion.tr
                                                    key={load.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    onClick={() => handleRowClick(load)}
                                                    className={`group transition-all cursor-pointer ${selectedLoadForMap?.id === load.id ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600' : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}`}
                                                >
                                                    <td className="py-5 pl-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-blue-600 text-xs">{load.load_number || `AT-${load.id}`}</span>
                                                            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                                                {load.origin_city || 'Origin'} → {load.destination_city || 'Dest'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-5">
                                                        <span className="text-sm font-bold text-gray-500">
                                                            {load.created_at ? format(new Date(load.created_at), 'MMM dd') : '-'}
                                                        </span>
                                                    </td>
                                                    <td className="py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${load.status === 'in_transit' ? 'bg-blue-100 text-blue-600' :
                                                            load.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                                                                'bg-amber-100 text-amber-600'
                                                            }`}>
                                                            {load.status?.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                                        ${(load.booked_rate_amount || load.quoted_rate_amount || load.cargo_value_amount || 0).toLocaleString()}
                                                    </td>
                                                    <td className="py-5 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleEdit(load, 'edit'); }}
                                                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 rounded-lg transition-colors"
                                                            >
                                                                <Edit3 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleEdit(load, 'view'); }}
                                                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 rounded-lg transition-colors"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* Route Map */}
                    <GlassCard className="p-0 relative overflow-hidden h-64 border-blue-500/10">
                        <RouteMap
                            origin={selectedLoadForMap ? { lat: 0, lng: 0, name: selectedLoadForMap.origin_city } : undefined}
                            destination={selectedLoadForMap ? { lat: 0, lng: 0, name: selectedLoadForMap.destination_city } : undefined}
                            className="h-full w-full"
                        />
                    </GlassCard>
                </motion.div>

                {/* Sidebar */}
                <motion.div variants={itemVariants} className="space-y-8">
                    {/* Top Carriers */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            {t('dashboard.top_carriers')}
                        </h4>
                        <div className="space-y-3">
                            <div className="space-y-3">
                                {carriersLoading ? (
                                    <p className="text-gray-500 text-sm ml-4">Loading carriers...</p>
                                ) : carriers.length === 0 ? (
                                    <p className="text-gray-500 text-sm ml-4">No carriers found.</p>
                                ) : (
                                    carriers.slice(0, 5).map((carrier) => (
                                        <GlassCard
                                            key={carrier.id}
                                            onClick={() => setSelectedCarrier(carrier)}
                                            className="p-6 hover:scale-[1.02] transition-transform cursor-pointer border-transparent hover:border-blue-500/20"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center rounded-2xl font-black text-blue-600">
                                                        {carrier.legal_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{carrier.legal_name}</p>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase">{carrier.verification_status}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-blue-600">
                                                    <Star size={14} className="fill-blue-600 mr-1" />
                                                    <span className="font-black text-sm">N/A</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ID</span>
                                                <span className="font-black text-gray-900 dark:text-white">#{carrier.id}</span>
                                            </div>
                                        </GlassCard>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Market Intelligence */}
                    <GlassCard className="p-8 bg-blue-600 text-white border-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000" />
                        <h4 className="text-xl font-black tracking-tighter mb-4 relative z-10 flex items-center gap-2">
                            <TrendingUp size={20} />
                            {t('dashboard.market_analysis')}
                        </h4>
                        <p className="text-sm font-bold text-blue-100 mb-6 relative z-10">
                            {t('dashboard.market_insight')}
                        </p>
                        <button
                            onClick={() => navigate('/dashboard/market-analysis')}
                            className="w-full py-4 bg-white text-blue-600 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 group transform transition-all hover:translate-x-1"
                        >
                            {t('dashboard.analysis_btn')} <ArrowRight size={18} />
                        </button>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Edit Modal */}
            {/* Modal: View & Edit Modes */}
            <AnimatePresence>
                {editingLoad && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black">
                                    {modalMode === 'edit' ? 'Edit Load' : 'Load Details'}
                                </h2>
                                <button onClick={() => setEditingLoad(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>

                            {modalMode === 'view' ? (
                                // READ-ONLY VIEW
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Origin</label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium">
                                                {editingLoad.origin_city}, {editingLoad.origin_country}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Destination</label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium">
                                                {editingLoad.destination_city}, {editingLoad.destination_country}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2">Equipment Type</label>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium">
                                            {editingLoad.equipment_code || 'N/A'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Weight</label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium">
                                                {editingLoad.weight_kg ? `${editingLoad.weight_kg} kg` : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Cargo Value</label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium">
                                                {editingLoad.cargo_value_amount ? `$${editingLoad.cargo_value_amount}` : 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2">Status</label>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${editingLoad.status === 'in_transit' ? 'bg-blue-100 text-blue-600' :
                                            editingLoad.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                                                'bg-amber-100 text-amber-600'
                                            }`}>
                                            {editingLoad.status?.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={() => handleEdit(editingLoad, 'edit')}
                                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                                        >
                                            <Edit3 size={18} />
                                            Edit Load
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // EDIT FORM
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Equipment Code</label>
                                        <input
                                            type="text"
                                            value={editFormData.equipment_code}
                                            onChange={(e) => setEditFormData({ ...editFormData, equipment_code: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2">Cargo Value</label>
                                        <input
                                            type="number"
                                            value={editFormData.cargo_value_amount}
                                            onChange={(e) => setEditFormData({ ...editFormData, cargo_value_amount: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2">Weight (kg)</label>
                                        <input
                                            type="number"
                                            value={editFormData.weight_kg}
                                            onChange={(e) => setEditFormData({ ...editFormData, weight_kg: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2">Status</label>
                                        <select
                                            value={editFormData.status}
                                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="posted">Posted</option>
                                            <option value="in_transit">In Transit</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={handleSaveEdit}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                                        >
                                            <Save size={20} />
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => setEditingLoad(null)}
                                            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 font-bold rounded-xl"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Carrier Contact Modal */}
            <AnimatePresence>
                {selectedCarrier && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black">Carrier Details</h2>
                                <button onClick={() => setSelectedCarrier(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center rounded-2xl font-black text-2xl text-blue-600">
                                        {selectedCarrier.legal_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedCarrier.legal_name}</h3>
                                        <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                            {selectedCarrier.verification_status}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Email</label>
                                        <p className="font-bold text-lg select-all">contact@{selectedCarrier.legal_name.toLowerCase().replace(/\s/g, '')}.com</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Phone</label>
                                        <p className="font-bold text-lg select-all">+1 (555) 000-0000</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Services</label>
                                        <p className="font-medium text-gray-600 dark:text-gray-300">Full Truckload (FTL), Refrigerated, Intermodal</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20">
                                        Start Chat
                                    </button>
                                    <button className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold py-4 rounded-xl">
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
