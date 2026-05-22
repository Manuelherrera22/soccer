import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { token } = data;

    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado.' }, { status: 400 });
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return NextResponse.json({ error: 'Token inválido o corrupto.' }, { status: 400 });
    }

    const [payloadBase64, signature] = parts;
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback_secret_key_123';

    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'El enlace de verificación no es válido o ha sido alterado.' }, { status: 400 });
    }

    // Decode payload
    const payloadStr = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadStr);

    // Check expiration (e.g., 24 hours)
    if (Date.now() - payload.timestamp > 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: 'El enlace de verificación ha expirado. Por favor, regístrate nuevamente.' }, { status: 400 });
    }

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('participants')
      .select('id')
      .eq('email', payload.email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Este correo electrónico ya está verificado y registrado en el torneo.' }, { status: 400 });
    }

    // Check total quota (128 max)
    const { count, error: countError } = await supabaseAdmin
      .from('participants')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    if ((count || 0) >= 128) {
      return NextResponse.json({ error: 'El torneo está lleno. (128/128)' }, { status: 400 });
    }

    // Insert new participant
    const { error: insertError } = await supabaseAdmin
      .from('participants')
      .insert([
        {
          fullName: payload.fullName,
          birthDate: payload.birthDate,
          phone: payload.phone,
          email: payload.email,
          isDaviviendaClient: payload.isDaviviendaClient,
          isTigoClient: payload.isTigoClient,
          isMinor: payload.isMinor,
          dui: payload.dui,
          guardianName: payload.guardianName,
          guardianPhone: payload.guardianPhone,
          guardianDui: payload.guardianDui,
          acceptedTerms: payload.acceptedTerms
        }
      ]);

    if (insertError) {
      throw insertError;
    }

    // Optionally send welcome email
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Elite Gaming Cup <registro@elitegamingcup.com>',
            to: payload.email,
            subject: '¡Registro Exitoso! - Elite Gaming Cup',
            html: `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                <h2 style="color: #6a1b9a; text-align: center;">¡Bienvenido a la Elite Gaming Cup!</h2>
                <p>Hola <strong>${payload.fullName}</strong>,</p>
                <p>Tu correo ha sido verificado y tu registro oficial para la <strong>Elite Gaming Cup</strong> ha sido confirmado exitosamente.</p>
                <p>Nos emociona tenerte en este gran torneo de EA Sports FC 26.</p>
                <br />
                <p>El torneo se llevará a cabo el <strong>domingo 31 de mayo de 2026</strong> en Metrocentro, 8ª Etapa, iniciando a las 10:00 a.m. Te recomendamos llegar con anticipación.</p>
                <p>¡Prepárate para dar lo mejor en la cancha virtual!</p>
                <br />
                <hr style="border: none; border-top: 1px solid #eaeaea;" />
                <p style="font-size: 0.8rem; color: #888; text-align: center;">Este es un correo automático, por favor no respondas a este mensaje.</p>
              </div>
            `
          })
        });
      } catch (err) {
        console.error('Welcome email error:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verification failed:', error);
    return NextResponse.json({ error: 'Error interno del servidor al verificar el registro.' }, { status: 500 });
  }
}
