'use client';

import { useState, useEffect, useMemo } from 'react';

function Sparkles() {
  const items = useMemo(() => Array.from({ length: 40 }, (_, i) => {
    const types = ['dot', 'glow', 'star'];
    return { id: i, type: types[i % 3], left: Math.random() * 100, delay: Math.random() * 10, duration: 7 + Math.random() * 10 };
  }), []);
  return (
    <div className="sparkles">
      {items.map(s => (
        <span key={s.id} className={s.type} style={{ left: `${s.left}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }} />
      ))}
    </div>
  );
}

function FloatingElements() {
  const els = [
    { emoji: '⚽', top: '8%', left: '5%', delay: '0s', size: '2.5rem' },
    { emoji: '⚽', top: '75%', left: '3%', delay: '4s', size: '2rem' },
    { emoji: '🎮', top: '15%', right: '4%', delay: '2s', size: '2rem' },
    { emoji: '⚽', top: '60%', right: '6%', delay: '6s', size: '1.8rem' },
    { emoji: '🎮', top: '85%', right: '10%', delay: '3s', size: '1.5rem' },
  ];
  return (
    <div className="floating-elements">
      {els.map((el, i) => (
        <div key={i} className="floating-el" style={{ top: el.top, left: el.left, right: (el as any).right, animationDelay: el.delay, fontSize: el.size }}>{el.emoji}</div>
      ))}
    </div>
  );
}

function ShieldLogo() {
  return (
    <div className="shield-logo">
      <div className="outer" />
      <div className="inner">
        <span className="ball">⚽</span>
        <span className="controller">🎮</span>
        <span className="label-gaming">GAMING</span>
        <span className="label-cup">CUP</span>
        <div className="sponsors">
          <span>DAVIVIENDA</span>
          <span className="divider" />
          <span>TIGO SPORTS</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState({ total: 0, remaining: 128 });
  const [form, setForm] = useState({
    fullName: '', tariff: '', birthDate: '', phone: '', email: '',
    isDaviviendaClient: false, isTigoClient: false, isMinor: false,
    guardianName: '', guardianPhone: '', guardianDui: '',
    acceptedTerms: false,
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: false });

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try { const r = await fetch('/api/stats'); setStats(await r.json()); } catch (e) { console.error(e); }
  };

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: false });
    if (!form.tariff) { setStatus({ loading: false, error: 'Selecciona tu tarifa.', success: false }); return; }
    try {
      const res = await fetch('/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus({ loading: false, error: '', success: true });
      fetchStats();
    } catch (e: any) {
      setStatus({ loading: false, error: e.message, success: false });
    }
  };

  if (status.success) {
    return (
      <div className="page-wrapper">
        <Sparkles /><FloatingElements />
        <div className="neon-line neon-line-left" /><div className="neon-line neon-line-right" />
        <div className="success-screen">
          <div className="form-card success-card" style={{ textAlign: 'center' }}>
            <div className="success-icon">🏆</div>
            <ShieldLogo />
            <h1 className="hero-heading" style={{ fontSize: '1.6rem' }}>¡Inscripción Exitosa!</h1>
            <p className="hero-desc">Tu lugar en la Gaming Cup está asegurado.</p>
            <div className="alert alert-success">✅ Pronto anunciaremos las llaves del torneo.</div>
            <a href="/bracket" className="btn-submit" style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>Ver Llaves del Torneo</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Sparkles /><FloatingElements />
      <div className="neon-line neon-line-left" /><div className="neon-line neon-line-right" />
      <div className="container-centered">
        <ShieldLogo />
        <h1 className="hero-heading">Inscríbete al Torneo</h1>
        <p className="hero-desc">Registrate y asegura tu lugar en la Gaming Cup. Llena el formulario para inscribirte y participar en el torneo.</p>
        <button className="btn-gold-outline" type="button">Ver Detalles del Torneo</button>

        <div className="form-card">
          <h2 className="form-section-title">Datos de Registro</h2>
          {status.error && <div className="alert alert-error">⚠️ {status.error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <span className="label">Nombre Completo</span>
              <input type="text" name="fullName" className="input-field" required placeholder="Ingresa tu nombre completo" value={form.fullName} onChange={handleText} />
            </div>

            <div className="form-group">
              <span className="label">Selecciona tu tarifa</span>
              <div className="tariff-row">
                <label className="tariff-option">
                  <input type="radio" name="tariff" value="general" checked={form.tariff === 'general'} onChange={handleText} />
                  <div className="tariff-label">Tarifa General</div>
                  <div className="tariff-price">$50</div>
                  <span className="check-icon">✓</span>
                </label>
                <label className="tariff-option">
                  <input type="radio" name="tariff" value="client" checked={form.tariff === 'client'} onChange={handleText} />
                  <div className="tariff-label">Tarifa Clientes<br />Davivienda/Tigo</div>
                  <div className="tariff-price">$40</div>
                  <div className="tariff-discount">20% Descuento</div>
                  <span className="check-icon">✓</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <span className="label">Fecha de Nacimiento</span>
              <input type="date" name="birthDate" className="input-field" required value={form.birthDate} onChange={handleText} />
            </div>

            <div className="form-group">
              <span className="label">Teléfono</span>
              <input type="tel" name="phone" className="input-field" required placeholder="Ej: 7000-0000" value={form.phone} onChange={handleText} />
            </div>

            <div className="form-group">
              <span className="label">Correo Electrónico</span>
              <input type="email" name="email" className="input-field" required placeholder="tucorreo@email.com" value={form.email} onChange={handleText} />
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="isDaviviendaClient" checked={form.isDaviviendaClient} onChange={handleCheck} />
                Soy cliente de <strong>Davivienda</strong>
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="isTigoClient" checked={form.isTigoClient} onChange={handleCheck} />
                Soy cliente de <strong>Tigo</strong>
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="isMinor" checked={form.isMinor} onChange={handleCheck} />
                Soy <strong>menor de edad</strong>
              </label>
            </div>

            {form.isMinor && (
              <div className="guardian-section">
                <h3 className="guardian-title">👤 Datos del Padre / Madre / Encargado</h3>
                <div className="form-group">
                  <span className="label">Nombre completo del encargado</span>
                  <input type="text" name="guardianName" className="input-field" required placeholder="Nombre del padre, madre o encargado" value={form.guardianName} onChange={handleText} />
                </div>
                <div className="form-group">
                  <span className="label">Teléfono del encargado</span>
                  <input type="tel" name="guardianPhone" className="input-field" required placeholder="Ej: 7000-0000" value={form.guardianPhone} onChange={handleText} />
                </div>
                <div className="form-group">
                  <span className="label">DUI del encargado</span>
                  <input type="text" name="guardianDui" className="input-field" required placeholder="Ej: 00000000-0" value={form.guardianDui} onChange={handleText} />
                </div>
              </div>
            )}

            <div className="checkbox-group" style={{ marginTop: '0.5rem' }}>
              <label className="checkbox-label">
                <input type="checkbox" name="acceptedTerms" checked={form.acceptedTerms} onChange={handleCheck} />
                Acepto los <strong>términos y condiciones</strong> del torneo.
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={status.loading}>
              {status.loading ? '⏳ Registrando...' : 'INSCRIBIRME AHORA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
