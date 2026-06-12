import React, { useState, useEffect } from "react";
import { Trophy, Key, Moon, Sun, Share2, Menu, X, Timer } from "lucide-react";
import { usePredictor } from "../context/PredictorContext.jsx";
import { useFantasy } from "../context/FantasyContext.jsx";

export default function Navbar({ activePage, setActivePage }) {
  const { groupFixtures, knockoutPredictions } = usePredictor();
  const { squad, captain, viceCaptain, formation } = useFantasy();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("wc_theme") === "dark" || 
      (!localStorage.getItem("wc_theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });
  
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    return localStorage.getItem("gemini_api_key") || "";
  });
  const [hasApiKey, setHasApiKey] = useState(!!apiKeyInput);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countdownText, setCountdownText] = useState("");

  // Countdown timer to July 19, 2026 (Final)
  useEffect(() => {
    const finalDate = new Date("2026-07-19T20:00:00").getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = finalDate - now;
      
      if (diff <= 0) {
        setCountdownText("Final Day!");
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setCountdownText(`${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Theme toggle effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("wc_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("wc_theme", "light");
    }
  }, [darkMode]);

  const saveApiKey = () => {
    localStorage.setItem("gemini_api_key", apiKeyInput.trim());
    setHasApiKey(!!apiKeyInput.trim());
    setShowKeyModal(false);
    // Reload page to re-initialize model
    window.location.reload();
  };

  const removeApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKeyInput("");
    setHasApiKey(false);
    setShowKeyModal(false);
    window.location.reload();
  };

  // Share layout logic: encodes predictor & fantasy state in URL search parameters
  const shareState = () => {
    try {
      const stateObj = {
        s: squad,
        c: captain,
        vc: viceCaptain,
        f: formation
      };
      const encoded = btoa(JSON.stringify(stateObj));
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
      
      navigator.clipboard.writeText(shareUrl);
      alert("Custom prediction & fantasy squad link copied to clipboard! Send it to your friends.");
    } catch (e) {
      alert("Failed to generate shareable link.");
    }
  };

  const navItems = [
    { id: "groups", label: "Groups" },
    { id: "bracket", label: "Bracket" },
    { id: "teams", label: "Teams" },
    { id: "predictions", label: "My Predictions" },
    { id: "fantasy", label: "Fantasy Squad" },
    { id: "live", label: "Live Gameweek" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "ai", label: "AI Analysis" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePage("groups")}>
          <div className="rounded-lg bg-indigo-600 p-2 text-white glow-card">
            <Trophy className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 bg-clip-text text-transparent">
            World Cup 2026
          </span>
        </div>

        {/* Desktop Navbar Menu */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-250 ${
                activePage === item.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-muted hover:bg-border/30 hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Timer Countdown */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted bg-card">
            <Timer className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-indigo-600 dark:text-indigo-400">{countdownText} to Final</span>
          </div>

          {/* Share button */}
          <button
            onClick={shareState}
            title="Share My Squad & Predictions"
            className="rounded-full p-2 border border-border hover:bg-border/30 text-muted hover:text-foreground transition bg-card"
          >
            <Share2 className="h-4.5 w-4.5" />
          </button>

          {/* Gemini API Key config */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 border border-border text-xs font-semibold bg-card transition ${
              hasApiKey 
                ? "text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/20" 
                : "text-amber-600 border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-950/20"
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{hasApiKey ? "Gemini Active" : "Mock Mode"}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full p-2 border border-border hover:bg-border/30 text-muted hover:text-foreground transition bg-card"
          >
            {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden rounded-full p-2 border border-border hover:bg-border/30 transition bg-card"
          >
            {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          <div className="flex justify-center sm:hidden pb-2">
            <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted bg-background">
              <Timer className="h-3.5 w-3.5 text-indigo-500" />
              <span>{countdownText} to Final</span>
            </div>
          </div>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                activePage === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-muted hover:bg-border/30 hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Gemini API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-500" />
              Gemini API Configuration
            </h3>
            <p className="mt-2 text-sm text-muted">
              Configure your Gemini API Key to enable AI-powered pre-match previews, team comparisons, and fantasy squad suggestions.
            </p>
            <p className="mt-1 text-xs text-amber-500 font-medium">
              * The key is stored locally in your browser's localStorage and is sent directly to the Google Gemini API.
            </p>
            
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2 text-sm font-semibold">
              <button
                onClick={() => setShowKeyModal(false)}
                className="rounded-lg px-4 py-2 border border-border hover:bg-border/30 transition"
              >
                Cancel
              </button>
              {hasApiKey && (
                <button
                  onClick={removeApiKey}
                  className="rounded-lg px-4 py-2 bg-red-600 hover:bg-red-700 text-white transition"
                >
                  Clear Key
                </button>
              )}
              <button
                onClick={saveApiKey}
                className="rounded-lg px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
