import { create } from 'zustand';
import api from '@/services/api';

interface OfferState {
    offers: any[];
    isLoading: boolean;
    fetchOffers: (filters?: any) => Promise<void>;
    createOffer: (data: any) => Promise<any>;
}

export const useOfferStore = create<OfferState>((set) => ({
    offers: [],
    isLoading: false,
    fetchOffers: async (filters = {}) => {
        set({ isLoading: true });
        try {
            const response = await api.get('/offers', { params: filters });
            set({ offers: response.data.data });
        } catch (error) {
            console.error('Fetch Offers Error:', error);
        } finally {
            set({ isLoading: false });
        }
    },
    createOffer: async (data) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/offers', data);
            // Optimistically update offers list or refetch
            // For now, let's just return the data
            return response.data.data;
        } catch (error) {
            console.error('Create Offer Error:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    }
}));
