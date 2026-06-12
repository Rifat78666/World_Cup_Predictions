# 🏆 2026 FIFA World Cup Predictor & Fantasy Football App

An interactive React + Tailwind CSS web application combining a **104-match tournament predictor** and a **full fantasy football manager league**, powered by client-side simulations and **Google Gemini 3.5 Flash** for tactical previews and roster advice.

## 🌟 Key Features

### ⚽ Part A — Tournament Predictor
1. **Match-by-Match Predictions**: Enter predicted scorelines for all 72 group stage matches. Live standings recalculate dynamically using official FIFA tiebreaker rules (Points → GD → GS → Head-to-Head → FIFA Ranking).
2. **Dynamic Bracket Simulation**: Interactive Round of 32 down to the Final. Best third-placed teams (top 8) are automatically ranked and mapped to group winners without same-group clashes.
3. **Animated Champion Reveal**: Celebrate your predicted winner with an animated trophy screen and confetti explosion.
4. **Tactical Analyzer**: Custom matchup tool simulating tactical reports and win-probabilities for any two nations.

### 🛡️ Part B — Fantasy Football Game
1. **Squad Draft**: Select a 15-player squad (2 GK, 5 DEF, 5 MID, 3 FWD) from the 240 real-world player database (5 per country) within a 100-credits budget. Max 3 players per country.
2. **Interactive Pitch**: Position your lineup on a styled football field with toggleable formations (4-3-3, 3-4-3, 4-4-2, 3-5-2, 5-3-2) and designate Captains (2x points) and Vice-Captains (1.5x points fallback).
3. **Scoring Simulator**: Every match predicted triggers a detailed event-log timeline (goals, assists, clean sheets, saves, cards) and translates events into player fantasy scores in real-time.
4. **Wildcard & Transfers**: Make transfers round-by-round or activate a Wildcard for unlimited free swaps.
5. **Mini-Leagues & Leaderboard**: Track ranks against global bot opponents and create or join private mini-leagues using 6-digit invite codes.
6. **URL State Sharing**: Share your entire prediction bracket and fantasy squad with one click; your choices are compressed and encoded directly into a shareable link!

### 🤖 Gemini AI Assistant Integration
- **Pre-match previews**: Generates reports highlighting team form, playing styles, strengths, weaknesses, and predicted scorelines.
- **AI Pick My Squad**: Scans player valuations to draft an optimized 15-player squad within the budget.
- **AI Suggest Transfers**: Receives transfer recommendations round-by-round.
- **AI Captain / Differentials**: Identifies premium candidates or high-upside low-ownership targets.

---

## 🛠️ Installation & Setup

1. **Clone or download the project files.**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables (Optional)**:
   Create a `.env` file in the root directory and add your Google Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: If no API key is specified, the application will automatically activate the local Mock AI Simulator engine, ensuring 100% functionality out-of-the-box.*
4. **Start the local development server**:
   ```bash
   npm run dev
   ```

---

## 📐 Tech Stack
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 (Glassmorphism, custom pitch rendering, dark theme first)
- **Icons**: Lucide React
- **Animations**: Canvas Confetti
- **AI Engine**: Google Gemini API (`@google/generative-ai`)
- **State**: React Context + localStorage

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
