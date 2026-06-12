import React, { useState, useEffect } from "react";
import { Bell, Key, ShieldCheck, Info, MessageSquare, Cpu, Radio } from "lucide-react";

export default function Settings() {
  // Notification Permission State
  const [permissionState, setPermissionState] = useState(() => {
    return typeof Notification !== "undefined" ? Notification.permission : "default";
  });

  const [toggles, setToggles] = useState(() => {
    const saved = localStorage.getItem("wc_settings_notifications");
    return saved ? JSON.parse(saved) : {
      start15: true,
      kickoff: true,
      goals: true,
      cards: true,
      points: true,
      results: true,
      deadline: true
    };
  });

  const [draftTimer, setDraftTimer] = useState(() => {
    return parseInt(localStorage.getItem("wc_settings_draft_timer") || "60", 10);
  });

  const [wsUrl, setWsUrl] = useState(() => {
    return localStorage.getItem("wc_settings_ws_url") || "ws://localhost:8080";
  });

  const [realtimeSync, setRealtimeSync] = useState(() => {
    return localStorage.getItem("wc_settings_sync") === "true";
  });

  useEffect(() => {
    localStorage.setItem("wc_settings_notifications", JSON.stringify(toggles));
  }, [toggles]);

  useEffect(() => {
    localStorage.setItem("wc_settings_draft_timer", draftTimer.toString());
  }, [draftTimer]);

  useEffect(() => {
    localStorage.setItem("wc_settings_ws_url", wsUrl);
  }, [wsUrl]);

  useEffect(() => {
    localStorage.setItem("wc_settings_sync", realtimeSync.toString());
  }, [realtimeSync]);

  const requestNotificationPermission = async () => {
    if (typeof Notification === "undefined") {
      alert("This browser does not support Web Push notifications.");
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      if (permission === "granted") {
        alert("Push notifications enabled successfully!");
      }
    } catch (e) {
      console.error("Failed to request permission:", e);
    }
  };

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      
      {/* Header */}
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">
          Application Settings
        </h1>
        <p className="text-muted text-sm md:text-base mt-1">
          Configure real-time push alerts, Web Push APIs, and live snake draft synchronization.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* PUSH NOTIFICATIONS CONTROLS */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm text-left">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3 mb-4">
            <Bell className="h-5 w-5 text-indigo-500" />
            Push Notifications (Web Push API)
          </h2>

          {/* Custom Permission Banner */}
          {permissionState !== "granted" && (
            <div className="rounded-2xl bg-indigo-500/5 border border-indigo-500/20 p-4 mb-5 flex items-start gap-3">
              <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">Enable Web Push Notifications</h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Receive real-time match goals, kick-off alerts, card counts, and transfer deadline reminders. Toggles can be configured below.
                </p>
                <button
                  onClick={requestNotificationPermission}
                  className="mt-3 inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Grant Permission
                </button>
              </div>
            </div>
          )}

          {/* Toggle Checklist */}
          <div className="space-y-3">
            {[
              { id: "start15", label: "Match Starting Soon", desc: "Alert 15 minutes before kick-off time" },
              { id: "kickoff", label: "Match Kick-off", desc: "Immediate alert when the match starts" },
              { id: "goals", label: "Goal Alerts (Squad)", desc: "Alerts when players in your fantasy squad score" },
              { id: "cards", label: "Disciplinary Alerts (Squad)", desc: "Alerts when players in your squad receive cards" },
              { id: "points", label: "GW Points Updates", desc: "Notification at final-time with points calculated" },
              { id: "results", label: "Match Results", desc: "Notification with final scorelines" },
              { id: "deadline", label: "Transfer Deadline Reminders", desc: "Alert 1 hour before a round lock deadline" }
            ].map(item => (
              <div key={item.id} className="flex items-start justify-between p-2.5 rounded-xl hover:bg-muted-foreground/3 transition">
                <div>
                  <span className="font-bold text-sm text-foreground block">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={toggles[item.id]}
                  onChange={() => handleToggle(item.id)}
                  className="h-5.5 w-5.5 rounded border-border text-indigo-600 focus:ring-indigo-500 shrink-0 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* LIVE SNAKE DRAFT CONFIGURATION */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm text-left">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3 mb-4">
            <Radio className="h-5 w-5 text-indigo-500" />
            Live Draft Room Settings
          </h2>

          <div className="space-y-4">
            {/* Draft Timer select */}
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Pick Time Limit</label>
              <select
                value={draftTimer}
                onChange={(e) => setDraftTimer(parseInt(e.target.value, 10))}
                className="w-full sm:w-64 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="30">30 seconds per pick</option>
                <option value="60">60 seconds per pick</option>
                <option value="90">90 seconds per pick</option>
              </select>
            </div>

            {/* Websocket Sync URL */}
            <div className="border-t border-border/60 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-sm text-foreground block">WebSocket Room Synchronization</span>
                  <span className="text-xs text-muted-foreground">Sync draft picks in real-time with a Node.js WS server</span>
                </div>
                <input
                  type="checkbox"
                  checked={realtimeSync}
                  onChange={() => setRealtimeSync(!realtimeSync)}
                  className="h-5.5 w-5.5 rounded border-border text-indigo-600 focus:ring-indigo-500 shrink-0 cursor-pointer"
                />
              </div>

              {realtimeSync && (
                <div className="space-y-2 mt-3 animate-fadeIn">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider">WebSocket Server URL</label>
                  <input
                    type="text"
                    value={wsUrl}
                    onChange={(e) => setWsUrl(e.target.value)}
                    className="w-full sm:w-96 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-muted block leading-relaxed">
                    * The default push-server runs under the `backend/` directory. Run `node backend/server.js` locally to connect.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
