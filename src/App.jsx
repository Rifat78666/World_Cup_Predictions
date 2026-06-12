import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Groups from "./pages/Groups.jsx";
import Bracket from "./pages/Bracket.jsx";
import Teams from "./pages/Teams.jsx";
import MyPredictions from "./pages/MyPredictions.jsx";
import FantasySquad from "./pages/FantasySquad.jsx";
import LiveGameweek from "./pages/LiveGameweek.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import AIAnalysis from "./pages/AIAnalysis.jsx";

import { PredictorProvider } from "./context/PredictorContext.jsx";
import { FantasyProvider } from "./context/FantasyContext.jsx";

function AppContent() {
  const [activePage, setActivePage] = useState("groups");

  // Restore state from share link if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get("share");
    if (shareData) {
      try {
        const decoded = JSON.parse(atob(shareData));
        if (decoded.s) localStorage.setItem("wc_fantasy_squad", JSON.stringify(decoded.s));
        if (decoded.c) localStorage.setItem("wc_fantasy_captain", decoded.c);
        if (decoded.vc) localStorage.setItem("wc_fantasy_vice_captain", decoded.vc);
        if (decoded.f) localStorage.setItem("wc_fantasy_formation", decoded.f);
        
        // Clear share param from URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        alert("Loaded shared Fantasy Squad and Formation details successfully!");
        window.location.reload();
      } catch (e) {
        console.error("Failed to parse shared state:", e);
      }
    }
  }, []);

  const renderActivePage = () => {
    switch (activePage) {
      case "groups":
        return <Groups />;
      case "bracket":
        return <Bracket />;
      case "teams":
        return <Teams />;
      case "predictions":
        return <MyPredictions />;
      case "fantasy":
        return <FantasySquad />;
      case "live":
        return <LiveGameweek />;
      case "leaderboard":
        return <Leaderboard />;
      case "ai":
        return <AIAnalysis />;
      default:
        return <Groups />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-250 flex flex-col justify-between">
      <div>
        <Navbar activePage={activePage} setActivePage={setActivePage} />
        <main className="pb-16">
          {renderActivePage()}
        </main>
      </div>

      <footer className="w-full border-t border-border bg-card py-6 text-center text-xs text-muted font-semibold">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>🏆 2026 FIFA World Cup Predictor & Fantasy Football App</span>
          <span className="text-[10px] text-muted-foreground">Powered by Gemini 3.5 Flash Client-Side Engine</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <PredictorProvider>
      <FantasyProvider>
        <AppContent />
      </FantasyProvider>
    </PredictorProvider>
  );
}
