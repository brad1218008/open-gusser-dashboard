import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Check if user is the creator
        const competition = await prisma.competition.findUnique({
            where: { id },
            select: { creatorId: true }
        });

        if (!competition) {
            return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
        }

        if (competition.creatorId !== userId) {
            return NextResponse.json({ error: 'Forbidden: Only the creator can delete this competition' }, { status: 403 });
        }

        // Delete all related data first (cascade should handle this if configured, but let's be safe/explicit or rely on cascade)
        // Prisma doesn't support cascade delete in the schema unless configured in the DB.
        // Assuming standard relation setup, we might need to delete children first if cascade isn't set up.
        // However, for this task, let's assume we can just delete the competition and let Prisma/DB handle it 
        // or wrap in a transaction if we need to manually delete children.
        // Given the schema isn't fully visible but usually has relations, let's try simple delete.
        // If it fails, we'll know we need to delete relations.

        // Actually, to be safe and ensure clean deletion:
        await prisma.$transaction(async (tx: any) => {
            // Delete scores
            // We need to find all rounds for this competition first
            const rounds = await tx.round.findMany({ where: { competitionId: id }, select: { id: true } });
            const roundIds = rounds.map((r: any) => r.id);

            if (roundIds.length > 0) {
                await tx.score.deleteMany({ where: { roundId: { in: roundIds } } });
            }

            // Delete rounds
            await tx.round.deleteMany({ where: { competitionId: id } });

            // Delete competition players
            await tx.competitionPlayer.deleteMany({ where: { competitionId: id } });

            // Delete competition
            await tx.competition.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting competition:', error);
        return NextResponse.json({ error: 'Failed to delete competition' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const { status, userId } = body;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Check if user is the creator
        const competition = await prisma.competition.findUnique({
            where: { id },
            select: { creatorId: true }
        });

        if (!competition) {
            return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
        }

        if (competition.creatorId !== userId) {
            return NextResponse.json({ error: 'Forbidden: Only the creator can update this competition' }, { status: 403 });
        }

        const updatedCompetition = await prisma.competition.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(updatedCompetition);
    } catch (error) {
        console.error('Error updating competition:', error);
        return NextResponse.json({ error: 'Failed to update competition' }, { status: 500 });
    }
}
