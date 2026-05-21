'use client';

import { useState, useEffect, useMemo } from 'react';
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import Link from 'next/link';

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="zoom-controls">
      <button className="zoom-btn" onClick={() => zoomIn()}>+</button>
      <button className="zoom-btn" onClick={() => zoomOut()}>-</button>
      <button className="zoom-btn" onClick={() => resetTransform()}>⟲</button>
    </div>
  );
};

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
  1: 'Ronda de 128', 2: 'Ronda de 64', 3: 'Ronda de 32',
  4: 'Octavos de Final', 5: 'Cuartos de Final', 6: 'Semifinales', 7: 'Campeón'
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
      <div className="container-full">
        {/* Sticky Header with Search */}
        <div className="bracket-header">
          <div className="header-left">
            <Link href="/" className="back-btn" title="Volver al inicio">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <Link href="/" className="shield-logo" style={{ width: '150px', cursor: 'pointer', display: 'block' }}>
              <img src="/Logo Final.png" alt="Elite Gaming Cup" />
            </Link>
          </div>
          <div className="search-container">
            <div className="header-title-box">
              <h1 className="hero-title" style={{ margin: 0, fontSize: '1.8rem' }}>— Partidos —</h1>
            </div>
            <input
              type="text" className="form-control bracket-search"
              placeholder="Busca a un jugador..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', maxWidth: '500px', margin: '4rem auto' }}>
            <h3 className="section-title" style={{ justifyContent: 'center' }}>Las llaves aún no han sido generadas</h3>
            <p style={{ color: 'var(--text-muted)' }}>Vuelve pronto para conocer los enfrentamientos.</p>
          </div>
        ) : (
          <TransformWrapper 
            initialScale={1} 
            minScale={0.1} 
            maxScale={2} 
            centerOnInit={true}
          >
            <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 150px)', overflow: 'hidden' }}>
              <Controls />
              <TransformComponent wrapperStyle={{ width: "100%", height: "100%", cursor: "grab" }} contentStyle={{ padding: "4rem" }}>
                <div className="bracket-scroll split-bracket">
                  {/* Left Side */}
                  {[1, 2, 3, 4, 5, 6].map((round) => {
                    const rm = matches.filter(m => m.round === round);
                    const half = Math.ceil(rm.length / 2);
                    const sideMatches = rm.slice(0, half);
                    if (!sideMatches.length) return null;
                    
                    return (
                      <div key={`left-${round}`} className="bracket-round left-round">
                        <div className="round-label">{ROUND_NAMES[round]}</div>
                        <div className="round-matches">
                          {sideMatches.map((m, index) => (
                            <div key={m.matchId} className={`match-wrapper ${index % 2 === 0 ? 'top-match' : 'bottom-match'}`}>
                              <div className={`match-card ${isHighlighted(m) ? 'highlighted' : ''}`}>
                                <div className={`match-player ${m.winnerId === m.p1Id ? 'winner' : ''}`}>
                                  <span className="player-name">{m.p1Id ? m.p1Name : <span className="tbd">Por definir</span>}</span>
                                  {m.winnerId && <span className="player-score">{m.player1Score}</span>}
                                </div>
                                <div className={`match-player ${m.winnerId === m.p2Id ? 'winner' : ''}`}>
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

                  {/* Center (Final) */}
                  <div className="bracket-round center-round">
                    <div className="round-label">👑 GRAN FINAL 👑</div>
                    <div className="round-matches" style={{ justifyContent: 'center' }}>
                      {matches.filter(m => m.round === 7).map(m => (
                        <div key={m.matchId} className="match-wrapper center-match">
                          <div className={`match-card final-card ${isHighlighted(m) ? 'highlighted' : ''}`}>
                            <div className={`match-player ${m.winnerId === m.p1Id ? 'winner' : ''}`}>
                              <span className="player-name">{m.p1Id ? m.p1Name : <span className="tbd">Finalista 1</span>}</span>
                              {m.winnerId && <span className="player-score">{m.player1Score}</span>}
                            </div>
                            <div className={`match-player ${m.winnerId === m.p2Id ? 'winner' : ''}`}>
                              <span className="player-name">{m.p2Id ? m.p2Name : <span className="tbd">Finalista 2</span>}</span>
                              {m.winnerId && <span className="player-score">{m.player2Score}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side */}
                  {[6, 5, 4, 3, 2, 1].map((round) => {
                    const rm = matches.filter(m => m.round === round);
                    const half = Math.ceil(rm.length / 2);
                    const sideMatches = rm.slice(half);
                    if (!sideMatches.length) return null;
                    
                    return (
                      <div key={`right-${round}`} className="bracket-round right-round">
                        <div className="round-label">{ROUND_NAMES[round]}</div>
                        <div className="round-matches">
                          {sideMatches.map((m, index) => (
                            <div key={m.matchId} className={`match-wrapper right-wrapper ${index % 2 === 0 ? 'top-match' : 'bottom-match'}`}>
                              <div className={`match-card ${isHighlighted(m) ? 'highlighted' : ''}`}>
                                <div className={`match-player ${m.winnerId === m.p1Id ? 'winner' : ''}`}>
                                  {m.winnerId && <span className="player-score score-left">{m.player1Score}</span>}
                                  <span className="player-name align-right">{m.p1Id ? m.p1Name : <span className="tbd">Por definir</span>}</span>
                                </div>
                                <div className={`match-player ${m.winnerId === m.p2Id ? 'winner' : ''}`}>
                                  {m.winnerId && <span className="player-score score-left">{m.player2Score}</span>}
                                  <span className="player-name align-right">{m.p2Id ? m.p2Name : <span className="tbd">Por definir</span>}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TransformComponent>
            </div>
          </TransformWrapper>
        )}
      </div>
    </div>
  );
}
