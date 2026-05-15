'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

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

export default function RankingPage() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ranking');
      setRanking(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="page-wrapper">
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ fontFamily: 'Orbitron', color: 'var(--purple-glow)' }}>Cargando Ranking...</p>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Particles />
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="logo-shield" style={{ width: '100px', height: '115px' }}>
            <div className="shield-bg" />
            <div className="shield-inner">
              <span style={{ fontSize: '1.8rem' }}>🏆</span>
              <span className="shield-sub" style={{ fontSize: '0.6rem' }}>RANKING</span>
            </div>
          </div>
          <h1 className="hero-title">— Global Ranking —</h1>
          <p className="hero-subtitle">Tabla de Posiciones Oficial por Goles y Victorias</p>
        </div>

        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>Pos</th>
                  <th>Jugador</th>
                  <th style={{ textAlign: 'center' }}>PJ</th>
                  <th style={{ textAlign: 'center', color: 'var(--gold)' }}>PG</th>
                  <th style={{ textAlign: 'center' }}>GF</th>
                  <th style={{ textAlign: 'center' }}>GC</th>
                  <th style={{ textAlign: 'center' }}>DIF</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((player, idx) => (
                  <tr key={player.id} style={{ transition: 'background 0.2s' }}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: idx < 3 ? 'var(--gold)' : 'var(--text-muted)' }}>
                      {idx + 1} {idx === 0 ? '👑' : ''}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <Link href={`/player/${player.id}`} style={{ color: 'var(--white)', textDecoration: 'none' }}>
                        {player.fullName}
                      </Link>
                    </td>
                    <td style={{ textAlign: 'center' }}>{player.matchesPlayed}</td>
                    <td style={{ textAlign: 'center', color: 'var(--gold)', fontWeight: 'bold' }}>{player.wins}</td>
                    <td style={{ textAlign: 'center', color: '#00e676' }}>{player.goalsFor}</td>
                    <td style={{ textAlign: 'center', color: '#ff4060' }}>{player.goalsAgainst}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: player.goalDifference > 0 ? '#00e676' : (player.goalDifference < 0 ? '#ff4060' : 'var(--text-muted)') }}>
                      {player.goalDifference > 0 ? '+' : ''}{player.goalDifference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
