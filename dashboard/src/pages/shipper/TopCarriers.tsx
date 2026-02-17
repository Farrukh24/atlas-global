import { useEffect, useState } from 'react';
import { usePartyStore } from '@/stores/partyStore';
import {
    Star,
    Truck,
    Search,
    Filter,
    Phone,
    Mail,
    MapPin,
    Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';

export default function TopCarriersPage() {
    const { carriers, fetchParties, isLoading } = usePartyStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [equipmentFilter, setEquipmentFilter] = useState('all');

    useEffect(() => {
        fetchParties('carrier');
    }, [fetchParties]);

    const filteredCarriers = carriers.filter(carrier => {
        const matchesSearch = carrier.legal_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="min-h-screen p-6 lg:p-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                    Лучшие <span className="text-blue-600 italic">Перевозчики</span>
                </h1>
                <p className="text-gray-500 font-bold mt-2">Рейтинг проверенных перевозчиков для ваших грузов</p>
            </div>

            {/* Search & Filters */}
            <GlassCard className="p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Поиск по названию компании..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                        />
                    </div>
                    <select
                        value={equipmentFilter}
                        onChange={(e) => setEquipmentFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                    >
                        <option value="all">Все типы оборудования</option>
                        <option value="DRY_VAN">Dry Van</option>
                        <option value="FLATBED">Flatbed</option>
                        <option value="REEFER">Refrigerated</option>
                        <option value="TANKER">Tanker</option>
                    </select>
                </div>
            </GlassCard>

            {/* Top 3 Featured Carriers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {filteredCarriers.slice(0, 3).map((carrier, idx) => (
                    <motion.div
                        key={carrier.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <GlassCard className="p-6 relative overflow-hidden border-2 border-blue-500/20 hover:border-blue-500/40 transition-all">
                            {idx === 0 && (
                                <div className="absolute top-4 right-4">
                                    <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full flex items-center gap-1">
                                        <Award size={14} className="text-yellow-600" />
                                        <span className="text-[10px] font-black text-yellow-600 uppercase">ТОП-1</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center rounded-2xl font-black text-2xl text-blue-600">
                                    {carrier.legal_name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-lg text-gray-900 dark:text-white">{carrier.legal_name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Star size={16} className="fill-yellow-500 text-yellow-500" />
                                        <span className="font-black text-sm text-gray-900 dark:text-white">4.9</span>
                                        <span className="text-xs text-gray-500 font-bold">(N/A отзывов)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-xs font-bold text-gray-500">Выполнено заказов</span>
                                    <span className="font-black text-gray-900 dark:text-white">N/A</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-xs font-bold text-gray-500">Средняя цена</span>
                                    <span className="font-black text-blue-600">$2.30/км</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-xs font-bold text-gray-500">Статус</span>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${carrier.verification_status === 'verified'
                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20'
                                            : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20'
                                        }`}>
                                        {carrier.verification_status}
                                    </span>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                <Phone size={18} />
                                Связаться
                            </button>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* All Carriers List */}
            <GlassCard className="p-8">
                <h3 className="text-2xl font-black tracking-tighter mb-6 flex items-center gap-3">
                    <Truck className="text-blue-600" />
                    Все перевозчики ({filteredCarriers.length})
                </h3>

                {isLoading ? (
                    <p className="text-center py-12 text-gray-500">Загрузка перевозчиков...</p>
                ) : filteredCarriers.length === 0 ? (
                    <p className="text-center py-12 text-gray-500">Перевозчики не найдены.</p>
                ) : (
                    <div className="space-y-4">
                        {filteredCarriers.slice(3).map((carrier) => (
                            <div key={carrier.id} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center rounded-xl font-black text-lg text-blue-600">
                                                {carrier.legal_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{carrier.legal_name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Star size={14} className="fill-yellow-500 text-yellow-500" />
                                                    <span className="font-black text-sm">4.8</span>
                                                    <span className="text-xs text-gray-500">• ID: {carrier.id}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mt-4">
                                            <div>
                                                <p className="text-xs font-black text-gray-400 uppercase mb-1">Выполнено</p>
                                                <p className="font-bold text-gray-900 dark:text-white">N/A</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-400 uppercase mb-1">Цена/км</p>
                                                <p className="font-bold text-blue-600">$2.25</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-400 uppercase mb-1">Регистрация</p>
                                                <p className="font-bold text-gray-900 dark:text-white">
                                                    {carrier.created_at ? new Date(carrier.created_at).getFullYear() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 ml-4">
                                        <Mail size={18} />
                                        Связаться
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
