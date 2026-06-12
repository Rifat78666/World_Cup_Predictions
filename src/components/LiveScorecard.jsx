import React, { useState, useEffect } from "react";
import { useFantasy } from "../context/FantasyContext.jsx";
import { teams } from "../data/teams.js";
import { ChevronDown, ChevronUp, Radio, HelpCircle } from "lucide-react";

export default function LiveScorecard() {
  const { squadPlayers } = useFantasy();
  const [collapsed, setCollapsed] = useState(true);
  const [liveMatches, setLiveMatches] = useState([
    { id: "live_1", home: "USA", away: "ENG", homeScore: 1, awayScore: 1, minute: 54, lastScoreChange: null },
    { id: "live_2", home: "BRA", away: "FRA", homeScore: 2, awayScore: 0, minute: 76, lastScoreChange: null },
    { id: "live_3", home: "ARG", away: "GER", homeScore: 0, awayScore: 0, minute: 12, lastScoreChange: null }
  ]);

  // Handle live score simulation (polls every 60s to increment minute or score)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMatches(prev => 
        prev.map(m => {
          let nextMin = m.minute + 1;
          if (nextMin > 90) nextMin = 1; // loop simulation

          let nextHome = m.homeScore;
          let nextAway = m.awayScore;
          let scoreChanged = false;

          // 5% chance of goal every minute
          if (Math.random() < 0.05) {
            if (Math.random() < 0.5) {
              nextHome += 1;
            } else {
              nextAway += 1;
            }
            scoreChanged = true;
          }

          return {
            ...m,
            minute: nextMin,
            homeScore: nextHome,
            awayScore: nextAway,
            lastScoreChange: scoreChanged ? Date.now() : m.lastScoreChange
          };
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getTeamFlag = (id) => teams.find(t => t.id === id)?.flag || "🏳️";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Collapsed Pill */}
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 rounded-full bg-slate-900 border border-indigo-500/30 text-white px-4 py-2.5 text-xs font-extrabold shadow-xl hover:bg-slate-800 transition-all duration-200 cursor-pointer animate-pulse-glow"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          LIVE • {liveMatches.length} Matches
        </button>
      ) : (
        /* Expanded Live Card */
        <div className="w-80 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden glass glow-card">
          {/* Header */}
          <div 
            onClick={() => setCollapsed(true)}
            className="flex items-center justify-between bg-slate-900 text-white px-4 py-3 cursor-pointer hover:bg-slate-800 transition"
          >
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest">
              <Radio className="h-4 w-4 text-red-500 animate-pulse" />
              Live Scores (World Cup)
            </div>
            <ChevronDown className="h-4 w-4" />
          </div>

          {/* Matches List */}
          <div className="p-3 space-y-2">
            {liveMatches.map(m => {
              // Highlight goal changes
              const isFlashed = m.lastScoreChange && (Date.now() - m.lastScoreChange < 5000);
              
              // Check if player from user's squad belongs to home/away
              const hasSquadHome = squadPlayers.some(p => p.nation === m.home);
              const hasSquadAway = squadPlayers.some(p => p.nation === m.away);

              return (
                <div 
                  key={m.id}
                  className={`rounded-xl p-3 border border-border/60 bg-background transition-all duration-500 ${
                    isFlashed ? "bg-emerald-500/20 border-emerald-500/40" : ""
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] text-muted font-bold mb-2">
                    <span className="text-red-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                      {m.minute}'
                    </span>
                    <span className="text-muted-foreground uppercase font-bold">2026 WC Live</span>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Home */}
                    <div className="flex items-center gap-1.5 font-bold text-sm w-5/12">
                      <span>{getTeamFlag(m.home)}</span>
                      <span className="truncate">{m.home}</span>
                      {hasSquadHome && <span className="h-2 w-2 rounded-full bg-indigo-500" title="Squad player playing"></span>}
                    </div>

                    {/* Score */}
                    <div className="text-center font-extrabold text-sm px-2 bg-muted-foreground/15 rounded-lg text-indigo-600 dark:text-indigo-400 min-w-[48px]">
                      {m.homeScore} - {m.awayScore}
                    </div>

                    {/* Away */}
                    <div className="flex items-center justify-end gap-1.5 font-bold text-sm w-5/12 text-right">
                      {hasSquadAway && <span className="h-2 w-2 rounded-full bg-indigo-500" title="Squad player playing"></span>}
                      <span className="truncate">{m.away}</span>
                      <span>{getTeamFlag(m.away)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
