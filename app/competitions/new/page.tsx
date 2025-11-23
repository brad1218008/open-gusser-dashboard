'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';

export default function NewCompetitionPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [name, setName] = useState('');
    const [players, setPlayers] = useState<string[]>(['']);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addPlayerField = () => {
        setPlayers([...players, '']);
    };

    const removePlayerField = (index: number) => {
        const newPlayers = [...players];
        newPlayers.splice(index, 1);
        setPlayers(newPlayers);
    };

    const updatePlayerName = (index: number, value: string) => {
        const newPlayers = [...players];
        newPlayers[index] = value;
        setPlayers(newPlayers);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Filter out empty player names
        const validPlayers = players.filter(p => p.trim() !== '');

        if (!name.trim()) {
            alert('Please enter a competition name');
            setIsSubmitting(false);
            return;
        }

        if (validPlayers.length === 0) {
            alert('Please add at least one player');
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch('/api/competitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    playerNames: validPlayers,
                    userId: session?.user?.id
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create competition');
            }

            const data = await res.json();
            router.push(`/competitions/${data.id}`);
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Error creating competition');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <header style={{ marginBottom: '2rem' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>
                <h1 className="heading-1">New Competition</h1>
            </header>

            <form onSubmit={handleSubmit} className="card">
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Competition Name</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g., Weekly Pro League #42"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 500 }}>Players</label>
                        <button type="button" onClick={addPlayerField} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            <Plus size={14} />
                            Add Player
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {players.map((player, index) => (
                            <div key={index} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder={`Player ${index + 1}`}
                                    value={player}
                                    onChange={(e) => updatePlayerName(index, e.target.value)}
                                />
                                {players.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePlayerField(index)}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid var(--border)',
                                            color: 'var(--destructive)',
                                            borderRadius: '0.5rem',
                                            width: '42px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <Link href="/" className="btn btn-outline">Cancel</Link>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : (
                            <>
                                <Save size={18} />
                                Create Competition
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
