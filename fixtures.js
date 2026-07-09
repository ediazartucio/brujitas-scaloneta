const FIXTURES = {
  matches: [
    { id: "m97",  stage: "quarterfinal", kickoff_utc: "2026-07-09T20:00:00Z", venue: "Gillette Stadium, Boston",        home: { name: "France",      code: "FRA" }, away: { name: "Morocco",     code: "MAR" } },
    { id: "m98",  stage: "quarterfinal", kickoff_utc: "2026-07-10T19:00:00Z", venue: "SoFi Stadium, Los Angeles",       home: { name: "Spain",       code: "ESP" }, away: { name: "Belgium",     code: "BEL" } },
    { id: "m99",  stage: "quarterfinal", kickoff_utc: "2026-07-11T21:00:00Z", venue: "Hard Rock Stadium, Miami",        home: { name: "Norway",      code: "NOR" }, away: { name: "England",     code: "ENG" } },
    { id: "m100", stage: "quarterfinal", kickoff_utc: "2026-07-12T01:00:00Z", venue: "Arrowhead Stadium, Kansas City",  home: { name: "Argentina",   code: "ARG" }, away: { name: "Switzerland", code: "SUI" } },
    { id: "m101", stage: "semifinal",    kickoff_utc: "2026-07-14T19:00:00Z", venue: "AT&T Stadium, Dallas",            home: { ref: "winner:m97" },                away: { ref: "winner:m98" } },
    { id: "m102", stage: "semifinal",    kickoff_utc: "2026-07-15T19:00:00Z", venue: "Mercedes-Benz Stadium, Atlanta",  home: { ref: "winner:m99" },                away: { ref: "winner:m100" } },
    { id: "m103", stage: "third_place",  kickoff_utc: "2026-07-18T21:00:00Z", venue: "Hard Rock Stadium, Miami",        home: { ref: "loser:m101" },                away: { ref: "loser:m102" } },
    { id: "m104", stage: "final",        kickoff_utc: "2026-07-19T19:00:00Z", venue: "MetLife Stadium, New Jersey",     home: { ref: "winner:m101" },               away: { ref: "winner:m102" } }
  ]
};

const VOTE_WINDOW_MINUTES = 120; // regulation + halftime + stoppage buffer, ignores ET/penalties

function getActiveMatch(now = new Date()) {
  for (const match of FIXTURES.matches) {
    const kickoff = new Date(match.kickoff_utc);
    const closesAt = new Date(kickoff.getTime() + VOTE_WINDOW_MINUTES * 60000);
    if (now >= kickoff && now < closesAt) {
      return { match, status: "live", votingOpen: true, closesAt };
    }
  }
  const upcoming = FIXTURES.matches
    .filter(m => new Date(m.kickoff_utc) > now)
    .sort((a, b) => new Date(a.kickoff_utc) - new Date(b.kickoff_utc))[0];

  return upcoming
    ? { match: upcoming, status: "upcoming", votingOpen: true, closesAt: null }
    : { match: null, status: "tournament_over", votingOpen: false };
}
