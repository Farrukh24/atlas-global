import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePartyStore } from '@/stores/partyStore';
import { useLanguage } from '@/i18n/LanguageContext';
import {
    User,
    Building,
    Mail,
    Phone,
    MapPin,
    Save,
    Bell,
    Shield,
    Globe,
    FileText,
    Image as ImageIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const { updateMySettings } = usePartyStore();
    const { language, setLanguage, t } = useLanguage();

    const [formData, setFormData] = useState({
        legal_name: user?.legal_name || '',
        email: user?.settings?.email || '',
        phone: user?.settings?.phone || '',
        address: user?.settings?.address || '',
        city: user?.settings?.city || '',
        country: user?.settings?.country || '',
        description: user?.settings?.description || '',
        logo_url: user?.settings?.logo_url || '',
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // Validation
        if (!formData.email.includes('@')) {
            toast.error(t('settings.invalid_email'));
            return;
        }

        const toastId = toast.loading(t('common.saving'));

        try {
            await updateMySettings({
                legal_name: formData.legal_name,
                settings: {
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    country: formData.country,
                    description: formData.description,
                    logo_url: formData.logo_url,
                    language: language
                }
            });
            toast.success(t('common.saved'), { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error(t('common.error'), { id: toastId });
        }
    };

    return (
        <div className="min-h-screen p-6 lg:p-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                    {t('settings.title')} <span className="text-blue-600 italic">Profile</span>
                </h1>
                <p className="text-gray-500 font-bold mt-2">{t('settings.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Information */}
                    <GlassCard className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="text-blue-600" size={24} />
                            <h3 className="text-2xl font-black tracking-tighter">{t('settings.company_info')}</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    <Building className="inline mr-2" size={16} />
                                    {t('settings.legal_name')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.legal_name}
                                    onChange={(e) => updateField('legal_name', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    <Mail className="inline mr-2" size={16} />
                                    {t('settings.email')}
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    <Phone className="inline mr-2" size={16} />
                                    {t('settings.phone')}
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                    placeholder="+7 (000) 000-00-00"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    <ImageIcon className="inline mr-2" size={16} />
                                    {t('settings.logo_url')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.logo_url}
                                    onChange={(e) => updateField('logo_url', e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    <FileText className="inline mr-2" size={16} />
                                    {t('settings.description')}
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold resize-none"
                                    placeholder="Tell us about your company..."
                                />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Address */}
                    <GlassCard className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin className="text-blue-600" size={24} />
                            <h3 className="text-2xl font-black tracking-tighter">{t('settings.address_title')}</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    {t('settings.street')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => updateField('address', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('settings.city')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => updateField('city', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('settings.country')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => updateField('country', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        {t('common.save')}
                    </button>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Account Status */}
                    <GlassCard className="p-6">
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Shield size={14} />
                            {t('settings.account_status')}
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('settings.verification')}</span>
                                <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20">
                                    {user?.verification_status || 'pending'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('settings.type')}</span>
                                <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                                    {user?.type || 'shipper'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">ID</span>
                                <span className="text-sm font-black text-gray-900 dark:text-white">#{user?.id}</span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Notifications */}
                    <GlassCard className="p-6">
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Bell size={14} />
                            {t('settings.notifications')}
                        </h4>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('settings.email_notif')}</span>
                                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('settings.status_update')}</span>
                                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('settings.new_offers')}</span>
                                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            </label>
                        </div>
                    </GlassCard>

                    {/* Language */}
                    <GlassCard className="p-6">
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Globe size={14} />
                            {t('settings.language')}
                        </h4>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'ru' | 'en' | 'uz')}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold cursor-pointer"
                        >
                            <option value="ru">Русский</option>
                            <option value="en">English</option>
                            <option value="uz">O'zbek</option>
                        </select>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
