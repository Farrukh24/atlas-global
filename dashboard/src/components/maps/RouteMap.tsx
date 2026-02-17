
import React, { useEffect, useState } from 'react';
// @ts-ignore
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default marker icon in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RouteMapProps {
    origin?: { lat: number; lng: number; name: string };
    destination?: { lat: number; lng: number; name: string };
    className?: string;
}

// Component to update view bounds based on markers
const BoundsUpdater = ({ origin, destination }: { origin?: { lat: number, lng: number }, destination?: { lat: number, lng: number } }) => {
    const map = useMap();

    useEffect(() => {
        if (!origin && !destination) return;

        const bounds = new L.LatLngBounds([]);
        if (origin && (origin.lat !== 0 || origin.lng !== 0)) bounds.extend([origin.lat, origin.lng]);
        if (destination && (destination.lat !== 0 || destination.lng !== 0)) bounds.extend([destination.lat, destination.lng]);

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [origin, destination, map]);

    return null;
};

const RouteMap: React.FC<RouteMapProps> = ({ origin, destination, className }) => {
    // Default to Almaty coordinates if nothing provided
    const defaultCenter = { lat: 43.2220, lng: 76.8512 };
    const isGoogleMode = !!import.meta.env.VITE_GOOGLE_MAPS_KEY && !!window.google;

    // Haversine distance calculation
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    const getEstimatedTime = () => {
        if (!origin || !destination) return "N/A";
        // Check for valid coordinates
        if (origin.lat === 0 && origin.lng === 0) return "Unknown";
        if (destination.lat === 0 && destination.lng === 0) return "Unknown";

        const dist = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
        const speed = 60; // Average truck speed km/h
        const timeHours = dist / speed;

        const days = Math.floor(timeHours / 24);
        const hours = Math.floor(timeHours % 24);

        if (days > 0) return `~${days}d ${hours}h`;
        return `~${hours}h`;
    };

    if (isGoogleMode) {
        return (
            <div className={`relative w-full h-full bg-gray-100 rounded-2xl overflow-hidden ${className}`}>
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold">
                    Google Map (Key Detected)
                </div>
            </div>
        );
    }

    // Leaflet Implementation
    // Use fallback coordinates if 0,0 provided (often happens with default props)
    const validOrigin = origin && (origin.lat !== 0 || origin.lng !== 0) ? origin : { lat: 43.2220, lng: 76.8512, name: 'Almaty' };
    const validDest = destination && (destination.lat !== 0 || destination.lng !== 0) ? destination : { lat: 41.0082, lng: 28.9784, name: 'Istanbul' };

    return (
        <div className={`relative w-full h-full rounded-2xl overflow-hidden ${className}`}>
            <MapContainer
                center={[defaultCenter.lat, defaultCenter.lng]}
                zoom={4}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <Marker position={[validOrigin.lat, validOrigin.lng]}>
                    <Popup>{validOrigin.name}</Popup>
                </Marker>

                <Marker position={[validDest.lat, validDest.lng]}>
                    <Popup>{validDest.name}</Popup>
                </Marker>

                <Polyline
                    positions={[
                        [validOrigin.lat, validOrigin.lng],
                        [validDest.lat, validDest.lng]
                    ]}
                    pathOptions={{ color: '#2563eb', weight: 4, dashArray: '10, 10', opacity: 0.7 }}
                />

                <BoundsUpdater origin={validOrigin} destination={validDest} />
            </MapContainer>

            {/* Overlay Info Card */}
            <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                    <Navigation size={14} className="text-blue-600" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Time</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{getEstimatedTime()}</p>
            </div>
        </div>
    );
};

export default RouteMap;
