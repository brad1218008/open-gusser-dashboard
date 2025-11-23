import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/competitions - List all competitions
export async function GET() {
    const competitions = await prisma.competition.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { players: true, rounds: true }
            }
        }
    });
    return NextResponse.json(competitions);
}

// POST /api/competitions - Create a new competition
export async function POST(request: Request) {
    const body = await request.json();
    const { name, playerNames } = body; // playerNames is an array of strings

    if (!name || !playerNames || !Array.isArray(playerNames)) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Transaction to create players (if not exist) and competition
    const result = await prisma.$transaction(async (tx: any) => {
        // 1. Create competition
        const competition = await tx.competition.create({
            data: { name }
        });

        // 2. Handle players
        for (const playerName of playerNames) {
            // Upsert player
            let player = await tx.player.findUnique({ where: { name: playerName } });
            if (!player) {
                player = await tx.player.create({ data: { name: playerName } });
            }

            // Link to competition
            await tx.competitionPlayer.create({
                data: {
                    competitionId: competition.id,
                    playerId: player.id
                }
            });
        }

        return competition;
    });

    return NextResponse.json(result);
}
