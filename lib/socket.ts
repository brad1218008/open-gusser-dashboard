'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        socket = io({
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });
    }
    return socket;
}

export function useSocket(competitionId?: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

    useEffect(() => {
        const s = getSocket();
        setSocketInstance(s);

        function onConnect() {
            setIsConnected(true);
            console.log('Socket connected');
        }

        function onDisconnect() {
            setIsConnected(false);
            console.log('Socket disconnected');
        }

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);

        // Join competition room if competitionId is provided
        if (competitionId) {
            s.emit('join-competition', competitionId);
        }

        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);

            // Leave competition room on cleanup
            if (competitionId) {
                s.emit('leave-competition', competitionId);
            }
        };
    }, [competitionId]);

    return { socket: socketInstance, isConnected };
}
