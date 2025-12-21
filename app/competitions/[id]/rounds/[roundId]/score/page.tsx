import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ScoreForm from './ScoreForm';

async function getData(competitionId: string, roundId: string, gameIndex: number) {
    // 1. Fetch Round
    const round = await prisma.round.findUnique({
        where: { id: roundId },
        include: { competition: true }
    });

    if (!round || round.competitionId !== competitionId) return null;

    // 2. Fetch All Players in Competition
    const compPlayers = await prisma.competitionPlayer.findMany({
        where: { competitionId },
        include: { player: true }
    });

    // 3. Fetch Existing Scores for this Round and Game
    const currentGameScores = await prisma.score.findMany({
        where: {
            roundId,
            gameIndex
        }
    });

    // 4. Fetch Previous Scores (GameIndex - 1)
    let previousScores: any[] = [];
    if (gameIndex > 1) {
        previousScores = await prisma.score.findMany({
            where: {
                roundId,
                gameIndex: gameIndex - 1
            }
        });
    }

    const playersData = compPlayers.map((cp) => {
        // Find existing score for this game
        const currentScore = currentGameScores.find(s => s.competitionPlayerId === cp.id);

        // Find previous score
        const prevScore = previousScores.find(s => s.competitionPlayerId === cp.id);
        const previousTotal = prevScore ? prevScore.inputTotalScore : 0;

        return {
            competitionPlayerId: cp.id,
            rawPlayerId: cp.player.id, // Needed for API
            name: cp.player.name,
            currentTotal: previousTotal,
            lastInputScore: currentScore ? currentScore.inputTotalScore : null,
            isRejoin: currentScore ? currentScore.isRejoin : false
        };
    });

    return { round, playersData };
}

export default async function ScorePage({
    params,
    searchParams
}: {
    params: Promise<{ id: string; roundId: string }>;
    searchParams: Promise<{ game?: string }>;
}) {
    const { id, roundId } = await params;
    const { game } = await searchParams;
    const gameIndex = game ? parseInt(game) : 1;

    const data = await getData(id, roundId, gameIndex);

    if (!data) {
        notFound();
    }

    return (
        <ScoreForm
            key={`${roundId}-${gameIndex}`}
            competitionId={id}
            roundId={roundId}
            roundNumber={data.round.roundNumber}
            mapName={data.round.mapName}
            gameCount={data.round.gameCount}
            players={data.playersData}
        />
    );
}
