import { create } from 'zustand';
import api from '@/services/api';

interface LoadState {
    loads: any[];
    isLoading: boolean;
    fetchLoads: (filters?: any) => Promise<void>;
    createLoad: (data: any) => Promise<any>;
    updateLoad: (id: number, data: any) => Promise<any>;
    deleteLoad: (id: number) => Promise<void>;
}

export const useLoadStore = create<LoadState>((set) => ({
    loads: [],
    isLoading: false,
    fetchLoads: async (filters = {}) => {
        set({ isLoading: true });
        try {
            const response = await api.get('/loads', { params: filters });
            set({ loads: response.data.data });
        } catch (error) {
            console.error('Fetch Loads Error:', error);
        } finally {
            set({ isLoading: false });
        }
    },
    createLoad: async (data) => {
        set({ isLoading: true });
        try {
            // First, create or find locations
            const originResponse = await api.post('/locations', {
                location_name: data.origin_city,
                city: data.origin_city,
                country_code: data.origin_country || 'KZ',
                latitude: 43.2220, // Default, will be updated later
                longitude: 76.8512
            });

            const destResponse = await api.post('/locations', {
                location_name: data.destination_city,
                city: data.destination_city,
                country_code: data.destination_country || 'TR',
                latitude: 41.0082,
                longitude: 28.9784
            });

            // Convert datetime strings to ISO format if needed
            const formatDatetime = (dateStr?: string) => {
                if (!dateStr) return undefined;
                const date = new Date(dateStr);
                return date.toISOString();
            };

            // Then create the load with location IDs (converted to numbers)
            const loadPayload = {
                ...data,
                origin_location_id: Number(originResponse.data.data.id),
                destination_location_id: Number(destResponse.data.data.id),
                pickup_earliest: formatDatetime(data.pickup_earliest),
                delivery_earliest: formatDatetime(data.delivery_earliest),
                pickup_latest: formatDatetime(data.pickup_latest),
                delivery_latest: formatDatetime(data.delivery_latest),
            };

            // Remove temporary fields
            delete loadPayload.origin_city;
            delete loadPayload.origin_country;
            delete loadPayload.destination_city;
            delete loadPayload.destination_country;

            const response = await api.post('/loads', loadPayload);

            // Refresh load list
            const loadListResponse = await api.get('/loads/search');
            set({ loads: loadListResponse.data.data, isLoading: false });

            return response.data.data;
        } catch (error: any) {
            set({ isLoading: false });
            throw error;
        }
    },
    updateLoad: async (id, data) => {
        set({ isLoading: true });
        try {
            // If city data is being updated, handle location updates
            let updatePayload = { ...data };

            if (data.origin_city || data.destination_city) {
                if (data.origin_city) {
                    const originResponse = await api.post('/locations', {
                        location_name: data.origin_city,
                        city: data.origin_city,
                        country_code: data.origin_country || 'KZ',
                        latitude: 43.2220,
                        longitude: 76.8512
                    });
                    updatePayload.origin_location_id = originResponse.data.data.id;
                    delete updatePayload.origin_city;
                    delete updatePayload.origin_country;
                }

                if (data.destination_city) {
                    const destResponse = await api.post('/locations', {
                        location_name: data.destination_city,
                        city: data.destination_city,
                        country_code: data.destination_country || 'TR',
                        latitude: 41.0082,
                        longitude: 28.9784
                    });
                    updatePayload.destination_location_id = destResponse.data.data.id;
                    delete updatePayload.destination_city;
                    delete updatePayload.destination_country;
                }
            }

            const response = await api.put(`/loads/${id}`, updatePayload);

            // Update local state
            set((state) => ({
                loads: state.loads.map(load => load.id === id ? response.data.data : load),
                isLoading: false
            }));

            return response.data.data;
        } catch (error: any) {
            set({ isLoading: false });
            throw error;
        }
    },
    deleteLoad: async (id) => {
        set({ isLoading: true });
        try {
            await api.delete(`/loads/${id}`);

            // Remove from local state
            set((state) => ({
                loads: state.loads.filter(load => load.id !== id),
                isLoading: false
            }));
        } catch (error: any) {
            set({ isLoading: false });
            throw error;
        }
    },
}));
