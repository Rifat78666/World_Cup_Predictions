import React, { createContext, useContext, useState, useEffect } from "react";
import { players } from "../data/players.js";
import { usePredictor } from "./PredictorContext.jsx";
import { simulateMatchEvents } from "../utils/simulator.js";

const FantasyContext = createContext();

const MOCK_BOTS = [
  { id: "bot1", username: "GrealishHairline", squadName: "Vini Vici Vidi", baseOffset: 12 },
  { id: "bot2", username: "Bellingham_Fan", squadName: "Hey Jude", baseOffset: -8 },
  { id: "bot3", username: "GoldenBootHunter", squadName: "Mbappe Speed", baseOffset: 25 },
  { id: "bot4", username: "TacticalMaster", squadName: "Xabi Ball", baseOffset: -18 },
  { id: "bot5", username: "TikiTakaDream", squadName: "Yamal Control", baseOffset: 4 },
  { id: "bot6", username: "KaneTrophyHunt", squadName: "No Trophy Yet", baseOffset: -30 }
];

export const FantasyProvider = ({ children }) => {
  const { matchesPredictList } = usePredictor();

  // Fantasy Squad state: list of player IDs (max 15)
  const [squad, setSquad] = useState(() => {
    const saved = localStorage.getItem("wc_fantasy_squad");
    return saved ? JSON.parse(saved) : [];
  });

  const [captain, setCaptain] = useState(() => {
    return localStorage.getItem("wc_fantasy_captain") || "";
  });

  const [viceCaptain, setViceCaptain] = useState(() => {
    return localStorage.getItem("wc_fantasy_vice_captain") || "";
  });

  const [formation, setFormation] = useState(() => {
    return localStorage.getItem("wc_fantasy_formation") || "4-3-3";
  });

  const [wildcardUsed, setWildcardUsed] = useState(() => {
    return localStorage.getItem("wc_fantasy_wildcard") === "true";
  });

  const [transfersMade, setTransfersMade] = useState(() => {
    return parseInt(localStorage.getItem("wc_fantasy_transfers") || "0", 10);
  });

  const [leagues, setLeagues] = useState(() => {
    const saved = localStorage.getItem("wc_fantasy_leagues");
    return saved ? JSON.parse(saved) : [
      { code: "GLOBAL", name: "Global League", isDefault: true },
      { code: "USA2026", name: "Host Country Fan Club", isDefault: false }
    ];
  });

  // Calculate remaining budget
  const squadPlayers = players.filter(p => squad.includes(p.id));
  const spentCredits = squadPlayers.reduce((sum, p) => sum + p.cost, 0);
  const budget = 100 - spentCredits;

  useEffect(() => {
    localStorage.setItem("wc_fantasy_squad", JSON.stringify(squad));
  }, [squad]);

  useEffect(() => {
    localStorage.setItem("wc_fantasy_captain", captain);
  }, [captain]);

  useEffect(() => {
    localStorage.setItem("wc_fantasy_vice_captain", viceCaptain);
  }, [viceCaptain]);

  useEffect(() => {
    localStorage.setItem("wc_fantasy_formation", formation);
  }, [formation]);

  useEffect(() => {
    localStorage.setItem("wc_fantasy_wildcard", wildcardUsed.toString());
  }, [wildcardUsed]);

  useEffect(() => {
    localStorage.setItem("wc_fantasy_transfers", transfersMade.toString());
  }, [transfersMade]);

  useEffect(() => {
    localStorage.setItem("wc_fantasy_leagues", JSON.stringify(leagues));
  }, [leagues]);

  // Squad drafting & management actions
  const addPlayerToSquad = (playerId) => {
    const p = players.find(x => x.id === playerId);
    if (!p) return { success: false, error: "Player not found" };

    if (squad.includes(playerId)) {
      return { success: false, error: "Player already in squad" };
    }

    if (squad.length >= 15) {
      return { success: false, error: "Squad is full (max 15 players)" };
    }

    if (budget < p.cost) {
      return { success: false, error: "Insufficient budget credits" };
    }

    // Limit check: Max 3 players from same nation
    const countNation = squadPlayers.filter(x => x.nation === p.nation).length;
    if (countNation >= 3) {
      return { success: false, error: `Max 3 players allowed from a single nation (${p.nation})` };
    }

    // Limit check by position
    const posCounts = squadPlayers.reduce((acc, x) => {
      acc[x.position] = (acc[x.position] || 0) + 1;
      return acc;
    }, { GK: 0, DEF: 0, MID: 0, FWD: 0 });

    const maxPos = { GK: 2, DEF: 5, MID: 5, FWD: 3 };
    if (posCounts[p.position] >= maxPos[p.position]) {
      return { success: false, error: `Position limit reached for ${p.position} (max ${maxPos[p.position]})` };
    }

    setSquad(prev => [...prev, playerId]);
    
    // Automatically make first GK captain and first FWD vice-captain if empty
    if (!captain) setCaptain(playerId);
    else if (!viceCaptain && captain !== playerId) setViceCaptain(playerId);

    return { success: true };
  };

  const removePlayerFromSquad = (playerId) => {
    setSquad(prev => prev.filter(id => id !== playerId));
    if (captain === playerId) setCaptain("");
    if (viceCaptain === playerId) setViceCaptain("");
  };

  const clearSquad = () => {
    setSquad([]);
    setCaptain("");
    setViceCaptain("");
  };

  // Run live point calculation across all predicted matches
  const getFantasyPoints = () => {
    let totalPoints = 0;
    const matchBreakdowns = {}; // matchId -> simulatedResults
    const playerPointsSummary = {}; // playerId -> { points, goals, assists, cs, saves, cards, breakdownDetails }

    // Initialize summaries
    squad.forEach(id => {
      const p = players.find(x => x.id === id);
      playerPointsSummary[id] = {
        id,
        name: p?.name || "",
        position: p?.position || "",
        nation: p?.nation || "",
        totalPoints: 0,
        goals: 0,
        assists: 0,
        saves: 0,
        cleanSheet: false,
        eventsLog: []
      };
    });

    // Process all predicted matches
    matchesPredictList.forEach(m => {
      if (m.homeScore !== "" && m.awayScore !== "" && m.homeScore !== null && m.awayScore !== null) {
        const sim = simulateMatchEvents(m.id, m.home, m.away, m.homeScore, m.awayScore);
        matchBreakdowns[m.id] = {
          events: sim.events,
          playerPoints: sim.playerPoints,
          homeTeam: m.home,
          awayTeam: m.away,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          round: m.round
        };

        // If any squad player played in this match, add points
        squad.forEach(id => {
          if (sim.playerPoints[id]) {
            const stats = sim.playerPoints[id];
            const summary = playerPointsSummary[id];

            summary.goals += stats.goals;
            summary.assists += stats.assists;
            summary.saves += stats.saves;
            if (stats.cleanSheet) summary.cleanSheet = true;
            summary.eventsLog = [...summary.eventsLog, ...stats.eventsLog.map(log => `[${m.round}] ${log}`)];

            // Apply captain multipliers
            let pts = stats.totalPoints;
            if (id === captain) {
              pts = pts * 2;
              summary.eventsLog.push(`[Captain Bonus] Doubled match points (Total: +${pts} pts)`);
            } else if (id === viceCaptain) {
              // Checks if captain played in this match. If captain was not in the home/away team of this match, vice-captain gets 1.5x
              const capPlayer = players.find(x => x.id === captain);
              const capInMatch = capPlayer && (capPlayer.nation === m.home || capPlayer.nation === m.away);
              if (!capInMatch || !sim.playerPoints[captain] || sim.playerPoints[captain].minutes === 0) {
                pts = Math.floor(pts * 1.5);
                summary.eventsLog.push(`[Vice-Captain Bonus] Captain did not play, 1.5x points applied (Total: +${pts} pts)`);
              }
            }

            summary.totalPoints += pts;
            totalPoints += pts;
          }
        });
      }
    });

    // Deduct transfer penalties if transfersMade > free limit
    // We assume 1 free transfer per round. If transfers > 4 (say, after R32, R16, QF, SF), they cost -4.
    // Let's assume a simple rule: users get 5 free transfers total. Extra transfers cost -4 pts.
    const freeTransfers = wildcardUsed ? 999 : 5;
    const penalty = transfersMade > freeTransfers ? (transfersMade - freeTransfers) * -4 : 0;
    totalPoints += penalty;

    return {
      totalPoints,
      penalty,
      playerPointsSummary,
      matchBreakdowns
    };
  };

  const fantasyPointsResults = getFantasyPoints();

  // Mini Leagues Actions
  const createMiniLeague = (name) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newLeague = { code, name, isDefault: false };
    setLeagues(prev => [...prev, newLeague]);
    return code;
  };

  const joinMiniLeague = (code) => {
    const uppercaseCode = code.toUpperCase().trim();
    if (leagues.find(l => l.code === uppercaseCode)) {
      return { success: false, error: "You are already in this league!" };
    }
    // Check code length
    if (uppercaseCode.length !== 6) {
      return { success: false, error: "Invalid invite code. Must be 6 alphanumeric characters." };
    }
    const newLeague = { code: uppercaseCode, name: `League ${uppercaseCode}`, isDefault: false };
    setLeagues(prev => [...prev, newLeague]);
    return { success: true };
  };

  // Generate Leaderboard
  const getLeaderboard = () => {
    const userScore = fantasyPointsResults.totalPoints;
    
    const board = [
      { rank: 1, username: "You", squadName: "My Predictions FC", gwPoints: userScore, totalPoints: userScore, transfers: transfersMade, isUser: true }
    ];

    MOCK_BOTS.forEach(bot => {
      // Bot points fluctuate deterministically based on user's score to make it competitive
      const score = Math.max(0, userScore + bot.baseOffset);
      board.push({
        rank: 0,
        username: bot.username,
        squadName: bot.squadName,
        gwPoints: score,
        totalPoints: score,
        transfers: Math.floor(Math.random() * 6),
        isUser: false
      });
    });

    // Sort leaderboard by totalPoints descending
    board.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Assign ranks
    board.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    return board;
  };

  const leaderboard = getLeaderboard();

  return (
    <FantasyContext.Provider
      value={{
        squad,
        squadPlayers,
        budget,
        spentCredits,
        captain,
        viceCaptain,
        formation,
        wildcardUsed,
        transfersMade,
        leagues,
        leaderboard,
        fantasyPointsResults,
        addPlayerToSquad,
        removePlayerFromSquad,
        clearSquad,
        setCaptain,
        setViceCaptain,
        setFormation,
        setWildcardUsed,
        setTransfersMade,
        createMiniLeague,
        joinMiniLeague
      }}
    >
      {children}
    </FantasyContext.Provider>
  );
};

export const useFantasy = () => useContext(FantasyContext);
