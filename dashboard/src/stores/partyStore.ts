import { create } from 'zustand';
import api from '@/services/api';

interface Party {
    id: number;
    type: string;
    legal_name: string;
    verification_status: string;
    account_status: string;
    created_at: string;
    usdot_number?: string;
    mc_number?: string;
    rating?: number; // Calculated or joined field if available
}

interface PartyState {
    parties: Party[];
    carriers: Party[]; // Dedicated list for carriers
    isLoading: boolean;
    error: string | null;
    fetchParties: (type?: string) => Promise<void>;
    updateMySettings: (data: any) => Promise<void>;
}

export const usePartyStore = create<PartyState>((set) => ({
    parties: [],
    carriers: [],
    isLoading: false,
    error: null,
    fetchParties: async (type?: string) => {
        set({ isLoading: true, error: null });
        try {
            const url = type ? `/parties?type=${type}` : '/parties';
            const response = await api.get(url);

            if (type === 'carrier') {
                set({ carriers: response.data.data, isLoading: false });
            } else {
                set({ parties: response.data.data, isLoading: false });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch parties',
                isLoading: false
            });
        }
    },
    updateMySettings: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
            await api.patch('/parties/settings', data);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to update settings',
                isLoading: false
            });
            throw error;
        }
    }
}));
