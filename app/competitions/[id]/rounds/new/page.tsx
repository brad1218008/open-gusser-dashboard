import { prisma } from '@/lib/prisma';
import NewRoundForm from './NewRoundForm';
import { notFound } from 'next/navigation';

export default async function NewRoundPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const competition = await prisma.competition.findUnique({
        where: { id },
        include: {
            _count: {
                select: { rounds: true }
            }
        }
    });

    if (!competition) {
        notFound();
    }

    const nextRoundNumber = competition._count.rounds + 1;

    return <NewRoundForm competitionId={id} initialRoundNumber={nextRoundNumber} />;
}
