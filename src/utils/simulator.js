import { players } from "../data/players.js";
import { teams } from "../data/teams.js";

// Seedable PRNG to ensure match simulations are 100% deterministic based on Match ID + Scores
const createRng = (seedStr) => {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

export const simulateMatchEvents = (matchId, homeTeamId, awayTeamId, homeScore, awayScore) => {
  const seed = `${matchId}-${homeTeamId}-${awayTeamId}-${homeScore}-${awayScore}`;
  const rng = createRng(seed);

  const homeTeam = teams.find(t => t.id === homeTeamId);
  const awayTeam = teams.find(t => t.id === awayTeamId);

  const homePlayers = players.filter(p => p.nation === homeTeamId);
  const awayPlayers = players.filter(p => p.nation === awayTeamId);

  const events = [];
  const playerPoints = {};

  const initPlayerPoints = (player, opponentRating, oppGoals) => {
    return {
      playerId: player.id,
      name: player.name,
      nation: player.nation,
      position: player.position,
      goals: 0,
      assists: 0,
      cleanSheet: false,
      minutes: 90, // default
      saves: 0,
      penaltySaves: 0,
      yellowCards: 0,
      redCards: 0,
      conceded: oppGoals,
      ownGoals: 0,
      penaltyMisses: 0,
      bonus: 0,
      totalPoints: 0,
      eventsLog: []
    };
  };

  // Initialize points for all players
  homePlayers.forEach(p => { playerPoints[p.id] = initPlayerPoints(p, awayTeam?.ranking || 50, awayScore); });
  awayPlayers.forEach(p => { playerPoints[p.id] = initPlayerPoints(p, homeTeam?.ranking || 50, homeScore); });

  // Simulate minutes played (most starters play 90, some subbed out)
  const simulateMinutes = (playerList) => {
    playerList.forEach(p => {
      const stats = playerPoints[p.id];
      const roll = rng();
      if (roll < 0.1) {
        stats.minutes = Math.floor(rng() * 58) + 1; // 1 to 59 mins
        stats.eventsLog.push(`Played ${stats.minutes} mins (+1 pt)`);
      } else {
        stats.minutes = 90;
        stats.eventsLog.push(`Played 90 mins (+2 pts)`);
      }
    });
  };

  simulateMinutes(homePlayers);
  simulateMinutes(awayPlayers);

  // Helper to pick a player based on weighted estimated stats
  const pickPlayerForAction = (playerList, actionType, rngFunc) => {
    const activeStarters = playerList.filter(p => playerPoints[p.id].minutes > 0);
    if (activeStarters.length === 0) return null;

    const weights = activeStarters.map(p => {
      if (actionType === "goal") {
        if (p.position === "FWD") return (p.goalsEst || 0.6) * 3;
        if (p.position === "MID") return (p.goalsEst || 0.3) * 2;
        return (p.goalsEst || 0.1) * 1;
      } else { // assist
        if (p.position === "MID") return (p.assistsEst || 0.4) * 3;
        if (p.position === "FWD") return (p.assistsEst || 0.2) * 2;
        return (p.assistsEst || 0.1) * 1;
      }
    });

    const sum = weights.reduce((a, b) => a + b, 0);
    let r = rngFunc() * sum;
    for (let i = 0; i < activeStarters.length; i++) {
      r -= weights[i];
      if (r <= 0) return activeStarters[i];
    }
    return activeStarters[0];
  };

  // Simulate Goals and Assists
  const handleGoals = (score, attackingPlayers, defendingPlayers, defTeamId) => {
    const goalkeeper = defendingPlayers.find(p => p.position === "GK");
    for (let g = 0; g < score; g++) {
      const minute = Math.floor(rng() * 90) + 1;
      
      // Check for own goal (2% chance)
      if (rng() < 0.02) {
        const nonGk = defendingPlayers.filter(p => p.position !== "GK");
        const defPlayer = nonGk.length > 0 
          ? nonGk[Math.floor(rng() * nonGk.length)] 
          : defendingPlayers[0];
          
        if (!defPlayer) continue;

        events.push({
          minute,
          type: "own_goal",
          detail: `Own Goal by ${defPlayer.name} (${defTeamId})`,
          team: defTeamId
        });
        playerPoints[defPlayer.id].ownGoals += 1;
        playerPoints[defPlayer.id].eventsLog.push(`Own Goal at ${minute}' (-2 pts)`);
        continue;
      }

      const scorer = pickPlayerForAction(attackingPlayers, "goal", rng);
      if (!scorer) continue;

      playerPoints[scorer.id].goals += 1;
      let assistDetail = "";
      let assister = null;

      // 70% chance of assist
      if (rng() < 0.7) {
        const potentialAssisters = attackingPlayers.filter(p => p.id !== scorer.id);
        assister = pickPlayerForAction(potentialAssisters, "assist", rng);
        if (assister) {
          playerPoints[assister.id].assists += 1;
          playerPoints[assister.id].eventsLog.push(`Assist at ${minute}' (+3 pts)`);
          assistDetail = `, Assist by ${assister.name}`;
        }
      }

      events.push({
        minute,
        type: "goal",
        detail: `Goal by ${scorer.name}${assistDetail}`,
        team: scorer.nation,
        scorerId: scorer.id,
        assisterId: assister?.id || null
      });

      const goalPoints = (scorer.position === "DEF" || scorer.position === "GK") ? 8 : 6;
      playerPoints[scorer.id].eventsLog.push(`Goal at ${minute}' (+${goalPoints} pts)`);
    }
  };

  handleGoals(homeScore, homePlayers, awayPlayers, awayTeamId);
  handleGoals(awayScore, awayPlayers, homePlayers, homeTeamId);

  // Simulate GK Saves
  const simulateGk = (gkPlayer, oppScore) => {
    if (!gkPlayer) return;
    const stats = playerPoints[gkPlayer.id];
    // Base saves: 1 to 5, plus extra depending on opponent score
    const savesCount = Math.floor(rng() * 4) + 1 + Math.max(0, Math.floor(oppScore * 0.5));
    stats.saves = savesCount;
    stats.eventsLog.push(`Made ${savesCount} saves (+${Math.floor(savesCount / 3)} pts)`);

    // Penalty save (3% chance if conceded > 0)
    if (oppScore > 0 && rng() < 0.03) {
      stats.penaltySaves += 1;
      stats.eventsLog.push(`Penalty Save! (+5 pts)`);
      events.push({
        minute: Math.floor(rng() * 85) + 5,
        type: "penalty_save",
        detail: `Penalty Saved by ${gkPlayer.name}`,
        team: gkPlayer.nation
      });
    }
  };

  simulateGk(homePlayers.find(p => p.position === "GK"), awayScore);
  simulateGk(awayPlayers.find(p => p.position === "GK"), homeScore);

  // Cards, penalty misses, clean sheets
  const applyDefensiveStats = (playerList, oppScore, oppTeam) => {
    playerList.forEach(p => {
      const stats = playerPoints[p.id];
      
      // Clean sheet points (must play 90 mins and concede 0)
      if (oppScore === 0 && stats.minutes === 90) {
        stats.cleanSheet = true;
        let csPoints = 1;
        if (p.position === "GK" || p.position === "DEF") csPoints = 4;
        else if (p.position === "MID") csPoints = 2;
        stats.eventsLog.push(`Clean Sheet (+${csPoints} pts)`);
      }

      // Conceded points (GK/DEF only, -1 per 2 goals)
      if ((p.position === "GK" || p.position === "DEF") && oppScore >= 2) {
        const concededMinus = Math.floor(oppScore / 2);
        stats.eventsLog.push(`Conceded ${oppScore} goals (-${concededMinus} pts)`);
      }

      // Yellow cards (15% for MID/DEF, 8% for FWD)
      const ycChance = (p.position === "DEF" || p.position === "MID") ? 0.15 : 0.08;
      if (rng() < ycChance) {
        stats.yellowCards = 1;
        stats.eventsLog.push(`Yellow Card (-1 pt)`);
        
        // Red card from double yellow or straight red (1.5% chance)
        if (rng() < 0.015) {
          stats.redCards = 1;
          stats.eventsLog.push(`Red Card (-3 pts)`);
          events.push({
            minute: Math.floor(rng() * 40) + 50,
            type: "red_card",
            detail: `Red Card: ${p.name}`,
            team: p.nation
          });
        }
      }

      // Penalty missed (1% chance for attackers)
      if ((p.position === "FWD" || p.position === "MID") && rng() < 0.01) {
        stats.penaltyMisses += 1;
        stats.eventsLog.push(`Penalty Missed! (-2 pts)`);
        events.push({
          minute: Math.floor(rng() * 80) + 10,
          type: "penalty_miss",
          detail: `Penalty Missed by ${p.name}`,
          team: p.nation
        });
      }
    });
  };

  applyDefensiveStats(homePlayers, awayScore, awayTeam);
  applyDefensiveStats(awayPlayers, homeScore, homeTeam);

  // Sort events timeline chronologically
  events.sort((a, b) => a.minute - b.minute);

  // Calculate Points summation
  const allSquadPlayers = [...homePlayers, ...awayPlayers];
  allSquadPlayers.forEach(p => {
    const stats = playerPoints[p.id];
    let pt = 0;

    // Appearance
    if (stats.minutes >= 60) pt += 2;
    else if (stats.minutes > 0) pt += 1;

    // Goals
    const goalVal = (p.position === "DEF" || p.position === "GK") ? 8 : 6;
    pt += stats.goals * goalVal;

    // Assists
    pt += stats.assists * 3;

    // Clean sheet
    if (stats.cleanSheet) {
      if (p.position === "GK" || p.position === "DEF") pt += 4;
      else if (p.position === "MID") pt += 2;
      else if (p.position === "FWD") pt += 1;
    }

    // GK Saves
    if (p.position === "GK") {
      pt += Math.floor(stats.saves / 3);
      pt += stats.penaltySaves * 5;
    }

    // Conceded (-1 per 2 goals)
    if (p.position === "GK" || p.position === "DEF") {
      pt -= Math.floor(stats.conceded / 2);
    }

    // Yellow / Red
    pt -= stats.yellowCards * 1;
    pt -= stats.redCards * 3;

    // Own Goals
    pt -= stats.ownGoals * 2;

    // Penalty Missed
    pt -= stats.penaltyMisses * 2;

    stats.totalPoints = pt;
  });

  // Calculate Bonus Points (Man of the Match, Upset Scorer)
  let bestPlayerId = null;
  let maxPoints = -999;
  
  allSquadPlayers.forEach(p => {
    const stats = playerPoints[p.id];
    if (stats.totalPoints > maxPoints) {
      maxPoints = stats.totalPoints;
      bestPlayerId = p.id;
    }
  });

  if (bestPlayerId && maxPoints > 0) {
    playerPoints[bestPlayerId].bonus += 3;
    playerPoints[bestPlayerId].totalPoints += 3;
    playerPoints[bestPlayerId].eventsLog.push("Man of the Match (+3 pts)");
  }

  // Upset Scorer check (Goal scored vs top-10 team by team ranked > 20)
  const checkUpset = (playersList, opponentTeam) => {
    if (opponentTeam && opponentTeam.ranking <= 10) {
      playersList.forEach(p => {
        const ownTeam = teams.find(t => t.id === p.nation);
        if (ownTeam && ownTeam.ranking > 20) {
          const stats = playerPoints[p.id];
          if (stats.goals > 0) {
            stats.bonus += 2;
            stats.totalPoints += 2;
            stats.eventsLog.push("Surprise Upset Scorer (+2 pts)");
          }
        }
      });
    }
  };

  checkUpset(homePlayers, awayTeam);
  checkUpset(awayPlayers, homeTeam);

  return {
    events,
    playerPoints
  };
};
