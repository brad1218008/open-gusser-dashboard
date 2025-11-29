'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/socket';

interface CompetitionRealtimeProps {
    competitionId: string;
}

export default function CompetitionRealtime({ competitionId }: CompetitionRealtimeProps) {
    const router = useRouter();
    const { socket, isConnected } = useSocket(competitionId, () => {
        // Refresh data when reconnected
        router.refresh();
    });

    useEffect(() => {
        if (!socket) return;

        function onScoreUpdate(data: any) {
            console.log('Score update received:', data);

            // Dispatch custom event for ConnectionStatus component
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('data:update'));
            }

            // Refresh the page data
            router.refresh();
        }

        socket.on('score-update', onScoreUpdate);

        return () => {
            socket.off('score-update', onScoreUpdate);
        };
    }, [socket, router]);


    // Connection status is now handled by the global ConnectionStatus component
    return null;
}
