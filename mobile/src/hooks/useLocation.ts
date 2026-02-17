import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import api from '../services/api';

export const useLocation = (activeLoadId?: number) => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);

            if (activeLoadId) {
                // Start watching position
                await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 30000, // 30 seconds
                        distanceInterval: 10,
                    },
                    async (newLoc) => {
                        setLocation(newLoc);
                        // Submit to backend
                        try {
                            await api.post(`/tracking/${activeLoadId}/position`, {
                                event_type: 'position_update',
                                latitude: newLoc.coords.latitude,
                                longitude: newLoc.coords.longitude,
                                speed_kph: newLoc.coords.speed ? newLoc.coords.speed * 3.6 : 0,
                                event_timestamp: new Date().toISOString()
                            });
                        } catch (e) {
                            console.error('Tracking Submission Error:', e);
                        }
                    }
                );
            }
        })();
    }, [activeLoadId]);

    return { location, errorMsg };
};
