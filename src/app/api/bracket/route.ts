import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: matches, error } = await supabaseAdmin
      .from('matches')
      .select(`
        id as "matchId", 
        round, 
        matchNumber as "matchNumber", 
        winnerId as "winnerId",
        p1:player1Id(id, fullName),
        p2:player2Id(id, fullName)
      `)
      .order('round', { ascending: true })
      .order('matchNumber', { ascending: true });

    if (error) throw error;

    // Transform data to match previous SQLite output structure exactly
    const formattedMatches = (matches || []).map((m: any) => ({
      matchId: m.matchId,
      round: m.round,
      matchNumber: m.matchNumber,
      winnerId: m.winnerId,
      p1Id: m.p1 ? m.p1.id : null,
      p1Name: m.p1 ? m.p1.fullName : null,
      p2Id: m.p2 ? m.p2.id : null,
      p2Name: m.p2 ? m.p2.fullName : null
    }));

    return NextResponse.json(formattedMatches);
  } catch (error) {
    console.error('Failed to fetch bracket:', error);
    return NextResponse.json({ error: 'Failed to fetch bracket' }, { status: 500 });
  }
}
