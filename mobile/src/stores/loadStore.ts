import { create } from 'zustand';
import api from '../services/api';

interface LoadState {
    loads: any[];
    myLoads: any[];
    isLoading: boolean;
    fetchLoads: (params?: any) => Promise<void>;
    fetchMyLoads: () => Promise<void>;
}

export const useLoadStore = create<LoadState>((set) => ({
    loads: [],
    myLoads: [],
    isLoading: false,
    fetchLoads: async (params = {}) => {
        set({ isLoading: true });
        try {
            const response = await api.get('/loads/search', { params });
            set({ loads: response.data.data });
        } catch (error) {
            console.error('Fetch Loads Error:', error);
        } finally {
            set({ isLoading: false });
        }
    },
    fetchMyLoads: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/invoices/my'); // Using invoices as proxy for history for now
            set({ myLoads: response.data.data });
        } catch (error) {
            console.error('Fetch My Loads Error:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));
