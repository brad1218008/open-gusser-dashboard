'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function ConnectionStatus() {
    const [isConnected, setIsConnected] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        // Listen for WebSocket connection events
        const handleOnline = () => setIsConnected(true);
        const handleOffline = () => setIsConnected(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Listen for custom WebSocket events from your socket connection
        const handleSocketConnect = () => {
            setIsConnected(true);
            setLastUpdate(new Date());
        };

        const handleSocketDisconnect = () => {
            setIsConnected(false);
        };

        const handleDataUpdate = () => {
            setLastUpdate(new Date());
        };

        // Add event listeners for socket events
        window.addEventListener('socket:connect', handleSocketConnect);
        window.addEventListener('socket:disconnect', handleSocketDisconnect);
        window.addEventListener('data:update', handleDataUpdate);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('socket:connect', handleSocketConnect);
            window.removeEventListener('socket:disconnect', handleSocketDisconnect);
            window.removeEventListener('data:update', handleDataUpdate);
        };
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '1rem',
                right: '1rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${isConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: '#e2e8f0',
                zIndex: 9999,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            }}
        >
            {isConnected ? (
                <Wifi
                    size={14}
                    style={{
                        color: '#22c55e',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                />
            ) : (
                <WifiOff
                    size={14}
                    style={{ color: '#ef4444' }}
                />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                <span style={{
                    color: isConnected ? '#22c55e' : '#ef4444',
                    fontWeight: 600,
                    fontSize: '0.7rem'
                }}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                {isConnected && (
                    <span style={{
                        color: '#94a3b8',
                        fontSize: '0.65rem'
                    }}>
                        Updated: {formatTime(lastUpdate)}
                    </span>
                )}
            </div>

            <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
        </div>
    );
}
