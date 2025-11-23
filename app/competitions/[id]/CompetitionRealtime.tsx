'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/socket';

interface CompetitionRealtimeProps {
    competitionId: string;
}

export default function CompetitionRealtime({ competitionId }: CompetitionRealtimeProps) {
    const router = useRouter();
    const { socket, isConnected } = useSocket(competitionId);

    useEffect(() => {
        if (!socket) return;

        function onScoreUpdate(data: any) {
            console.log('Score update received:', data);
            // Refresh the page data
            router.refresh();
        }

        socket.on('score-update', onScoreUpdate);

        return () => {
            socket.off('score-update', onScoreUpdate);
        };
    }, [socket, router]);

    // Optional: Show connection status indicator
    if (process.env.NODE_ENV === 'development') {
        return (
            <div style={{
                position: 'fixed',
                bottom: '1rem',
                right: '1rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: isConnected ? '#10b981' : '#ef4444',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                zIndex: 1000
            }}>
                {isConnected ? '🟢 Live' : '🔴 Disconnected'}
            </div>
        );
    }

    return null;
}
