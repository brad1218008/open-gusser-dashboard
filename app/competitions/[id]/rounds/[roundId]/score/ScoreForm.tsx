'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface PlayerData {
    competitionPlayerId: string;
    rawPlayerId: string;
    name: string;
    currentTotal: number | null; // Previous total score
    lastInputScore: number | null; // Existing score for this round if editing
    isRejoin: boolean;
}

interface ScoreFormProps {
    competitionId: string;
    roundId: string;
    roundNumber: number;
    mapName: string;
    players: PlayerData[];
}

export default function ScoreForm({ competitionId, roundId, roundNumber, mapName, players }: ScoreFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameIndex = Number(searchParams.get('game') || 1);

    const [inputs, setInputs] = useState<Record<string, number | ''>>(() => {
        const initial: Record<string, number | ''> = {};
        players.forEach(p => {
            // Default to lastInputScore if exists (editing), otherwise default to currentTotal (previous total)
            initial[p.competitionPlayerId] = p.lastInputScore ?? (p.currentTotal ?? '');
        });
        return initial;
    });

    const [rejoins, setRejoins] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        players.forEach(p => {
            initial[p.competitionPlayerId] = p.isRejoin;
        });
        return initial;
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleScoreChange = (id: string, value: string) => {
        const num = value === '' ? '' : parseInt(value, 10);
        setInputs(prev => ({ ...prev, [id]: num }));
    };

    const toggleRejoin = (id: string) => {
        setRejoins(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleAllRejoins = () => {
        const allSelected = players.every(p => rejoins[p.competitionPlayerId]);
        const newState: Record<string, boolean> = {};
        players.forEach(p => {
            newState[p.competitionPlayerId] = !allSelected;
        });
        setRejoins(newState);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const scoresToSubmit = players.map(p => ({
            playerId: p.rawPlayerId,
            inputTotalScore: Number(inputs[p.competitionPlayerId] || 0),
            isRejoin: rejoins[p.competitionPlayerId] || false,
            gameIndex: gameIndex
        }));

        try {
            const res = await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roundId,
                    scores: scoresToSubmit
                })
            });

            if (!res.ok) throw new Error('Failed to submit scores');

            router.push(`/competitions/${competitionId}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error submitting scores');
            setIsSubmitting(false);
        }
    };

    const allRejoinsSelected = players.length > 0 && players.every(p => rejoins[p.competitionPlayerId]);

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <header style={{ marginBottom: '2rem' }}>
                <Link href={`/competitions/${competitionId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    <ArrowLeft size={16} />
                    Back to Competition
                </Link>
                <h1 className="heading-1">Round {roundNumber} - Game {gameIndex}</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>{mapName}</p>
            </header>

            <form onSubmit={handleSubmit} className="card">
                <div className="table-container" style={{ marginBottom: '2rem' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Previous Total</th>
                                <th>New Total Score</th>
                                <th style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <span>Rejoin?</span>
                                        <input
                                            type="checkbox"
                                            checked={allRejoinsSelected}
                                            onChange={toggleAllRejoins}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                            title="Select All"
                                        />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map(p => (
                                <tr key={p.competitionPlayerId}>
                                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                                    <td style={{ color: '#94a3b8' }}>
                                        {p.currentTotal !== null ? p.currentTotal.toLocaleString() : '-'}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="input"
                                            style={{ width: '120px' }}
                                            value={inputs[p.competitionPlayerId]}
                                            onChange={(e) => handleScoreChange(p.competitionPlayerId, e.target.value)}
                                            placeholder="Total Score"
                                            required
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={rejoins[p.competitionPlayerId] || false}
                                            onChange={() => toggleRejoin(p.competitionPlayerId)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Link href={`/competitions/${competitionId}`} className="btn btn-outline">Cancel</Link>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Save Scores
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
