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
    
    // Create matches for a 128-player bracket (64, 32, 16, 8, 4, 2, 1)
    const matchInserts = [];
    const rounds = [64, 32, 16, 8, 4, 2, 1];
    let matchNumberGlobal = 1;

    for (let r = 0; r < rounds.length; r++) {
      const numMatches = rounds[r];
      const roundNum = r + 1;
      
      for (let i = 0; i < numMatches; i++) {
        matchInserts.push({
          round: roundNum,
          matchNumber: i + 1,
          player1Id: roundNum === 1 ? (shuffled[i * 2]?.id || null) : null,
          player2Id: roundNum === 1 ? (shuffled[i * 2 + 1]?.id || null) : null
        });
        matchNumberGlobal++;
      }
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
