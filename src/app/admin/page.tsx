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

  // Score Modal State
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [score1, setScore1] = useState<number | ''>('');
  const [score2, setScore2] = useState<number | ''>('');
  const [selectedWinner, setSelectedWinner] = useState<number | ''>('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const baseUrl = window.location.protocol + '//' + window.location.host;
      const [pRes, mRes] = await Promise.all([fetch(`${baseUrl}/api/admin/participants`), fetch(`${baseUrl}/api/bracket`)]);
      setParticipants(await pRes.json());
      setMatches(await mRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!confirm('¿Generar las llaves con los jugadores actuales?')) return;
    const baseUrl = window.location.protocol + '//' + window.location.host;
    const res = await fetch(`${baseUrl}/api/admin/generate`, { method: 'POST' });
    const data = await res.json();
    alert(res.ok ? '✅ Llaves generadas' : data.error);
    fetchData();
  };

  const openScoreModal = (match: any) => {
    setActiveMatch(match);
    setScore1('');
    setScore2('');
    setSelectedWinner('');
  };

  const submitScore = async () => {
    if (score1 === '' || score2 === '' || selectedWinner === '') {
      alert('Debes llenar los goles y seleccionar al ganador.');
      return;
    }

    const baseUrl = window.location.protocol + '//' + window.location.host;
    const res = await fetch(`${baseUrl}/api/admin/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId: activeMatch.matchId,
        winnerId: Number(selectedWinner),
        player1Score: Number(score1),
        player2Score: Number(score2)
      })
    });

    if (res.ok) {
      setActiveMatch(null);
      fetchData();
    } else {
      alert('Error al registrar resultado');
    }
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
        <div className="admin-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', background: 'rgba(24, 24, 27, 0.6)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="shield-logo" style={{ width: '60px' }}>
              <img src="/Nuevo Logo_ELITE GAMING CUP_DAVIVIENDA Y TIGO.png" alt="Elite Gaming" />
            </div>
            <div>
              <h1 className="hero-title" style={{ margin: 0, fontSize: '1.5rem', textAlign: 'left' }}>Control Center</h1>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold)', letterSpacing: '1px' }}>ADMINISTRADOR</span>
            </div>
          </div>
          
          <div className="actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="btn-outline" onClick={downloadCSV} style={{ margin: 0, padding: '0.6rem 1rem' }}>📥 Exportar CSV</button>
            <button className="btn-purple" onClick={handleGenerate} style={{ margin: 0, padding: '0.6rem 1rem' }}>🎲 Generar Llaves</button>
            <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>
            <button className="btn-outline" onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }} style={{ margin: 0, padding: '0.6rem 1rem', borderColor: '#ff4444', color: '#ff4444' }}>Salir 🚪</button>
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
                      <div key={m.matchId} className="match-card" 
                           onClick={() => !m.winnerId && m.p1Id && m.p2Id && openScoreModal(m)}
                           style={{ cursor: (!m.winnerId && m.p1Id && m.p2Id) ? 'pointer' : 'default' }}>
                        <div className={`match-player ${m.winnerId === m.p1Id ? 'winner' : ''} ${m.winnerId && m.winnerId !== m.p1Id ? 'loser' : ''}`}>
                          {m.p1Id ? <span>{m.p1Name}</span> : <span className="tbd">TBD</span>}
                          {m.winnerId && <span style={{ fontWeight: 'bold' }}>{m.player1Score}</span>}
                          {m.winnerId === m.p1Id && <span>🏆</span>}
                        </div>
                        <div className="match-vs">VS</div>
                        <div className={`match-player ${m.winnerId === m.p2Id ? 'winner' : ''} ${m.winnerId && m.winnerId !== m.p2Id ? 'loser' : ''}`}>
                          {m.p2Id ? <span>{m.p2Name}</span> : <span className="tbd">TBD</span>}
                          {m.winnerId && <span style={{ fontWeight: 'bold' }}>{m.player2Score}</span>}
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

      {activeMatch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
            <h3 style={{ fontFamily: 'Orbitron', marginBottom: '1.5rem', textAlign: 'center' }}>Registrar Resultado</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600, width: '40%' }}>{activeMatch.p1Name}</span>
              <input type="number" min="0" value={score1} onChange={e => setScore1(e.target.value ? Number(e.target.value) : '')} className="input-field" style={{ width: '60px', textAlign: 'center' }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 600, width: '40%' }}>{activeMatch.p2Name}</span>
              <input type="number" min="0" value={score2} onChange={e => setScore2(e.target.value ? Number(e.target.value) : '')} className="input-field" style={{ width: '60px', textAlign: 'center' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>¿Quién avanzó a la siguiente ronda?</label>
              <select value={selectedWinner} onChange={e => setSelectedWinner(e.target.value ? Number(e.target.value) : '')} className="input-field">
                <option value="">-- Seleccionar Ganador --</option>
                <option value={activeMatch.p1Id}>{activeMatch.p1Name}</option>
                <option value={activeMatch.p2Id}>{activeMatch.p2Name}</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setActiveMatch(null)}>Cancelar</button>
              <button className="btn-purple" style={{ flex: 1 }} onClick={submitScore}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
