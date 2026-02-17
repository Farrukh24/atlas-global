
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLoadStore } from '@/stores/loadStore';
import { format } from 'date-fns';
import { Package, Search, Plus, Eye, Edit3, XCircle, X, Save, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';
import api from '@/services/api';

const statusColors = {
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    posted: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    booked: 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    en_route: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    delivered: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
};

export default function MyLoadsPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { loads, fetchLoads, updateLoad, deleteLoad, isLoading } = useLoadStore();
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingLoad, setEditingLoad] = useState<any>(null);
    const [deletingLoad, setDeletingLoad] = useState<any>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'review'>('view');
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

    // Search Logic
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearchQuery = searchParams.get('search') || '';
    const [searchQuery, setSearchQuery] = useState(urlSearchQuery);


    // Sync local state with URL on mount/update
    useEffect(() => {
        if (urlSearchQuery !== searchQuery) {
            setSearchQuery(urlSearchQuery);
        }
    }, [urlSearchQuery]);

    // Update URL when search changes (debounced)
    const debouncedSearch = useDebounce(searchQuery, 300);

    useEffect(() => {
        if (debouncedSearch) {
            setSearchParams({ search: debouncedSearch });
        } else {
            setSearchParams({});
        }
    }, [debouncedSearch, setSearchParams]);

    useEffect(() => {
        if (user?.id) {
            fetchLoads({ shipper_party_id: user.id });
        }
    }, [user?.id, fetchLoads]);

    const filteredLoads = loads.filter(load => {
        const lowerQuery = debouncedSearch.toLowerCase();
        const matchesSearch =
            load.load_number?.toLowerCase().includes(lowerQuery) ||
            load.origin_city?.toLowerCase().includes(lowerQuery) ||
            load.destination_city?.toLowerCase().includes(lowerQuery);
        const matchesStatus = statusFilter === 'all' || load.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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

    const handleDelete = async () => {
        if (!deletingLoad) return;

        try {
            await deleteLoad(deletingLoad.id);
            toast.success('Load deleted successfully!');
            setDeletingLoad(null);
            fetchLoads({ shipper_party_id: user?.id });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete load');
        }
    };

    const handleOpenReview = (load: any) => {
        setEditingLoad(load);
        setModalMode('review');
        setReviewData({ rating: 5, comment: '' });
    };

    const handleSubmitReview = async () => {
        if (!editingLoad) return;

        try {
            await api.post('/reviews', {
                shipment_id: editingLoad.id,
                subject_party_id: editingLoad.carrier_party_id,
                rating: reviewData.rating,
                comment: reviewData.comment
            });
            toast.success('Thank you for your feedback!');
            setEditingLoad(null);
        } catch (error: any) {
            console.error('Failed to submit review:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    };

    // Helper to highlight text
    const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
        if (!text) return null;
        if (!highlight.trim()) return <>{text}</>;

        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ?
                        <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-white rounded px-0.5 font-bold border border-yellow-300 dark:border-yellow-700">{part}</span> :
                        part
                )}
            </span>
        );
    };

    return (
        <div className="min-h-screen p-6 lg:p-10">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                        My <span className="text-blue-600 italic">Loads</span>
                    </h1>
                    <p className="text-gray-500 font-bold mt-2">Manage all your shipments</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/create-load')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-colors"
                >
                    <Plus size={20} />
                    Create New Load
                </button>
            </div>

            {/* Filters */}
            <GlassCard className="p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by load number, origin, or destination..."
                            className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                    >
                        <option value="all">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="posted">Posted</option>
                        <option value="booked">Booked</option>
                        <option value="en_route">En Route</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </GlassCard>

            {/* Loads Table */}
            <GlassCard className="p-8">
                <div className="flex items-center gap-3 mb-8">
                    <Package className="text-blue-600" size={24} />
                    <h3 className="text-2xl font-black tracking-tighter">All Loads ({filteredLoads.length})</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="pb-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Load #</th>
                                <th className="pb-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Route</th>
                                <th className="pb-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                <th className="pb-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="pb-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Equipment</th>
                                <th className="pb-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        Loading loads...
                                    </td>
                                </tr>
                            ) : filteredLoads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        No loads found. {statusFilter !== 'all' ? 'Try changing the status filter.' : 'Create a new load to get started.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredLoads.map((load) => (
                                    <motion.tr
                                        key={load.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all"
                                    >
                                        <td className="py-5">
                                            <span className="font-black text-blue-600 text-sm">
                                                <HighlightText text={load.load_number || `AT-${load.id}`} highlight={debouncedSearch} />
                                            </span>
                                        </td>
                                        <td className="py-5">
                                            <div className="font-bold text-sm text-gray-900 dark:text-gray-100">
                                                <HighlightText text={load.origin_city || 'Origin'} highlight={debouncedSearch} />
                                                <span className="mx-1">→</span>
                                                <HighlightText text={load.destination_city || 'Dest'} highlight={debouncedSearch} />
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {load.origin_country} → {load.destination_country}
                                            </div>
                                        </td>
                                        <td className="py-5">
                                            <span className="text-sm font-bold text-gray-500">
                                                {load.created_at ? format(new Date(load.created_at), 'MMM dd, yyyy') : '-'}
                                            </span>
                                        </td>
                                        <td className="py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[load.status as keyof typeof statusColors] || statusColors.draft}`}>
                                                {load.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-5">
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                {load.equipment_code || '-'}
                                            </span>
                                        </td>
                                        <td className="py-5">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(load, 'view')}
                                                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(load, 'edit')}
                                                    className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-600 rounded-lg transition-colors"
                                                    title="Edit Load"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingLoad(load)}
                                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 rounded-lg transition-colors"
                                                    title="Delete Load"
                                                    disabled={!['draft', 'posted', 'cancelled'].includes(load.status)}
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                                {load.status === 'delivered' && (
                                                    <button
                                                        onClick={() => handleOpenReview(load)}
                                                        className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 rounded-lg transition-colors"
                                                        title="Leave Review"
                                                    >
                                                        <Star size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Edit/Review Modal */}
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
                                    {modalMode === 'edit' ? 'Edit Load' : modalMode === 'review' ? 'Submit Review' : 'Load Details'}
                                </h2>
                                <button onClick={() => setEditingLoad(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>

                            {modalMode === 'view' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-widest text-[10px]">Origin</label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl font-bold">
                                                {editingLoad.origin_city}, {editingLoad.origin_country}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-widest text-[10px]">Destination</label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl font-bold">
                                                {editingLoad.destination_city}, {editingLoad.destination_country}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-widest text-[10px]">Equipment Type</label>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl font-bold uppercase tracking-widest text-xs">
                                            {editingLoad.equipment_code || 'N/A'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-widest text-[10px]">Weight</label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl font-bold">
                                                {editingLoad.weight_kg ? `${editingLoad.weight_kg} kg` : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-widest text-[10px]">Cargo Value</label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl font-bold text-blue-600">
                                                {editingLoad.cargo_value_amount ? `$${Number(editingLoad.cargo_value_amount).toLocaleString()}` : 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-widest text-[10px]">Status</label>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[editingLoad.status as keyof typeof statusColors] || statusColors.draft}`}>
                                            {editingLoad.status?.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3">
                                        <button
                                            onClick={() => handleEdit(editingLoad, 'edit')}
                                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                                        >
                                            <Edit3 size={18} />
                                            Edit Load
                                        </button>
                                    </div>
                                </div>
                            ) : modalMode === 'edit' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-widest text-[10px]">Equipment Code</label>
                                        <input
                                            type="text"
                                            value={editFormData.equipment_code}
                                            onChange={(e) => setEditFormData({ ...editFormData, equipment_code: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-widest text-[10px]">Cargo Value</label>
                                            <input
                                                type="number"
                                                value={editFormData.cargo_value_amount}
                                                onChange={(e) => setEditFormData({ ...editFormData, cargo_value_amount: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-widest text-[10px]">Weight (kg)</label>
                                            <input
                                                type="number"
                                                value={editFormData.weight_kg}
                                                onChange={(e) => setEditFormData({ ...editFormData, weight_kg: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-widest text-[10px]">Status</label>
                                        <select
                                            value={editFormData.status}
                                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="posted">Posted</option>
                                            <option value="booked">Booked</option>
                                            <option value="en_route">En Route</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                        <button
                                            onClick={handleSaveEdit}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                                        >
                                            <Save size={20} />
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => setEditingLoad(null)}
                                            className="px-6 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold rounded-xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <p className="text-gray-500 font-bold mb-4">How was your experience with this carrier?</p>
                                        <div className="flex justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                                                    className="transition-transform active:scale-95"
                                                >
                                                    <Star
                                                        size={40}
                                                        className={star <= reviewData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Comment (Optional)</label>
                                        <textarea
                                            value={reviewData.comment}
                                            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                            placeholder="Tell others about your experience..."
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500/30 font-medium resize-none outline-none"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={handleSubmitReview}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                                        >
                                            Submit Review
                                        </button>
                                        <button
                                            onClick={() => setEditingLoad(null)}
                                            className="px-6 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold rounded-xl"
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

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deletingLoad && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8"
                        >
                            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                                <XCircle className="text-red-500" />
                                Delete Load?
                            </h2>
                            <p className="text-gray-500 font-medium mb-6">
                                Are you sure you want to delete load <span className="font-bold text-blue-600">{deletingLoad.load_number || `AT-${deletingLoad.id}`}</span>? This action cannot be undone.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setDeletingLoad(null)}
                                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
