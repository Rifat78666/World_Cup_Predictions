import React, { useState } from "react";
import { useFantasy } from "../context/FantasyContext.jsx";
import { Trophy, Users, Plus, ShieldAlert, ArrowDown, ArrowUp, Check } from "lucide-react";

export default function Leaderboard() {
  const {
    leaderboard,
    leagues,
    transfersMade,
    createMiniLeague,
    joinMiniLeague
  } = useFantasy();

  const [activeLeagueTab, setActiveLeagueTab] = useState("GLOBAL");
  
  // Custom League Inputs
  const [newLeagueName, setNewLeagueName] = useState("");
  const [joinLeagueCode, setJoinLeagueCode] = useState("");
  const [successCode, setSuccessCode] = useState("");

  const handleCreateLeague = (e) => {
    e.preventDefault();
    if (!newLeagueName.trim()) return;
    const code = createMiniLeague(newLeagueName.trim());
    setSuccessCode(code);
    setNewLeagueName("");
  };

  const handleJoinLeague = (e) => {
    e.preventDefault();
    if (!joinLeagueCode.trim()) return;
    const res = joinMiniLeague(joinLeagueCode);
    if (res.success) {
      alert("Successfully joined league!");
      setActiveLeagueTab(joinLeagueCode.toUpperCase().trim());
      setJoinLeagueCode("");
    } else {
      alert(res.error);
    }
  };

  const activeLeague = leagues.find(l => l.code === activeLeagueTab) || leagues[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Intro Header */}
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">
          Leagues & Leaderboards
        </h1>
        <p className="text-muted text-sm md:text-base mt-1">
          Compete globally or create private mini-leagues to invite friends and track rank movements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Leagues List & Creations (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Leagues Switcher */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm text-left">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-muted mb-3.5 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-indigo-500" />
              My Leagues
            </h2>
            <div className="space-y-1.5">
              {leagues.map(l => {
                const isSelected = activeLeagueTab === l.code;
                return (
                  <button
                    key={l.code}
                    onClick={() => {
                      setActiveLeagueTab(l.code);
                      setSuccessCode("");
                    }}
                    className={`w-full text-left rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow"
                        : "hover:bg-border/30 text-muted"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{l.name}</span>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isSelected ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      }`}>{l.code}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create a League Form */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm text-left">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted mb-3 flex items-center gap-1">
              <Plus className="h-4 w-4 text-indigo-500" />
              Create Private League
            </h3>
            <form onSubmit={handleCreateLeague} className="space-y-3.5">
              <input
                type="text"
                placeholder="League Name..."
                value={newLeagueName}
                onChange={(e) => setNewLeagueName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-xs font-bold transition shadow shadow-indigo-600/10 cursor-pointer"
              >
                Generate Code
              </button>
            </form>

            {successCode && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2 text-xs text-emerald-600">
                <Check className="h-4 w-4 shrink-0" />
                <div>
                  League created! Code: <span className="font-extrabold tracking-wider bg-white dark:bg-slate-900 border border-emerald-500/20 px-2 py-0.5 rounded text-sm select-all">{successCode}</span>
                </div>
              </div>
            )}
          </div>

          {/* Join a League Form */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm text-left">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted mb-3 flex items-center gap-1">
              <Users className="h-4 w-4 text-indigo-500" />
              Join Private League
            </h3>
            <form onSubmit={handleJoinLeague} className="space-y-3.5">
              <input
                type="text"
                placeholder="Enter 6-digit Invite Code..."
                value={joinLeagueCode}
                onChange={(e) => setJoinLeagueCode(e.target.value)}
                maxLength={6}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 uppercase font-mono tracking-widest"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-card hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 py-2 text-xs font-bold transition cursor-pointer"
              >
                Join League
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Active League Leaderboard Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2 text-left">
            <Trophy className="h-5 w-5 text-indigo-500" />
            {activeLeague.name} Table
          </h2>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm text-left">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted-foreground/5 border-b border-border text-xs text-muted uppercase font-bold text-left">
                  <th className="px-4 py-3 text-center w-14">Rank</th>
                  <th className="px-3 py-3">Team & Manager</th>
                  <th className="px-3 py-3 text-center">Transfers</th>
                  <th className="px-3 py-3 text-center">GW Pts</th>
                  <th className="px-4 py-3 text-center">Total Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaderboard.map((user) => {
                  // Simulate rank movements details
                  const movement = user.username === "You" ? 0 : (user.rank % 3 === 0 ? 1 : (user.rank % 3 === 1 ? -1 : 0));
                  
                  return (
                    <tr 
                      key={user.username}
                      className={`hover:bg-muted-foreground/3 transition ${
                        user.isUser ? "bg-indigo-500/[0.03] border-l-4 border-l-indigo-600" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center font-bold">
                        <div className="flex items-center justify-center gap-1">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                            user.rank === 1 ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                            user.rank === 2 ? "bg-slate-300/20 text-slate-500 dark:text-slate-400" :
                            user.rank === 3 ? "bg-amber-600/10 text-amber-700 dark:text-amber-500" :
                            "bg-slate-500/10 text-muted"
                          }`}>
                            {user.rank}
                          </span>
                          <span className="text-[10px]">
                            {movement > 0 && <ArrowUp className="h-3 w-3 text-emerald-500 inline" />}
                            {movement < 0 && <ArrowDown className="h-3 w-3 text-red-500 inline" />}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="font-extrabold text-sm">{user.squadName}</div>
                        <div className="text-xs text-muted-foreground font-medium">@{user.username}</div>
                      </td>
                      <td className="px-3 py-3.5 text-center text-muted font-bold text-xs">
                        {user.transfers}
                      </td>
                      <td className="px-3 py-3.5 text-center font-semibold text-muted text-xs">
                        {user.gwPoints}
                      </td>
                      <td className="px-4 py-3.5 text-center font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                        {user.totalPoints}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
