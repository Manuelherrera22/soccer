import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: matches, error } = await supabaseAdmin
      .from('matches')
      .select('*')
      .order('round', { ascending: true })
      .order('matchNumber', { ascending: true });

    if (error) throw error;

    const { data: participants, error: pError } = await supabaseAdmin
      .from('participants')
      .select('id, fullName');
      
    if (pError) throw pError;
    
    const pMap = new Map((participants || []).map((p: any) => [p.id, p.fullName]));

    // Transform data to match previous SQLite output structure exactly
    const formattedMatches = (matches || []).map((m: any) => ({
      matchId: m.id,
      round: m.round,
      matchNumber: m.matchNumber,
      winnerId: m.winnerId,
      player1Score: m.player1Score,
      player2Score: m.player2Score,
      p1Id: m.player1Id,
      p1Name: pMap.get(m.player1Id) || null,
      p2Id: m.player2Id,
      p2Name: pMap.get(m.player2Id) || null
    }));

    return NextResponse.json(formattedMatches);
  } catch (error) {
    console.error('Failed to fetch bracket:', error);
    return NextResponse.json({ error: 'Failed to fetch bracket' }, { status: 500 });
  }
}
