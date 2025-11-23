import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plus, Map, ArrowLeft, Trophy } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import CompetitionActions from './CompetitionActions';

async function getCompetition(id: string) {
    const competition = await prisma.competition.findUnique({
        where: { id },
        include: {
            players: {
                include: { player: true }
            },
            rounds: {
                orderBy: { roundNumber: 'asc' },
                include: {
                    scores: true
                }
            }
        }
    });

    if (!competition) return null;
    return competition;
}

export const dynamic = 'force-dynamic';

export default async function CompetitionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const competition = await getCompetition(id);

    if (!competition) {
        notFound();
    }

    // Calculate Totals
    const playerTotals: Record<string, number> = {};
    competition.players.forEach((cp: any) => {
        playerTotals[cp.id] = 0;
    });

    competition.rounds.forEach((round: any) => {
        round.scores.forEach((score: any) => {
            if (score.calculatedGameScore !== null) {
                playerTotals[score.competitionPlayerId] = (playerTotals[score.competitionPlayerId] || 0) + score.calculatedGameScore;
            }
        });
    });

    // Sort players by total score
    const sortedPlayers = [...competition.players].sort((a: any, b: any) => {
        return (playerTotals[b.id] || 0) - (playerTotals[a.id] || 0);
    });

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="heading-1" style={{ marginBottom: '0.5rem' }}>{competition.name}</h1>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span className={competition.status === 'ACTIVE' ? 'badge badge-active' : 'badge badge-completed'}>
                                {competition.status}
                            </span>
                            <CompetitionActions id={competition.id} status={competition.status} />
                        </div>
                    </div>
                    {competition.status === 'ACTIVE' && (
                        <Link href={`/competitions/${competition.id}/rounds/new`} className="btn btn-primary">
                            <Plus size={20} />
                            Add Round
                        </Link>
                    )}
                </div>
            </header>

            <div className="grid-cols-2" style={{ alignItems: 'start' }}>
                {/* Leaderboard */}
                <section className="card">
                    <h2 className="heading-2" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Trophy className="text-yellow-500" />
                        Leaderboard
                    </h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th style={{ textAlign: 'right' }}>Total Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedPlayers.map((cp, index) => (
                                    <tr key={cp.id}>
                                        <td style={{ width: '80px' }}>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{cp.player.name}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem' }}>
                                            {playerTotals[cp.id]?.toLocaleString() || 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Rounds History */}
                <section>
                    <h2 className="heading-2" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Map />
                        Rounds
                    </h2>

                    {competition.rounds.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            <p>No rounds played yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {competition.rounds.map((round) => {
                                // Determine max game index with scores
                                let maxGameIndex = 0;
                                round.scores.forEach((s: any) => {
                                    if (s.gameIndex > maxGameIndex) maxGameIndex = s.gameIndex;
                                });

                                return (
                                    <div key={round.id} className="card" style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Round {round.roundNumber}: {round.mapName}</h3>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                                                    <span className="badge" style={{ backgroundColor: '#334155', color: '#fff' }}>
                                                        {round.mapType}
                                                    </span>
                                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                        {round.gameCount} Games
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Game Buttons */}
                                        {competition.status === 'ACTIVE' && (
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                                {/* Show Edit for the last entered game (if any) */}
                                                {maxGameIndex > 0 && (
                                                    <Link
                                                        href={`/competitions/${competition.id}/rounds/${round.id}/score?game=${maxGameIndex}`}
                                                        className="btn btn-outline"
                                                        style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem' }}
                                                    >
                                                        Edit Game {maxGameIndex}
                                                    </Link>
                                                )}

                                                {/* Show Enter for the next game (if within limit) */}
                                                {maxGameIndex < round.gameCount && (
                                                    <Link
                                                        href={`/competitions/${competition.id}/rounds/${round.id}/score?game=${maxGameIndex + 1}`}
                                                        className="btn btn-primary"
                                                        style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem' }}
                                                    >
                                                        Enter Game {maxGameIndex + 1}
                                                    </Link>
                                                )}
                                            </div>
                                        )}

                                        {/* Score Matrix */}
                                        {round.scores.length > 0 && (
                                            <div className="table-container" style={{ fontSize: '0.9rem' }}>
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Player</th>
                                                            {Array.from({ length: round.gameCount }).map((_, i) => (
                                                                <th key={i} style={{ textAlign: 'center' }}>G{i + 1}</th>
                                                            ))}
                                                            <th style={{ textAlign: 'right' }}>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {competition.players.map((cp: any) => {
                                                            const playerScores = round.scores.filter((s: any) => s.competitionPlayerId === cp.id);
                                                            const totalScore = playerScores.reduce((sum: number, s: any) => sum + (s.calculatedGameScore || 0), 0);

                                                            return (
                                                                <tr key={cp.id}>
                                                                    <td style={{ fontWeight: 500 }}>{cp.player.name}</td>
                                                                    {Array.from({ length: round.gameCount }).map((_, i) => {
                                                                        const gameIndex = i + 1;
                                                                        const score = playerScores.find((s: any) => s.gameIndex === gameIndex);
                                                                        return (
                                                                            <td key={gameIndex} style={{ textAlign: 'center' }}>
                                                                                {score ? (
                                                                                    <span style={{ color: score.isRejoin ? 'var(--warning)' : 'inherit' }}>
                                                                                        {score.calculatedGameScore?.toLocaleString() ?? '-'}
                                                                                        {score.isRejoin && '*'}
                                                                                    </span>
                                                                                ) : '-'}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                                                                        {totalScore.toLocaleString()}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
