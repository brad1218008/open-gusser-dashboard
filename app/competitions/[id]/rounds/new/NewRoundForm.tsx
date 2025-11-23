'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface NewRoundFormProps {
    competitionId: string;
    initialRoundNumber: number;
}

export default function NewRoundForm({ competitionId, initialRoundNumber }: NewRoundFormProps) {
    const router = useRouter();
    const [mapName, setMapName] = useState('');
    const [roundNumber, setRoundNumber] = useState(initialRoundNumber);
    const [gameCount, setGameCount] = useState(10); // Default to 10 games
    const [mapType, setMapType] = useState('Moving');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/rounds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    competitionId,
                    mapName,
                    roundNumber: Number(roundNumber),
                    gameCount: Number(gameCount),
                    mapType
                })
            });

            if (!res.ok) throw new Error('Failed to create round');

            const data = await res.json();
            // Redirect to competition page instead of score entry, as they need to choose a game first
            router.push(`/competitions/${competitionId}`);
        } catch (error) {
            console.error(error);
            alert('Error creating round');
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
                <h1 className="heading-1">Add New Round</h1>
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
                        autoFocus
                        required
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
                            onChange={(e) => setMapType(e.target.value)}
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
                        {isSubmitting ? 'Creating...' : (
                            <>
                                <Save size={18} />
                                Create Round
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
