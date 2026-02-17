import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

let socket: Socket;

export const initSocket = (token: string) => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
        auth: {
            token,
        },
        transports: ['websocket'],
    });

    socket.on('connect', () => {
        console.log('🔌 Connected to Tracking Server');
    });

    socket.on('disconnect', () => {
        console.log('🔌 Disconnected from Tracking Server');
    });

    return socket;
};

export const getSocket = () => {
    if (!socket) {
        throw new Error('Socket not initialized');
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        (socket as any) = null;
    }
};
