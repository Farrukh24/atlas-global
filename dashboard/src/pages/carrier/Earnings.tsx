
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import api from '@/services/api';

import { useLanguage } from '@/i18n/LanguageContext';

export default function Earnings() {
    const { t } = useLanguage();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        api.get('/payments')
            .then(res => {
                const d = res.data?.data || res.data;
                setData({
                    balance: d?.balance ?? 0,
                    pending: d?.pending ?? 0,
                    history: Array.isArray(d?.history) ? d.history : []
                });
            })
            .catch(err => {
                console.error('Failed to load earnings', err);
                setError(t('earnings_page.error_load'));
                setData({ balance: 0, pending: 0, history: [] });
            })
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                {t('earnings_page.title')} <span className="text-emerald-600 italic">{t('earnings_page.span')}</span>
            </h1>

            {error && (
                <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-700 dark:text-yellow-400">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-8 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none">
                    <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs">{t('earnings_page.balance')}</p>
                    <h2 className="text-5xl font-black mt-2">${(data?.balance ?? 0).toLocaleString()}</h2>
                </GlassCard>
                <GlassCard className="p-8">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('earnings_page.pending')}</p>
                    <h2 className="text-5xl font-black mt-2 text-gray-900 dark:text-white">${(data?.pending ?? 0).toLocaleString()}</h2>
                </GlassCard>
            </div>

            <h3 className="text-xl font-black">{t('earnings_page.history')}</h3>
            <div className="space-y-4">
                {data?.history?.length > 0 ? (
                    data.history.map((tx: any) => (
                        <GlassCard key={tx.id} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold">{t('earnings_page.payment_for')} {tx.shipment_id || tx.load_id}</p>
                                <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className="font-black text-emerald-600">+${tx.amount}</span>
                        </GlassCard>
                    ))
                ) : (
                    <GlassCard className="p-8 text-center">
                        <DollarSign className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
                        <p className="text-gray-500 font-medium">{t('earnings_page.no_transactions')}</p>
                        <p className="text-gray-400 text-sm mt-1">{t('earnings_page.no_transactions_detail')}</p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}
