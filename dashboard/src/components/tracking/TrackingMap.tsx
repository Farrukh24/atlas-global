import { useState } from 'react';
import Map, { Marker, NavigationControl, FullscreenControl, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Truck, MapPin, Navigation } from 'lucide-react';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9obmRvZSIsImEiOiJjbGZ6ZzR6ZzAwMGR6M3BvNXN6ZzR6ZzAwIn0.XXXXX'; // PLACEHOLDER

interface TrackingMapProps {
    shipments: any[];
}

export default function TrackingMap({ shipments }: TrackingMapProps) {
    const [selectedTruck, setSelectedTruck] = useState<any>(null);

    const [viewState, setViewState] = useState({
        longitude: 69.2401,
        latitude: 41.2995,
        zoom: 12
    });

    return (
        <div className="w-full h-full rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
            >
                <FullscreenControl position="top-right" />
                <NavigationControl position="top-right" />

                {shipments.map((shipment) => (
                    <Marker
                        key={shipment.id}
                        longitude={shipment.lng}
                        latitude={shipment.lat}
                        anchor="bottom"
                        onClick={e => {
                            e.originalEvent.stopPropagation();
                            setSelectedTruck(shipment);
                        }}
                    >
                        <div className="bg-primary-600 p-2 rounded-full border-2 border-white shadow-xl cursor-pointer hover:scale-110 transition-transform">
                            <Navigation size={18} color="white" fill="white" className="rotate-45" />
                        </div>
                    </Marker>
                ))}

                {selectedTruck && (
                    <Popup
                        longitude={selectedTruck.lng}
                        latitude={selectedTruck.lat}
                        anchor="top"
                        onClose={() => setSelectedTruck(null)}
                        closeButton={false}
                        className="rounded-2xl overflow-hidden"
                    >
                        <div className="p-4 bg-slate-900 text-white min-w-[200px]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase text-primary-400">Shipment #{selectedTruck.id}</span>
                                <span className="text-[10px] font-black uppercase text-emerald-400">Moving</span>
                            </div>
                            <p className="text-sm font-bold mb-1">{selectedTruck.carrier}</p>
                            <div className="flex items-center text-xs text-slate-400">
                                <Truck size={12} className="mr-1" />
                                <span>ETA: 45 mins</span>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>

            {/* Floating UI Control */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                <div className="glass-panel p-4 rounded-2xl flex items-center space-x-6 pointer-events-auto border border-slate-700 shadow-2xl">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-white">Live Data Stream</span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-700" />
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                                <Truck size={12} color="#64748b" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
