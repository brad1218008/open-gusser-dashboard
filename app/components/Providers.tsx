'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import ConnectionStatus from './ConnectionStatus';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            {children}
            <ConnectionStatus />
        </SessionProvider>
    );
}
