import { create } from 'zustand';
import api from '@/services/api';

interface UserState {
    users: any[];
    isLoading: boolean;
    fetchUsers: () => Promise<void>;
    updateUserStatus: (id: number, status: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    users: [],
    isLoading: false,
    fetchUsers: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/parties');
            set({ users: response.data.data });
        } catch (error) {
            console.error('Fetch Users Error:', error);
        } finally {
            set({ isLoading: false });
        }
    },
    updateUserStatus: async (id, status) => {
        try {
            await api.patch(`/parties/${id}/status`, { status });
            set((state) => ({
                users: state.users.map((u) => (u.id === id ? { ...u, verification_status: status } : u))
            }));
        } catch (error) {
            console.error('Update User Error:', error);
            throw error;
        }
    }
}));
