import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MapType } from '@prisma/client';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    const { mapName, mapType, gameCount, joinCode } = body;

    if (!mapName || !mapType || !gameCount) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    try {
        const round = await prisma.round.update({
            where: { id },
            data: {
                mapName,
                mapType: mapType as MapType,
                gameCount: Number(gameCount),
                joinCode
            }
        });

        return NextResponse.json(round);
    } catch (error) {
        console.error('Error updating round:', error);
        return NextResponse.json({ error: 'Failed to update round' }, { status: 500 });
    }
}
