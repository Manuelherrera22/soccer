'use client';

import { useState, useEffect, useMemo } from 'react';

function Sparkles() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    setItems(Array.from({ length: 40 }, (_, i) => {
      const types = ['dot', 'glow', 'star'];
      return { id: i, type: types[i % 3], left: Math.random() * 100, delay: Math.random() * 10, duration: 7 + Math.random() * 10 };
    }));
  }, []);
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
    { src: '/Balon 1.png', top: '8%', left: '5%', delay: '0s', size: '4rem' },
    { src: '/Balon 2.png', top: '75%', left: '3%', delay: '4s', size: '3.5rem' },
    { src: '/Elemento 1.png', top: '15%', right: '4%', delay: '2s', size: '3rem' },
    { src: '/Balon 1.png', top: '60%', right: '6%', delay: '6s', size: '3rem' },
    { src: '/Elemento 1.png', top: '85%', right: '10%', delay: '3s', size: '2.5rem' },
  ];
  return (
    <div className="floating-elements">
      {els.map((el, i) => (
        <div key={i} className="floating-el" style={{ top: el.top, left: el.left, right: (el as any).right, animationDelay: el.delay, width: el.size }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={el.src} alt="" style={{ width: '100%', height: 'auto', opacity: 0.8 }} />
        </div>
      ))}
    </div>
  );
}

function MainLogo() {
  return (
    <div className="shield-logo" style={{ width: '320px', marginBottom: '2rem' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/Logo Final.png" alt="Elite Gaming Cup - Davivienda & Tigo" />
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState({ total: 0, remaining: 128 });
  const [form, setForm] = useState({
    fullName: '', birthDate: '', phone: '', email: '', dui: '',
    isDaviviendaClient: false, isTigoClient: false, isMinor: false,
    guardianName: '', guardianPhone: '', guardianDui: '',
    acceptedTerms: false, acceptedImageRights: false, acceptedPrivacy: false,
  });
  const [sponsorError, setSponsorError] = useState(false);
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
    setSponsorError(false);
    setStatus({ loading: true, error: '', success: false });
    if (!form.isDaviviendaClient && !form.isTigoClient) {
      setSponsorError(true);
      setStatus({ loading: false, error: 'Debes seleccionar al menos Davivienda o Tigo.', success: false });
      return;
    }
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
            <MainLogo />
            <h1 className="hero-heading" style={{ fontSize: '1.6rem' }}>¡Casi listo!</h1>
            <p className="hero-desc">Para completar tu inscripción, debes validar tu correo electrónico.</p>
            <div className="alert alert-success">Te hemos enviado un enlace de confirmación a tu correo. Por favor revisa tu bandeja de entrada (o la carpeta de SPAM) y haz clic en el botón para finalizar el registro.</div>
            <a href="/" className="btn-submit" style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>Volver al inicio</a>
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
        <MainLogo />
        <h1 className="hero-heading">Inscríbete al Torneo</h1>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
          <div className="alert alert-success" style={{ margin: 0, padding: '0.5rem 1.5rem', background: 'rgba(0, 229, 255, 0.1)', borderColor: 'var(--cyan)', color: 'var(--cyan)', fontWeight: 'bold' }}>
            {stats.remaining > 0 ? `Quedan ${stats.remaining} cupos disponibles` : 'Cupos agotados (128/128)'}
          </div>
        </div>
        <p className="hero-desc">Registrate y asegura tu lugar en la Gaming Cup. Llena el formulario para inscribirte y participar en el torneo.</p>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <a href="/bracket" className="btn-gold-outline" style={{ margin: 0 }}>Ver Llaves</a>
          <a href="/ranking" className="btn-gold-outline" style={{ margin: 0, borderColor: 'var(--purple-glow)', color: 'var(--purple-glow)' }}>Ver Ranking</a>
        </div>
        <div className="form-card">
          <h2 className="form-section-title">Datos de Registro</h2>
          {status.error && <div className="alert alert-error">⚠️ {status.error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <span className="label">Nombre Completo</span>
              <input type="text" name="fullName" className="input-field" required placeholder="Ingresa tu nombre completo" value={form.fullName} onChange={handleText} />
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

            {!form.isMinor && (
              <div className="form-group">
                <span className="label">Tu DUI (Documento Único de Identidad) <span className="required-badge">Obligatorio</span></span>
                <input type="text" name="dui" className="input-field" required={!form.isMinor} placeholder="Ej: 00000000-0" value={form.dui} onChange={handleText} />
              </div>
            )}

            <div className={`checkbox-group sponsor-group${sponsorError ? ' sponsor-error' : ''}`}>
              <span className="label">Selecciona tu patrocinador <span className="required-badge">Obligatorio</span></span>
              {sponsorError && <div className="sponsor-error-msg">⚠️ Debes elegir al menos Davivienda o Tigo</div>}
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

            <div className="terms-container" style={{ marginTop: '2rem', marginBottom: '1.5rem', background: 'rgba(20,10,60,0.3)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>Reglamento y Privacidad</h3>
              <div className="terms-scroll" style={{ height: '200px', overflowY: 'auto', fontSize: '0.8rem', color: 'var(--text-light)', paddingRight: '0.5rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '1rem' }}><strong>PRIMERA: OBJETO Y ORGANIZADORES</strong><br/>El presente reglamento establece las condiciones contractuales y de participación que regirán el torneo de videojuegos denominado "Elite Gaming Cup" , el cual es promovido de manera conjunta por Banco Davivienda Salvadoreño, S.A. y Tigo Sports / Tigo (en adelante denominados de forma conjunta como "Los Organizadores").</p>
                <p style={{ marginBottom: '1rem' }}><strong>SEGUNDA: REQUISITOS DE ADMISIBILIDAD Y EDAD MÍNIMA</strong><br/>Edad Mínima Requerida: La participación en el torneo está estrictamente limitada a personas naturales mayores de 14 años de edad.<br/>Mecanismo para Participantes Menores de Edad: Todo participante que tenga entre 14 y menos de 18 años de edad (menor de edad) deberá realizar su proceso de inscripción registrando obligatoriamente el número de Documento Único de Identidad (DUI) de su padre, madre o responsable legal. Asimismo, será condición indispensable para habilitar su participación la entrega física de una carta de autorización firmada por dicho tutor el día del evento.</p>
                <p style={{ marginBottom: '1rem' }}><strong>TERCERA: CONDICIÓN DE EXCLUSIVIDAD PARA CLIENTES</strong><br/>Acceso Restringido: El ingreso y la participación en el Torneo se reserva de forma exclusiva para clientes activos de Tigo o clientes de Tarjeta de Crédito o Débito de Banco Davivienda Salvadoreño, S.A.. No se admitirá la inscripción ni el ingreso de personas que no ostenten la calidad de clientes activos de las marcas mencionadas.<br/>Declaración y Validación: Al momento de realizar el proceso de inscripción en el landing page oficial, cada postulante deberá declarar expresamente si es cliente de Tigo o Davivienda. Dicha información será utilizada para la validación de su estatus y la aplicación de los beneficios correspondientes.</p>
                <p style={{ marginBottom: '1rem' }}><strong>CUARTA: LOGÍSTICA, FORMATO Y REGLAS DE LA COMPETENCIA</strong><br/>Fecha, Hora y Sede: El evento se llevará a cabo el día domingo 31 de mayo de 2026 en las instalaciones de Metrocentro, 8ª Etapa, iniciando formalmente el llamado a partir de las 10:00 a.m..<br/>Plataforma y Videojuego Oficial: El torneo se desarrollará de forma exclusiva en la consola de videojuegos PlayStation 5 (PS5), utilizando como software oficial y único de competencia el juego EA Sports FC 26 (FC26). Los Organizadores proveerán las consolas, pantallas y el videojuego en su versión original y actualizada a la fecha del evento. Queda estrictamente prohibido el uso de cuentas personales, modificaciones de software (hacks) o la alteración de las plantillas oficiales predeterminadas para el torneo.<br/>Formato del Torneo: Se adoptará un sistema de competición de eliminación directa. Cada emparejamiento o enfrentamiento definirá de manera automática e inapelable al jugador que avanza a la siguiente ronda, aplicándose de forma sucesiva hasta determinar a los participantes de la gran final.<br/>Duración de las Partidas: Cada partido se disputará con una duración cronometrada máxima de 3 minutos por cada tiempo de juego, utilizando de forma obligatoria las configuraciones oficiales predefinidas por la organización.<br/>Estaciones de Juego y Horarios: La asignación de los horarios específicos y las estaciones de juego será realizada previamente por los organizadores y se comunicará formalmente a los jugadores durante el desarrollo del evento.<br/>Puntualidad y Penalización por Ausencia (Default): Cada participante tiene la obligación de presentarse con la debida anticipación a la partida que le corresponda. En caso de no estar presente al momento del llamado oficial por parte del staff, se procederá a declarar la pérdida del encuentro por default automáticamente.</p>
                <p><strong>QUINTA: ACEPTACIÓN DE LAS BASES</strong><br/>El perfeccionamiento del proceso de inscripción digital implica la lectura, comprensión y aceptación automática, expresa e irrevocable de la totalidad de las reglas, condiciones y lineamientos generales aquí descritos.</p>
              </div>
              <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label className="checkbox-label" style={{ alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" name="acceptedTerms" checked={form.acceptedTerms} onChange={handleCheck} style={{ marginTop: '0.2rem', transform: 'scale(1.2)' }} />
                  <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>He leído, comprendido y <strong>acepto las bases, condiciones y lineamientos</strong> estipulados en el Reglamento del Torneo.</span>
                </label>
                <label className="checkbox-label" style={{ alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" name="acceptedImageRights" checked={form.acceptedImageRights} onChange={handleCheck} style={{ marginTop: '0.2rem', transform: 'scale(1.2)' }} />
                  <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}><strong>Autorización de Uso de Imagen:</strong> Autorizo de manera expresa y gratuita a Banco Davivienda Salvadoreño, S.A., y a Tigo Sports para capturar y utilizar fotografías/vídeos tomados durante el evento con fines promocionales.</span>
                </label>
                <label className="checkbox-label" style={{ alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" name="acceptedPrivacy" checked={form.acceptedPrivacy} onChange={handleCheck} style={{ marginTop: '0.2rem', transform: 'scale(1.2)' }} />
                  <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}><strong>Aviso de Privacidad:</strong> La información provista será tratada con estricta confidencialidad. Su recolección tiene como única finalidad la gestión operativa del torneo y validación de beneficios.</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={status.loading}>
              {status.loading ? '⏳ Registrando...' : 'INSCRIBIRME AHORA'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.3, fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} Elite Gaming Cup. <a href="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>All rights reserved.</a>
        </div>
      </div>
    </div>
  );
}
