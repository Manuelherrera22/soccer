'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Enlace de verificación inválido. Por favor, asegúrate de haber copiado el enlace completo.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Ocurrió un error al verificar.');
        }

        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="form-container" style={{ textAlign: 'center', padding: '3rem', maxWidth: '500px' }}>
        {status === 'loading' && (
          <>
            <h2 style={{ color: 'var(--gold)' }}>Verificando tu registro...</h2>
            <p style={{ color: 'var(--text-light)', marginTop: '1rem' }}>Por favor, espera un momento mientras validamos tu información y te registramos en el torneo.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: 'var(--gold)' }}>¡Registro Confirmado!</h2>
            <p style={{ color: 'var(--text-light)', marginTop: '1rem' }}>Tu correo ha sido verificado y ahora estás oficialmente inscrito en la <strong>Elite Gaming Cup</strong>.</p>
            <button 
              onClick={() => router.push('/')}
              className="btn-submit"
              style={{ marginTop: '2rem', display: 'inline-block', width: 'auto', padding: '0.8rem 2rem' }}
            >
              Volver al inicio
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#ff4444' }}>Error en la Verificación</h2>
            <p style={{ color: 'var(--text-light)', marginTop: '1rem' }}>{errorMessage}</p>
            <button 
              onClick={() => router.push('/')}
              className="btn-submit"
              style={{ marginTop: '2rem', display: 'inline-block', width: 'auto', padding: '0.8rem 2rem', background: 'rgba(255,255,255,0.1)' }}
            >
              Intentar de nuevo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h2 style={{ color: 'var(--gold)' }}>Cargando...</h2></div>}>
      <VerifyContent />
    </Suspense>
  );
}
