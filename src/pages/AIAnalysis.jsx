import React, { useState } from "react";
import { useFantasy } from "../context/FantasyContext.jsx";
import { players } from "../data/players.js";
import { teams } from "../data/teams.js";
import { getSquadRecommendation, suggestTransfers, suggestCaptain, getPreMatchAnalysis } from "../utils/ai.js";
import { Sparkles, BrainCircuit, RefreshCcw, Star, ShieldAlert, Cpu, HeartHandshake } from "lucide-react";

export default function AIAnalysis() {
  const { squad, addPlayerToSquad, clearSquad } = useFantasy();

  const [aiReport, setAiReport] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Custom Comparison Matchup
  const [t1Id, setT1Id] = useState("USA");
  const [t2Id, setT2Id] = useState("ENG");

  const runAiDraft = async () => {
    setLoading(true);
    setAiReport("");
    const apiKey = localStorage.getItem("gemini_api_key");
    
    try {
      const res = await getSquadRecommendation(players, apiKey);
      clearSquad();
      res.squadIds.forEach(id => addPlayerToSquad(id));
      setAiReport(`### 🤖 AI Squad Draft Completed!\n\nI have drafted a squad of 15 players matching your budget cap and national limits. Here is the rationale behind my selections:\n\n${res.explanation}`);
    } catch (e) {
      setAiReport(`*Error running AI draft: ${e.message}*`);
    } finally {
      setLoading(false);
    }
  };

  const runAiTransfers = async () => {
    if (squad.length === 0) {
      alert("Please draft a squad first before asking for transfer suggestions!");
      return;
    }
    setLoading(true);
    setAiReport("");
    const apiKey = localStorage.getItem("gemini_api_key");

    try {
      const res = await suggestTransfers(squad, players, apiKey);
      setAiReport(res);
    } catch (e) {
      setAiReport(`*Error generating transfer tips: ${e.message}*`);
    } finally {
      setLoading(false);
    }
  };

  const runAiCaptain = async () => {
    if (squad.length === 0) {
      alert("Please draft a squad first before asking for captain suggestions!");
      return;
    }
    setLoading(true);
    setAiReport("");
    const apiKey = localStorage.getItem("gemini_api_key");

    try {
      const res = await suggestCaptain(squad, players, apiKey);
      setAiReport(res);
    } catch (e) {
      setAiReport(`*Error generating captain recommendations: ${e.message}*`);
    } finally {
      setLoading(false);
    }
  };

  const runMatchupPreview = async () => {
    if (t1Id === t2Id) {
      alert("Select two different teams for preview!");
      return;
    }
    setLoading(true);
    setAiReport("");
    const apiKey = localStorage.getItem("gemini_api_key");

    const home = teams.find(t => t.id === t1Id);
    const away = teams.find(t => t.id === t2Id);

    try {
      const res = await getPreMatchAnalysis(home, away, apiKey);
      setAiReport(res);
    } catch (e) {
      setAiReport(`*Error generating match preview: ${e.message}*`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Header */}
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">
          Gemini AI Predictor Assistant
        </h1>
        <p className="text-muted text-sm md:text-base mt-1">
          Unlock insights using Google Gemini 3.5 Flash. Request automated draft selections, strategic transfers, and tactical previews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Actions Dashboard (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-bold border-b border-border pb-2 text-left">
            AI Actions Hub
          </h2>

          <div className="space-y-3">
            
            {/* Squad actions */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2.5 text-left">
              <span className="text-xs font-bold text-muted uppercase tracking-wider block">Fantasy Squad Tactics</span>
              
              <button
                onClick={runAiDraft}
                disabled={loading}
                className="w-full flex items-center justify-start gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-bold transition shadow disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Pick & Optimize Squad
              </button>

              <button
                onClick={runAiTransfers}
                disabled={loading}
                className="w-full flex items-center justify-start gap-2 rounded-xl border border-border hover:bg-border/30 px-4 py-2.5 text-xs font-semibold text-muted transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCcw className="h-4 w-4" />
                Recommend Best Transfers
              </button>

              <button
                onClick={runAiCaptain}
                disabled={loading}
                className="w-full flex items-center justify-start gap-2 rounded-xl border border-border hover:bg-border/30 px-4 py-2.5 text-xs font-semibold text-muted transition disabled:opacity-50 cursor-pointer"
              >
                <Star className="h-4 w-4" />
                Captain & Differentials Tips
              </button>
            </div>

            {/* Custom pre-match analysis */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3.5 text-left">
              <span className="text-xs font-bold text-muted uppercase tracking-wider block">Pre-Match Tactical Preview</span>
              
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={t1Id}
                  onChange={(e) => setT1Id(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  {teams.map(t => <option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}
                </select>

                <select
                  value={t2Id}
                  onChange={(e) => setT2Id(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  {teams.map(t => <option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}
                </select>
              </div>

              <button
                onClick={runMatchupPreview}
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition shadow disabled:opacity-50 cursor-pointer"
              >
                <Cpu className="h-4 w-4" />
                Simulate Match Preview
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: AI Prompt terminal output (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2 text-left">
            <BrainCircuit className="h-5 w-5 text-indigo-500" />
            AI Assistant Outputs
          </h2>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm min-h-[400px] text-left relative flex flex-col justify-between">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60 backdrop-blur-sm rounded-3xl">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                <span className="text-sm font-semibold text-muted mt-3">Consulting Gemini 3.5 Flash...</span>
              </div>
            ) : null}

            {aiReport ? (
              <div className="prose prose-sm dark:prose-invert max-w-none space-y-3 font-medium text-xs sm:text-sm leading-relaxed overflow-y-auto max-h-[500px]">
                {aiReport.split("\n").map((line, idx) => {
                  if (line.startsWith("###")) {
                    return <h3 key={idx} className="text-base font-extrabold text-foreground border-b border-border pb-1 mt-4">{line.replace("###", "")}</h3>;
                  }
                  if (line.startsWith("####")) {
                    return <h4 key={idx} className="text-sm font-extrabold text-indigo-500 mt-2">{line.replace("####", "")}</h4>;
                  }
                  if (line.startsWith("* **") || line.startsWith("- **")) {
                    return <li key={idx} className="ml-4 list-disc mt-1">{line.replace(/^[\*-]\s+/, "")}</li>;
                  }
                  if (line.startsWith("*") || line.startsWith("-")) {
                    return <li key={idx} className="ml-4 list-disc mt-0.5">{line.replace(/^[\*-]\s+/, "")}</li>;
                  }
                  return <p key={idx} className="mb-2">{line}</p>;
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 text-muted h-full">
                <BrainCircuit className="h-12 w-12 text-border mb-3" />
                <h3 className="font-semibold text-sm">AI Output Console</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
                  Run an AI action from the panel on the left to see Gemini's strategic draft suggestions and analysis here.
                </p>
              </div>
            )}

            <div className="flex gap-2 rounded-xl bg-background border border-border p-3 text-xs text-muted items-start mt-6">
              <HeartHandshake className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Tip:</span> Save your Gemini API Key in the settings at the top right for live AI reports. If no key is configured, fallback simulation reports will be run.
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
