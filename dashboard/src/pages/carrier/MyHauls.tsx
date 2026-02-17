
import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { PackageCheck, MapPin, Truck } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

export default function MyHauls() {
    const { t } = useLanguage();
    const [hauls, setHauls] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchHauls();
    }, []);

    const fetchHauls = async () => {
        try {
            const response = await api.get('/hauls');
            const haulsData = response.data?.data || response.data || [];
            setHauls(Array.isArray(haulsData) ? haulsData : []);
        } catch (error) {
            console.error('Failed to fetch hauls', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/hauls/${id}/status`, { status });
            toast.success('Status updated');
            fetchHauls();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                {t('my_hauls_page.title')} <span className="text-emerald-600 italic">{t('my_hauls_page.span_hauls')}</span>
            </h1>

            <div className="grid gap-6">
                {isLoading ? (
                    <div>{t('my_hauls_page.loading')}</div>
                ) : hauls.length === 0 ? (
                    <p className="text-gray-500 font-bold">{t('my_hauls_page.no_hauls')}</p>
                ) : (
                    hauls.map((haul) => (
                        <GlassCard key={haul.id} className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Truck className="text-emerald-600" />
                                        <span className="font-black text-lg">{t('my_hauls_page.shipment_num')} {haul.id}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-gray-500 font-bold flex items-center gap-2">
                                            <MapPin size={16} /> {t('my_hauls_page.origin_id')} {haul.origin_location_id}
                                        </p>
                                        <p className="text-gray-500 font-bold flex items-center gap-2">
                                            <MapPin size={16} /> {t('my_hauls_page.dest_id')} {haul.destination_location_id}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-black uppercase text-gray-400">{t('my_hauls_page.current_status')} {t(`my_hauls_page.status_${haul.current_status}`)}</span>
                                    <div className="flex gap-2">
                                        {['dispatched', 'in_transit', 'delivered'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => updateStatus(haul.id, status)}
                                                disabled={haul.current_status === status}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${haul.current_status === status
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                                    }`}
                                            >
                                                {t(`my_hauls_page.status_${status}`)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
}
