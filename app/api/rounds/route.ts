import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MapType } from '@prisma/client';

// POST /api/rounds - Create a new round
export async function POST(request: Request) {
    const body = await request.json();
    const { competitionId, mapName, roundNumber, mapType, gameCount, joinCode } = body;

    if (!competitionId || !roundNumber || !mapName || !mapType) {
        return NextResponse.json({ array: 'Missing fields' }, { status: 400 });
    }

    try {
        const round = await prisma.round.create({
            data: {
                competitionId,
                mapName,
                roundNumber: Number(roundNumber),
                gameCount: Number(gameCount || 1),
                mapType: mapType as MapType,
                joinCode
            }
        });

        return NextResponse.json(round);
    } catch (error) {
        console.error('Error creating round:', error);
        return NextResponse.json({ error: 'Failed to create round' }, { status: 500 });
    }


}
