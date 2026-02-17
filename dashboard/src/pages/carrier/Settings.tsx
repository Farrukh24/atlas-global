
import { useState } from 'react';
import { User, Bell, Lock, Globe } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { useAuthStore } from '@/stores/authStore';

export default function CarrierSettings() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'preferences', label: 'Preferences', icon: Globe },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                Account <span className="text-emerald-600 italic">Settings</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <GlassCard className="p-4 h-fit lg:col-span-1">
                    <nav className="space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === tab.id
                                        ? 'bg-emerald-600 text-white'
                                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </GlassCard>

                {/* Content */}
                <GlassCard className="p-8 lg:col-span-3 min-h-[500px]">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black">Profile Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Legal Name</label>
                                    <input
                                        disabled
                                        value={user?.legal_name || 'Carrier Company LLC'}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-bold text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Email Address</label>
                                    <input
                                        disabled
                                        value={user?.email || 'email@example.com'}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-bold text-gray-500"
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                <p className="text-amber-800 dark:text-amber-400 font-bold text-sm">
                                    To update your company information, please contact Atlas Support directly as verification is required.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'profile' && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <Lock className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">Coming Soon</h3>
                            <p className="text-gray-500 max-w-sm mt-2">
                                We are currently building out advanced {activeTab} controls for carriers. Check back later!
                            </p>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
}
