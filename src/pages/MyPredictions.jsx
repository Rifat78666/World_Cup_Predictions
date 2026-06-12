import React from "react";
import { usePredictor } from "../context/PredictorContext.jsx";
import { teams } from "../data/teams.js";
import { CheckCircle2, Circle, Trophy } from "lucide-react";

export default function MyPredictions() {
  const { groupFixtures, knockoutPredictions, matchesPredictList } = usePredictor();

  const getTeam = (id) => {
    return teams.find(x => x.id === id) || { name: id, flag: "🏳️" };
  };

  const groupTotal = 72;
  const groupPredicted = groupFixtures.filter(
    f => f.homeScore !== "" && f.awayScore !== "" && f.homeScore !== null && f.awayScore !== null
  ).length;

  const knockoutTotal = 32;
  // Count values in knockoutPredictions that have scores
  const knockoutPredicted = Object.keys(knockoutPredictions).filter(key => {
    const p = knockoutPredictions[key];
    return p && p.homeScore !== "" && p.awayScore !== "" && p.homeScore !== null && p.awayScore !== null;
  }).length;

  const totalPredicted = groupPredicted + knockoutPredicted;
  const totalMatches = groupTotal + knockoutTotal;
  const percentComplete = Math.round((totalPredicted / totalMatches) * 100);

  // Group predicted matches by round
  const predictedMatches = matchesPredictList.filter(
    m => m.homeScore !== "" && m.awayScore !== "" && m.homeScore !== null && m.awayScore !== null
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Header */}
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">
          My Predictions Summary
        </h1>
        <p className="text-muted text-sm md:text-base mt-1">
          Review your predicted match scores. Ensure all 104 matches are predicted to complete your bracket!
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Progress */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-muted uppercase tracking-wider">Overall Completion</span>
            <Trophy className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {percentComplete}%
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">
            {totalPredicted} of {totalMatches} matches predicted
          </p>
          <div className="w-full bg-background border border-border rounded-full h-2 mt-4 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
        </div>

        {/* Group Stage Progress */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-muted uppercase tracking-wider">Group Stage</span>
            {groupPredicted === groupTotal ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted" />
            )}
          </div>
          <div className="text-3xl font-extrabold text-foreground">
            {groupPredicted} <span className="text-sm text-muted font-normal">/ {groupTotal} predicted</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">
            72 matches across Groups A to L
          </p>
        </div>

        {/* Knockouts Progress */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-muted uppercase tracking-wider">Knockouts Bracket</span>
            {knockoutPredicted === knockoutTotal ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted" />
            )}
          </div>
          <div className="text-3xl font-extrabold text-foreground">
            {knockoutPredicted} <span className="text-sm text-muted font-normal">/ {knockoutTotal} predicted</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">
            R32, R16, QF, SF, 3rd place, and Final
          </p>
        </div>

      </div>

      {/* List of predictions entered */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm text-left">
        <h2 className="text-lg font-bold border-b border-border pb-3 mb-4">
          Predicted Fixtures ({predictedMatches.length})
        </h2>

        {predictedMatches.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <span className="text-4xl block mb-3">🔮</span>
            <p className="text-sm font-medium">You haven't predicted any match scores yet.</p>
            <p className="text-xs text-muted mt-1">Go to the Groups or Bracket page to enter predicted scores!</p>
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2">
            {predictedMatches.map(m => {
              const h = getTeam(m.home);
              const a = getTeam(m.away);
              return (
                <div key={m.id} className="flex items-center justify-between rounded-xl bg-background border border-border px-4 py-2.5 hover:border-indigo-500/30 transition">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted w-1/4">
                    <span className="bg-muted-foreground/10 px-2 py-0.5 rounded text-[10px]">{m.round}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 w-1/2">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-right justify-end w-5/12">
                      <span className="truncate">{h.name}</span>
                      <span>{h.flag}</span>
                    </div>
                    <div className="rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm px-3 py-1 flex items-center justify-center shrink-0 min-w-[50px]">
                      {m.homeScore} - {m.awayScore}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-left justify-start w-5/12">
                      <span>{a.flag}</span>
                      <span className="truncate">{a.name}</span>
                    </div>
                  </div>
                  <div className="w-1/4 text-right text-[10px] text-muted font-bold tracking-wider">
                    {m.type === "group" ? "STABLE" : "KNOCKOUT"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
