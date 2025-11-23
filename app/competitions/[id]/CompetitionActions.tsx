'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Trash2, CheckCircle } from 'lucide-react';

interface CompetitionActionsProps {
    id: string;
    status: string;
}

export default function CompetitionActions({ id, status }: CompetitionActionsProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isEnding, setIsEnding] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEndCompetition = async () => {
        if (!confirm('Are you sure you want to end this competition?')) return;

        setIsEnding(true);
        try {
            const res = await fetch(`/api/competitions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'COMPLETED',
                    userId: session?.user?.id
                })
            });

            if (!res.ok) throw new Error('Failed to end competition');

            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error ending competition');
        } finally {
            setIsEnding(false);
        }
    };

    const handleDeleteCompetition = async () => {
        if (!confirm('Are you sure you want to DELETE this competition? This action cannot be undone.')) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/competitions/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session?.user?.id })
            });

            if (!res.ok) throw new Error('Failed to delete competition');

            router.push('/');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error deleting competition');
            setIsDeleting(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            {status === 'ACTIVE' && (
                <button
                    onClick={handleEndCompetition}
                    className="btn btn-outline"
                    disabled={isEnding}
                    title="End Competition"
                >
                    <CheckCircle size={18} />
                    {isEnding ? 'Ending...' : 'End'}
                </button>
            )}
            <button
                onClick={handleDeleteCompetition}
                className="btn btn-outline"
                style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
                disabled={isDeleting}
                title="Delete Competition"
            >
                <Trash2 size={18} />
                {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
        </div>
    );
}
