
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import api from '@/services/api';

import { useLanguage } from '@/i18n/LanguageContext';

export default function Rating() {
    const { t } = useLanguage();
    const [rating, setRating] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);

    useEffect(() => {
        api.get('/reviews/rating').then(res => setRating(res.data));
        api.get('/reviews').then(res => setReviews(res.data));
    }, []);

    if (!rating) return <div>{t('rating_page.loading')}</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                {t('rating_page.title')} <span className="text-emerald-600 italic">{t('rating_page.span')}</span>
            </h1>

            <div className="flex items-center gap-8">
                <div className="text-center">
                    <div className="text-6xl font-black text-emerald-600 flex items-center gap-2">
                        {rating.average} <Star size={48} fill="currentColor" />
                    </div>
                    <p className="text-gray-500 font-bold mt-2">{rating.count} {t('rating_page.total_reviews')}</p>
                </div>
            </div>

            <div className="grid gap-6">
                {reviews.map((review) => (
                    <GlassCard key={review.id} className="p-6">
                        <div className="flex justify-between mb-4">
                            <span className="font-bold text-lg">{review.reviewer_name}</span>
                            <div className="flex items-center gap-1 text-emerald-500">
                                {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 italic">"{review.comment}"</p>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
