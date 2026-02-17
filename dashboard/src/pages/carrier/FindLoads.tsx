import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, DollarSign, Filter, Truck, ArrowRight, Star, Clock, Package, Weight, X, Info } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import DatePicker from '@/components/ui/DatePicker';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useLanguage } from '@/i18n/LanguageContext';

export default function FindLoads() {
    const [loads, setLoads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Separate state for display vs API
    const [displayFilters, setDisplayFilters] = useState({
        origin: '',
        destination: '',
        date: '' as string,
        equipment_type: ''
    });

    const [apiFilters, setApiFilters] = useState({
        origin: '',
        destination: '',
        date: '' as string,
        equipment_type: ''
    });

    const [selectedLoad, setSelectedLoad] = useState<any>(null);
    const [bidAmount, setBidAmount] = useState('');
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [submittingBid, setSubmittingBid] = useState(false);

    const { t } = useLanguage();
    const debounceTimerRef = useRef<any>(null);

    // Debounced filter update
    const updateFilters = useCallback((newFilters: typeof displayFilters) => {
        setDisplayFilters(newFilters);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            setApiFilters(newFilters);
        }, 500);
    }, []);

    // Fetch loads when API filters change
    useEffect(() => {
        fetchLoads();
    }, [apiFilters]);

    const fetchLoads = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();

            // Text filters
            if (apiFilters.origin) params.append('origin', apiFilters.origin);
            if (apiFilters.destination) params.append('destination', apiFilters.destination);
            if (apiFilters.equipment_type) params.append('equipment_code', apiFilters.equipment_type);

            // Date filter (ISO format for backend)
            if (apiFilters.date) {
                params.append('pickup_date', new Date(apiFilters.date).toISOString());
            }

            // Always filter by posted status for carriers
            params.append('status', 'posted');

            console.log('Fetching loads with params:', params.toString());
            const response = await api.get(`/loads?${params.toString()}`);
            const loadsData = response.data?.data || response.data || [];
            console.log('Loaded', loadsData.length, 'loads');
            setLoads(Array.isArray(loadsData) ? loadsData : []);
        } catch (error) {
            console.error('Failed to fetch loads', error);
            toast.error(t('find_loads.error_fetch'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = (load: any) => {
        setSelectedLoad(load);
        setIsDetailsModalOpen(true);
    };

    const handleBidClick = (load: any) => {
        setSelectedLoad(load);
        setIsDetailsModalOpen(false);
        setIsBidModalOpen(true);
    };

    const submitBid = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bidAmount || !selectedLoad) return;

        setSubmittingBid(true);
        try {
            await api.post('/offers', {
                load_id: selectedLoad.id,
                amount: parseFloat(bidAmount),
                currency: 'USD',
                pickup_date: selectedLoad.pickup_earliest,
                delivery_date: selectedLoad.delivery_earliest
            });
            toast.success(t('find_loads.success'));
            setIsBidModalOpen(false);
            setBidAmount('');
            fetchLoads();
        } catch (error) {
            console.error('Failed to submit bid', error);
            toast.error(t('find_loads.error'));
        } finally {
            setSubmittingBid(false);
        }
    };

    return (
        <div className="space-y-6 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                        {t('find_loads.title')} <span className="text-emerald-600">{t('find_loads.span')}</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">{t('find_loads.subtitle')}</p>
                </div>
            </div>

            {/* Compact Filters - FIXED Z-INDEX */}
            <GlassCard className="p-4 relative z-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder={t('find_loads.origin_ph')}
                            value={displayFilters.origin}
                            onChange={(e) => updateFilters({ ...displayFilters, origin: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800/50 border-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder={t('find_loads.dest_ph')}
                            value={displayFilters.destination}
                            onChange={(e) => updateFilters({ ...displayFilters, destination: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800/50 border-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                    <div className="relative z-30">
                        <DatePicker
                            selected={displayFilters.date ? new Date(displayFilters.date) : null}
                            onChange={(date: Date | null) => updateFilters({ ...displayFilters, date: date ? date.toISOString() : '' })}
                            placeholderText={t('find_loads.pickup_date_ph')}
                            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800/50 border-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                    <div className="relative">
                        <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={displayFilters.equipment_type}
                            onChange={(e) => updateFilters({ ...displayFilters, equipment_type: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800/50 border-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                        >
                            <option value="">{t('find_loads.equipment_any')}</option>
                            <option value="DRY_VAN">{t('equipment.dry_van')}</option>
                            <option value="REEFER">{t('equipment.reefer')}</option>
                            <option value="FLATBED">{t('equipment.flatbed')}</option>
                        </select>
                    </div>
                </div>
                {isLoading && (
                    <div className="absolute top-2 right-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                    </div>
                )}
            </GlassCard>

            {/* Compact Load List */}
            <div className="space-y-2 relative z-10">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
                    </div>
                ) : loads.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 font-medium">{t('find_loads.no_loads')}</p>
                    </div>
                ) : (
                    loads.map((load) => (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key={load.id}
                        >
                            <GlassCard className="p-4 hover:border-emerald-500/50 transition-all">
                                {/* Mobile Layout */}
                                <div className="block lg:hidden space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Package size={14} className="text-gray-400" />
                                                <span className="text-xs text-gray-500 font-medium">{load.load_number}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-black text-emerald-600">{load.origin_city || 'Origin'}</span>
                                                    <ArrowRight size={16} className="text-gray-400" />
                                                    <span className="text-lg font-black text-blue-600">{load.destination_city || 'Dest'}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {load.pickup_earliest ? format(new Date(load.pickup_earliest), 'MMM dd') : 'TBD'}
                                                    {' → '}
                                                    {load.delivery_earliest ? format(new Date(load.delivery_earliest), 'MMM dd') : 'TBD'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                                                {load.quoted_rate_amount ? `$${Number(load.quoted_rate_amount).toLocaleString()}` : t('find_loads.negotiable')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Truck size={12} />
                                            {load.equipment_code || 'N/A'}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Weight size={12} />
                                            {load.weight_kg ? `${Number(load.weight_kg).toLocaleString()} kg` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewDetails(load)}
                                            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-xs font-bold"
                                        >
                                            <Info size={14} className="inline mr-1" /> Details
                                        </button>
                                        <button
                                            onClick={() => handleBidClick(load)}
                                            className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold"
                                        >
                                            <DollarSign size={14} className="inline mr-1" /> Bid
                                        </button>
                                    </div>
                                </div>

                                {/* Desktop Compact Row Layout */}
                                <div className="hidden lg:flex items-center gap-4">
                                    {/* Load Number */}
                                    <div className="w-24 flex-shrink-0">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Package size={12} />
                                            <span className="font-medium truncate">{load.load_number}</span>
                                        </div>
                                    </div>

                                    {/* Route */}
                                    <div className="flex-1 flex items-center gap-3">
                                        <div className="flex-1">
                                            <p className="font-black text-emerald-600 text-base leading-tight">{load.origin_city || 'Origin'}</p>
                                            <p className="text-xs text-gray-500">
                                                {load.pickup_earliest ? format(new Date(load.pickup_earliest), 'MMM dd, yyyy') : 'TBD'}
                                            </p>
                                        </div>
                                        <ArrowRight size={20} className="text-gray-300 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="font-black text-blue-600 text-base leading-tight">{load.destination_city || 'Destination'}</p>
                                            <p className="text-xs text-gray-500">
                                                {load.delivery_earliest ? format(new Date(load.delivery_earliest), 'MMM dd, yyyy') : 'TBD'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Equipment & Weight */}
                                    <div className="w-32 flex-shrink-0 text-xs text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Truck size={12} />
                                            <span>{load.equipment_code || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Weight size={12} />
                                            <span>{load.weight_kg ? `${Number(load.weight_kg).toLocaleString()} kg` : 'N/A'}</span>
                                        </div>
                                    </div>

                                    {/* Rate */}
                                    <div className="w-28 flex-shrink-0 text-right">
                                        <span className="inline-block bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                                            {load.quoted_rate_amount ? `$${Number(load.quoted_rate_amount).toLocaleString()}` : t('find_loads.negotiable')}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="w-52 flex-shrink-0 flex gap-2">
                                        <button
                                            onClick={() => handleViewDetails(load)}
                                            className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                                        >
                                            <Info size={14} /> Details
                                        </button>
                                        <button
                                            onClick={() => handleBidClick(load)}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                                        >
                                            <DollarSign size={14} /> {t('find_loads.place_bid')}
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {isDetailsModalOpen && selectedLoad && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setIsDetailsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Load Details</h2>
                                    <p className="text-gray-500 text-sm mt-1">{selectedLoad.load_number || 'Load Information'}</p>
                                </div>
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Route Section */}
                            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-4 mb-4">
                                <h3 className="text-xs font-black uppercase text-gray-500 mb-3">Route</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-xl font-black text-emerald-600">{selectedLoad.origin_city || 'Origin'}</p>
                                        <p className="text-sm text-gray-600 mt-0.5">{selectedLoad.origin_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Pickup: {selectedLoad.pickup_earliest ? format(new Date(selectedLoad.pickup_earliest), 'PPP') : 'TBD'}
                                        </p>
                                    </div>
                                    <ArrowRight size={24} className="text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-xl font-black text-blue-600">{selectedLoad.destination_city || 'Destination'}</p>
                                        <p className="text-sm text-gray-600 mt-0.5">{selectedLoad.destination_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Delivery: {selectedLoad.delivery_earliest ? format(new Date(selectedLoad.delivery_earliest), 'PPP') : 'TBD'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black uppercase text-gray-500">Cargo Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <p className="text-xs text-gray-500">Equipment</p>
                                            <p className="font-bold">{selectedLoad.equipment_code || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Weight</p>
                                            <p className="font-bold">{selectedLoad.weight_kg ? `${Number(selectedLoad.weight_kg).toLocaleString()} kg` : 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Volume</p>
                                            <p className="font-bold">{selectedLoad.volume_cbm ? `${selectedLoad.volume_cbm} m³` : 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-xs font-black uppercase text-gray-500">Commercial</h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <p className="text-xs text-gray-500">Rate</p>
                                            <p className="font-bold text-lg text-emerald-600">
                                                {selectedLoad.quoted_rate_amount ? `$${Number(selectedLoad.quoted_rate_amount).toLocaleString()}` : 'Negotiable'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Shipper</p>
                                            <p className="font-bold">{selectedLoad.shipper_name || 'Not available'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Commodity</p>
                                            <p className="font-bold">{selectedLoad.commodity_description || 'General freight'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Special Requirements */}
                            {(selectedLoad.hazmat || selectedLoad.temperature_min_c) && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mb-4">
                                    <h3 className="text-xs font-black uppercase text-yellow-700 dark:text-yellow-500 mb-2">Special Requirements</h3>
                                    <div className="space-y-1 text-xs">
                                        {selectedLoad.hazmat && <p>⚠️ Hazmat: {selectedLoad.hazmat_class || 'Yes'}</p>}
                                        {selectedLoad.temperature_min_c && <p>🌡️ Temp: {selectedLoad.temperature_min_c}°C - {selectedLoad.temperature_max_c}°C</p>}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 py-3 rounded-lg font-bold text-sm"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleBidClick(selectedLoad)}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-black text-sm flex items-center justify-center gap-2"
                                >
                                    <DollarSign size={18} /> Place Bid
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bid Modal */}
            <AnimatePresence>
                {isBidModalOpen && selectedLoad && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20"
                        >
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">{t('find_loads.modal_title')}</h2>
                            <p className="text-gray-500 text-sm mb-4">
                                {selectedLoad.origin_city || selectedLoad.origin_name} → {selectedLoad.destination_city || selectedLoad.destination_name}
                            </p>

                            <form onSubmit={submitBid} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">{t('find_loads.offered_rate')}</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-emerald-500 font-bold text-lg outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {selectedLoad.quoted_rate_amount && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Suggested: ${Number(selectedLoad.quoted_rate_amount).toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsBidModalOpen(false)}
                                        className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 py-3 rounded-lg font-bold text-sm"
                                    >
                                        {t('find_loads.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingBid}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-black text-sm"
                                    >
                                        {submittingBid ? t('find_loads.sending') : t('find_loads.submit')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
