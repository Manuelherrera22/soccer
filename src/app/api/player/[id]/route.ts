import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const playerId = Number(params.id);
    if (!playerId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    // Fetch participant
    const { data: player, error: pError } = await supabase
      .from('participants')
      .select('id, fullName, createdAt')
      .eq('id', playerId)
      .single();

    if (pError || !player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });

    // Fetch all matches involving player
    const { data: matches, error: mError } = await supabase
      .from('matches')
      .select(`
        id as "matchId", 
        round, 
        matchNumber as "matchNumber", 
        winnerId as "winnerId",
        "player1Score",
        "player2Score",
        p1:player1Id(id, fullName),
        p2:player2Id(id, fullName)
      `)
      .or(`player1Id.eq.${playerId},player2Id.eq.${playerId}`)
      .not('winnerId', 'is', null)
      .order('round', { ascending: true });

    if (mError) throw mError;

    let wins = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    const formattedMatches = (matches || []).map((m: any) => {
      const isPlayer1 = m.p1?.id === playerId;
      
      const pScore = isPlayer1 ? (m.player1Score || 0) : (m.player2Score || 0);
      const oppScore = isPlayer1 ? (m.player2Score || 0) : (m.player1Score || 0);
      
      goalsFor += pScore;
      goalsAgainst += oppScore;
      if (m.winnerId === playerId) wins++;

      return {
        matchId: m.matchId,
        round: m.round,
        opponentName: isPlayer1 ? (m.p2?.fullName || 'TBD') : (m.p1?.fullName || 'TBD'),
        opponentId: isPlayer1 ? m.p2?.id : m.p1?.id,
        playerScore: pScore,
        opponentScore: oppScore,
        won: m.winnerId === playerId
      };
    });

    return NextResponse.json({
      player,
      stats: {
        matchesPlayed: formattedMatches.length,
        wins,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst
      },
      history: formattedMatches
    });
  } catch (error: any) {
    console.error('Error fetching player:', error);
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}
