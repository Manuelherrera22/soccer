import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { fullName, birthDate, phone, email, dui, isDaviviendaClient, isTigoClient, isMinor, guardianName, guardianPhone, guardianDui, acceptedTerms, acceptedImageRights, acceptedPrivacy } = data;

    if (!fullName || !birthDate || !phone || !email) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
    }

    if (!isDaviviendaClient && !isTigoClient) {
      return NextResponse.json({ error: 'Debes seleccionar al menos Davivienda o Tigo.' }, { status: 400 });
    }

    if (!acceptedTerms || !acceptedImageRights || !acceptedPrivacy) {
      return NextResponse.json({ error: 'Debes aceptar los términos y condiciones, uso de imagen y políticas de privacidad.' }, { status: 400 });
    }

    if (isMinor && (!guardianName || !guardianPhone || !guardianDui)) {
      return NextResponse.json({ error: 'Los datos del padre/madre o encargado son obligatorios para menores de edad.' }, { status: 400 });
    }

    if (!isMinor && !dui) {
      return NextResponse.json({ error: 'El DUI es obligatorio para participantes mayores de edad.' }, { status: 400 });
    }

    // Check total quota (128 max)
    const { count, error: countError } = await supabaseAdmin
      .from('participants')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    if ((count || 0) >= 128) {
      return NextResponse.json({ error: 'El torneo está lleno. (128/128)' }, { status: 400 });
    }

    // Check duplicate email
    const { data: existingUser } = await supabaseAdmin
      .from('participants')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Este correo electrónico ya está registrado.' }, { status: 400 });
    }

    // Generate Magic Link Token
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback_secret_key_123';
    const payloadData = {
      fullName,
      birthDate,
      phone,
      email,
      isDaviviendaClient: !!isDaviviendaClient,
      isTigoClient: !!isTigoClient,
      isMinor: !!isMinor,
      dui: !isMinor ? dui : null,
      guardianName: guardianName || null,
      guardianPhone: guardianPhone || null,
      guardianDui: guardianDui || null,
      acceptedTerms: !!acceptedTerms,
      timestamp: Date.now()
    };
    
    const payload = Buffer.from(JSON.stringify(payloadData)).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    const token = `${payload}.${signature}`;

    const origin = req.headers.get('origin') || 'https://elitegamingcup.com';
    const verifyLink = `${origin}/verify?token=${token}`;

    // Attempt to send a verification email via Resend
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
            to: email,
            subject: 'Confirma tu registro - Elite Gaming Cup',
            html: `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                <h2 style="color: #6a1b9a; text-align: center;">¡Estás a un paso de la Elite Gaming Cup!</h2>
                <p>Hola <strong>${fullName}</strong>,</p>
                <p>Hemos recibido tu solicitud de registro para el torneo. Para completarlo y asegurar tu cupo, debes confirmar tu correo electrónico haciendo clic en el siguiente botón:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verifyLink}" style="background-color: #6a1b9a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Confirmar mi registro</a>
                </div>
                <p style="font-size: 0.9rem; color: #666;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                <p style="font-size: 0.8rem; word-break: break-all;"><a href="${verifyLink}">${verifyLink}</a></p>
                <br />
                <p>El torneo se llevará a cabo el <strong>domingo 31 de mayo de 2026</strong> en Metrocentro, 8ª Etapa.</p>
                <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 30px;" />
                <p style="font-size: 0.8rem; color: #888; text-align: center;">Este es un correo automático, por favor no respondas a este mensaje.</p>
              </div>
            `
          })
        });
      } catch (emailErr) {
        console.error('Failed to send verification email:', emailErr);
        return NextResponse.json({ error: 'Error al enviar el correo de verificación. Intenta nuevamente.' }, { status: 500 });
      }
    } else {
      console.log('No RESEND_API_KEY provided. Verification Email skipped. VERIFY LINK:', verifyLink);
    }

    return NextResponse.json({ success: true, pendingVerification: true });
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
