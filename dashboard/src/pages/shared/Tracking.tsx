import { useState } from 'react';
import TrackingMap from '@/components/tracking/TrackingMap';
import {
    Search,
    ChevronRight,
    MapPin,
    Clock,
    ShieldCheck,
    Filter
} from 'lucide-react';

const mockShipments = [
    { id: '1024', lat: 41.3110, lng: 69.2405, carrier: 'Central Express', status: 'moving' },
    { id: '1025', lat: 41.2950, lng: 69.2350, carrier: 'TransUz Logistics', status: 'idle' },
    { id: '1028', lat: 41.3050, lng: 69.2550, carrier: 'Silk Road Fast', status: 'moving' },
];

export default function Tracking() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <div className="h-[calc(100vh-160px)] flex gap-8 animate-in fade-in duration-700">
            {/* Sidebar List */}
            <div className="w-96 flex flex-col space-y-4">
                <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search trucks, loads..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {mockShipments.map(ship => (
                        <div
                            key={ship.id}
                            onClick={() => setSelectedId(ship.id)}
                            className={twMerge(
                                "p-5 glass-panel rounded-3xl border transition-all cursor-pointer group",
                                selectedId === ship.id
                                    ? "border-primary-500 bg-primary-500/5 shadow-lg"
                                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase text-primary-500 tracking-widest">Shipment #{ship.id}</span>
                                <div className={twMerge(
                                    "w-2 h-2 rounded-full",
                                    ship.status === 'moving' ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                                )} />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{ship.carrier}</h4>

                            <div className="space-y-3">
                                <div className="flex items-center text-xs text-slate-500 font-medium">
                                    <MapPin size={14} className="mr-2" />
                                    Route: Tashkent → Samarkand
                                </div>
                                <div className="flex items-center text-xs text-slate-500 font-medium">
                                    <Clock size={14} className="mr-2" />
                                    ETA: Today, 4:20 PM
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center text-[10px] font-bold text-primary-500 uppercase tracking-widest">
                                    View Detail
                                    <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                                <ShieldCheck size={16} className="text-emerald-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1">
                <TrackingMap shipments={mockShipments} />
            </div>
        </div>
    );
}

import { twMerge } from 'tailwind-merge';
