import { teams } from "./teams.js";

const venues = [
  "New York New Jersey Stadium (MetLife)",
  "Los Angeles Stadium (SoFi)",
  "Dallas Stadium (AT&T)",
  "Atlanta Stadium (Mercedes-Benz)",
  "Vancouver Stadium (BC Place)",
  "Seattle Stadium (Lumen Field)",
  "San Francisco Stadium (Levi's)",
  "Boston Stadium (Gillette)",
  "Houston Stadium (NRG)",
  "Miami Stadium (Hard Rock)",
  "Philadelphia Stadium (Lincoln Financial)",
  "Kansas City Stadium (Arrowhead)",
  "Monterrey Stadium (Estadio BBVA)",
  "Guadalajara Stadium (Estadio Akron)",
  "Mexico City Stadium (Estadio Azteca)",
  "Toronto Stadium (BMO Field)"
];

const getAiScore = (homeRank, awayRank, matchId) => {
  const diff = awayRank - homeRank; // negative means away is better, positive means home is better
  let home = 1;
  let away = 1;

  if (diff > 45) {
    home = 3;
    away = 0;
  } else if (diff > 20) {
    home = 2;
    away = 0;
  } else if (diff > 5) {
    home = 2;
    away = 1;
  } else if (diff < -45) {
    home = 0;
    away = 3;
  } else if (diff < -20) {
    home = 0;
    away = 2;
  } else if (diff < -5) {
    home = 1;
    away = 2;
  } else {
    // Close ranking: decide draw or narrow win based on matchId
    if (matchId % 3 === 0) {
      home = 1;
      away = 1;
    } else if (matchId % 2 === 0) {
      home = 2;
      away = 1;
    } else {
      home = 1;
      away = 2;
    }
  }
  return { home, away };
};

const generateGroupFixtures = () => {
  const fixturesList = [];
  let matchId = 1;
  
  const groupLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  
  groupLetters.forEach((letter, groupIdx) => {
    const groupTeams = teams.filter(t => t.group === letter);
    if (groupTeams.length === 4) {
      const [t1, t2, t3, t4] = groupTeams;
      
      const matchups = [
        { home: t1, away: t2, matchday: 1, dateOffset: 0 },
        { home: t3, away: t4, matchday: 1, dateOffset: 1 },
        { home: t1, away: t3, matchday: 2, dateOffset: 6 },
        { home: t2, away: t4, matchday: 2, dateOffset: 7 },
        { home: t1, away: t4, matchday: 3, dateOffset: 12 },
        { home: t2, away: t3, matchday: 3, dateOffset: 12 }
      ];
      
      matchups.forEach((mu, muIdx) => {
        // Stagger groups so 2 groups start per day
        const groupDayOffset = Math.floor(groupIdx / 2); 
        const baseDate = new Date(2026, 5, 11 + mu.dateOffset + groupDayOffset);
        const dateString = baseDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const venue = venues[(groupIdx * 6 + muIdx) % venues.length];
        
        const predictedScore = getAiScore(mu.home.ranking, mu.away.ranking, matchId);

        fixturesList.push({
          id: matchId++,
          group: letter,
          home: mu.home.id,
          away: mu.away.id,
          matchday: mu.matchday,
          date: dateString,
          time: muIdx % 2 === 0 ? "18:00 EST" : "21:00 EST",
          venue: venue,
          homeScore: predictedScore.home,
          awayScore: predictedScore.away
        });
      });
    }
  });
  
  return fixturesList;
};

export const fixtures = generateGroupFixtures();
export { venues };

