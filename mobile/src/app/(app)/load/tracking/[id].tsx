import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTracking } from '../../../hooks/useTracking';
import { useLocation } from '../../../hooks/useLocation';
import { ArrowLeft, Navigation, Phone } from 'lucide-react-native';

export default function TrackingScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { latestPosition, isConnected } = useTracking(Number(id));
    const { location } = useLocation(Number(id));

    const currentCoords = location?.coords || { latitude: 0, longitude: 0 };

    return (
        <View className="flex-1 bg-background">
            <View className="absolute top-12 left-6 z-10 flex-row items-center space-x-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-surface/80 p-3 rounded-full border border-slate-700"
                >
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <View className="bg-surface/80 px-4 py-2 rounded-full border border-slate-700 flex-row items-center">
                    <View className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-accent' : 'bg-danger'}`} />
                    <Text className="text-white font-bold text-xs uppercase tracking-widest">
                        {isConnected ? 'LIVE TRACKING' : 'RECONNECTING...'}
                    </Text>
                </View>
            </View>

            <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: currentCoords.latitude || 41.2995,
                    longitude: currentCoords.longitude || 69.2401,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                customMapStyle={darkMapStyle}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        title="Your Position"
                    >
                        <View className="bg-primary p-2 rounded-full border-2 border-white shadow-xl">
                            <Navigation size={20} color="white" fill="white" />
                        </View>
                    </Marker>
                )}
            </MapView>

            <View className="absolute bottom-10 left-6 right-6 bg-surface p-6 rounded-[32px] border border-slate-700 shadow-2xl">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Active Shipment</Text>
                        <Text className="text-white text-xl font-bold">Load #{id}</Text>
                    </View>
                    <TouchableOpacity className="bg-slate-700/50 p-3 rounded-full">
                        <Phone size={24} color="#3B82F6" />
                    </TouchableOpacity>
                </View>

                <View className="bg-background rounded-2xl p-4 flex-row justify-between items-center mb-6">
                    <View className="items-center flex-1">
                        <Text className="text-slate-500 text-[10px] font-bold uppercase">Speed</Text>
                        <Text className="text-white font-bold text-lg">{Math.round(location?.coords?.speed || 0)} <Text className="text-xs font-medium text-slate-400">km/h</Text></Text>
                    </View>
                    <View className="w-[1px] h-8 bg-slate-800" />
                    <View className="items-center flex-1">
                        <Text className="text-slate-500 text-[10px] font-bold uppercase">Accuracy</Text>
                        <Text className="text-white font-bold text-lg">±{Math.round(location?.coords?.accuracy || 0)}m</Text>
                    </View>
                </View>

                <TouchableOpacity className="bg-accent h-16 rounded-2xl items-center justify-center">
                    <Text className="text-white font-bold text-lg">Update Status</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const darkMapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1e293b" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
    // ... more styles
];
