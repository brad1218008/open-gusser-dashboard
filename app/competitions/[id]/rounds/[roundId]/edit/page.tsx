import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EditRoundForm from './EditRoundForm';

export default async function EditRoundPage({ params }: { params: Promise<{ id: string; roundId: string }> }) {
    const { id, roundId } = await params;

    const round = await prisma.round.findUnique({
        where: { id: roundId },
    });

    if (!round || round.competitionId !== id) {
        notFound();
    }

    return <EditRoundForm competitionId={id} round={round} />;
}
