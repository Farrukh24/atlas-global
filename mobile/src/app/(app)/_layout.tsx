import { Slot, useRouter } from 'expo-router';
import { useAuthStore } from '../../../stores/authStore';
import { useEffect } from 'react';

export default function AppLayout() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/(auth)/login');
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) return null;

    return <Slot />;
}
