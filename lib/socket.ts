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

export function useSocket(competitionId?: string, onReconnect?: () => void) {
    const [isConnected, setIsConnected] = useState(false);
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

    useEffect(() => {
        const s = getSocket();
        setSocketInstance(s);

        function onConnect() {
            setIsConnected(true);
            console.log('Socket connected');

            // Dispatch custom event for ConnectionStatus component
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('socket:connect'));
            }

            // Rejoin competition room on reconnect
            if (competitionId) {
                s.emit('join-competition', competitionId);
                console.log('Rejoined competition room:', competitionId);
            }

            // Trigger reconnect callback to refresh data
            if (onReconnect) {
                console.log('Triggering data refresh after reconnection');
                onReconnect();
            }
        }

        function onDisconnect() {
            setIsConnected(false);
            console.log('Socket disconnected');

            // Dispatch custom event for ConnectionStatus component
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('socket:disconnect'));
            }
        }

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);

        // Join competition room if competitionId is provided and already connected
        if (competitionId && s.connected) {
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
    }, [competitionId, onReconnect]);

    return { socket: socketInstance, isConnected };
}
