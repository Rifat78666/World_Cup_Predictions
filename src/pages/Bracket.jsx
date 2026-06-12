import React, { useState, useEffect } from "react";
import { usePredictor } from "../context/PredictorContext.jsx";
import { teams } from "../data/teams.js";
import { Trophy, HelpCircle, Star, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export default function Bracket() {
  const {
    activeKnockoutMatches,
    updateKnockoutPrediction
  } = usePredictor();

  const [activeRoundTab, setActiveRoundTab] = useState("r32");
  const [champion, setChampion] = useState(null);

  const getTeam = (id) => {
    return teams.find(x => x.id === id) || { name: id, flag: "🏳️" };
  };

  // Check if champion is predicted, trigger confetti
  const finalMatch = activeKnockoutMatches.final?.[32];
  
  useEffect(() => {
    if (finalMatch) {
      const pred = finalMatch;
      let winnerId = pred.winner;
      if (!winnerId && pred.homeScore !== "" && pred.awayScore !== "") {
        const hs = parseInt(pred.homeScore, 10);
        const as = parseInt(pred.awayScore, 10);
        if (hs > as) winnerId = pred.homeTeam;
        else if (as > hs) winnerId = pred.awayTeam;
      }
      
      if (winnerId && winnerId !== "Finalist 1" && winnerId !== "Finalist 2") {
        setChampion(getTeam(winnerId));
        // Confetti!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        setChampion(null);
      }
    }
  }, [finalMatch]);

  const handleScoreChange = (roundKey, matchId, isHome, val) => {
    const numericVal = val === "" ? "" : parseInt(val, 10);
    const scoreKey = isHome ? "homeScore" : "awayScore";
    
    updateKnockoutPrediction(roundKey, matchId, { [scoreKey]: numericVal });
  };

  const selectWinner = (roundKey, matchId, teamId) => {
    if (!teamId || teamId.includes("Winner") || teamId.includes("Runner") || teamId.includes("3rd") || teamId.includes("Finalist")) return;
    updateKnockoutPrediction(roundKey, matchId, { winner: teamId });
  };

  const rounds = [
    { id: "r32", label: "Round of 32", matchesCount: 16 },
    { id: "r16", label: "Round of 16", matchesCount: 8 },
    { id: "qf", label: "Quarter-Finals", matchesCount: 4 },
    { id: "sf", label: "Semi-Finals", matchesCount: 2 },
    { id: "final", label: "Final & 3rd Place", matchesCount: 2 }
  ];

  // Helper to render a match card
  const renderMatchCard = (roundKey, matchId, showHeading = false) => {
    const match = activeKnockoutMatches[roundKey]?.[matchId] || {
      homeTeam: "TBD",
      awayTeam: "TBD",
      homeScore: "",
      awayScore: "",
      winner: null
    };

    const homeTeam = getTeam(match.homeTeam);
    const awayTeam = getTeam(match.awayTeam);

    const isWinnerHome = match.winner === match.homeTeam;
    const isWinnerAway = match.winner === match.awayTeam;

    return (
      <div key={matchId} className="w-full rounded-2xl bg-card border border-border p-3 space-y-2.5 transition duration-150 hover:border-indigo-500/40 relative">
        <div className="flex justify-between items-center text-[10px] text-muted font-bold tracking-wider uppercase">
          <span>Match #{matchId}</span>
          <span className="text-indigo-600 dark:text-indigo-400">Click name to advance</span>
        </div>

        <div className="space-y-1.5">
          {/* Home Team */}
          <div 
            onClick={() => selectWinner(roundKey, matchId, match.homeTeam)}
            className={`flex items-center justify-between rounded-xl px-2 py-1.5 cursor-pointer transition ${
              isWinnerHome 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20" 
                : "hover:bg-muted-foreground/5"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-xl">{homeTeam.flag}</span>
              <span className="text-sm truncate">{homeTeam.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={match.homeScore}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleScoreChange(roundKey, matchId, true, e.target.value)}
                placeholder="-"
                className="w-10 h-8 rounded-lg bg-background border border-border text-center font-extrabold text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Away Team */}
          <div 
            onClick={() => selectWinner(roundKey, matchId, match.awayTeam)}
            className={`flex items-center justify-between rounded-xl px-2 py-1.5 cursor-pointer transition ${
              isWinnerAway 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20" 
                : "hover:bg-muted-foreground/5"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-xl">{awayTeam.flag}</span>
              <span className="text-sm truncate">{awayTeam.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={match.awayScore}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleScoreChange(roundKey, matchId, false, e.target.value)}
                placeholder="-"
                className="w-10 h-8 rounded-lg bg-background border border-border text-center font-extrabold text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Champion Reveal Animation */}
      {champion && (
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-yellow-500/10 via-amber-500/20 to-yellow-600/10 border-2 border-yellow-500/30 p-6 md:p-8 text-center animate-pulse-glow glow-card">
          <div className="inline-flex rounded-full bg-yellow-500 p-4 text-white mb-3 shadow-lg shadow-yellow-500/30">
            <Trophy className="h-10 w-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Your 2026 Champion
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-4xl md:text-5xl">{champion.flag}</span>
            <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
              {champion.name}
            </span>
          </div>
          <p className="text-xs text-muted mt-3">
            Predicted champion is locked! Confetti triggered. 🎉⚽
          </p>
        </div>
      )}

      {/* Intro Header */}
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">
          Knockout Bracket
        </h1>
        <p className="text-muted text-sm md:text-base mt-1">
          Predict scorelines or click on team cards to advance them directly to the next stage.
        </p>
      </div>

      {/* Desktop View: Horizontal scroll tree */}
      <div className="hidden lg:block overflow-x-auto pb-6 border border-border rounded-3xl bg-card/40 backdrop-blur p-6">
        <div className="min-w-[1200px] grid grid-cols-5 gap-6 items-start">
          
          {/* Round of 32 Column */}
          <div className="space-y-4">
            <div className="rounded-xl bg-card border border-border py-2 text-center font-bold text-xs uppercase tracking-wider text-muted">Round of 32</div>
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-1">
              {Object.keys(activeKnockoutMatches.r32 || {}).map(id => renderMatchCard("r32", id))}
            </div>
          </div>

          {/* Round of 16 Column */}
          <div className="space-y-4 mt-[50px]">
            <div className="rounded-xl bg-card border border-border py-2 text-center font-bold text-xs uppercase tracking-wider text-indigo-500 bg-indigo-500/5">Round of 16</div>
            <div className="space-y-8 max-h-[800px] overflow-y-auto pr-1 pt-[20px]">
              {Object.keys(activeKnockoutMatches.r16 || {}).map(id => renderMatchCard("r16", id))}
            </div>
          </div>

          {/* Quarter-Finals Column */}
          <div className="space-y-4 mt-[150px]">
            <div className="rounded-xl bg-card border border-border py-2 text-center font-bold text-xs uppercase tracking-wider text-pink-500 bg-pink-500/5">Quarter-Finals</div>
            <div className="space-y-16 max-h-[800px] overflow-y-auto pr-1 pt-[40px]">
              {Object.keys(activeKnockoutMatches.qf || {}).map(id => renderMatchCard("qf", id))}
            </div>
          </div>

          {/* Semi-Finals Column */}
          <div className="space-y-4 mt-[250px]">
            <div className="rounded-xl bg-card border border-border py-2 text-center font-bold text-xs uppercase tracking-wider text-amber-500 bg-amber-500/5">Semi-Finals</div>
            <div className="space-y-32 max-h-[800px] overflow-y-auto pr-1 pt-[80px]">
              {Object.keys(activeKnockoutMatches.sf || {}).map(id => renderMatchCard("sf", id))}
            </div>
          </div>

          {/* Finals Column */}
          <div className="space-y-8 mt-[200px]">
            <div>
              <div className="rounded-xl bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 py-2 text-center font-bold text-xs uppercase tracking-wider text-yellow-600 dark:text-yellow-500 mb-4">🏆 Final Match</div>
              {renderMatchCard("final", 32)}
            </div>
            
            <div className="border-t border-border/80 pt-6">
              <div className="rounded-xl bg-card border border-border py-2 text-center font-bold text-xs uppercase tracking-wider text-muted mb-4">🥉 Third Place Play-off</div>
              {renderMatchCard("thirdPlace", 31)}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile/Tablet View: Round Tab Switcher */}
      <div className="lg:hidden space-y-6">
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          {rounds.map(r => (
            <button
              key={r.id}
              onClick={() => setActiveRoundTab(r.id)}
              className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeRoundTab === r.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-card border border-border text-muted hover:bg-border/30 hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeRoundTab === "r32" && Object.keys(activeKnockoutMatches.r32 || {}).map(id => renderMatchCard("r32", id))}
          {activeRoundTab === "r16" && Object.keys(activeKnockoutMatches.r16 || {}).map(id => renderMatchCard("r16", id))}
          {activeRoundTab === "qf" && Object.keys(activeKnockoutMatches.qf || {}).map(id => renderMatchCard("qf", id))}
          {activeRoundTab === "sf" && Object.keys(activeKnockoutMatches.sf || {}).map(id => renderMatchCard("sf", id))}
          {activeRoundTab === "final" && (
            <div className="col-span-full space-y-6">
              <div className="bg-card border border-border rounded-3xl p-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-indigo-500 mb-3 text-left">World Cup Final</h3>
                {renderMatchCard("final", 32)}
              </div>
              <div className="bg-card border border-border rounded-3xl p-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-muted mb-3 text-left">Third Place Play-off</h3>
                {renderMatchCard("thirdPlace", 31)}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
