import { GoogleGenerativeAI } from "@google/generative-ai";

// Quick mock helper to simulate AI thinking delay
const delay = (ms) => new Date().getTime() + ms;

export const getGeminiModel = (apiKey) => {
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash or gemini-1.5-flash as the exact model string
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  } catch (e) {
    console.error("Failed to initialize Gemini AI model:", e);
    return null;
  }
};

export const getPreMatchAnalysis = async (homeTeam, awayTeam, apiKey) => {
  const model = getGeminiModel(apiKey);
  
  if (!model) {
    // Return mock fallback
    return `### ⚔️ AI Pre-Match Report: ${homeTeam.flag} ${homeTeam.name} vs ${awayTeam.name} ${awayTeam.flag}
    
#### **Head-to-Head & Team Form**
* **${homeTeam.name}** (FIFA Rank: #${homeTeam.ranking}) enters this fixture in **${homeTeam.form}** form. They favor a **${homeTeam.style}** style of play.
* **${awayTeam.name}** (FIFA Rank: #${awayTeam.ranking}) enters in **${awayTeam.form}** form. They favor a **${awayTeam.style}** style of play.

#### **Key Matchups**
* The tactical conflict will center on whether ${homeTeam.name}'s structure can contain ${awayTeam.name}'s transition game.
* **Upset Potential**: ${homeTeam.ranking > awayTeam.ranking ? "Moderate" : "Low"}.

#### **Predicted Outcome**
* **Scoreline**: ${homeTeam.ranking < awayTeam.ranking ? "2 - 1" : "1 - 2"}
* **Confidence**: **${Math.floor(65 + Math.random() * 20)}%**
* **AI Analysis Summary**: Expect a tactical battle where midfield transitions decide the outcome. ${homeTeam.ranking < awayTeam.ranking ? homeTeam.name : awayTeam.name} holds a slight technical advantage.`;
  }

  const prompt = `You are a sports analyst. Analyze the upcoming 2026 FIFA World Cup match between:
  Home Team: ${homeTeam.name} (FIFA Ranking: ${homeTeam.ranking}, Form: ${homeTeam.form}, Style: ${homeTeam.style})
  Away Team: ${awayTeam.name} (FIFA Ranking: ${awayTeam.ranking}, Form: ${awayTeam.form}, Style: ${awayTeam.style})
  Provide a detailed preview including:
  1. Team overview and style comparison.
  2. Strengths vs Weaknesses.
  3. A predicted scoreline and a confidence percentage (%).
  Format the output in clean, beautiful Markdown. Keep it engaging.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `*Failed to query Gemini API: ${error.message}*`;
  }
};

export const getSquadRecommendation = async (availablePlayers, apiKey) => {
  const model = getGeminiModel(apiKey);
  
  if (!model) {
    // Generate an optimal mock draft
    // Budget: 100, Formation: 2 GK, 5 DEF, 5 MID, 3 FWD
    // Sort players by value (points expected / cost)
    const sorted = [...availablePlayers].sort((a, b) => {
      const valA = (a.goalsEst * 6 + a.assistsEst * 3) / a.cost;
      const valB = (b.goalsEst * 6 + b.assistsEst * 3) / b.cost;
      return valB - valA;
    });

    const squad = [];
    const limits = { GK: 2, DEF: 5, MID: 5, FWD: 3 };
    const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    const countryCounts = {};
    let currentCost = 0;

    for (let p of sorted) {
      if (counts[p.position] < limits[p.position]) {
        const countryCount = countryCounts[p.nation] || 0;
        if (countryCount < 3 && currentCost + p.cost <= 100) {
          squad.push(p);
          counts[p.position]++;
          countryCounts[p.nation] = countryCount + 1;
          currentCost += p.cost;
        }
      }
      if (squad.length === 15) break;
    }

    return {
      squadIds: squad.map(p => p.id),
      explanation: `**AI Selection Strategy**:
      * Drafted key premium differential assets like **${squad.find(p => p.cost > 12)?.name || "Lamine Yamal"}** to spearhead the attack.
      * Selected high-value defenders with clean sheet potential to maximize returns.
      * Remaining credits optimized on budget enablers from middle-ranked teams to ensure a strong 15-player squad under the 100 credits cap.`
    };
  }

  // AI Prompt for squad selection
  const playerBrief = availablePlayers.map(p => ({ id: p.id, name: p.name, pos: p.position, cost: p.cost, goals: p.goalsEst, assists: p.assistsEst, nation: p.nation }));
  
  const prompt = `You are a Fantasy Football Master. Select a squad of 15 players from this list:
  ${JSON.stringify(playerBrief)}
  
  Constraints:
  1. Exactly 2 GK, 5 DEF, 5 MID, 3 FWD.
  2. Total cost must NOT exceed 100.
  3. Max 3 players from the same nation (represented by "nation" field).
  
  Format your response strictly as a JSON object with:
  {
    "squadIds": ["ID1", "ID2", ...],
    "explanation": "A markdown string explaining your strategy, picks, captain selection, and differentials."
  }
  Do not include markdown code block styling in the JSON response, return raw JSON string.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Clean JSON if model returned markdown codeblocks
    const cleanText = text.replace(/^```json/, "").replace(/```$/, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const suggestTransfers = async (squadIds, availablePlayers, apiKey) => {
  const model = getGeminiModel(apiKey);
  const currentSquad = availablePlayers.filter(p => squadIds.includes(p.id));

  if (!model) {
    return `#### 🔄 AI Transfer Recommendations
    1. **Sell**: ${currentSquad.find(p => p.position === 'FWD')?.name || "A. Morata"} (FWD) | **Buy**: **Viktor Gyökeres** (FWD, SWE)
       * *Reason*: Gyökeres has exceptional estimated returns and Sweden's group stage fixtures present a high probability of multiple goals.
    2. **Sell**: ${currentSquad.find(p => p.position === 'MID')?.name || "T. Soucek"} (MID) | **Buy**: **Arda Güler** (MID, TUR)
       * *Reason*: Guler represents a low-ownership high-upside differential pick who takes set-pieces and acts as a central playmaker.`;
  }

  const prompt = `You are a Fantasy Football Master. Review this current squad of players:
  ${JSON.stringify(currentSquad)}
  
  And suggest two transfer options from the pool of available players. Explain why (consider player pricing, estimated goals/assists, and match difficulty).
  Format your reply in Markdown.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `*Failed to query Gemini API: ${error.message}*`;
  }
};

export const suggestCaptain = async (squadIds, availablePlayers, apiKey) => {
  const model = getGeminiModel(apiKey);
  const currentSquad = availablePlayers.filter(p => squadIds.includes(p.id));

  if (!model) {
    const premium = currentSquad.sort((a, b) => b.cost - a.cost)[0] || currentSquad[0];
    const differential = currentSquad.filter(p => p.cost < 11).sort((a, b) => b.goalsEst - a.goalsEst)[0] || currentSquad[1];

    return `#### 👑 AI Captain Recommendations
    
* **Safe Pick: ${premium?.name} (${premium?.nation})**
  * *Reason*: As the highest-value player in your squad, ${premium?.name} is the most reliable source of points. His high goal/assist probability makes him the premium choice.
* **Differential Pick: ${differential?.name} (${differential?.nation})**
  * *Reason*: Ownership is low, but he is in prime position to score or assist against a struggling defense. High upside choice if you want to climb ranks!`;
  }

  const prompt = `You are a Fantasy Football Master. Look at this squad:
  ${JSON.stringify(currentSquad)}
  
  Suggest:
  1. The best Captain option (2x points)
  2. The best Vice-Captain option (1.5x points fallback)
  3. A differential captain choice.
  Explain the reasoning based on estimated performance and cost. Format in Markdown.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `*Failed to query Gemini API: ${error.message}*`;
  }
};
