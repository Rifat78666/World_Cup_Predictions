import React, { useState } from "react";
import { usePredictor } from "../context/PredictorContext.jsx";
import { teams as initialTeams } from "../data/teams.js";
import { Sparkles, RefreshCw, Star, Info, Calendar } from "lucide-react";

export default function Groups() {
  const {
    groupFixtures,
    groupStandings,
    thirdPlaceStandings,
    updateGroupPrediction,
    autoPredictGroupMatches,
    resetAllPredictions
  } = usePredictor();

  const [activeGroup, setActiveGroup] = useState("A");

  const groupLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  const getTeamName = (id) => {
    const t = initialTeams.find(x => x.id === id);
    return t ? t.name : id;
  };

  const getTeamFlag = (id) => {
    const t = initialTeams.find(x => x.id === id);
    return t ? t.flag : "🏳️";
  };

  const activeFixtures = groupFixtures.filter(f => f.group === activeGroup);
  const activeStandings = groupStandings[activeGroup] || [];

  // Mocking "Today" to match the first date in the dataset (or current date if matching)
  const todaysDate = "Jun 11, 2026"; 
  const todaysMatches = groupFixtures.filter(f => f.date === todaysDate);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-left bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">
            Group Stage Predictions
          </h1>
          <p className="text-muted text-sm md:text-base text-left mt-1">
            Predict the scores of the 72 group stage matches. Standings recalculate in real-time.
          </p>
        </div>
        
        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            onClick={autoPredictGroupMatches}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-sm font-semibold transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Quick Simulate
          </button>
          <button
            onClick={resetAllPredictions}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-border/30 px-4 py-2.5 text-sm font-semibold transition text-muted cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Today's Matches Carousel / Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2 text-left mb-4">
          <Calendar className="h-5 w-5 text-indigo-500" />
          Today's Matches <span className="text-xs font-semibold text-muted bg-slate-500/10 px-2 py-0.5 rounded-full">{todaysDate}</span>
        </h2>
        
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x pr-2 custom-scrollbar">
          {todaysMatches.map(fix => (
            <div key={fix.id} className="min-w-[300px] shrink-0 snap-center rounded-2xl bg-card border border-border p-4 transition-all duration-200 hover:border-indigo-500/40">
              <div className="flex items-center justify-between text-[10px] text-muted font-bold uppercase tracking-widest mb-3">
                <span>Group {fix.group}</span>
                <span>{fix.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold w-[40%]">
                  <span className="text-2xl">{getTeamFlag(fix.home)}</span>
                  <span className="truncate">{getTeamName(fix.home)}</span>
                </div>
                <div className="text-center font-extrabold text-sm px-2.5 py-1 bg-muted-foreground/15 rounded-lg text-indigo-600 dark:text-indigo-400">
                  {fix.homeScore} - {fix.awayScore}
                </div>
                <div className="flex items-center justify-end gap-2 font-bold w-[40%] text-right">
                  <span className="truncate">{getTeamName(fix.away)}</span>
                  <span className="text-2xl">{getTeamFlag(fix.away)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group Selector Navigation */}
      <div className="flex flex-wrap gap-1.5 mb-8 border-b border-border pb-4">
        {groupLetters.map(letter => {
          const isSelected = activeGroup === letter;
          return (
            <button
              key={letter}
              onClick={() => setActiveGroup(letter)}
              className={`w-11 h-11 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-card border border-border text-muted hover:bg-border/30 hover:text-foreground"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Fixture Predictions list (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2 text-left">
            Group {activeGroup} Fixtures
          </h2>

          <div className="space-y-3">
            {activeFixtures.map(fix => {
              return (
                <div key={fix.id} className="rounded-2xl bg-card border border-border p-4 transition-all duration-200 hover:border-indigo-500/40">
                  <div className="flex items-center justify-between text-xs text-muted font-medium mb-3">
                    <span>Matchday {fix.matchday}</span>
                    <span>{fix.date} • {fix.time}</span>
                  </div>

                  <div className="grid grid-cols-12 items-center gap-3">
                    
                    {/* Home Team */}
                    <div className="col-span-4 flex items-center justify-end gap-2 text-right">
                      <span className="font-semibold text-sm sm:text-base hidden sm:inline">{getTeamName(fix.home)}</span>
                      <span className="font-semibold text-sm sm:hidden">{fix.home}</span>
                      <span className="text-2xl sm:text-3xl">{getTeamFlag(fix.home)}</span>
                    </div>

                    {/* Scores Inputs */}
                    <div className="col-span-4 flex items-center justify-center gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="-"
                        value={fix.homeScore}
                        onChange={(e) => updateGroupPrediction(fix.id, e.target.value, fix.awayScore)}
                        className="w-12 h-10 rounded-xl bg-background border border-border text-center font-bold text-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="font-semibold text-muted">:</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="-"
                        value={fix.awayScore}
                        onChange={(e) => updateGroupPrediction(fix.id, fix.homeScore, e.target.value)}
                        className="w-12 h-10 rounded-xl bg-background border border-border text-center font-bold text-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Away Team */}
                    <div className="col-span-4 flex items-center justify-start gap-2 text-left">
                      <span className="text-2xl sm:text-3xl">{getTeamFlag(fix.away)}</span>
                      <span className="font-semibold text-sm sm:text-base hidden sm:inline">{getTeamName(fix.away)}</span>
                      <span className="font-semibold text-sm sm:hidden">{fix.away}</span>
                    </div>

                  </div>

                  <div className="text-center text-[10px] text-muted-foreground mt-3">
                    📍 {fix.venue}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Standing tables (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2 text-left">
              Group {activeGroup} Standings
            </h2>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted-foreground/5 border-b border-border text-xs text-muted uppercase font-bold text-left">
                    <th className="px-4 py-3 text-center">Pos</th>
                    <th className="px-3 py-3">Team</th>
                    <th className="px-3 py-3 text-center">P</th>
                    <th className="px-3 py-3 text-center">GD</th>
                    <th className="px-4 py-3 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeStandings.map((team, idx) => {
                    const advances = idx < 2;
                    return (
                      <tr key={team.id} className="hover:bg-muted-foreground/3">
                        <td className="px-4 py-3 text-center font-semibold">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                            idx === 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            idx === 1 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            idx === 2 ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" :
                            "bg-slate-500/10 text-muted"
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-semibold flex items-center gap-2">
                          <span className="text-xl">{team.flag}</span>
                          <span>{team.name}</span>
                          {idx === 2 && (
                            <span className="text-[10px] text-indigo-500 uppercase tracking-wider font-extrabold bg-indigo-500/10 px-1.5 py-0.5 rounded">3rd</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center text-muted font-medium">{team.played}</td>
                        <td className="px-3 py-3 text-center font-bold text-muted">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                        <td className="px-4 py-3 text-center font-extrabold text-indigo-600 dark:text-indigo-400">{team.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 rounded-xl bg-card border border-border p-3 text-xs text-muted items-start text-left leading-relaxed">
              <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Qualification rules:</span> The top 2 teams in each group advance to the Round of 32. The 8 best third-placed teams across all 12 groups also qualify.
              </div>
            </div>
          </div>

          {/* Third Place Standings panel */}
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2 text-left">
              Best Third-Place Teams
            </h2>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="bg-muted-foreground/5 border-b border-border text-xs text-muted uppercase font-bold text-left">
                    <th className="px-3 py-2.5 text-center">Pos</th>
                    <th className="px-3 py-2.5">Team</th>
                    <th className="px-2 py-2.5 text-center">Grp</th>
                    <th className="px-2 py-2.5 text-center">GD</th>
                    <th className="px-3 py-2.5 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {thirdPlaceStandings.map((team, idx) => {
                    const advances = idx < 8;
                    return (
                      <tr key={team.id} className={`hover:bg-muted-foreground/3 ${advances ? "" : "opacity-60"}`}>
                        <td className="px-3 py-2.5 text-center font-semibold">
                          <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                            advances 
                              ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-semibold flex items-center gap-2">
                          <span className="text-lg">{team.flag}</span>
                          <span className="truncate max-w-[120px]">{team.name}</span>
                        </td>
                        <td className="px-2 py-2.5 text-center font-bold text-muted">{team.groupLetter}</td>
                        <td className="px-2 py-2.5 text-center font-bold text-muted">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                        <td className="px-3 py-2.5 text-center font-extrabold text-indigo-600 dark:text-indigo-400">{team.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
