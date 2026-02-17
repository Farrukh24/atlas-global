import { create } from 'zustand';
import { storage } from '../services/storage';

interface AuthState {
    token: string | null;
    user: any | null;
    isAuthenticated: boolean;
    setAuth: (token: string, user: any) => void;
    logout: () => void;
    hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    setAuth: async (token, user) => {
        await storage.set('token', token);
        await storage.set('user', user);
        set({ token, user, isAuthenticated: true });
    },
    logout: async () => {
        await storage.remove('token');
        await storage.remove('user');
        set({ token: null, user: null, isAuthenticated: false });
    },
    hydrate: async () => {
        const token = await storage.get('token');
        const user = await storage.get('user');
        if (token && user) {
            set({ token, user, isAuthenticated: true });
        }
    },
}));
