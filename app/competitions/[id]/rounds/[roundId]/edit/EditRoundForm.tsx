'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Round } from '@prisma/client';

interface EditRoundFormProps {
    competitionId: string;
    round: Round;
}

export default function EditRoundForm({ competitionId, round }: EditRoundFormProps) {
    const router = useRouter();
    const [mapName, setMapName] = useState(round.mapName);
    const [roundNumber, setRoundNumber] = useState(round.roundNumber);
    const [gameCount, setGameCount] = useState(round.gameCount);
    const [mapType, setMapType] = useState(round.mapType);
    const [joinCode, setJoinCode] = useState(round.joinCode || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/rounds/${round.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mapName,
                    roundNumber: Number(roundNumber),
                    gameCount: Number(gameCount),
                    mapType,
                    joinCode
                })
            });

            if (!res.ok) throw new Error('Failed to update round');

            const data = await res.json();
            router.push(`/competitions/${competitionId}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error updating round');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <header style={{ marginBottom: '2rem' }}>
                <Link href={`/competitions/${competitionId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    <ArrowLeft size={16} />
                    Back to Competition
                </Link>
                <h1 className="heading-1">Edit Round {round.roundNumber}</h1>
            </header>

            <form onSubmit={handleSubmit} className="card">
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Map Name</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g., A Balanced World"
                        value={mapName}
                        onChange={(e) => setMapName(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Join Code (Optional)</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g., A1B2C3"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Round #</label>
                        <input
                            type="number"
                            className="input"
                            value={roundNumber}
                            onChange={(e) => setRoundNumber(Number(e.target.value))}
                            min="1"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Games</label>
                        <input
                            type="number"
                            className="input"
                            value={gameCount}
                            onChange={(e) => setGameCount(Number(e.target.value))}
                            min="1"
                            max="10"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Map Type</label>
                        <select
                            className="input"
                            value={mapType}
                            onChange={(e) => setMapType(e.target.value as any)}
                        >
                            <option value="Moving">Moving</option>
                            <option value="NoMove">No Move</option>
                            <option value="NMPZ">NMPZ</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <Link href={`/competitions/${competitionId}`} className="btn btn-outline">Cancel</Link>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : (
                            <>
                                <Save size={18} />
                                Update Round
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
