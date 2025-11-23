import Link from 'next/link';
import { Plus, Trophy, Calendar, Users } from 'lucide-react';
import { prisma } from '@/lib/prisma';

async function getCompetitions() {
  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { players: true, rounds: true }
      }
    }
  });
  return competitions;
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  const competitions = await getCompetitions();

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="heading-1">Open Gusser</h1>
          <p style={{ color: '#94a3b8' }}>Professional Score Tracker</p>
        </div>
        <Link href="/competitions/new" className="btn btn-primary">
          <Plus size={20} />
          New Competition
        </Link>
      </header>

      <section>
        <h2 className="heading-2">Recent Competitions</h2>

        {competitions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Trophy size={48} style={{ color: '#334155', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No competitions yet</h3>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Start your first game to track scores.</p>
            <Link href="/competitions/new" className="btn btn-primary">
              Create Competition
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {competitions.map((comp) => (
              <Link href={`/competitions/${comp.id}`} key={comp.id} className="card" style={{ textDecoration: 'none', transition: 'transform 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{comp.name}</h3>
                  <span className={comp.status === 'ACTIVE' ? 'badge badge-active' : 'badge badge-completed'}>
                    {comp.status}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} />
                    {comp._count.players} Players
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={16} />
                    {comp._count.rounds} Rounds
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={14} />
                  {new Date(comp.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
