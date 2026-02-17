import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoadStore } from '@/stores/loadStore';
import {
    Truck,
    MapPin,
    Calendar,
    DollarSign,
    ChevronRight,
    Package,
    ArrowLeft,
    CheckCircle2,
    Shield,
    Clock,
    Info,
    ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import GlassCard from '@/components/ui/GlassCard';
import { toast } from 'react-hot-toast';
import DatePicker from '@/components/ui/DatePicker';

export default function CreateLoad() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        origin_city: '',
        destination_city: '',
        equipment_code: 'VAN',
        quoted_rate_amount: 0,
        pickup_earliest: '',
        delivery_earliest: '',
        commodity_description: ''
    });

    const createLoad = useLoadStore((state) => state.createLoad);
    const navigate = useNavigate();

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        const loadingToast = toast.loading('Publishing freight requirement...');
        try {
            await createLoad(formData);
            toast.success('Load successfully posted to Atlas network', { id: loadingToast });
            navigate('/loads');
        } catch (e) {
            toast.error('Failed to post load. Please check all fields.', { id: loadingToast });
        }
    };

    const steps = [
        { id: 1, title: 'Route', icon: MapPin },
        { id: 2, title: 'Specs', icon: Truck },
        { id: 3, title: 'Payment', icon: DollarSign }
    ];

    return (
        <div className="max-w-5xl mx-auto py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-400 font-bold text-sm mb-12 hover:text-primary-500 transition-colors group"
            >
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mr-3 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                    <ArrowLeft size={16} />
                </div>
                Discard and Return
            </button>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Side: Stepper Info */}
                <div className="lg:w-1/3">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="sticky top-24"
                    >
                        <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Post<br /><span className="text-primary-600 italic">Freight</span></h2>
                        <p className="text-gray-500 font-bold text-lg mb-10 leading-relaxed">Publish your shipment to the global carrier network in three simple steps.</p>

                        <div className="space-y-6">
                            {steps.map((s, i) => (
                                <div key={s.id} className="flex items-center group">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 mr-4 font-black",
                                        step === s.id ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-110" :
                                            step > s.id ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                    )}>
                                        {step > s.id ? <CheckCircle2 size={24} /> : <s.icon size={22} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-xs font-black uppercase tracking-widest leading-none mb-1",
                                            step === s.id ? "text-primary-500" : "text-gray-400"
                                        )}>Step 0{s.id}</span>
                                        <span className={cn(
                                            "text-lg font-black tracking-tight",
                                            step === s.id ? "text-gray-900 dark:text-white" : "text-gray-400"
                                        )}>{s.title}</span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className="absolute left-[22px] mt-16 w-0.5 h-8 bg-gray-100 dark:bg-gray-800" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 p-6 bg-primary-50 dark:bg-primary-900/10 rounded-[32px] border border-primary-100 dark:border-primary-800/50">
                            <div className="flex items-start">
                                <Shield className="text-primary-500 mr-4 shrink-0" size={24} />
                                <div>
                                    <p className="font-black text-gray-900 dark:text-white text-sm">Secured Transaction</p>
                                    <p className="text-xs text-gray-500 font-bold mt-1">Every load published on Atlas is protected by our carrier vetting system.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1">
                    <GlassCard className="p-10 !bg-white/80 dark:!bg-gray-900/80 shadow-2xl relative border-white">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                                            <MapPin className="text-primary-500" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Route Details</h3>
                                            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Origin & Destination</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <InputGroup
                                            label="Pickup Location"
                                            icon={<MapPin size={20} />}
                                            value={formData.origin_city}
                                            onChange={(val) => setFormData({ ...formData, origin_city: val })}
                                            placeholder="e.g. Tashkent, UZ"
                                        />
                                        <InputGroup
                                            label="Delivery Location"
                                            icon={<MapPin size={20} />}
                                            value={formData.destination_city}
                                            onChange={(val) => setFormData({ ...formData, destination_city: val })}
                                            placeholder="e.g. Samarkand, UZ"
                                        />
                                    </div>

                                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-[28px] border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">
                                            <Info size={14} className="mr-2" />
                                            Map Preview
                                        </div>
                                        <div className="h-64 bg-gray-200 dark:bg-[#020617] rounded-2xl flex items-center justify-center overflow-hidden relative">
                                            <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/40,40,1/1000x400?access_token=pk.placeholder')] bg-cover" />
                                            <div className="relative z-10 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                                <span className="text-xs font-black text-white uppercase tracking-widest">Interactive Map Ready</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={!formData.origin_city || !formData.destination_city}
                                        className="w-full py-6 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-[24px] shadow-2xl shadow-primary-600/30 transition-all flex items-center justify-center group disabled:opacity-50"
                                    >
                                        Equipment & Timing
                                        <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={22} />
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                                            <Truck className="text-primary-500" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Shipment Specs</h3>
                                            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Equipment & Schedule</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <InputGroup
                                            label="Equipment Type"
                                            icon={<Truck size={20} />}
                                            value={formData.equipment_code}
                                            onChange={(val) => setFormData({ ...formData, equipment_code: val })}
                                            placeholder="VAN, FLATBED, REEFER"
                                        />
                                        <InputGroup
                                            label="Commodity"
                                            icon={<Package size={20} />}
                                            value={formData.commodity_description}
                                            onChange={(val) => setFormData({ ...formData, commodity_description: val })}
                                            placeholder="General Merchandise"
                                        />
                                        <div className="space-y-3 group">
                                            <DatePicker
                                                label="Pickup Window"
                                                selected={formData.pickup_earliest ? new Date(formData.pickup_earliest) : null}
                                                onChange={(date: Date | null) => setFormData({ ...formData, pickup_earliest: date ? date.toISOString() : '' })}
                                                placeholderText="Select pickup time"
                                                minDate={new Date()}
                                                showTimeSelect
                                                dateFormat="Pp"
                                                className="w-full pl-4 pr-6 py-5 bg-gray-50 dark:bg-gray-800/40 border-2 border-transparent rounded-[24px] outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-bold text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-3 group">
                                            <DatePicker
                                                label="Delivery Goal"
                                                selected={formData.delivery_earliest ? new Date(formData.delivery_earliest) : null}
                                                onChange={(date: Date | null) => setFormData({ ...formData, delivery_earliest: date ? date.toISOString() : '' })}
                                                placeholderText="Select delivery time"
                                                minDate={formData.pickup_earliest ? new Date(formData.pickup_earliest) : new Date()}
                                                showTimeSelect
                                                dateFormat="Pp"
                                                className="w-full pl-4 pr-6 py-5 bg-gray-50 dark:bg-gray-800/40 border-2 border-transparent rounded-[24px] outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-bold text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleBack}
                                            className="flex-1 py-6 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black rounded-[24px] flex items-center justify-center group"
                                        >
                                            <ChevronLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={22} />
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="flex-[2] py-6 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-[24px] shadow-2xl shadow-primary-600/30 transition-all flex items-center justify-center group"
                                        >
                                            Rate & Publication
                                            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={22} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mb-6">
                                            <DollarSign className="text-emerald-500" size={48} />
                                        </div>
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Publication Rate</h3>
                                        <p className="text-gray-500 font-bold mt-2">Set your target offer for the carrier network.</p>
                                    </div>

                                    <div className="max-w-xs mx-auto">
                                        <div className="relative">
                                            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-5xl font-black text-gray-400">$</span>
                                            <input
                                                type="number"
                                                value={formData.quoted_rate_amount}
                                                onChange={(e) => setFormData({ ...formData, quoted_rate_amount: Number(e.target.value) })}
                                                className="w-full bg-gray-50 dark:bg-gray-800/50 border-4 border-emerald-500/20 rounded-[40px] py-10 px-16 text-6xl font-black tracking-tighter text-center focus:border-emerald-500 outline-none transition-all dark:text-white tabular-nums"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-emerald-500/5 p-6 rounded-[32px] border border-emerald-500/20">
                                        <p className="text-center text-emerald-600 font-black text-sm uppercase tracking-widest">Rate Recommended by Intelligence Platform</p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleBack}
                                            className="flex-1 py-6 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black rounded-[24px] flex items-center justify-center group"
                                        >
                                            <ChevronLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={22} />
                                            Back
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="flex-[2] py-6 premium-gradient text-white font-black rounded-[24px] shadow-2xl shadow-primary-600/50 transition-all flex items-center justify-center"
                                        >
                                            <CheckCircle2 className="mr-3" size={22} />
                                            Launch Publication
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

function InputGroup({ label, icon, value, onChange, placeholder, type = "text" }: any) {
    return (
        <div className="space-y-3 group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary-500 transition-colors">{label}</label>
            <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    {icon}
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 dark:bg-gray-800/40 border-2 border-transparent rounded-[24px] outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-bold text-gray-900 dark:text-white"
                />
            </div>
        </div>
    );
}
