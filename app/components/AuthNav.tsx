'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Plus, LogIn, LogOut, User } from 'lucide-react';

export default function AuthNav() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return null;
    }

    if (session?.user) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <User size={16} />
                    <span>{session.user.name}</span>
                </div>
                <Link href="/competitions/new" className="btn btn-primary">
                    <Plus size={20} />
                    New Competition
                </Link>
                <button
                    onClick={() => signOut()}
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        );
    }

    return (
        <Link href="/login" className="btn btn-primary">
            <LogIn size={18} />
            Login
        </Link>
    );
}
