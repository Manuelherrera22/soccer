import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { matchId, winnerId } = await req.json();

    if (!matchId || !winnerId) {
      return NextResponse.json({ error: 'Missing matchId or winnerId' }, { status: 400 });
    }

    const { data: match, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Update winner
    const { error: updateWinnerError } = await supabaseAdmin
      .from('matches')
      .update({ winnerId })
      .eq('id', matchId);

    if (updateWinnerError) throw updateWinnerError;

    // Calculate next match info
    const nextRound = match.round + 1;
    const nextMatchNumber = Math.ceil(match.matchNumber / 2);
    const isPlayer1InNextMatch = match.matchNumber % 2 !== 0;

    // See if the next match exists
    const { data: nextMatch, error: nextMatchError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('round', nextRound)
      .eq('matchNumber', nextMatchNumber)
      .maybeSingle();

    if (nextMatchError) throw nextMatchError;

    if (!nextMatch) {
      // Create the next match
      const newMatchData: any = {
        round: nextRound,
        matchNumber: nextMatchNumber,
      };
      if (isPlayer1InNextMatch) {
        newMatchData.player1Id = winnerId;
      } else {
        newMatchData.player2Id = winnerId;
      }

      const { error: insertNextError } = await supabaseAdmin
        .from('matches')
        .insert([newMatchData]);

      if (insertNextError) throw insertNextError;

    } else {
      // Update existing next match
      const updateData: any = {};
      if (isPlayer1InNextMatch) {
        updateData.player1Id = winnerId;
      } else {
        updateData.player2Id = winnerId;
      }

      const { error: updateNextError } = await supabaseAdmin
        .from('matches')
        .update(updateData)
        .eq('id', nextMatch.id);

      if (updateNextError) throw updateNextError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to advance player:', error);
    return NextResponse.json({ error: 'Failed to advance player' }, { status: 500 });
  }
}
