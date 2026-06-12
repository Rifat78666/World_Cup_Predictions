import React, { useState } from "react";
import { useFantasy } from "../context/FantasyContext.jsx";
import { teams } from "../data/teams.js";
import { players } from "../data/players.js";
import { Activity, Bell, Calendar, ChevronDown, ChevronUp, FileText, Info } from "lucide-react";

export default function LiveGameweek() {
  const { fantasyPointsResults, squad } = useFantasy();
  const { totalPoints, playerPointsSummary, matchBreakdowns } = fantasyPointsResults;

  const [expandedMatchId, setExpandedMatchId] = useState(null);

  const getTeam = (id) => {
    return teams.find(t => t.id === id) || { name: id, flag: "🏳️" };
  };

  const getPlayer = (id) => {
    return players.find(p => p.id === id);
  };

  const toggleMatchExpand = (matchId) => {
    setExpandedMatchId(prev => (prev === matchId ? null : matchId));
  };

  // Compile active events to show in the live event notifications ticker
  const activeEvents = [];
  Object.keys(matchBreakdowns).forEach(matchId => {
    const breakdn = matchBreakdowns[matchId];
    breakdn.events.forEach(evt => {
      // Check if player is in user's squad
      const playerInSquad = squad.includes(evt.scorerId) || squad.includes(evt.assisterId);
      if (playerInSquad) {
        let msg = "";
        if (evt.type === "goal") {
          const pName = getPlayer(evt.scorerId)?.name || "Squad Player";
          msg = `🔥 ${pName} scores for ${getTeam(evt.team).name}! (+6 pts)`;
        } else if (evt.type === "own_goal") {
          msg = `⚠️ Own goal conceded! (-2 pts)`;
        } else if (evt.type === "red_card") {
          msg = `🛑 Red card! (-3 pts)`;
        }
        if (msg) {
          activeEvents.push({
            id: `${matchId}-${evt.minute}`,
            msg,
            round: breakdn.round
          });
        }
      }
    });
  });

  const predictedMatchCount = Object.keys(matchBreakdowns).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Intro Header */}
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">
          Live Gameweek Scoring
        </h1>
        <p className="text-muted text-sm md:text-base mt-1">
          Simulated match stats and real-time points. Point calculations adapt instantly as your predictions update.
        </p>
      </div>

      {/* Live Points Ticker Header */}
      <div className="rounded-3xl border border-border bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-white text-left shadow-lg glow-card mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Live Gameweek Points</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-1">{totalPoints} <span className="text-sm font-normal text-indigo-200">points</span></h2>
          <p className="text-xs text-indigo-200 mt-2 font-medium">
            Based on {predictedMatchCount} predicted scores simulated.
          </p>
        </div>

        {/* Live event notifications banner */}
        <div className="w-full md:w-1/2 bg-black/20 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">
            <Bell className="h-4 w-4 animate-bounce" />
            Live Squad Notifications ({activeEvents.length})
          </div>
          <div className="max-h-[80px] overflow-y-auto space-y-1.5 pr-2">
            {activeEvents.length === 0 ? (
              <span className="text-xs text-white/60 font-semibold block py-2">No active match events for your squad yet. Predict matches in Groups or Bracket!</span>
            ) : (
              activeEvents.map(evt => (
                <div key={evt.id} className="text-xs bg-white/5 rounded border border-white/5 px-2 py-1 flex justify-between items-center font-bold">
                  <span>{evt.msg}</span>
                  <span className="text-[9px] uppercase tracking-wider text-white/50">{evt.round}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Simulated match logs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2 text-left">
            <Activity className="h-5 w-5 text-indigo-500" />
            Simulated Matches & Event Logs
          </h2>

          {predictedMatchCount === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center text-muted">
              <span className="text-4xl block mb-3">🏟️</span>
              <p className="text-sm font-semibold">No predictions have been entered yet.</p>
              <p className="text-xs text-muted mt-1">Visit the Groups or Bracket tab, predict some results, and watch live scores generate events!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.keys(matchBreakdowns).map(matchId => {
                const data = matchBreakdowns[matchId];
                const home = getTeam(data.homeTeam);
                const away = getTeam(data.awayTeam);
                const isExpanded = expandedMatchId === matchId;

                // Count if any user squad player is involved
                const squadInvolved = squad.filter(id => {
                  const p = getPlayer(id);
                  return p && (p.nation === data.homeTeam || p.nation === data.awayTeam);
                });

                return (
                  <div key={matchId} className="rounded-2xl border border-border bg-card overflow-hidden">
                    {/* Header Row */}
                    <div 
                      onClick={() => toggleMatchExpand(matchId)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted-foreground/3 transition"
                    >
                      <div className="text-xs text-muted font-bold tracking-wider uppercase flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {data.round}
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <span className="text-lg font-bold">{home.flag}</span>
                        <span className="font-extrabold text-sm sm:text-base">{home.name}</span>
                        <span className="rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm px-2.5 py-0.5">
                          {data.homeScore} - {data.awayScore}
                        </span>
                        <span className="font-extrabold text-sm sm:text-base">{away.name}</span>
                        <span className="text-lg font-bold">{away.flag}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {squadInvolved.length > 0 && (
                          <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                            {squadInvolved.length} players
                          </span>
                        )}
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="border-t border-border bg-background/50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        {/* Left: Match Timeline Event Log */}
                        <div>
                          <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            Match Event Log
                          </h4>
                          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-2 text-xs font-medium">
                            {data.events.length === 0 ? (
                              <span className="text-muted block py-2">No significant events simulated in this match.</span>
                            ) : (
                              data.events.map((evt, idx) => (
                                <div key={idx} className="flex gap-2 items-center bg-card border border-border/60 rounded px-2.5 py-1">
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{evt.minute}'</span>
                                  <span>{evt.detail}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Right: Squad Player Score breakdown */}
                        <div>
                          <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">
                            Squad Point Breakdowns
                          </h4>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 text-xs font-medium">
                            {squadInvolved.length === 0 ? (
                              <span className="text-muted block py-2">No drafted players from either country played.</span>
                            ) : (
                              squadInvolved.map(id => {
                                const p = getPlayer(id);
                                const stats = data.playerPoints[id];
                                if (!stats) return null;
                                return (
                                  <div key={id} className="bg-card border border-border/60 rounded-xl p-2.5">
                                    <div className="flex justify-between items-center mb-1.5 font-bold">
                                      <span>{p.name} ({p.position})</span>
                                      <span className="text-indigo-600 dark:text-indigo-400">+{stats.totalPoints} pts</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground space-y-0.5">
                                      {stats.eventsLog.map((log, idx) => (
                                        <div key={idx}>• {log}</div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Total Squad Player points leaderboard (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2 text-left">
            My Squad Leaderboard
          </h2>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm text-left">
            <div className="p-4 border-b border-border bg-muted-foreground/5">
              <span className="text-xs font-bold text-muted uppercase tracking-widest">Points breakdown per player</span>
            </div>
            {squad.length === 0 ? (
              <div className="p-8 text-center text-muted text-sm font-semibold">
                No drafted players in your squad yet.
              </div>
            ) : (
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {Object.keys(playerPointsSummary).map(id => {
                  const summary = playerPointsSummary[id];
                  const flag = getTeamFlag(summary.nation);
                  return (
                    <div key={id} className="p-4 hover:bg-muted-foreground/3">
                      <div className="flex items-center justify-between font-bold mb-1.5">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span>{flag}</span>
                          <span>{summary.name}</span>
                          <span className="text-[9px] bg-slate-500/10 text-muted px-1 rounded uppercase tracking-wider">{summary.position}</span>
                        </div>
                        <span className="text-indigo-600 dark:text-indigo-400 text-sm">
                          {summary.totalPoints} pts
                        </span>
                      </div>

                      {/* Display player events log summary */}
                      <div className="text-[10px] text-muted-foreground space-y-0.5 font-medium pl-1">
                        {summary.eventsLog.slice(0, 3).map((log, idx) => (
                          <div key={idx}>• {log}</div>
                        ))}
                        {summary.eventsLog.length > 3 && (
                          <div className="text-indigo-500 font-semibold">• and {summary.eventsLog.length - 3} more match logs...</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
