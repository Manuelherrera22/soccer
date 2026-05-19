'use client';

import { useState, useEffect, useMemo } from 'react';

function Particles() {
  const [particles, setParticles] = useState<any[]>([]);
  useEffect(() => {
    setParticles(Array.from({ length: 25 }, (_, i) => ({
      id: i, left: Math.random() * 100, delay: Math.random() * 8,
      duration: 6 + Math.random() * 8, size: 2 + Math.random() * 3,
    })));
  }, []);
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
      const data = await res.json();
      if (Array.isArray(data)) {
        setMatches(data);
      } else {
        console.error('Expected array, got:', data);
      }
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
          <div className="shield-logo" style={{ width: '220px', margin: '0 auto 1rem' }}>
            <img src="/Nuevo Logo_ELITE GAMING CUP_DAVIVIENDA Y TIGO.png" alt="Elite Gaming Cup" />
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
            {[1, 2, 3, 4, 5, 6, 7].map((round, rIndex, arr) => {
              const rm = matches.filter(m => m.round === round);
              if (!rm.length) return null;
              return (
                <div key={round} className="bracket-round">
                  <div className="round-label">{ROUND_NAMES[round] || `Ronda ${round}`}</div>
                  <div className="round-matches">
                    {rm.map((m, index) => (
                      <div key={m.matchId} className={`match-wrapper ${index % 2 === 0 ? 'top-match' : 'bottom-match'}`}>
                        <div className={`match-card ${isHighlighted(m) ? 'highlighted' : ''}`}>
                          <div className={`match-player ${m.winnerId === m.p1Id ? 'winner' : ''} ${m.winnerId && m.winnerId !== m.p1Id ? 'loser' : ''}`}>
                            <span className="player-name">{m.p1Id ? m.p1Name : <span className="tbd">Por definir</span>}</span>
                            {m.winnerId && <span className="player-score">{m.player1Score}</span>}
                          </div>
                          <div className={`match-player ${m.winnerId === m.p2Id ? 'winner' : ''} ${m.winnerId && m.winnerId !== m.p2Id ? 'loser' : ''}`}>
                            <span className="player-name">{m.p2Id ? m.p2Name : <span className="tbd">Por definir</span>}</span>
                            {m.winnerId && <span className="player-score">{m.player2Score}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
