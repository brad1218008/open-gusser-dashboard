import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateScore } from '@/lib/scoring';

// POST /api/scores - Submit scores for a round
export async function POST(request: Request) {
    const body = await request.json();
    const { roundId, scores } = body;
    // scores is array of { playerId, inputTotalScore, isRejoin }

    if (!roundId || !scores || !Array.isArray(scores)) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const results = [];

    // Process each score submission
    for (const scoreData of scores) {
        const { playerId, inputTotalScore, isRejoin, gameIndex } = scoreData;

        // 1. Find the CompetitionPlayer ID
        // We need to look up the round -> competition -> competitionPlayer
        const round = await prisma.round.findUnique({
            where: { id: roundId },
            include: { competition: true }
        });

        if (!round) continue;

        const compPlayer = await prisma.competitionPlayer.findUnique({
            where: {
                competitionId_playerId: {
                    competitionId: round.competitionId,
                    playerId: playerId
                }
            }
        });

        if (!compPlayer) continue;

        // 2. Get previous score for calculation
        // If gameIndex > 1, find the score for gameIndex - 1
        let previousTotal = 0;

        if (gameIndex > 1) {
            const previousGameScore = await prisma.score.findFirst({
                where: {
                    competitionPlayerId: compPlayer.id,
                    roundId: roundId,
                    gameIndex: gameIndex - 1
                }
            });
            if (previousGameScore) {
                previousTotal = previousGameScore.inputTotalScore;
            }
        }

        // If Rejoin, the game score is just the inputTotalScore (since they started from 0 effectively for this leg? 
        // Wait, user said: "Rejoin 的話就是不用扣除前面總和的意思" -> "If Rejoin, do not deduct previous total".
        // So if Rejoin, Game Score = Input Total.
        // If NOT Rejoin, Game Score = Input Total - Previous Total.

        let calculatedGameScore = 0;
        if (isRejoin) {
            calculatedGameScore = inputTotalScore;
        } else {
            calculatedGameScore = inputTotalScore - previousTotal;
        }

        // 3. Create Score
        // Check if score for this gameIndex already exists? Ideally yes, update it. 
        // But for simplicity, let's assume we are creating new ones or replacing.
        // Let's use upsert or just create. Given the flow, simple create is risky if they double submit.
        // Let's try to find existing score for this gameIndex and update it, or create new.

        const existingScore = await prisma.score.findFirst({
            where: {
                competitionPlayerId: compPlayer.id,
                roundId: roundId,
                gameIndex: gameIndex
            }
        });

        if (existingScore) {
            const updatedScore = await prisma.score.update({
                where: { id: existingScore.id },
                data: {
                    inputTotalScore,
                    calculatedGameScore,
                    isRejoin: isRejoin || false,
                    entryTimestamp: new Date()
                }
            });
            results.push(updatedScore); // Pushing the updated score
        } else {
            const newScore = await prisma.score.create({
                data: {
                    roundId,
                    competitionPlayerId: compPlayer.id,
                    inputTotalScore,
                    gameIndex: gameIndex || 1, // Default to 1 if not provided
                    calculatedGameScore,
                    isRejoin: isRejoin || false
                }
            });
            results.push(newScore);
        }
    }

    // Broadcast score update via WebSocket
    if (global.io) {
        // Get the competition ID from the round
        const round = await prisma.round.findUnique({
            where: { id: roundId },
            select: { competitionId: true }
        });

        if (round) {
            global.io.to(`competition-${round.competitionId}`).emit('score-update', {
                competitionId: round.competitionId,
                roundId: roundId,
                timestamp: new Date().toISOString()
            });
        }
    }

    return NextResponse.json(results);
}
