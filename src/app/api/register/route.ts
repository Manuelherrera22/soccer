import { NextResponse } from 'next/server';
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

    // Insert new participant
    const { error: insertError } = await supabaseAdmin
      .from('participants')
      .insert([
        {
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
          acceptedTerms: !!acceptedTerms
        }
      ]);

    if (insertError) {
      throw insertError;
    }

    // Attempt to send a welcome email via Resend
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
            subject: '¡Registro Exitoso! - Elite Gaming Cup',
            html: `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                <h2 style="color: #6a1b9a; text-align: center;">¡Bienvenido a la Elite Gaming Cup!</h2>
                <p>Hola <strong>${fullName}</strong>,</p>
                <p>Tu registro para la <strong>Elite Gaming Cup</strong>, patrocinada por Davivienda y Tigo, ha sido confirmado exitosamente.</p>
                <p>Nos emociona tenerte en este gran torneo de EA Sports FC 26.</p>
                <br />
                <h3>Detalles de tu inscripción:</h3>
                <ul>
                  <li><strong>Participante:</strong> ${fullName}</li>
                  <li><strong>Correo:</strong> ${email}</li>
                  <li><strong>Teléfono:</strong> ${phone}</li>
                  <li><strong>Categoría:</strong> ${isMinor ? 'Menor de edad' : 'Mayor de edad'}</li>
                </ul>
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
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr);
        // Do not fail registration if email fails
      }
    } else {
      console.log('No RESEND_API_KEY provided. Email skipped.');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
