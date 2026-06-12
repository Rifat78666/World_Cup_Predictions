import React, { useState } from "react";
import { teams } from "../data/teams.js";
import { getPreMatchAnalysis } from "../utils/ai.js";
import { Sparkles, Search, SlidersHorizontal, Info, ShieldAlert, Cpu } from "lucide-react";

export default function Teams() {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom Matchup Analyzer state
  const [homeAnalyzeTeamId, setHomeAnalyzeTeamId] = useState("ARG");
  const [awayAnalyzeTeamId, setAwayAnalyzeTeamId] = useState("FRA");
  const [aiAnalysisResult, setAiAnalysisResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredTeams = teams.filter(t => {
    const matchesGroup = selectedGroupFilter === "ALL" || t.group === selectedGroupFilter;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const runAiAnalysis = async () => {
    if (homeAnalyzeTeamId === awayAnalyzeTeamId) {
      alert("Please select two different teams for analysis!");
      return;
    }
    
    setIsAnalyzing(true);
    setAiAnalysisResult("");

    const home = teams.find(t => t.id === homeAnalyzeTeamId);
    const away = teams.find(t => t.id === awayAnalyzeTeamId);
    const apiKey = localStorage.getItem("gemini_api_key");

    try {
      const report = await getPreMatchAnalysis(home, away, apiKey);
      setAiAnalysisResult(report);
    } catch (e) {
      setAiAnalysisResult(`*Error generating report: ${e.message}*`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Favourites list sorted by FIFA Ranking
  const favourites = [...teams].sort((a, b) => a.ranking - b.ranking).slice(0, 10);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Intro Header */}
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">
          Teams & AI Matchup Analyzer
        </h1>
        <p className="text-muted text-sm md:text-base mt-1">
          Explore the 48 competing nations, view tactical profiles, or run custom AI simulations between any two teams.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: Favourites Leaderboard & AI Matchup Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Matchup Simulator */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3 mb-4 text-left">
              <Cpu className="h-5 w-5 text-indigo-500" />
              AI Pre-Match Analyzer
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Select Home Team */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5 text-left">Home Team</label>
                  <select
                    value={homeAnalyzeTeamId}
                    onChange={(e) => setHomeAnalyzeTeamId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Select Away Team */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5 text-left">Away Team</label>
                  <select
                    value={awayAnalyzeTeamId}
                    onChange={(e) => setAwayAnalyzeTeamId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={runAiAnalysis}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-sm font-semibold transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {isAnalyzing ? "Analyzing Matchup..." : "Run AI Pre-Match Analysis"}
              </button>

              {/* Analysis output container */}
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center p-6 bg-background rounded-2xl border border-border mt-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                  <span className="text-xs font-medium text-muted mt-3">Consulting Gemini 3.5 Flash...</span>
                </div>
              )}

              {aiAnalysisResult && !isAnalyzing && (
                <div className="p-4 bg-background rounded-2xl border border-border text-left mt-4 max-h-[300px] overflow-y-auto text-xs leading-relaxed font-medium">
                  <div className="prose prose-sm dark:prose-invert">
                    {aiAnalysisResult.split("\n").map((line, idx) => (
                      <p key={idx} className="mb-1">{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Favorites Win-Probability Leaderboard */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-bold border-b border-border pb-3 mb-4 text-left">
              🏆 Favourites & Win Probability
            </h2>
            <div className="space-y-3">
              {favourites.map((team, idx) => {
                // Approximate win probability based on FIFA rank
                const prob = Math.round(88 - (team.ranking - 1) * 3);
                return (
                  <div key={team.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="text-muted w-4 text-xs font-bold">{idx + 1}</span>
                      <span>{team.flag}</span>
                      <span>{team.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-background border border-border rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${prob}%` }}
                        ></div>
                      </div>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs w-8 text-right">{prob}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Nations Tacts Directory & Filters (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-card border border-border rounded-2xl p-3 shadow-sm">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1 shrink-0 px-2">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Group:
              </span>
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Groups</option>
                {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map(l => (
                  <option key={l} value={l}>Group {l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Teams Profile Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTeams.map(team => {
              return (
                <div 
                  key={team.id}
                  onClick={() => {
                    setHomeAnalyzeTeamId(team.id);
                    // Scroll to Analyzer on mobile
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="rounded-2xl border border-border bg-card p-4 text-left transition duration-150 hover:border-indigo-500/40 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{team.flag}</span>
                        <span className="font-extrabold text-base">{team.name}</span>
                      </div>
                      <span className="text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                        Grp {team.group}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs font-semibold text-muted">
                      <div>🏆 FIFA Rank: <span className="text-foreground">#{team.ranking}</span></div>
                      <div>⚡ Form: <span className="text-foreground">{team.form}</span></div>
                      <div className="truncate">🎯 Playing Style: <span className="text-foreground">{team.style}</span></div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center border-t border-border/60 pt-3">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Group Difficulty</span>
                    <span className={`text-xs font-extrabold ${
                      team.difficulty === 5 ? "text-red-500" :
                      team.difficulty >= 3 ? "text-amber-500" : "text-emerald-500"
                    }`}>
                      {team.difficulty === 5 ? "Death" : team.difficulty === 4 ? "Hard" : team.difficulty === 3 ? "Medium" : "Easy"}
                    </span>
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
