import React, { createContext, useContext, useState, useEffect } from "react";
import { fixtures as initialFixtures } from "../data/fixtures.js";
import { teams } from "../data/teams.js";
import {
  calculateGroupStandings,
  calculateThirdPlaceStandings,
  pairThirdPlaceTeams
} from "../utils/engine.js";

const PredictorContext = createContext();

export const PredictorProvider = ({ children }) => {
  // Store group fixtures with user predictions
  const [groupFixtures, setGroupFixtures] = useState(() => {
    const saved = localStorage.getItem("wc_group_fixtures");
    return saved ? JSON.parse(saved) : initialFixtures;
  });

  // Store knockout match predictions: matchId -> { homeTeam, awayTeam, homeScore, awayScore, winner }
  const [knockoutPredictions, setKnockoutPredictions] = useState(() => {
    const saved = localStorage.getItem("wc_knockout_predictions");
    return saved ? JSON.parse(saved) : {};
  });

  // Calculate standings
  const [groupStandings, setGroupStandings] = useState({});
  const [thirdPlaceStandings, setThirdPlaceStandings] = useState([]);
  const [top8ThirdPlace, setTop8ThirdPlace] = useState([]);
  const [thirdPlacePairings, setThirdPlacePairings] = useState({});

  useEffect(() => {
    localStorage.setItem("wc_group_fixtures", JSON.stringify(groupFixtures));
    
    // Recalculate standings for all groups
    const standings = {};
    const groupLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    
    groupLetters.forEach(letter => {
      const groupFix = groupFixtures.filter(f => f.group === letter);
      standings[letter] = calculateGroupStandings(letter, groupFix);
    });
    
    setGroupStandings(standings);

    // Calculate third-place standings
    const thirdStandings = calculateThirdPlaceStandings(standings);
    setThirdPlaceStandings(thirdStandings);

    const top8 = thirdStandings.slice(0, 8);
    setTop8ThirdPlace(top8);

    // Pair third place teams with group winners
    if (top8.length === 8) {
      const pairings = pairThirdPlaceTeams(top8);
      setThirdPlacePairings(pairings);
    } else {
      setThirdPlacePairings({});
    }
  }, [groupFixtures]);

  useEffect(() => {
    localStorage.setItem("wc_knockout_predictions", JSON.stringify(knockoutPredictions));
  }, [knockoutPredictions]);

  // Update a single group stage prediction
  const updateGroupPrediction = (matchId, homeScore, awayScore) => {
    setGroupFixtures(prev =>
      prev.map(fix =>
        fix.id === matchId
          ? { ...fix, homeScore: homeScore === "" ? "" : parseInt(homeScore, 10), awayScore: awayScore === "" ? "" : parseInt(awayScore, 10) }
          : fix
      )
    );
  };

  // Reset all group predictions
  const resetAllPredictions = () => {
    setGroupFixtures(initialFixtures);
    setKnockoutPredictions({});
  };

  // Autocomplete all group matches with random scores for easy testing
  const autoPredictGroupMatches = () => {
    setGroupFixtures(prev =>
      prev.map(fix => {
        const homeScore = Math.floor(Math.random() * 4);
        const awayScore = Math.floor(Math.random() * 4);
        return { ...fix, homeScore, awayScore };
      })
    );
  };

  // Get active teams for the Round of 32 based on group standing calculation
  const getRoundOf32Teams = () => {
    const r32Teams = {};

    const getWinner = (g) => groupStandings[g]?.[0]?.id || `Winner ${g}`;
    const getRunnerUp = (g) => groupStandings[g]?.[1]?.id || `Runner-up ${g}`;
    const getThirdPlaced = (g) => thirdPlacePairings[g]?.id || `3rd ${g}`;

    // R32 Pairings (M1 to M16)
    r32Teams[1] = { home: getRunnerUp("A"), away: getRunnerUp("B") };
    r32Teams[2] = { home: getWinner("C"), away: getRunnerUp("F") };
    r32Teams[3] = { home: getWinner("E"), away: getThirdPlaced("E") };
    r32Teams[4] = { home: getWinner("F"), away: getRunnerUp("C") };
    r32Teams[5] = { home: getRunnerUp("E"), away: getRunnerUp("I") };
    r32Teams[6] = { home: getWinner("I"), away: getThirdPlaced("I") };
    r32Teams[7] = { home: getWinner("A"), away: getThirdPlaced("A") };
    r32Teams[8] = { home: getWinner("L"), away: getThirdPlaced("L") };
    r32Teams[9] = { home: getWinner("G"), away: getThirdPlaced("G") };
    r32Teams[10] = { home: getWinner("D"), away: getThirdPlaced("D") };
    r32Teams[11] = { home: getWinner("H"), away: getRunnerUp("J") };
    r32Teams[12] = { home: getRunnerUp("K"), away: getRunnerUp("L") };
    r32Teams[13] = { home: getWinner("B"), away: getThirdPlaced("B") };
    r32Teams[14] = { home: getRunnerUp("D"), away: getRunnerUp("G") };
    r32Teams[15] = { home: getWinner("J"), away: getRunnerUp("H") };
    r32Teams[16] = { home: getWinner("K"), away: getThirdPlaced("K") };

    return r32Teams;
  };

  // Get active teams for all knockout rounds dynamically
  const getKnockoutMatches = () => {
    const r32 = getRoundOf32Teams();
    const matches = {
      r32: {},
      r16: {},
      qf: {},
      sf: {},
      thirdPlace: {},
      final: {}
    };

    // Helper to resolve the winner of a match
    const getMatchWinner = (roundKey, matchNum, fallbackHome, fallbackAway) => {
      const pred = knockoutPredictions[`${roundKey}_${matchNum}`];
      if (pred?.winner) return pred.winner;
      
      // Automatic fallback if scores entered
      if (pred && pred.homeScore !== "" && pred.awayScore !== "") {
        const hs = parseInt(pred.homeScore, 10);
        const as = parseInt(pred.awayScore, 10);
        if (hs > as) return pred.homeTeam;
        if (as > hs) return pred.awayTeam;
      }
      return null;
    };

    const getMatchLoser = (roundKey, matchNum, fallbackHome, fallbackAway) => {
      const pred = knockoutPredictions[`${roundKey}_${matchNum}`];
      const win = getMatchWinner(roundKey, matchNum, fallbackHome, fallbackAway);
      if (!win) return null;
      return win === pred?.homeTeam ? pred?.awayTeam : pred?.homeTeam;
    };

    // Populate R32
    for (let i = 1; i <= 16; i++) {
      const pred = knockoutPredictions[`r32_${i}`] || {};
      matches.r32[i] = {
        id: `r32_${i}`,
        homeTeam: r32[i]?.home || `Home R32-${i}`,
        awayTeam: r32[i]?.away || `Away R32-${i}`,
        homeScore: pred.homeScore ?? "",
        awayScore: pred.awayScore ?? "",
        winner: pred.winner || getMatchWinner("r32", i)
      };
    }

    // Populate R16 (Matches 17 to 24)
    const r16Pairings = [
      [1, 2], [3, 4], [5, 6], [7, 8],
      [9, 10], [11, 12], [13, 14], [15, 16]
    ];
    r16Pairings.forEach((pair, idx) => {
      const matchNum = idx + 17;
      const t1 = getMatchWinner("r32", pair[0]);
      const t2 = getMatchWinner("r32", pair[1]);
      const pred = knockoutPredictions[`r16_${matchNum}`] || {};
      matches.r16[matchNum] = {
        id: `r16_${matchNum}`,
        homeTeam: t1 || `Winner M${pair[0]}`,
        awayTeam: t2 || `Winner M${pair[1]}`,
        homeScore: pred.homeScore ?? "",
        awayScore: pred.awayScore ?? "",
        winner: pred.winner || getMatchWinner("r16", matchNum)
      };
    });

    // Populate QF (Matches 25 to 28)
    const qfPairings = [
      [17, 18], [19, 20], [21, 22], [23, 24]
    ];
    qfPairings.forEach((pair, idx) => {
      const matchNum = idx + 25;
      const t1 = getMatchWinner("r16", pair[0]);
      const t2 = getMatchWinner("r16", pair[1]);
      const pred = knockoutPredictions[`qf_${matchNum}`] || {};
      matches.qf[matchNum] = {
        id: `qf_${matchNum}`,
        homeTeam: t1 || `Winner M${pair[0]}`,
        awayTeam: t2 || `Winner M${pair[1]}`,
        homeScore: pred.homeScore ?? "",
        awayScore: pred.awayScore ?? "",
        winner: pred.winner || getMatchWinner("qf", matchNum)
      };
    });

    // Populate SF (Matches 29 to 30)
    const sfPairings = [
      [25, 26], [27, 28]
    ];
    sfPairings.forEach((pair, idx) => {
      const matchNum = idx + 29;
      const t1 = getMatchWinner("qf", pair[0]);
      const t2 = getMatchWinner("qf", pair[1]);
      const pred = knockoutPredictions[`sf_${matchNum}`] || {};
      matches.sf[matchNum] = {
        id: `sf_${matchNum}`,
        homeTeam: t1 || `Winner M${pair[0]}`,
        awayTeam: t2 || `Winner M${pair[1]}`,
        homeScore: pred.homeScore ?? "",
        awayScore: pred.awayScore ?? "",
        winner: pred.winner || getMatchWinner("sf", matchNum)
      };
    });

    // Populate Third Place (Match 31)
    const l1 = getMatchLoser("sf", 29);
    const l2 = getMatchLoser("sf", 30);
    const pred3rd = knockoutPredictions["thirdPlace_31"] || {};
    matches.thirdPlace[31] = {
      id: "thirdPlace_31",
      homeTeam: l1 || "Loser M29",
      awayTeam: l2 || "Loser M30",
      homeScore: pred3rd.homeScore ?? "",
      awayScore: pred3rd.awayScore ?? "",
      winner: pred3rd.winner || getMatchWinner("thirdPlace", 31)
    };

    // Populate Final (Match 32)
    const f1 = getMatchWinner("sf", 29);
    const f2 = getMatchWinner("sf", 30);
    const predFinal = knockoutPredictions["final_32"] || {};
    matches.final[32] = {
      id: "final_32",
      homeTeam: f1 || "Finalist 1",
      awayTeam: f2 || "Finalist 2",
      homeScore: predFinal.homeScore ?? "",
      awayScore: predFinal.awayScore ?? "",
      winner: predFinal.winner || getMatchWinner("final", 32)
    };

    return matches;
  };

  const updateKnockoutPrediction = (roundKey, matchNum, data) => {
    const key = `${roundKey}_${matchNum}`;
    setKnockoutPredictions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...data
      }
    }));
  };

  const activeKnockoutMatches = getKnockoutMatches();

  // Get list of all predicted matches for fantasy calculations
  const getAllMatchesPredictList = () => {
    const list = [];
    
    // Group fixtures
    groupFixtures.forEach(f => {
      list.push({
        id: `group_${f.id}`,
        home: f.home,
        away: f.away,
        homeScore: f.homeScore,
        awayScore: f.awayScore,
        type: "group",
        round: "Group Stage"
      });
    });

    // Helper to push knockout lists
    const pushKnockoutList = (roundKey, roundLabel) => {
      const roundMatches = activeKnockoutMatches[roundKey];
      Object.keys(roundMatches).forEach(matchNum => {
        const m = roundMatches[matchNum];
        list.push({
          id: `${roundKey}_${matchNum}`,
          home: m.homeTeam,
          away: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          type: "knockout",
          round: roundLabel
        });
      });
    };

    pushKnockoutList("r32", "Round of 32");
    pushKnockoutList("r16", "Round of 16");
    pushKnockoutList("qf", "Quarter-Finals");
    pushKnockoutList("sf", "Semi-Finals");
    pushKnockoutList("thirdPlace", "Third Place");
    pushKnockoutList("final", "Final");

    return list;
  };

  const matchesPredictList = getAllMatchesPredictList();

  return (
    <PredictorContext.Provider
      value={{
        groupFixtures,
        groupStandings,
        thirdPlaceStandings,
        top8ThirdPlace,
        thirdPlacePairings,
        knockoutPredictions,
        activeKnockoutMatches,
        matchesPredictList,
        updateGroupPrediction,
        updateKnockoutPrediction,
        resetAllPredictions,
        autoPredictGroupMatches
      }}
    >
      {children}
    </PredictorContext.Provider>
  );
};

export const usePredictor = () => useContext(PredictorContext);
