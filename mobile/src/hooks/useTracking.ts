import { useEffect, useState } from 'react';
import { initSocket, getSocket } from '../services/socket';
import { useAuthStore } from '../stores/authStore';

export const useTracking = (loadId: number) => {
    const { token } = useAuthStore();
    const [latestPosition, setLatestPosition] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token || !loadId) return;

        const socket = initSocket(token);

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('join_load_tracking', loadId.toString());
        });

        socket.on('tracking_update', (event: any) => {
            if (event.load_id === loadId) {
                setLatestPosition(event);
            }
        });

        socket.on('disconnect', () => setIsConnected(false));

        return () => {
            socket.off('tracking_update');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [loadId, token]);

    return { latestPosition, isConnected };
};
