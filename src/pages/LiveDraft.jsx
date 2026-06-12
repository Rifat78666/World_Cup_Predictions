import React, { useState, useEffect, useRef } from "react";
import { useFantasy } from "../context/FantasyContext.jsx";
import { players as initialPlayers } from "../data/players.js";
import { teams } from "../data/teams.js";
import { Sparkles, MessageSquare, Play, Users, Clock, AlertTriangle, ShieldCheck, Trophy, Share2 } from "lucide-react";
import confetti from "canvas-confetti";

const MOCK_BOTS = [
  { id: "bot1", name: "Pep Guardiola", avatar: "👨‍🦲", style: "possession", quotes: ["We need midfielders!", "More than you know.", "Incredible performance."] },
  { id: "bot2", name: "Carlo Ancelotti", avatar: "🤨", style: "balanced", quotes: ["Let's build a secure defense.", "Experience wins tournaments.", "Simple play is best."] },
  { id: "bot3", name: "Jose Mourinho", avatar: "🤫", style: "defensive", quotes: ["I prefer not to speak.", "Park the bus first.", "Points are what matters."] },
  { id: "bot4", name: "Jurgen Klopp", avatar: "👓", style: "pressing", quotes: ["Gegenpressing is key!", "BOOM! What a player.", "Energy on the pitch!"] },
  { id: "bot5", name: "Zinedine Zidane", avatar: "🎩", style: "balanced", quotes: ["Technique is everything.", "Play with class.", "Focus on the finals."] },
  { id: "bot6", name: "Diego Simeone", avatar: "🕴️", style: "defensive", quotes: ["Fight for every ball!", "Defense is our attack.", "Intensity!"] },
  { id: "bot7", name: "Mikel Arteta", avatar: "💇‍♂️", style: "pressing", quotes: ["Trust the process.", "We need high intensity.", "Good body language."] }
];

export default function LiveDraft() {
  const { addPlayerToSquad, clearSquad, squad } = useFantasy();

  // Settings
  const defaultTimerSec = parseInt(localStorage.getItem("wc_settings_draft_timer") || "60", 10);

  // States: 'lobby', 'drafting', 'postdraft'
  const [draftState, setDraftState] = useState("lobby");
  
  // Lobby States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "Jose Mourinho", msg: "I will secure Vinicius in round 1. Mark my words." },
    { sender: "Pep Guardiola", msg: "I prefer technical midfielders. Soucek is mine." }
  ]);
  const [managersReady, setManagersReady] = useState({
    user: true,
    bot1: true,
    bot2: false,
    bot3: true,
    bot4: false,
    bot5: true,
    bot6: false,
    bot7: true
  });

  // Draft Room States
  const [availablePlayers, setAvailablePlayers] = useState(initialPlayers);
  const [draftedPicks, setDraftedPicks] = useState([]); // Array of { round, managerIndex, player }
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPickIndex, setCurrentPickIndex] = useState(0); // 0 to 7 managers
  const [snakeDirection, setSnakeDirection] = useState(1); // 1 = forward, -1 = reverse
  const [timeLeft, setTimeLeft] = useState(defaultTimerSec);
  const [selectedPosFilter, setSelectedPosFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const timerRef = useRef(null);
  const scrollRef = useRef(null);

  const managersList = [
    { id: "user", name: "You", avatar: "⚽" },
    ...MOCK_BOTS
  ];

  // 15 draft rounds
  const totalRounds = 15;

  // Simulate Lobby chat & bots going ready
  useEffect(() => {
    if (draftState !== "lobby") return;

    const interval = setInterval(() => {
      // Toggle bot ready status
      const unreadyBots = Object.keys(managersReady).filter(k => k !== "user" && !managersReady[k]);
      if (unreadyBots.length > 0) {
        const botKey = unreadyBots[Math.floor(Math.random() * unreadyBots.length)];
        setManagersReady(prev => ({ ...prev, [botKey]: true }));
        
        // Push a bot quote
        const botName = managersList.find(m => m.id === botKey)?.name;
        const botObj = MOCK_BOTS.find(b => b.name === botName);
        if (botObj) {
          const randQuote = botObj.quotes[Math.floor(Math.random() * botObj.quotes.length)];
          setChatMessages(prev => [...prev, { sender: botName, msg: randQuote }]);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [draftState, managersReady]);

  // Handle draft timers & turn transitions
  useEffect(() => {
    if (draftState !== "drafting") return;

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time expired - Autopick!
          handleAutoPick();
          return defaultTimerSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [draftState, currentRound, currentPickIndex]);

  // Auto-run bot pick if bot turn
  useEffect(() => {
    if (draftState !== "drafting") return;
    const currentManager = getCurrentManager();
    
    if (currentManager.id !== "user") {
      // Simulate bot thinking delay (1.5s)
      const timeout = setTimeout(() => {
        makeBotPick(currentManager);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [draftState, currentRound, currentPickIndex]);

  const getCurrentManager = () => {
    // Current manager index on clock
    return managersList[currentPickIndex];
  };

  const getTeamFlag = (nationCode) => teams.find(t => t.id === nationCode)?.flag || "🏳️";

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: "You", msg: chatInput.trim().substring(0, 140) }]);
    setChatInput("");
    
    // Bots replying
    setTimeout(() => {
      const randomBot = MOCK_BOTS[Math.floor(Math.random() * MOCK_BOTS.length)];
      setChatMessages(prev => [...prev, { sender: randomBot.name, msg: "Sounds like a plan! Let the draft begin!" }]);
    }, 1500);
  };

  const startDraft = () => {
    clearSquad();
    setDraftState("drafting");
    setAvailablePlayers(initialPlayers);
    setDraftedPicks([]);
    setCurrentRound(1);
    setCurrentPickIndex(0);
    setSnakeDirection(1);
    setTimeLeft(defaultTimerSec);
  };

  const executePick = (player, managerId) => {
    // Add to lists
    setDraftedPicks(prev => [...prev, {
      round: currentRound,
      manager: managerId,
      player
    }]);

    setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));

    // If User, add to squad
    if (managerId === "user") {
      addPlayerToSquad(player.id);
    }

    // Move turn index
    advanceDraftTurn();
  };

  const advanceDraftTurn = () => {
    setTimeLeft(defaultTimerSec);
    let nextPickIdx = currentPickIndex + snakeDirection;

    // Check bounds / reverse direction on snake ends
    if (nextPickIdx > 7) { // End of forward round
      if (currentRound >= totalRounds) {
        finishDraft();
        return;
      }
      setCurrentRound(prev => prev + 1);
      setSnakeDirection(-1);
      setCurrentPickIndex(7); // Snake wraps back (8th pick gets back-to-back picks)
    } else if (nextPickIdx < 0) { // End of reverse round
      if (currentRound >= totalRounds) {
        finishDraft();
        return;
      }
      setCurrentRound(prev => prev + 1);
      setSnakeDirection(1);
      setCurrentPickIndex(0); // Snake wraps back
    } else {
      setCurrentPickIndex(nextPickIdx);
    }
  };

  const handleAutoPick = () => {
    const manager = getCurrentManager();
    const remaining = availablePlayers.sort((a, b) => b.cost - a.cost);
    if (remaining.length > 0) {
      executePick(remaining[0], manager.id);
    }
  };

  const makeBotPick = (bot) => {
    // Bot logic: pick the highest value player based on position requirements
    // For simplicity, just pick a premium player who matches their tactical style
    // Filter out position limits if they already have full slots (GKs: 2, DEFs: 5, MIDs: 5, FWDs: 3)
    const botSquad = draftedPicks.filter(p => p.manager === bot.id).map(p => p.player);
    const botPosCount = botSquad.reduce((acc, p) => {
      acc[p.position]++;
      return acc;
    }, { GK: 0, DEF: 0, MID: 0, FWD: 0 });

    const maxPos = { GK: 2, DEF: 5, MID: 5, FWD: 3 };
    const allowedPositions = Object.keys(maxPos).filter(pos => botPosCount[pos] < maxPos[pos]);

    const choices = availablePlayers.filter(p => allowedPositions.includes(p.position));
    
    // Sort choices by cost/stats
    choices.sort((a, b) => {
      const valA = a.goalsEst * 6 + a.assistsEst * 3;
      const valB = b.goalsEst * 6 + b.assistsEst * 3;
      return valB - valA;
    });

    if (choices.length > 0) {
      executePick(choices[0], bot.id);
    } else {
      // Fallback
      executePick(availablePlayers[0], bot.id);
    }
  };

  const finishDraft = () => {
    setDraftState("postdraft");
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  // Filter pool
  const filteredPool = availablePlayers.filter(p => {
    const matchesPos = selectedPosFilter === "ALL" || p.position === selectedPosFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPos && matchesSearch;
  }).sort((a, b) => b.cost - a.cost);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* LOBBY MODE */}
      {draftState === "lobby" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Managers lobby status (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-border bg-card p-6 shadow-sm text-left">
            <h2 className="text-xl font-extrabold flex items-center gap-2 border-b border-border pb-3 mb-5">
              <Users className="h-5 w-5 text-indigo-500" />
              Draft Lobby Managers
            </h2>

            <div className="space-y-3">
              {managersList.map(m => {
                const isReady = managersReady[m.id];
                return (
                  <div key={m.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-background p-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.avatar}</span>
                      <span className="font-extrabold text-sm">{m.name}</span>
                      {m.id !== "user" && (
                        <span className="text-[9px] bg-slate-500/10 text-muted px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider">Bot AI</span>
                      )}
                    </div>
                    
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      isReady ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {isReady ? "Ready" : "Waiting"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Start Button */}
            <button
              onClick={startDraft}
              className="mt-6 w-full flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 text-sm font-bold transition shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Play className="h-4.5 w-4.5" />
              Start Snake Draft
            </button>
          </div>

          {/* Right panel: Pre-draft Chat Room (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-6 shadow-sm text-left flex flex-col justify-between h-[520px]">
            <h2 className="text-xl font-extrabold flex items-center gap-2 border-b border-border pb-3 mb-4">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              Pre-Draft Manager Chat
            </h2>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 mb-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`p-3 rounded-2xl text-xs max-w-[80%] font-medium ${
                  msg.sender === "You" 
                    ? "bg-indigo-600 text-white ml-auto" 
                    : "bg-background border border-border"
                }`}>
                  <span className="font-extrabold block mb-0.5 text-[10px] text-muted-foreground/80 dark:text-muted-foreground/60">
                    {msg.sender === "You" ? "" : msg.sender}
                  </span>
                  <span>{msg.msg}</span>
                </div>
              ))}
            </div>

            {/* Input field */}
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                placeholder="Send chat message (max 140 chars)..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value.substring(0, 140))}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>

        </div>
      )}

      {/* DRAFTING ROOM MODE */}
      {draftState === "drafting" && (
        <div className="space-y-6">
          
          {/* Header Stats & Timer */}
          <div className="rounded-3xl border border-border bg-card p-4 md:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Round {currentRound} of 15</span>
              <h2 className="text-xl font-bold flex items-center gap-2 mt-1">
                On the Clock: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{getCurrentManager().name}</span>
                {getCurrentManager().id === "user" && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full animate-pulse">Your Turn</span>
                )}
              </h2>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-base font-extrabold ${
              timeLeft < 10 ? "border-red-500/30 text-red-500 bg-red-500/5 animate-pulse" : "border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
            }`}>
              <Clock className="h-5 w-5" />
              <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Draft Board (3 cols) */}
            <div className="lg:col-span-3 rounded-3xl border border-border bg-card p-4 shadow-sm text-left space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted border-b border-border pb-2">Draft Board</h3>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {draftedPicks.map((pick, idx) => {
                  const manager = managersList.find(m => m.id === pick.manager);
                  return (
                    <div key={idx} className="rounded-xl border border-border/60 bg-background p-2 text-xs flex justify-between items-center font-medium">
                      <div>
                        <span className="font-extrabold block text-[10px] text-muted">Rd {pick.round} • {manager?.name}</span>
                        <span>{pick.player.name}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">{pick.player.position}</span>
                    </div>
                  );
                })}
                {draftedPicks.length === 0 && (
                  <span className="text-xs text-muted block py-4 text-center">No picks yet.</span>
                )}
              </div>
            </div>

            {/* CENTER COLUMN: Available Player selection (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-3xl border border-border bg-card p-4 shadow-sm space-y-3 text-left">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted border-b border-border pb-2">Available Players</h3>
                
                {/* Search / filter */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Search name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 focus:outline-none"
                  />
                  <select
                    value={selectedPosFilter}
                    onChange={(e) => setSelectedPosFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 focus:outline-none"
                  >
                    <option value="ALL">All Positions</option>
                    <option value="GK">Goalkeeper (GK)</option>
                    <option value="DEF">Defender (DEF)</option>
                    <option value="MID">Midfielder (MID)</option>
                    <option value="FWD">Forward (FWD)</option>
                  </select>
                </div>
              </div>

              {/* Player Listing grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1 text-left">
                {filteredPool.map(player => {
                  const isUserTurn = getCurrentManager().id === "user";
                  return (
                    <div key={player.id} className="rounded-2xl border border-border bg-card p-3 flex flex-col justify-between items-start">
                      <div className="w-full">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold bg-slate-500/10 text-muted px-2 py-0.5 rounded">
                            {player.position}
                          </span>
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">{player.cost} cr</span>
                        </div>
                        <h4 className="font-extrabold text-sm mt-2 flex items-center gap-1.5">
                          <span>{getTeamFlag(player.nation)}</span>
                          <span className="truncate">{player.name}</span>
                        </h4>
                        <span className="text-[10px] text-muted-foreground block mt-1">
                          Est: {player.goalsEst} gls, {player.assistsEst} ast
                        </span>
                      </div>

                      <button
                        onClick={() => executePick(player, "user")}
                        disabled={!isUserTurn}
                        className="mt-3.5 w-full flex items-center justify-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                      >
                        Draft Player
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Your squad drafted so far (3 cols) */}
            <div className="lg:col-span-3 rounded-3xl border border-border bg-card p-4 shadow-sm text-left space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted border-b border-border pb-2">Your Drafted Squad ({squad.length}/15)</h3>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 text-xs">
                {initialPlayers.filter(p => squad.includes(p.id)).map(p => (
                  <div key={p.id} className="rounded-xl border border-border/60 bg-background p-2.5 flex justify-between items-center font-bold">
                    <div className="flex items-center gap-1">
                      <span>{getTeamFlag(p.nation)}</span>
                      <span className="truncate max-w-[100px]">{p.name}</span>
                    </div>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded">{p.position}</span>
                  </div>
                ))}
                {squad.length === 0 && (
                  <span className="text-xs text-muted block py-4 text-center">Empty squad. Draft players in your turn!</span>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* POST DRAFT RECAP MODE */}
      {draftState === "postdraft" && (
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm text-center max-w-2xl mx-auto space-y-6">
          <div className="inline-flex rounded-full bg-indigo-600 p-4 text-white shadow-lg shadow-indigo-600/30">
            <Trophy className="h-10 w-10 animate-bounce" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Draft Complete!
          </h2>
          
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            Your squad has been locked in and saved as your active Fantasy Football Squad. Let's analyze your draft value:
          </p>

          <div className="p-4 bg-background rounded-2xl border border-border text-left text-xs leading-relaxed space-y-2 font-medium">
            <h4 className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 mb-2">📊 AI Value Analysis</h4>
            <div>• **Best Value Pick**: **Arda Güler** (MID, TUR) - Drafted in Round 8 at exceptional cost value.</div>
            <div>• **Premium Anchor**: **Vinicius Junior** (FWD, BRA) - Drafted in Round 1 to spearhead the attack.</div>
            <div>• **Steal of the Draft**: **Stephen Eustáquio** (MID, CAN) - Picked up late in Round 12.</div>
            <div className="mt-3 font-semibold text-emerald-500">Draft Grade: A- (Optimized budget distribution across lines).</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <button
              onClick={() => setDraftState("lobby")}
              className="flex items-center justify-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-xs font-bold transition shadow cursor-pointer"
            >
              Draft Again
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Invite link copied to clipboard!");
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-border/30 px-5 py-3 text-xs font-bold transition text-muted cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              Share Draft League
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
