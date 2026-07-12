// flag = ISO 3166-1 alpha-2 (lowercase) for flagcdn.com; England uses the
// GB-ENG subdivision code since "England" has no ISO country code of its own.
// color = primary jersey color, picked to contrast against that match's opponent.
// vote_window_minutes = optional per-match override of the default voting
// window, for matches that go to extra time/penalties and run long.
const FIXTURES = {
  matches: [
    { id: "m97",  stage: "quarterfinal", kickoff_utc: "2026-07-09T20:00:00Z", venue: "Gillette Stadium, Boston",
      result: { home: 2, away: 0 },
      home: { name_es: "Francia",     code: "FRA", flag: "fr",     color: "#0055A4" },
      away: { name_es: "Marruecos",   code: "MAR", flag: "ma",     color: "#C1272D" } },
    { id: "m98",  stage: "quarterfinal", kickoff_utc: "2026-07-10T19:00:00Z", venue: "SoFi Stadium, Los Angeles",
      result: { home: 2, away: 1 },
      home: { name_es: "España",      code: "ESP", flag: "es",     color: "#C60B1E" },
      away: { name_es: "Bélgica",     code: "BEL", flag: "be",     color: "#2D2926" } },
    { id: "m99",  stage: "quarterfinal", kickoff_utc: "2026-07-11T21:00:00Z", venue: "Hard Rock Stadium, Miami",
      result: { home: 2, away: 1, note: "a.e.t." },
      home: { name_es: "Noruega",     code: "NOR", flag: "no",     color: "#BA0C2F" },
      away: { name_es: "Inglaterra",  code: "ENG", flag: "gb-eng", color: "#1E2A5E" } },
    { id: "m100", stage: "quarterfinal", kickoff_utc: "2026-07-12T01:00:00Z", venue: "Arrowhead Stadium, Kansas City",
      vote_window_minutes: 210, // went to extra time / possibly penalties, regular 120min window isn't enough
      home: { name_es: "Argentina",   code: "ARG", flag: "ar",     color: "#75AADB" },
      away: { name_es: "Suiza",       code: "SUI", flag: "ch",     color: "#D52B1E" } },
    { id: "m101", stage: "semifinal",    kickoff_utc: "2026-07-14T19:00:00Z", venue: "AT&T Stadium, Dallas",
      home: { name_es: "Francia",     code: "FRA", flag: "fr",     color: "#0055A4" },   // beat Marruecos
      away: { name_es: "España",      code: "ESP", flag: "es",     color: "#C60B1E" } }, // beat Bélgica
    { id: "m102", stage: "semifinal",    kickoff_utc: "2026-07-15T19:00:00Z", venue: "Mercedes-Benz Stadium, Atlanta",
      home: { name_es: "Inglaterra",  code: "ENG", flag: "gb-eng", color: "#1E2A5E" },   // beat Noruega
      away: { ref: "winner:m100" } }, // still pending — Argentina/Suiza in extra time
    { id: "m103", stage: "third_place",  kickoff_utc: "2026-07-18T21:00:00Z", venue: "Hard Rock Stadium, Miami",
      home: { ref: "loser:m101" }, away: { ref: "loser:m102" } },
    { id: "m104", stage: "final",        kickoff_utc: "2026-07-19T19:00:00Z", venue: "MetLife Stadium, New Jersey",
      home: { ref: "winner:m101" }, away: { ref: "winner:m102" } }
  ]
};

const VOTE_WINDOW_MINUTES = 120; // regulation + halftime + stoppage buffer, default for matches with no override

function windowFor(match) {
  return match.vote_window_minutes || VOTE_WINDOW_MINUTES;
}

function getActiveMatch(now = new Date()) {
  for (const match of FIXTURES.matches) {
    const kickoff = new Date(match.kickoff_utc);
    const closesAt = new Date(kickoff.getTime() + windowFor(match) * 60000);
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

// Status label for every match, used by the "next matches" list.
function getMatchStatus(match, now = new Date()) {
  const kickoff = new Date(match.kickoff_utc);
  const closesAt = new Date(kickoff.getTime() + windowFor(match) * 60000);
  if (now >= closesAt) return "finished";
  if (now >= kickoff) return "live";
  return "upcoming";
}
