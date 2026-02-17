import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLoadStore } from '@/stores/loadStore';
import {
    MapPin,
    Package,
    Calendar,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import toast from 'react-hot-toast';
import DatePicker from '@/components/ui/DatePicker';
import { useLanguage } from '@/i18n/LanguageContext';

const steps = [
    { id: 1, key: 'step1', icon: MapPin },
    { id: 2, key: 'step2', icon: Package },
    { id: 3, key: 'step3', icon: Calendar },
    { id: 4, key: 'step4', icon: CheckCircle },
];

export default function CreateLoadPage() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { createLoad, isLoading } = useLoadStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1
        origin_location_id: '',
        origin_city: '',
        origin_country: '',
        destination_location_id: '',
        destination_city: '',
        destination_country: '',

        // Step 2
        equipment_code: 'DRY_VAN',
        weight_kg: '',
        volume_cbm: '',
        cargo_description: '',

        // Step 3
        pickup_earliest: '',
        delivery_earliest: '',
    });

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            await createLoad({
                ...formData,
                weight_kg: Number(formData.weight_kg) || undefined,
                volume_cbm: Number(formData.volume_cbm) || undefined,
            });
            toast.success(t('create_load.success'));
            navigate('/dashboard/my-loads');
        } catch (error: any) {
            toast.error(error.message || t('create_load.error'));
        }
    };

    return (
        <div className="min-h-screen p-6 lg:p-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                    {t('create_load.title')} <span className="text-blue-600 italic">{t('create_load.span')}</span>
                </h1>
                <p className="text-gray-500 font-bold mt-2">{t('create_load.subtitle')}</p>
            </div>

            {/* Progress Steps */}
            <div className="mb-12">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center flex-1">
                            <div className="flex flex-col items-center relative">
                                <div
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all ${currentStep >= step.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                        }`}
                                >
                                    <step.icon size={24} />
                                </div>
                                <p className={`text-xs font-bold mt-2 text-center ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {t(`create_load.${step.key}`)}
                                </p>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-4 rounded-full ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-3xl mx-auto">
                <GlassCard className="p-8">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <Step1
                                key="step1"
                                formData={formData}
                                updateFormData={updateFormData}
                                onNext={nextStep}
                            />
                        )}
                        {currentStep === 2 && (
                            <Step2
                                key="step2"
                                formData={formData}
                                updateFormData={updateFormData}
                                onNext={nextStep}
                                onPrev={prevStep}
                            />
                        )}
                        {currentStep === 3 && (
                            <Step3
                                key="step3"
                                formData={formData}
                                updateFormData={updateFormData}
                                onNext={nextStep}
                                onPrev={prevStep}
                            />
                        )}
                        {currentStep === 4 && (
                            <Step4
                                key="step4"
                                formData={formData}
                                onSubmit={handleSubmit}
                                onPrev={prevStep}
                                isLoading={isLoading}
                            />
                        )}
                    </AnimatePresence>
                </GlassCard>
            </div>
        </div>
    );
}

// Step 1: Origin & Destination
function Step1({ formData, updateFormData, onNext }: any) {
    const { t } = useLanguage();
    const canProceed = formData.origin_city && formData.destination_city;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <h2 className="text-2xl font-black tracking-tighter">{t('create_load.step1')}</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {t('create_load.origin_city')} *
                    </label>
                    <input
                        type="text"
                        value={formData.origin_city}
                        onChange={(e) => updateFormData('origin_city', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                        placeholder="e.g., Almaty"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {t('create_load.origin_country')} *
                    </label>
                    <input
                        type="text"
                        value={formData.origin_country}
                        onChange={(e) => updateFormData('origin_country', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                        placeholder="e.g., Kazakhstan"
                    />
                </div>

                <div className="my-6 flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <ArrowRight className="text-blue-600" size={24} />
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {t('create_load.dest_city')} *
                    </label>
                    <input
                        type="text"
                        value={formData.destination_city}
                        onChange={(e) => updateFormData('destination_city', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                        placeholder="e.g., Istanbul"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {t('create_load.dest_country')} *
                    </label>
                    <input
                        type="text"
                        value={formData.destination_country}
                        onChange={(e) => updateFormData('destination_country', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                        placeholder="e.g., Turkey"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
                <button
                    onClick={onNext}
                    disabled={!canProceed}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                    {t('common.next')} <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>
    );
}

// Step 2: Cargo Details
function Step2({ formData, updateFormData, onNext, onPrev }: any) {
    const { t } = useLanguage();
    const canProceed = formData.equipment_code;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <h2 className="text-2xl font-black tracking-tighter">{t('create_load.step2')}</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {t('create_load.equipment')} *
                    </label>
                    <select
                        value={formData.equipment_code}
                        onChange={(e) => updateFormData('equipment_code', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                    >
                        <option value="DRY_VAN">Dry Van</option>
                        <option value="FLATBED">Flatbed</option>
                        <option value="REEFER">Refrigerated</option>
                        <option value="TANKER">Tanker</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            {t('create_load.weight')}
                        </label>
                        <input
                            type="number"
                            value={formData.weight_kg}
                            onChange={(e) => updateFormData('weight_kg', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                            placeholder="5000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            {t('create_load.volume')}
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.volume_cbm}
                            onChange={(e) => updateFormData('volume_cbm', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                            placeholder="25.0"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {t('create_load.description')}
                    </label>
                    <textarea
                        value={formData.cargo_description}
                        onChange={(e) => updateFormData('cargo_description', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold resize-none"
                        placeholder="Describe the cargo..."
                    />
                </div>
            </div>

            <div className="flex justify-between gap-4 pt-6">
                <button
                    onClick={onPrev}
                    className="px-8 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                    <ArrowLeft size={18} /> {t('common.back')}
                </button>
                <button
                    onClick={onNext}
                    disabled={!canProceed}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                    {t('common.next')} <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>
    );
}

// Step 3: Schedule
function Step3({ formData, updateFormData, onNext, onPrev }: any) {
    const { t } = useLanguage();
    const canProceed = formData.pickup_earliest && formData.delivery_earliest;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <h2 className="text-2xl font-black tracking-tighter">{t('create_load.step3')}</h2>

            <div className="space-y-4">
                <div>
                    <DatePicker
                        label={t('create_load.pickup_date')}
                        selected={formData.pickup_earliest ? new Date(formData.pickup_earliest) : null}
                        onChange={(date: Date | null) => updateFormData('pickup_earliest', date ? date.toISOString() : '')}
                        placeholderText={t('create_load.select_pickup_date')}
                        minDate={new Date()}
                        showTimeSelect
                        dateFormat="Pp"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                    />
                </div>

                <div>
                    <DatePicker
                        label={t('create_load.delivery_date')}
                        selected={formData.delivery_earliest ? new Date(formData.delivery_earliest) : null}
                        onChange={(date: Date | null) => updateFormData('delivery_earliest', date ? date.toISOString() : '')}
                        placeholderText={t('create_load.select_delivery_date')}
                        minDate={formData.pickup_earliest ? new Date(formData.pickup_earliest) : new Date()}
                        showTimeSelect
                        dateFormat="Pp"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                    />
                </div>
            </div>

            <div className="flex justify-between gap-4 pt-6">
                <button
                    onClick={onPrev}
                    className="px-8 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                    <ArrowLeft size={18} /> {t('common.back')}
                </button>
                <button
                    onClick={onNext}
                    disabled={!canProceed}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                    {t('common.next')} <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>
    );
}

// Step 4: Review & Submit
function Step4({ formData, onSubmit, onPrev, isLoading }: any) {
    const { t } = useLanguage();
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <h2 className="text-2xl font-black tracking-tighter">{t('create_load.step4')}</h2>

            <div className="space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-4">
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('create_load.route')}</p>
                        <p className="font-bold text-lg">
                            {formData.origin_city}, {formData.origin_country} → {formData.destination_city}, {formData.destination_country}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('create_load.equipment')}</p>
                            <p className="font-bold">{formData.equipment_code.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('create_load.weight')}</p>
                            <p className="font-bold">{formData.weight_kg ? `${formData.weight_kg} kg` : 'Not specified'}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('create_load.step3')}</p>
                        <p className="font-bold">
                            {t('create_load.pickup_date')}: {new Date(formData.pickup_earliest).toLocaleString()}
                            <br />
                            {t('create_load.delivery_date')}: {new Date(formData.delivery_earliest).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between gap-4 pt-6">
                <button
                    onClick={onPrev}
                    disabled={isLoading}
                    className="px-8 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <ArrowLeft size={18} /> {t('common.back')}
                </button>
                <button
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} /> {t('create_load.creating')}
                        </>
                    ) : (
                        <>
                            {t('create_load.submit')} <CheckCircle size={18} />
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
