import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Fetch all participants
    const { data: participants, error: pError } = await supabase
      .from('participants')
      .select('id, fullName');

    if (pError) throw pError;

    // 2. Fetch all played matches
    const { data: matches, error: mError } = await supabase
      .from('matches')
      .select('player1Id, player2Id, winnerId, player1Score, player2Score')
      .not('winnerId', 'is', null);

    if (mError) throw mError;

    // 3. Initialize stats dictionary
    const stats: Record<number, any> = {};
    (participants || []).forEach((p: any) => {
      stats[p.id] = {
        id: p.id,
        fullName: p.fullName,
        matchesPlayed: 0,
        wins: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      };
    });

    // 4. Calculate stats from matches
    (matches || []).forEach((m: any) => {
      if (m.player1Id && stats[m.player1Id]) {
        stats[m.player1Id].matchesPlayed += 1;
        stats[m.player1Id].goalsFor += m.player1Score || 0;
        stats[m.player1Id].goalsAgainst += m.player2Score || 0;
        stats[m.player1Id].goalDifference += (m.player1Score || 0) - (m.player2Score || 0);
        if (m.winnerId === m.player1Id) stats[m.player1Id].wins += 1;
      }

      if (m.player2Id && stats[m.player2Id]) {
        stats[m.player2Id].matchesPlayed += 1;
        stats[m.player2Id].goalsFor += m.player2Score || 0;
        stats[m.player2Id].goalsAgainst += m.player1Score || 0;
        stats[m.player2Id].goalDifference += (m.player2Score || 0) - (m.player1Score || 0);
        if (m.winnerId === m.player2Id) stats[m.player2Id].wins += 1;
      }
    });

    // 5. Convert to array and sort
    const rankingArray = Object.values(stats).sort((a: any, b: any) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.fullName.localeCompare(b.fullName);
    });

    return NextResponse.json(rankingArray);
  } catch (error: any) {
    console.error('Error fetching ranking:', error);
    return NextResponse.json({ error: error.message || 'Error fetching ranking' }, { status: 500 });
  }
}
