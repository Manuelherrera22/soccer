'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ROUND_NAMES: Record<number, string> = {
  1: 'Ronda de 64', 2: 'Ronda de 32', 3: 'Ronda de 16',
  4: 'Cuartos de Final', 5: 'Semifinales', 6: 'Final', 7: 'Campeón'
};

export default function PlayerDashboard({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/player/${params.id}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="page-wrapper">
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ fontFamily: 'Orbitron', color: 'var(--purple-glow)' }}>Cargando perfil...</p>
      </div>
    </div>
  );

  if (!data || data.error) return (
    <div className="page-wrapper">
      <div className="container" style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h2 style={{ color: 'var(--error)' }}>Jugador no encontrado</h2>
        <Link href="/ranking" style={{ color: 'var(--purple-glow)', textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>Volver al Ranking</Link>
      </div>
    </div>
  );

  const { player, stats, history } = data;

  return (
    <div className="page-wrapper">
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-shield" style={{ width: '80px', height: '90px' }}>
            <div className="shield-bg" />
            <div className="shield-inner">
              <span style={{ fontSize: '1.5rem' }}>👤</span>
            </div>
          </div>
          <h1 className="hero-title" style={{ fontSize: '1.8rem', marginTop: '1rem' }}>{player.fullName}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Miembro desde {new Date(player.createdAt).toLocaleDateString()}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Partidos Jugados</div>
            <div style={{ fontSize: '2rem', fontFamily: 'Orbitron', fontWeight: 900, color: 'var(--white)' }}>{stats.matchesPlayed}</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Victorias</div>
            <div style={{ fontSize: '2rem', fontFamily: 'Orbitron', fontWeight: 900, color: 'var(--gold)' }}>{stats.wins}</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Diferencia Goles</div>
            <div style={{ fontSize: '2rem', fontFamily: 'Orbitron', fontWeight: 900, color: stats.goalDifference > 0 ? '#00e676' : (stats.goalDifference < 0 ? '#ff4060' : 'var(--white)') }}>
              {stats.goalDifference > 0 ? '+' : ''}{stats.goalDifference}
            </div>
          </div>
        </div>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="section-title">Historial de Partidos</h2>
          {history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>El jugador aún no ha disputado ningún partido.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ronda</th>
                    <th>Oponente</th>
                    <th style={{ textAlign: 'center' }}>Resultado</th>
                    <th style={{ textAlign: 'center' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((m: any) => (
                    <tr key={m.matchId}>
                      <td style={{ color: 'var(--purple-glow)', fontWeight: 600 }}>{ROUND_NAMES[m.round]}</td>
                      <td>
                        <Link href={`/player/${m.opponentId}`} style={{ color: 'var(--text-light)', textDecoration: 'none' }}>
                          {m.opponentName}
                        </Link>
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'Orbitron', fontWeight: 700 }}>
                        <span style={{ color: m.won ? '#00e676' : '#ff4060' }}>{m.playerScore}</span> - <span>{m.opponentScore}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {m.won ? (
                          <span className="badge badge-client" style={{ color: '#00e676', borderColor: '#00e676' }}>Victoria</span>
                        ) : (
                          <span className="badge badge-dav" style={{ color: '#ff4060', borderColor: '#ff4060' }}>Derrota</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
           <Link href="/ranking" className="btn-outline">Volver al Ranking</Link>
        </div>

      </div>
    </div>
  );
}
