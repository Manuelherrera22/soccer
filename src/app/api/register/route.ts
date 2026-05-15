import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { fullName, tariff, birthDate, phone, email, isDaviviendaClient, isTigoClient, isMinor, guardianName, guardianPhone, guardianDui, acceptedTerms } = data;

    if (!fullName || !tariff || !birthDate || !phone || !email) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
    }

    if (!acceptedTerms) {
      return NextResponse.json({ error: 'Debes aceptar los términos y condiciones.' }, { status: 400 });
    }

    if (isMinor && (!guardianName || !guardianPhone || !guardianDui)) {
      return NextResponse.json({ error: 'Los datos del padre/madre o encargado son obligatorios para menores de edad.' }, { status: 400 });
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
          tariff,
          birthDate,
          phone,
          email,
          isDaviviendaClient: !!isDaviviendaClient,
          isTigoClient: !!isTigoClient,
          isMinor: !!isMinor,
          guardianName: guardianName || null,
          guardianPhone: guardianPhone || null,
          guardianDui: guardianDui || null,
          acceptedTerms: !!acceptedTerms
        }
      ]);

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
