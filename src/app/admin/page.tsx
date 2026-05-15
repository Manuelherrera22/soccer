'use client';

import { useState, useEffect } from 'react';

const ROUND_NAMES: Record<number, string> = {
  1: 'Ronda de 64', 2: 'Ronda de 32', 3: 'Ronda de 16',
  4: 'Cuartos', 5: 'Semifinal', 6: 'Final', 7: 'Campeón'
};

export default function AdminDashboard() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [pRes, mRes] = await Promise.all([fetch('/api/admin/participants'), fetch('/api/bracket')]);
      setParticipants(await pRes.json());
      setMatches(await mRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!confirm('¿Generar las llaves con los jugadores actuales?')) return;
    const res = await fetch('/api/admin/generate', { method: 'POST' });
    const data = await res.json();
    alert(res.ok ? '✅ Llaves generadas' : data.error);
    fetchData();
  };

  const handleAdvance = async (matchId: number, winnerId: number, name: string) => {
    if (!confirm(`¿Declarar a "${name}" como ganador?`)) return;
    const res = await fetch('/api/admin/advance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, winnerId })
    });
    if (res.ok) fetchData(); else alert('Error al avanzar jugador');
  };

  const downloadCSV = () => {
    if (!participants.length) return;
    const headers = ['ID', 'Nombre', 'Tarifa', 'Fecha Nac.', 'Teléfono', 'Email', 'Cliente Davivienda', 'Cliente Tigo', 'Fecha Registro'];
    const rows = participants.map(p =>
      [p.id, `"${p.fullName}"`, p.tariff, p.birthDate, p.phone, p.email, p.isDaviviendaClient ? 'Sí' : 'No', p.isTigoClient ? 'Sí' : 'No', p.createdAt].join(',')
    );
    const blob = new Blob([`${headers.join(',')}\n${rows.join('\n')}`], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'participantes_gaming_cup.csv';
    a.click();
  };

  if (loading) return (
    <div className="page-wrapper">
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ fontFamily: 'Orbitron', color: 'var(--purple-glow)' }}>Cargando...</p>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="admin-bar">
          <h1 className="hero-title">⚙️ Panel de Administración</h1>
          <div className="actions">
            <button className="btn-outline" onClick={downloadCSV}>📥 Exportar CSV</button>
            <button className="btn-purple" onClick={handleGenerate}>🎲 Generar Llaves</button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 className="section-title">Participantes ({participants.length}/128)</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Nombre</th><th>Tarifa</th><th>Teléfono</th><th>Email</th><th>Cliente</th>
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay participantes</td></tr>
                ) : participants.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{p.fullName}</td>
                    <td><span className={`badge ${p.tariff === 'client' ? 'badge-client' : 'badge-general'}`}>{p.tariff === 'client' ? '$40' : '$50'}</span></td>
                    <td>{p.phone}</td>
                    <td>{p.email}</td>
                    <td>
                      {p.isDaviviendaClient ? <span className="badge badge-dav" style={{ marginRight: 4 }}>DAV</span> : null}
                      {p.isTigoClient ? <span className="badge badge-tigo">TIGO</span> : null}
                      {!p.isDaviviendaClient && !p.isTigoClient && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Gestión de Llaves</h2>
          {matches.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No hay llaves generadas.</p>
          ) : (
            <div className="bracket-scroll">
              {[1, 2, 3, 4, 5, 6, 7].map(round => {
                const rm = matches.filter((m: any) => m.round === round);
                if (!rm.length) return null;
                return (
                  <div key={round} className="bracket-round">
                    <div className="round-label">{ROUND_NAMES[round]}</div>
                    {rm.map((m: any) => (
                      <div key={m.matchId} className="match-card">
                        <div className={`match-player ${!m.winnerId && m.p1Id ? 'clickable' : ''} ${m.winnerId === m.p1Id ? 'winner' : ''} ${m.winnerId && m.winnerId !== m.p1Id ? 'loser' : ''}`}
                          onClick={() => !m.winnerId && m.p1Id && m.p2Id && handleAdvance(m.matchId, m.p1Id, m.p1Name)}>
                          {m.p1Id ? <span>{m.p1Name}</span> : <span className="tbd">TBD</span>}
                          {m.winnerId === m.p1Id && <span>🏆</span>}
                        </div>
                        <div className="match-vs">VS</div>
                        <div className={`match-player ${!m.winnerId && m.p2Id ? 'clickable' : ''} ${m.winnerId === m.p2Id ? 'winner' : ''} ${m.winnerId && m.winnerId !== m.p2Id ? 'loser' : ''}`}
                          onClick={() => !m.winnerId && m.p1Id && m.p2Id && handleAdvance(m.matchId, m.p2Id, m.p2Name)}>
                          {m.p2Id ? <span>{m.p2Name}</span> : <span className="tbd">TBD</span>}
                          {m.winnerId === m.p2Id && <span>🏆</span>}
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
    </div>
  );
}
