function getVoterHash() {
  let hash = localStorage.getItem('voter_hash');
  if (!hash) {
    hash = crypto.randomUUID();
    localStorage.setItem('voter_hash', hash);
  }
  return hash;
}

function getMyVote(matchId) {
  return localStorage.getItem(`voted:${matchId}`);
}

async function castVote(matchId, teamCode) {
  if (getMyVote(matchId)) return { alreadyVoted: true };

  const { error } = await supabaseClient
    .from('votes')
    .insert({ match_id: matchId, team_code: teamCode, voter_hash: getVoterHash() });

  if (!error) localStorage.setItem(`voted:${matchId}`, teamCode);
  return { error };
}

async function getVoteCounts(matchId) {
  const { data, error } = await supabaseClient
    .from('votes')
    .select('team_code')
    .eq('match_id', matchId);

  if (error) {
    console.error('getVoteCounts failed', error);
    return {};
  }
  return data.reduce((acc, row) => {
    acc[row.team_code] = (acc[row.team_code] || 0) + 1;
    return acc;
  }, {});
}

// Fires onChange with no payload — caller just re-fetches counts, simplest way
// to stay correct even if multiple inserts land in a tight window.
function subscribeToVotes(matchId, onChange) {
  return supabaseClient
    .channel(`votes:${matchId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'votes', filter: `match_id=eq.${matchId}` },
      onChange
    )
    .subscribe();
}
