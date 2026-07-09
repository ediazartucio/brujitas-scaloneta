# Freezer mundialista — Project Document
*Game Design Document & Development Reference*
*Last updated: July 2026*

---

## Origin & Cultural Context

The project was sparked by a real cultural phenomenon observed during the **2022 FIFA World Cup in Qatar**, specifically within Argentine popular tradition. Around that tournament two things happened publicly and visibly:

- **Numerologists** began circulating analysis of dates, scorelines and squad numbers, finding patterns they claimed foretold Argentina's victory
- **Informal witches and curanderas** — most notably a group that became known as *las brujitas de la scaloneta* — used social media to teach ordinary people how to perform low-level hexes on rival teams from home. The most widely shared ritual: writing a rival player's name on a piece of paper and putting it in the freezer to "freeze" their performance

This isn't fringe occultism. It sits inside a long tradition of Argentine popular Catholicism coexisting comfortably with folk magic, *curanderismo*, and syncretic belief. The freezer ritual is domestic, accessible, and mundane in its materials — anyone with a kitchen can do it — but deadly serious in its intent. It belongs to the same cultural lineage as Maradona's Hand of God being semi-divine, or penalty shootouts being treated as cosmically determined events rather than sporting ones.

The game is essentially asking: **what if that was mechanically real and you were the one doing it?**

---

## The Current Prototype

A single self-contained HTML file. A playable jam-scope proof of concept.

### Structure
The screen is divided horizontally into two sections:

**Top ~60% — The Match**
A broadcast-aesthetic live football simulation. Colored dots represent players moving on a pitch. A weighted event randomizer fires continuously: attacks, counterattacks, yellows, reds, injuries, midfield passages. A scorebug tracks score and a compressed match clock. The player has **zero direct control** over the football.

**Bottom ~40% — El Freezer**
A roster of rival players, each with their name, number and position. The player clicks a player to "write their name on a paper and put them in the freezer." Up to 3 players can be frozen simultaneously. Each freeze lasts **5 seconds**, followed by a **7 second cooldown**.

### Core Mechanic
Freezing is **position-aware**:
- Freezing rival **DEF/ARQ** boosts your attack-to-goal conversion rate
- Freezing rival **DEL** suppresses their threat
- Freezing defenders also **spikes counterattack probability** — you open gaps
- Over-freezing is punished; the risk/reward is in the timing

### Probability System (hidden from player)
The player never sees numbers. The game communicates mechanically through match events and outcomes only. Internally:
- Base goal path: attack event → 62% shot generation → ~14% conversion = ~8.7% net per attack
- 1 frozen DEF: ~14.6% net | 2 frozen: ~20.5% | 3 frozen: ~25.6% (cap 38%)
- Frozen striker suppression: -5% per frozen DEL

**Design principle: mechanically transparent, narratively opaque, consequentially honest.**

### Other Systems
- **Red cards**: extremely rare, permanently removes a player (dot removed from pitch, card greyed out, man-down affects odds)
- **Injuries**: rare, triggers substitution system (max 5 per team), new player name rotates in with flash animation
- **Rival AI stub**: small chance each tick of a visual "frost" effect on one of your dots — narrative hint at rival counter-rituals, no real debuff yet
- **Match length**: 60 real-time seconds
- **End screen**: result-specific flavor text written in Argentine football-fan voice

### Tech
Plain HTML/CSS/JS, no dependencies, no build step. Single file.

---

## Near-Term Web App (World Cup 2026 — Current Priority)

A lightweight public web app to deploy during the 2026 World Cup. Think **collective ritual**, not solo game.

### Core Features
1. **Match picker** — select any 2026 World Cup match from the bracket
2. **Schedule awareness** — shows upcoming matches relative to current time/timezone, highlights what's live or next
3. **Collective freeze vote** — pick which of the two teams to freeze; one vote per session
4. **Live counter** — real-time running total of how many people have frozen each team, updating live as votes come in across all sessions
5. **Game layer** — the prototype runs as a "play while you wait" experience, with the voted-against team as the frozen rival

### The Vibe
The live counter is the soul of this feature. Watching the number tick up during a match — thousands of freezers being activated simultaneously across Argentina and the diaspora — *is* the ritual scaled up. It's *las brujitas de la scaloneta* as a distributed network.

### Stack
- **Frontend**: HTML/JS or lightweight framework, single repo
- **Hosting**: Netlify (already in use, free tier)
- **Database**: Supabase (free tier, Postgres)
- **Real-time**: Supabase real-time subscriptions on the votes table
- **Schedule data**: Static JSON of 2026 fixtures (dates already public, UTC kickoff times)

### Database Schema (votes table — rough)
```sql
create table votes (
  id uuid default gen_random_uuid() primary key,
  match_id text not null,
  team_id text not null,
  created_at timestamptz default now(),
  -- IP-based rate limiting handled at insert via RLS or edge function
);
```
Row Level Security enabled from day one. Simple IP check before insert to prevent spam voting.

### Development Phases
| Phase | Scope | Session estimate |
|---|---|---|
| 0 | Repo + Netlify deploy + Supabase project skeleton | 1 session |
| 1 | 2026 fixture JSON, data shape finalized | 1 session |
| 2 | Supabase schema + RLS + SDK connection | 1 session |
| 3 | Match picker UI | 1 session |
| 4 | Vote mechanic + write to Supabase | 1 session |
| 5 | Supabase real-time live counter | 1 session |
| 6 | Prototype integration (voted team = frozen rival) | 1-2 sessions |
| 7 | Polish, edge cases, mobile, error states | 1 session |

---

## Long-Term Vision — Roguelike Expansion

A full deck-building roguelike with Inscryption / Slay the Spire / Darkest Dungeon influences. The prototype is the core loop; the roguelike wraps a full campaign around it.

### Structure
A **tournament run**. Pick a national team, navigate a bracket match by match. Each win unlocks cards. Losses degrade your deck or end the run. Meta-progression between runs unlocks new regional card pools.

### Card System

**Six card types:**

| Type | Description | Rarity |
|---|---|---|
| Cábala | Passive buffs tied to your own team's behavior. Breakable if you violate the rule mid-run. | Common |
| Hex | Active interventions on rival players. The freezer mechanic expanded. | Common–Uncommon |
| Ritual | Multi-turn setup cards with large detonation effects. High cost, high reward. | Rare |
| Amuleto | Equipment cards that stay in play for the whole match (Slay the Spire relic equivalent) | Uncommon–Rare |
| Consumible | One-use items bought in the pre-match shop | Common |
| Hazard | Environmental events that fire against the player — the counterweight | N/A (system-generated) |

**Four rarity tiers:** Common, Uncommon, Rare, Legendary

### Regional Card Pools (Expansion Order)
1. **Argentina** — freezer hexes, cábalas, *mal de ojo*, Gauchito Gil, Difunta Correa, San La Muerte, sal gruesa, pulseras rojas
2. **South America** — Peru shamanic pre-match ceremonies, Pachamama offerings, Brazilian *simpatias* and Candomblé-adjacent protection rituals
3. **Africa** — fetish objects, goalpost charms, pre-match community ceremony buffs
4. **Europe** — Catholic saint intercession, sports psychology cards (skeptic pool, mechanically consistent but lower ceiling), eventually Islamic *du'a* for MENA teams
5. **Asia** — TBD, requires research pass

Cross-regional rare cards unlock after multiple pool access — some rituals transcend geography.

### The Ambiguity Principle
**The supernatural effects are mechanically real. The game never confirms this to the player.**

The ticker never says "your hex worked." It says *"el 9 rival resbala sin razón aparente"* or *"el arquero duda un segundo de más."* The connection between action and outcome is theirs to make — which is exactly how superstition operates in real life. You don't get a notification that the freezer worked. You watch the match and read into it.

Ambiguity lives in the **narrative layer**. The mechanical layer is fully honest.

### Pre/Post Match Shop
Preparation before a match is itself part of the tradition. Two phases:

**Pre-match** — informed purchases since you know the opponent. Consumables, relic equips, cábala commitments.

**Post-match** — spend earned points on permanent upgrades, new cards, run-wide passives.

**Shop tiers:**

| Tier | Examples | Effect |
|---|---|---|
| Ambient (cheap) | Palo santo, incense, white candle, sal en la puerta | Small passive boost, always available, feels like routine |
| Targeted (mid) | Colored candles (red=attack, black=hex, blue=protection), specific herbs, rival photograph | Interacts with card choices |
| Rare/powerful (expensive) | Gauchito Gil ribbon, water from pilgrimage site, ensalmo de curandera | Strong single-match effect, limited stock |

### Environmental Hazard System
Match-interruption events targeting your physical infrastructure. The joke: you're attempting to interfere with a World Cup from your apartment with a twenty-year-old Whirlpool and a fragile power grid.

| Event | Effect | Mitigation |
|---|---|---|
| Corte de luz | All active hexes thaw immediately, slots dark for ~30 match-seconds | UPS battery relic, candle backup |
| El freezer se rompió | Freeze mechanic disabled for the rest of the match | "El freezer de la abuela" relic |
| Vecino que se queja | Card misfires, cooldown resets badly | Do Not Disturb item |
| Se cortó el cable | Pitch goes dark, events fire blind | Data recharge item |
| Rival counter-rituals | Hexes return diminished effects, ambient misfire chance | Counter-hex protection cards |
| Viral moment (positive) | Global hex effectiveness multiplier, *"el hashtag explota"* | N/A — lucky event |
| Saint intervention | Free positive effect fires without player input | N/A — grace, not strategy |

**The freezer is your torch** (cf. Darkest Dungeon's torchlight — heroes mythic, infrastructure mortal).

### Aesthetic / Meta Layer
Framed as a *curandera*'s grimoire or workbook. UI designed like handwritten notes and worn paper. Unlocks presented as pages discovered in the book rather than menu items. Losing a run means the grimoire "forgets" a ritual.

The game is aware it's a game but layers the diegetic fiction on top. The Inscryption parallel is intentional.

---

## Design Principles (Carried Through All Versions)

- **No numbers shown to the player.** Effects communicate through match outcomes and event text only.
- **Backfires matter as much as successes.** Negative feedback is what teaches players their choices have weight.
- **The domestic and the cosmic coexist.** Palo santo sits next to the UPS battery in the same shop. This is true to the source material.
- **Mechanically transparent, narratively opaque, consequentially honest.**
- **Source material does the design work.** Card tiers, hazard systems, shop categories all emerge from taking the tradition seriously rather than being invented from scratch.

---

*Accounts set up: Supabase, GitHub, Netlify. Ready for Phase 0.*
