
import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import api from '@/services/api';
import { format } from 'date-fns';

export default function MyBids() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [bids, setBids] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBids();
    }, []);

    const fetchBids = async () => {
        try {
            const response = await api.get('/offers');
            const bidsData = response.data?.data || response.data || [];
            setBids(Array.isArray(bidsData) ? bidsData : []);
        } catch (error) {
            console.error('Failed to fetch bids', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                {t('my_bids_page.title')} <span className="text-emerald-600 italic">{t('my_bids_page.span_bids')}</span>
            </h1>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-20">{t('my_bids_page.loading')}</div>
                ) : bids.length === 0 ? (
                    <GlassCard className="p-10 text-center">
                        <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 font-bold">{t('my_bids_page.no_bids')}</p>
                    </GlassCard>
                ) : (
                    bids.map((bid) => (
                        <GlassCard key={bid.id} className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(bid.offer_status)}`}>
                                            {t(`my_bids_page.status_${bid.offer_status}`)}
                                        </span>
                                        <span className="text-gray-400 text-sm font-bold">
                                            {format(new Date(bid.created_at), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    <p className="text-xl font-black text-gray-900 dark:text-white">
                                        ${Number(bid.offer_amount).toLocaleString()}
                                    </p>
                                    <p className="text-sm font-bold text-gray-500">
                                        {t('my_bids_page.for_load')} {bid.load_id}
                                    </p>
                                </div>
                                {bid.offer_status === 'accepted' && (
                                    <button
                                        onClick={() => navigate('/dashboard/my-hauls')}
                                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                                    >
                                        {t('my_bids_page.start_haul')}
                                    </button>
                                )}
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
}
