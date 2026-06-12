import React, { useState } from "react";
import { useFantasy } from "../context/FantasyContext.jsx";
import { players as initialPlayers } from "../data/players.js";
import { teams } from "../data/teams.js";
import { getSquadRecommendation, suggestTransfers, suggestCaptain } from "../utils/ai.js";
import { 
  Sparkles, Trash2, Shield, Info, AlertTriangle, 
  UserPlus, CheckCircle, ChevronRight, Shuffle, Star, RefreshCcw 
} from "lucide-react";

export default function FantasySquad() {
  const {
    squad,
    squadPlayers,
    budget,
    spentCredits,
    captain,
    viceCaptain,
    formation,
    wildcardUsed,
    transfersMade,
    addPlayerToSquad,
    removePlayerFromSquad,
    clearSquad,
    setCaptain,
    setViceCaptain,
    setFormation,
    setWildcardUsed,
    setTransfersMade
  } = useFantasy();

  // Filters for available players
  const [filterPos, setFilterPos] = useState("ALL");
  const [filterNation, setFilterNation] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("cost"); // cost, goals, assists

  // AI Dialog state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState("");

  const getTeamFlag = (nationCode) => {
    return teams.find(t => t.id === nationCode)?.flag || "🏳️";
  };

  const getTeamName = (nationCode) => {
    return teams.find(t => t.id === nationCode)?.name || nationCode;
  };

  // Filter and sort player list
  const filteredAvailablePlayers = initialPlayers.filter(p => {
    const matchesPos = filterPos === "ALL" || p.position === filterPos;
    const matchesNation = filterNation === "ALL" || p.nation === filterNation;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPos && matchesNation && matchesSearch;
  }).sort((a, b) => {
    if (sortKey === "cost") return b.cost - a.cost;
    if (sortKey === "goals") return b.goalsEst - a.goalsEst;
    return b.assistsEst - a.assistsEst;
  });

  // Organize squad into positions
  const squadGKs = squadPlayers.filter(p => p.position === "GK");
  const squadDEFs = squadPlayers.filter(p => p.position === "DEF");
  const squadMIDs = squadPlayers.filter(p => p.position === "MID");
  const squadFWDs = squadPlayers.filter(p => p.position === "FWD");

  // Determine starting XI vs bench based on formation
  // Formations look like "4-3-3" -> 1 GK, 4 DEF, 3 MID, 3 FWD starting
  const getFormationConfig = () => {
    const [def, mid, fwd] = formation.split("-").map(x => parseInt(x, 10));
    return { GK: 1, DEF: def, MID: mid, FWD: fwd };
  };

  const config = getFormationConfig();

  const startingXI = [
    ...squadGKs.slice(0, config.GK),
    ...squadDEFs.slice(0, config.DEF),
    ...squadMIDs.slice(0, config.MID),
    ...squadFWDs.slice(0, config.FWD)
  ];

  const bench = [
    ...squadGKs.slice(config.GK),
    ...squadDEFs.slice(config.DEF),
    ...squadMIDs.slice(config.MID),
    ...squadFWDs.slice(config.FWD)
  ];

  // AI: Pick my squad
  const runAiDraft = async () => {
    setAiLoading(true);
    setAiReport("");
    const apiKey = localStorage.getItem("gemini_api_key");
    
    try {
      const res = await getSquadRecommendation(initialPlayers, apiKey);
      clearSquad();
      // Add players to squad one by one
      res.squadIds.forEach(id => {
        addPlayerToSquad(id);
      });
      setAiReport(res.explanation);
    } catch (e) {
      setAiReport(`*Error running AI draft: ${e.message}*`);
    } finally {
      setAiLoading(false);
    }
  };

  // AI: Suggest Transfers
  const runAiTransfers = async () => {
    if (squad.length === 0) {
      alert("Please draft a squad first before asking for transfer suggestions!");
      return;
    }
    setAiLoading(true);
    setAiReport("");
    const apiKey = localStorage.getItem("gemini_api_key");

    try {
      const res = await suggestTransfers(squad, initialPlayers, apiKey);
      setAiReport(res);
    } catch (e) {
      setAiReport(`*Error running AI suggestions: ${e.message}*`);
    } finally {
      setAiLoading(false);
    }
  };

  // AI: Suggest Captain
  const runAiCaptain = async () => {
    if (squad.length === 0) {
      alert("Please draft a squad first before asking for captain suggestions!");
      return;
    }
    setAiLoading(true);
    setAiReport("");
    const apiKey = localStorage.getItem("gemini_api_key");

    try {
      const res = await suggestCaptain(squad, initialPlayers, apiKey);
      setAiReport(res);
    } catch (e) {
      setAiReport(`*Error running AI suggestions: ${e.message}*`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddPlayer = (id) => {
    const res = addPlayerToSquad(id);
    if (!res.success) {
      alert(res.error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">
            Fantasy Squad Builder
          </h1>
          <p className="text-muted text-sm md:text-base mt-1">
            Draft your squad of 15 players within the 100 credits budget. Pick a captain (2x pts) and vice-captain (1.5x pts).
          </p>
        </div>
        
        {/* Action Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to activate your Wildcard? This gives you free transfers!")) {
                setWildcardUsed(true);
                alert("Wildcard activated! Transfers are now free.");
              }
            }}
            disabled={wildcardUsed}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              wildcardUsed 
                ? "bg-slate-500/10 text-muted border border-border" 
                : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md cursor-pointer hover:from-purple-700 hover:to-indigo-700"
            }`}
          >
            {wildcardUsed ? "Wildcard Active" : "Activate Wildcard"}
          </button>
          <button
            onClick={clearSquad}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-border/30 px-4 py-2 text-sm font-semibold transition text-muted cursor-pointer"
          >
            <RefreshCcw className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      {/* SQUAD STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-card border border-border rounded-3xl p-4 shadow-sm text-left">
        <div>
          <span className="text-xs font-bold text-muted uppercase tracking-wider block">Squad Count</span>
          <span className="text-2xl font-extrabold">{squad.length} <span className="text-sm font-normal text-muted">/ 15</span></span>
        </div>
        <div>
          <span className="text-xs font-bold text-muted uppercase tracking-wider block">Budget Left</span>
          <span className={`text-2xl font-extrabold ${budget < 0 ? "text-red-500" : "text-emerald-500"}`}>
            {budget} <span className="text-sm font-normal text-muted">/ 100 cr</span>
          </span>
        </div>
        <div>
          <span className="text-xs font-bold text-muted uppercase tracking-wider block">Transfers Made</span>
          <span className="text-2xl font-extrabold">{transfersMade}</span>
        </div>
        <div>
          <span className="text-xs font-bold text-muted uppercase tracking-wider block">Active Formation</span>
          <select
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            className="mt-1 rounded-lg border border-border bg-background px-2 py-0.5 text-sm font-bold focus:outline-none focus:border-indigo-500"
          >
            {["4-3-3", "3-4-3", "4-4-2", "3-5-2", "5-3-2"].map(form => (
              <option key={form} value={form}>{form}</option>
            ))}
          </select>
        </div>
      </div>

      {/* AI ASSISTANT TRIGGERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-4">
        <button
          onClick={runAiDraft}
          disabled={aiLoading}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition shadow shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          AI Pick My Squad
        </button>
        <button
          onClick={runAiTransfers}
          disabled={aiLoading}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-card hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 py-2.5 text-xs font-bold transition cursor-pointer disabled:opacity-50"
        >
          <Shuffle className="h-4 w-4" />
          AI Suggest Transfers
        </button>
        <button
          onClick={runAiCaptain}
          disabled={aiLoading}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-card hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 py-2.5 text-xs font-bold transition cursor-pointer disabled:opacity-50"
        >
          <Star className="h-4 w-4" />
          AI Captain / Differentials
        </button>

        {aiLoading && (
          <div className="col-span-full flex items-center justify-center py-4 text-xs font-bold text-muted gap-2 border-t border-border mt-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            Consulting Gemini AI Assistant...
          </div>
        )}

        {aiReport && !aiLoading && (
          <div className="col-span-full bg-card border border-border rounded-2xl p-4 text-left text-xs leading-relaxed font-medium mt-2 max-h-[220px] overflow-y-auto">
            <div className="prose prose-sm dark:prose-invert">
              {aiReport.split("\n").map((line, idx) => (
                <p key={idx} className="mb-1">{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: The Football Pitch View & Bench (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-border overflow-hidden bg-emerald-950 p-4 shadow-lg">
            
            {/* Pitch Field */}
            <div className="pitch-bg rounded-2xl w-full aspect-[4/5] sm:aspect-[4/3.5] flex flex-col justify-between py-6 px-4">
              
              {/* Goalkeepers Line */}
              <div className="flex justify-center">
                {startingXI.filter(p => p.position === "GK").map(player => (
                  <div key={player.id} className="text-center relative">
                    <div className="flex flex-col items-center">
                      <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center shadow-lg relative cursor-pointer hover:scale-105 transition" onClick={() => removePlayerFromSquad(player.id)}>
                        <span className="text-lg sm:text-2xl">🧤</span>
                        {captain === player.id && <span className="absolute -top-1 -right-1 bg-indigo-600 text-[10px] text-white font-extrabold px-1 rounded-full border border-white">C</span>}
                        {viceCaptain === player.id && <span className="absolute -top-1 -right-1 bg-amber-500 text-[10px] text-white font-extrabold px-1 rounded-full border border-white">V</span>}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-white bg-slate-900/70 rounded px-1.5 py-0.5 mt-1 max-w-[80px] sm:max-w-[120px] truncate shadow">
                        {player.name.split(" ").pop()}
                      </span>
                      <span className="text-[9px] text-white/80 font-semibold">{player.cost} cr</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Defenders Line */}
              <div className="flex justify-around">
                {startingXI.filter(p => p.position === "DEF").map(player => (
                  <div key={player.id} className="text-center relative">
                    <div className="flex flex-col items-center">
                      <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-lg relative cursor-pointer hover:scale-105 transition" onClick={() => removePlayerFromSquad(player.id)}>
                        <span className="text-lg sm:text-2xl">🛡️</span>
                        {captain === player.id && <span className="absolute -top-1 -right-1 bg-indigo-600 text-[10px] text-white font-extrabold px-1 rounded-full border border-white">C</span>}
                        {viceCaptain === player.id && <span className="absolute -top-1 -right-1 bg-amber-500 text-[10px] text-white font-extrabold px-1 rounded-full border border-white">V</span>}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-white bg-slate-900/70 rounded px-1.5 py-0.5 mt-1 max-w-[70px] sm:max-w-[100px] truncate shadow">
                        {player.name.split(" ").pop()}
                      </span>
                      <span className="text-[9px] text-white/80 font-semibold">{player.cost} cr</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Midfielders Line */}
              <div className="flex justify-around">
                {startingXI.filter(p => p.position === "MID").map(player => (
                  <div key={player.id} className="text-center relative">
                    <div className="flex flex-col items-center">
                      <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center shadow-lg relative cursor-pointer hover:scale-105 transition" onClick={() => removePlayerFromSquad(player.id)}>
                        <span className="text-lg sm:text-2xl">🏃</span>
                        {captain === player.id && <span className="absolute -top-1 -right-1 bg-indigo-600 text-[10px] text-white font-extrabold px-1 rounded-full border border-white">C</span>}
                        {viceCaptain === player.id && <span className="absolute -top-1 -right-1 bg-amber-500 text-[10px] text-white font-extrabold px-1 rounded-full border border-white">V</span>}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-white bg-slate-900/70 rounded px-1.5 py-0.5 mt-1 max-w-[70px] sm:max-w-[100px] truncate shadow">
                        {player.name.split(" ").pop()}
                      </span>
                      <span className="text-[9px] text-white/80 font-semibold">{player.cost} cr</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Forwards Line */}
              <div className="flex justify-around">
                {startingXI.filter(p => p.position === "FWD").map(player => (
                  <div key={player.id} className="text-center relative">
                    <div className="flex flex-col items-center">
                      <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-lg relative cursor-pointer hover:scale-105 transition" onClick={() => removePlayerFromSquad(player.id)}>
                        <span className="text-lg sm:text-2xl">⚽</span>
                        {captain === player.id && <span className="absolute -top-1 -right-1 bg-indigo-600 text-[10px] text-white font-extrabold px-1 rounded-full border border-white">C</span>}
                        {viceCaptain === player.id && <span className="absolute -top-1 -right-1 bg-amber-500 text-[10px] text-white font-extrabold px-1 rounded-full border border-white">V</span>}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-white bg-slate-900/70 rounded px-1.5 py-0.5 mt-1 max-w-[70px] sm:max-w-[100px] truncate shadow">
                        {player.name.split(" ").pop()}
                      </span>
                      <span className="text-[9px] text-white/80 font-semibold">{player.cost} cr</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Bench Subtitle */}
            <div className="bg-emerald-900/30 rounded-2xl p-4 mt-4 text-left border border-white/5">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Bench Players</h3>
              <div className="grid grid-cols-4 gap-3">
                {bench.map(player => (
                  <div key={player.id} className="flex flex-col items-center text-center">
                    <div 
                      onClick={() => removePlayerFromSquad(player.id)}
                      className="w-10 h-10 rounded-full border border-white/20 bg-slate-800 flex items-center justify-center relative cursor-pointer hover:scale-105 transition"
                    >
                      <span className="text-base">👤</span>
                      {captain === player.id && <span className="absolute -top-1 -right-1 bg-indigo-600 text-[10px] text-white font-extrabold px-1 rounded-full border border-white">C</span>}
                      {viceCaptain === player.id && <span className="absolute -top-1 -right-1 bg-amber-500 text-[10px] text-white font-extrabold px-1 rounded-full border border-white">V</span>}
                    </div>
                    <span className="text-[10px] font-bold text-white/90 truncate max-w-[70px] mt-1">{player.name.split(" ").pop()}</span>
                    <span className="text-[9px] text-white/50">{player.position} • {player.cost}</span>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 15 - squad.length) }).map((_, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center h-20 rounded-2xl border border-dashed border-white/10 bg-white/5 text-white/30 text-xs">
                    Empty
                  </div>
                ))}
              </div>
            </div>

            {/* Captain setting modal */}
            {squadPlayers.length > 0 && (
              <div className="bg-emerald-900/30 border border-white/5 rounded-2xl p-4 mt-4 text-left grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5">Select Captain</label>
                  <select
                    value={captain}
                    onChange={(e) => setCaptain(e.target.value)}
                    className="w-full rounded-lg bg-slate-800 text-white border border-white/10 px-2.5 py-1 text-xs focus:outline-none"
                  >
                    <option value="">None</option>
                    {squadPlayers.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.position})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5">Select Vice-Captain</label>
                  <select
                    value={viceCaptain}
                    onChange={(e) => setViceCaptain(e.target.value)}
                    className="w-full rounded-lg bg-slate-800 text-white border border-white/10 px-2.5 py-1 text-xs focus:outline-none"
                  >
                    <option value="">None</option>
                    {squadPlayers.filter(p => p.id !== captain).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.position})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Player Selection List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xl font-bold border-b border-border pb-2 text-left">
            Player Pool Directory
          </h2>

          {/* Search and Filters */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={filterPos}
                onChange={(e) => setFilterPos(e.target.value)}
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none"
              >
                <option value="ALL">All Positions</option>
                <option value="GK">Goalkeeper (GK)</option>
                <option value="DEF">Defender (DEF)</option>
                <option value="MID">Midfielder (MID)</option>
                <option value="FWD">Forward (FWD)</option>
              </select>

              <select
                value={filterNation}
                onChange={(e) => setFilterNation(e.target.value)}
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none"
              >
                <option value="ALL">All Nations</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-border/60 pt-3">
              <span className="text-muted font-bold uppercase tracking-wider">Sort by</span>
              <div className="flex gap-2 font-semibold">
                <button onClick={() => setSortKey("cost")} className={`px-2.5 py-1 rounded-md transition ${sortKey === "cost" ? "bg-indigo-600 text-white" : "hover:bg-border/30 text-muted"}`}>Cost</button>
                <button onClick={() => setSortKey("goals")} className={`px-2.5 py-1 rounded-md transition ${sortKey === "goals" ? "bg-indigo-600 text-white" : "hover:bg-border/30 text-muted"}`}>Est Goals</button>
              </div>
            </div>
          </div>

          {/* Players List Container */}
          <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2 text-left">
            {filteredAvailablePlayers.map(player => {
              const isDrafted = squad.includes(player.id);
              const flag = getTeamFlag(player.nation);
              const natName = getTeamName(player.nation);
              
              return (
                <div 
                  key={player.id} 
                  className={`flex items-center justify-between rounded-2xl bg-card border p-3 hover:border-indigo-500/30 transition ${
                    isDrafted ? "border-indigo-500/20 bg-indigo-500/[0.02]" : "border-border"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{flag}</span>
                      <span className="font-extrabold text-sm">{player.name}</span>
                      <span className="text-[9px] font-extrabold bg-slate-500/10 text-muted px-1.5 py-0.5 rounded">
                        {player.position}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 font-medium">
                      {natName} • Est: {player.goalsEst} gls, {player.assistsEst} ast
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">{player.cost} cr</span>
                    
                    {isDrafted ? (
                      <button
                        onClick={() => removePlayerFromSquad(player.id)}
                        className="rounded-xl bg-red-500/10 text-red-500 p-2 border border-red-500/10 hover:bg-red-500/25 transition cursor-pointer"
                        title="Remove Player"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddPlayer(player.id)}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white p-2 transition shadow shadow-indigo-600/10 cursor-pointer"
                        title="Draft Player"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
