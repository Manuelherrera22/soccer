import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from('participants')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({ total: count || 0, remaining: 128 - (count || 0) });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
