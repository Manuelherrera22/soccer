'use client';

import { useState } from 'react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        window.location.href = '/admin';
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="neon-line neon-line-left" />
      <div className="neon-line neon-line-right" />
      
      <div className="form-card" style={{ maxWidth: '400px', width: '90%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="shield-logo" style={{ width: '150px', margin: '0 auto 1.5rem auto' }}>
            <img src="/Logo Final.png" alt="Elite Gaming Cup" style={{ width: '100%' }} />
          </div>
          <h1 className="hero-heading" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Admin Login</h1>
          <p className="hero-desc" style={{ fontSize: '0.9rem', opacity: 0.7 }}>Acceso restringido al personal autorizado</p>
        </div>

        {error && <div className="alert alert-error" style={{ textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <span className="label">Usuario</span>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ingrese su usuario" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <span className="label">Contraseña</span>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '1.5rem' }}>
            {loading ? 'Validando...' : 'INGRESAR'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>← Volver al sitio público</a>
        </div>
      </div>
    </div>
  );
}
