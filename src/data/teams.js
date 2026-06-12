export const teams = [
  // Group A
  { id: "MEX", name: "Mexico", group: "A", ranking: 15, form: "W-D-L-W-D", style: "Balanced Attacking", difficulty: 3, flag: "🇲🇽" },
  { id: "RSA", name: "South Africa", group: "A", ranking: 59, form: "W-D-W-W-L", style: "Counter-Attack", difficulty: 2, flag: "🇿🇦" },
  { id: "KOR", name: "South Korea", group: "A", ranking: 22, form: "W-W-D-W-L", style: "High Intensity Pressing", difficulty: 3, flag: "🇰🇷" },
  { id: "CZE", name: "Czechia", group: "A", ranking: 35, form: "W-L-D-W-W", style: "Structured & Direct", difficulty: 2, flag: "🇨🇿" },

  // Group B
  { id: "CAN", name: "Canada", group: "B", ranking: 40, form: "W-D-L-W-W", style: "High Press & Speed", difficulty: 3, flag: "🇨🇦" },
  { id: "BIH", name: "Bosnia & Herzegovina", group: "B", ranking: 74, form: "L-L-W-L-D", style: "Defensive Low Block", difficulty: 2, flag: "🇧🇦" },
  { id: "QAT", name: "Qatar", group: "B", ranking: 46, form: "W-W-W-D-L", style: "Technical Possession", difficulty: 2, flag: "🇶🇦" },
  { id: "SUI", name: "Switzerland", group: "B", ranking: 18, form: "D-W-D-W-L", style: "Disciplined Organization", difficulty: 4, flag: "🇨🇭" },

  // Group C
  { id: "BRA", name: "Brazil", group: "C", ranking: 5, form: "W-W-D-W-D", style: "Samba Attacking & Flair", difficulty: 5, flag: "🇧🇷" },
  { id: "MAR", name: "Morocco", group: "C", ranking: 12, form: "W-W-D-W-W", style: "Fast Wings Transitions", difficulty: 4, flag: "🇲🇦" },
  { id: "HAI", name: "Haiti", group: "C", ranking: 86, form: "W-L-L-D-W", style: "Physical & Counter", difficulty: 1, flag: "🇭🇹" },
  { id: "SCO", name: "Scotland", group: "C", ranking: 39, form: "L-D-W-L-D", style: "High Workrate & Direct", difficulty: 3, flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },

  // Group D
  { id: "USA", name: "United States", group: "D", ranking: 16, form: "W-D-L-W-W", style: "Energetic Pressing", difficulty: 3, flag: "🇺🇸" },
  { id: "PAR", name: "Paraguay", group: "D", ranking: 56, form: "L-D-W-W-D", style: "Tough Defensive Low Block", difficulty: 2, flag: "🇵🇾" },
  { id: "AUS", name: "Australia", group: "D", ranking: 24, form: "W-W-D-L-W", style: "Physical & Direct Crossing", difficulty: 3, flag: "🇦🇺" },
  { id: "TUR", name: "Turkiye", group: "D", ranking: 26, form: "W-L-W-D-W", style: "Creative & Passionate", difficulty: 3, flag: "🇹🇷" },

  // Group E
  { id: "GER", name: "Germany", group: "E", ranking: 11, form: "W-W-D-W-W", style: "Positional Attacking", difficulty: 4, flag: "🇩🇪" },
  { id: "CUW", name: "Curacao", group: "E", ranking: 90, form: "L-W-D-L-L", style: "Flexible Counter", difficulty: 1, flag: "🇨🇼" },
  { id: "CIV", name: "Ivory Coast", group: "E", ranking: 38, form: "W-W-D-W-L", style: "Athletic & Power Play", difficulty: 3, flag: "🇨🇮" },
  { id: "ECU", name: "Ecuador", group: "E", ranking: 30, form: "D-W-L-W-W", style: "Fast Wide Counter-Attack", difficulty: 3, flag: "🇪🇨" },

  // Group F
  { id: "NED", name: "Netherlands", group: "F", ranking: 7, form: "W-D-W-W-L", style: "Total Football Possession", difficulty: 4, flag: "🇳🇱" },
  { id: "JPN", name: "Japan", group: "F", ranking: 17, form: "W-W-W-W-D", style: "High-Speed Quick Passing", difficulty: 4, flag: "🇯🇵" },
  { id: "SWE", name: "Sweden", group: "F", ranking: 28, form: "W-W-L-D-W", style: "Direct Attacking & Crosses", difficulty: 3, flag: "🇸🇪" },
  { id: "TUN", name: "Tunisia", group: "F", ranking: 41, form: "D-L-W-D-W", style: "Low Block & Set Pieces", difficulty: 2, flag: "🇹🇳" },

  // Group G
  { id: "BEL", name: "Belgium", group: "G", ranking: 6, form: "W-W-D-L-W", style: "Direct Wing Transitions", difficulty: 4, flag: "🇧🇪" },
  { id: "EGY", name: "Egypt", group: "G", ranking: 36, form: "W-W-D-W-L", style: "Structured Counter", difficulty: 3, flag: "🇪🇬" },
  { id: "IRN", name: "Iran", group: "G", ranking: 20, form: "W-W-W-D-W", style: "Experienced Defensive", difficulty: 3, flag: "🇮🇷" },
  { id: "NZL", name: "New Zealand", group: "G", ranking: 104, form: "L-D-W-L-D", style: "Direct Tall Targets", difficulty: 1, flag: "🇳🇿" },

  // Group H
  { id: "ESP", name: "Spain", group: "H", ranking: 3, form: "W-W-W-D-W", style: "Tiki-Taka Fluid Possession", difficulty: 5, flag: "🇪🇸" },
  { id: "CPV", name: "Cape Verde", group: "H", ranking: 65, form: "W-L-D-W-L", style: "High Intensity Transitions", difficulty: 2, flag: "🇨🇻" },
  { id: "KSA", name: "Saudi Arabia", group: "H", ranking: 53, form: "W-D-L-W-L", style: "Technical Compact Pressing", difficulty: 2, flag: "🇸🇦" },
  { id: "URU", name: "Uruguay", group: "H", ranking: 14, form: "W-W-W-L-D", style: "High Pressing & Intensity", difficulty: 4, flag: "🇺🇾" },

  // Group I
  { id: "FRA", name: "France", group: "I", ranking: 2, form: "W-W-D-W-W", style: "Dynamic Explosive Counter", difficulty: 5, flag: "🇫🇷" },
  { id: "SEN", name: "Senegal", group: "I", ranking: 21, form: "W-D-W-W-L", style: "Fast Wingers & Power Midfield", difficulty: 3, flag: "🇸🇳" },
  { id: "IRQ", name: "Iraq", group: "I", ranking: 58, form: "W-W-L-D-W", style: "Hardworking & Compact", difficulty: 2, flag: "🇮🇶" },
  { id: "NOR", name: "Norway", group: "I", ranking: 44, form: "L-W-W-D-L", style: "Direct Target & Midfield Press", difficulty: 3, flag: "🇳🇴" },

  // Group J
  { id: "ARG", name: "Argentina", group: "J", ranking: 1, form: "W-W-D-W-W", style: "Fluid Short Passing", difficulty: 5, flag: "🇦🇷" },
  { id: "ALG", name: "Algeria", group: "J", ranking: 32, form: "W-L-D-W-W", style: "Creative Wings & Possession", difficulty: 3, flag: "🇩🇿" },
  { id: "AUT", name: "Austria", group: "J", ranking: 25, form: "W-W-L-W-D", style: "High Energy Counterpress", difficulty: 3, flag: "🇦🇹" },
  { id: "JOR", name: "Jordan", group: "J", ranking: 71, form: "W-W-L-D-W", style: "Fast Direct Counter-Attack", difficulty: 2, flag: "🇯🇴" },

  // Group K
  { id: "POR", name: "Portugal", group: "K", ranking: 8, form: "W-W-D-W-L", style: "Fluid Positional Play", difficulty: 5, flag: "🇵🇹" },
  { id: "COD", name: "DR Congo", group: "K", ranking: 60, form: "W-D-W-L-D", style: "Aggressive Counter-Attack", difficulty: 2, flag: "🇨🇩" },
  { id: "UZB", name: "Uzbekistan", group: "K", ranking: 68, form: "W-D-W-W-D", style: "Disciplined Low Block", difficulty: 2, flag: "🇺🇿" },
  { id: "COL", name: "Colombia", group: "K", ranking: 13, form: "W-W-D-W-D", style: "Dynamic Intensity & Pace", difficulty: 4, flag: "🇨🇴" },

  // Group L
  { id: "ENG", name: "England", group: "L", ranking: 4, form: "W-W-D-W-L", style: "Tactically Flexible & Balanced", difficulty: 5, flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "CRO", name: "Croatia", group: "L", ranking: 10, form: "W-D-W-L-W", style: "Controlled Technical Possession", difficulty: 4, flag: "🇭🇷" },
  { id: "GHA", name: "Ghana", group: "L", ranking: 64, form: "D-L-W-W-L", style: "Athletic Counter-Attacking", difficulty: 2, flag: "🇬🇭" },
  { id: "PAN", name: "Panama", group: "L", ranking: 43, form: "W-L-D-W-W", style: "Organized Defensive Transitions", difficulty: 2, flag: "🇵🇦" }
];
