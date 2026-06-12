import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Groups from "./pages/Groups.jsx";
import Bracket from "./pages/Bracket.jsx";
import Teams from "./pages/Teams.jsx";
import MyPredictions from "./pages/MyPredictions.jsx";
import FantasySquad from "./pages/FantasySquad.jsx";
import LiveDraft from "./pages/LiveDraft.jsx";
import LiveGameweek from "./pages/LiveGameweek.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import AIAnalysis from "./pages/AIAnalysis.jsx";
import Settings from "./pages/Settings.jsx";
import LiveScorecard from "./components/LiveScorecard.jsx";

import { PredictorProvider } from "./context/PredictorContext.jsx";
import { FantasyProvider } from "./context/FantasyContext.jsx";
import { Download, X } from "lucide-react";

function AppContent() {
  const [activePage, setActivePage] = useState("groups");

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Catch PWA beforeinstallprompt event
  useEffect(() => {
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleOfflineStatus = () => setIsOffline(true);
    const handleOnlineStatus = () => setIsOffline(false);

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("offline", handleOfflineStatus);
    window.addEventListener("online", handleOnlineStatus);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("offline", handleOfflineStatus);
      window.removeEventListener("online", handleOnlineStatus);
    };
  }, []);

  // Show install banner after 30 seconds on the Fantasy Squad page
  useEffect(() => {
    let timeout;
    if (activePage === "fantasy" && deferredPrompt) {
      timeout = setTimeout(() => {
        setShowInstallBanner(true);
      }, 30000);
    } else {
      setShowInstallBanner(false);
    }
    return () => clearTimeout(timeout);
  }, [activePage, deferredPrompt]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Installation outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

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
      case "draft":
        return <LiveDraft />;
      case "live":
        return <LiveGameweek />;
      case "leaderboard":
        return <Leaderboard />;
      case "ai":
        return <AIAnalysis />;
      case "settings":
        return <Settings />;
      default:
        return <Groups />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-250 flex flex-col justify-between relative">
      
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="w-full bg-red-600 text-white text-xs font-bold py-2 px-4 text-center animate-pulse">
          ⚠️ Running Offline: Serving Cached App Shell. Last Updated: {new Date().toLocaleTimeString()}
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="w-full bg-indigo-600 text-white py-3 px-4 flex justify-between items-center text-xs sm:text-sm font-semibold shadow-md animate-fadeIn z-30">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 shrink-0" />
            <span>Install World Cup Manager on your home screen for quick offline access and scorecards!</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleInstallApp}
              className="bg-white text-indigo-600 font-extrabold px-3 py-1 rounded-lg hover:bg-indigo-50 transition cursor-pointer"
            >
              Install App
            </button>
            <button onClick={() => setShowInstallBanner(false)} className="text-white/80 hover:text-white transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div>
        <Navbar activePage={activePage} setActivePage={setActivePage} />
        <main className="pb-16">
          {renderActivePage()}
        </main>
      </div>

      {/* Live Scorecard Floating Widget */}
      <LiveScorecard />

      <footer className="w-full border-t border-border bg-card py-6 text-center text-xs text-muted font-semibold">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>🏆 2026 FIFA World Cup Predictor & Fantasy Football App</span>
          <span className="text-[10px] text-muted-foreground">PWA Offline-Ready • Web Push Notifications Enabled</span>
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
