'use client';

import { useState, useEffect, useMemo } from 'react';

function Particles() {
  const particles = useMemo(() => Array.from({ length: 25 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 8,
    duration: 6 + Math.random() * 8, size: 2 + Math.random() * 3,
  })), []);
  return (
    <div className="particles">
      {particles.map(p => (
        <span key={p.id} style={{ left: `${p.left}%`, width: p.size, height: p.size, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }} />
      ))}
    </div>
  );
}

const ROUND_NAMES: Record<number, string> = {
  1: 'Ronda de 64', 2: 'Ronda de 32', 3: 'Ronda de 16',
  4: 'Cuartos de Final', 5: 'Semifinales', 6: 'Final', 7: 'Campeón'
};

export default function BracketView() {
  const [matches, setMatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/bracket');
      setMatches(await res.json());
    } catch (e) { console.error(e); }
  };

  const isHighlighted = (m: any) => {
    if (!searchTerm) return false;
    const t = searchTerm.toLowerCase();
    const p1 = m.p1Name ? `${m.p1Name} ${m.p1LastName}`.toLowerCase() : '';
    const p2 = m.p2Name ? `${m.p2Name} ${m.p2LastName}`.toLowerCase() : '';
    return p1.includes(t) || p2.includes(t);
  };

  return (
    <div className="page-wrapper">
      <Particles />
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="logo-shield" style={{ width: '100px', height: '115px' }}>
            <div className="shield-bg" />
            <div className="shield-inner">
              <span style={{ fontSize: '1.8rem' }}>🎮</span>
              <span className="shield-sub" style={{ fontSize: '0.6rem' }}>GAMING CUP</span>
            </div>
          </div>
          <h1 className="hero-title">— Partidos —</h1>
          <p className="hero-subtitle">Sigue el progreso de la Elite Gaming Cup en vivo</p>
          <input
            type="text" className="form-control"
            placeholder="🔍 Busca a un jugador..."
            style={{ maxWidth: '400px', margin: '0 auto' }}
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {matches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h3 className="section-title" style={{ justifyContent: 'center' }}>Las llaves aún no han sido generadas</h3>
            <p style={{ color: 'var(--text-muted)' }}>Vuelve pronto para conocer los enfrentamientos.</p>
          </div>
        ) : (
          <div className="bracket-scroll">
            {[1, 2, 3, 4, 5, 6, 7].map(round => {
              const rm = matches.filter(m => m.round === round);
              if (!rm.length) return null;
              return (
                <div key={round} className="bracket-round">
                  <div className="round-label">{ROUND_NAMES[round] || `Ronda ${round}`}</div>
                  {rm.map(m => (
                    <div key={m.matchId} className={`match-card ${isHighlighted(m) ? 'highlighted' : ''}`}>
                      <div className={`match-player ${m.winnerId === m.p1Id ? 'winner' : ''} ${m.winnerId && m.winnerId !== m.p1Id ? 'loser' : ''}`}>
                        {m.p1Id ? <span>{m.p1Name} {m.p1LastName}</span> : <span className="tbd">Por definir</span>}
                      </div>
                      <div className="match-vs">VS</div>
                      <div className={`match-player ${m.winnerId === m.p2Id ? 'winner' : ''} ${m.winnerId && m.winnerId !== m.p2Id ? 'loser' : ''}`}>
                        {m.p2Id ? <span>{m.p2Name} {m.p2LastName}</span> : <span className="tbd">Por definir</span>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
