import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    // Check if bracket already exists
    const { count, error: countError } = await supabaseAdmin
      .from('matches')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    if ((count || 0) > 0) {
      return NextResponse.json({ error: 'Bracket already generated. Clear it first if you want to regenerate.' }, { status: 400 });
    }

    // Get all participants
    const { data: participants, error: pError } = await supabaseAdmin
      .from('participants')
      .select('id');

    if (pError) throw pError;
    
    const shuffled = [...(participants || [])].sort(() => 0.5 - Math.random());
    
    // Create 64 matches for Round 1
    const matchInserts = [];
    for (let i = 0; i < 64; i++) {
      matchInserts.push({
        round: 1,
        matchNumber: i + 1,
        player1Id: shuffled[i * 2]?.id || null,
        player2Id: shuffled[i * 2 + 1]?.id || null
      });
    }

    const { error: insertError } = await supabaseAdmin
      .from('matches')
      .insert(matchInserts);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, message: 'Bracket Generated!' });
  } catch (error) {
    console.error('Failed to generate bracket:', error);
    return NextResponse.json({ error: 'Failed to generate bracket' }, { status: 500 });
  }
}
