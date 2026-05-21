import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: participants, error } = await supabaseAdmin
      .from('participants')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json(participants || []);
  } catch (error) {
    console.error('Failed to fetch participants:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
