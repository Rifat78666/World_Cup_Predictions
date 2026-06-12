import { teams } from "../data/teams.js";

// Computes standings for a single group
export const calculateGroupStandings = (groupLetter, groupFixtures) => {
  const groupTeams = teams.filter(t => t.group === groupLetter);
  const standings = groupTeams.map(team => ({
    ...team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0, // goals for
    ga: 0, // goals against
    gd: 0, // goal difference
    points: 0
  }));

  // Process completed predictions
  groupFixtures.forEach(fix => {
    if (fix.homeScore !== "" && fix.awayScore !== "" && fix.homeScore !== null && fix.awayScore !== null) {
      const hs = parseInt(fix.homeScore, 10);
      const as = parseInt(fix.awayScore, 10);
      if (isNaN(hs) || isNaN(as)) return;

      const homeTeam = standings.find(t => t.id === fix.home);
      const awayTeam = standings.find(t => t.id === fix.away);

      if (homeTeam && awayTeam) {
        homeTeam.played += 1;
        awayTeam.played += 1;
        homeTeam.gf += hs;
        homeTeam.ga += as;
        awayTeam.gf += as;
        awayTeam.ga += hs;

        if (hs > as) {
          homeTeam.won += 1;
          homeTeam.points += 3;
          awayTeam.lost += 1;
        } else if (hs < as) {
          awayTeam.won += 1;
          awayTeam.points += 3;
          homeTeam.lost += 1;
        } else {
          homeTeam.drawn += 1;
          homeTeam.points += 1;
          awayTeam.drawn += 1;
          awayTeam.points += 1;
        }
      }
    }
  });

  standings.forEach(t => {
    t.gd = t.gf - t.ga;
  });

  // Sorting with FIFA Tiebreakers:
  // 1. Points
  // 2. Goal Difference
  // 3. Goals Scored
  // 4. Head-to-Head (if only 2 teams are tied, we look at their match. For simplicity, we fallback to H2H mock or FIFA ranking)
  // 5. FIFA Ranking (lower number is better)
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;

    // Head-to-head check
    const h2hMatch = groupFixtures.find(
      f => (f.home === a.id && f.away === b.id) || (f.home === b.id && f.away === a.id)
    );
    if (h2hMatch && h2hMatch.homeScore !== "" && h2hMatch.awayScore !== "") {
      const hs = parseInt(h2hMatch.homeScore, 10);
      const as = parseInt(h2hMatch.awayScore, 10);
      const aIsHome = h2hMatch.home === a.id;
      if (hs > as) return aIsHome ? -1 : 1;
      if (as > hs) return aIsHome ? 1 : -1;
    }

    // Fallback to FIFA Ranking (ascending order)
    return a.ranking - b.ranking;
  });

  return standings;
};

// Ranks all third place teams across groups A-L
export const calculateThirdPlaceStandings = (allGroupStandings) => {
  const thirdPlaceTeams = [];
  
  Object.keys(allGroupStandings).forEach(groupLetter => {
    const standings = allGroupStandings[groupLetter];
    if (standings && standings.length >= 3) {
      thirdPlaceTeams.push({
        ...standings[2], // 3rd team (index 2)
        groupLetter
      });
    }
  });

  // Rank 3rd place teams:
  // 1. Points
  // 2. Goal Difference
  // 3. Goals Scored
  // 4. FIFA Ranking
  thirdPlaceTeams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.ranking - b.ranking;
  });

  return thirdPlaceTeams;
};

// Bracket matchups configuration for Round of 32
// Winners of A, B, D, E, G, I, K, L face third-placed teams
export const compatibility = {
  E: ["A", "B", "C", "D", "F"],
  I: ["C", "D", "F", "G", "H"],
  A: ["C", "E", "F", "H", "I"],
  L: ["E", "H", "I", "J", "K"],
  G: ["A", "E", "H", "I", "J"],
  D: ["B", "E", "F", "I", "J"],
  B: ["E", "F", "G", "I", "J"],
  K: ["D", "E", "I", "J", "L"]
};

// Matches the 8 advancing third place teams to the 8 group winners who play against 3rd-placed teams
export const pairThirdPlaceTeams = (top8ThirdPlaceTeams) => {
  const winners = ["E", "I", "A", "L", "G", "D", "B", "K"];
  const result = {}; // winnerGroupLetter -> thirdPlaceTeamObject
  
  const used = new Set();

  const solve = (index) => {
    if (index === winners.length) return true;
    
    const w = winners[index];
    const allowedGroups = compatibility[w];

    for (let i = 0; i < top8ThirdPlaceTeams.length; i++) {
      const t = top8ThirdPlaceTeams[i];
      if (used.has(t.id)) continue;

      // Check compatibility
      if (allowedGroups.includes(t.groupLetter) && t.groupLetter !== w) {
        used.add(t.id);
        result[w] = t;
        if (solve(index + 1)) return true;
        used.delete(t.id);
        delete result[w];
      }
    }
    return false;
  };

  // Run backtracking
  const success = solve(0);

  // If strict backtracking fails, use a fallback greedy matching that just prevents a team playing their own group
  if (!success) {
    used.clear();
    winners.forEach(w => {
      const match = top8ThirdPlaceTeams.find(t => !used.has(t.id) && t.groupLetter !== w);
      if (match) {
        used.add(match.id);
        result[w] = match;
      } else {
        // Ultimate fallback
        const anyMatch = top8ThirdPlaceTeams.find(t => !used.has(t.id));
        if (anyMatch) {
          used.add(anyMatch.id);
          result[w] = anyMatch;
        }
      }
    });
  }

  return result;
};
