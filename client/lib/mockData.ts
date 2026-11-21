export interface MockUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "player" | "organizer" | "super_admin";
  avatarUrl: string;
  whatsappNumber: string;
  whatsappAlertsEnabled: boolean;
  gameProfiles: {
    game: "bgmi" | "freefire" | "valorant" | "codm";
    gameId: string;
    inGameName: string;
    verified: boolean;
  }[];
  followersCount: number;
  followingCount: number;
  referralCode: string;
  walletBalance: number;
  stats: {
    tournamentsPlayed: number;
    matchesPlayed: number;
    totalEliminations: number;
    winCount: number;
    bestRank: number;
  };
}

export interface MockTournament {
  id: string;
  title: string;
  slug: string;
  game: "bgmi" | "freefire";
  format: "solo" | "duo" | "squad";
  organizerName: string;
  organizerVerified: boolean;
  bannerUrl: string;
  entryFee: number;
  prizePool: number;
  maxSlots: number;
  registeredSlots: number;
  registrationEnd: string;
  tournamentDate: string;
  rawDate?: string;
  status: "registration_open" | "live" | "completed";
  rules: string;
  tag?: "daily" | "weekend_mega" | "mega_prize" | "regular";
  isLiveStreamed?: boolean;
  streamUrl?: string;
  streamViewerCount?: string;
  casterNames?: string;
  scoringRules: {
    firstPlacePoints: number;
    killPoints: number;
  };
}

export interface MockAchievement {
  id: string;
  title: string;
  category: "combat" | "tournament" | "squad" | "weekend";
  description: string;
  iconName: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  rewardType: "upi_cash" | "xp" | "badge";
  rewardValue: string;
  rewardFormatted: string;
  isClaimed: boolean;
  isUnlocked: boolean;
}

export interface MockLiveStream {
  id: string;
  game: "bgmi" | "freefire";
  title: string;
  subtitle: string;
  tournamentName: string;
  tournamentId: string;
  casters: string;
  viewerCount: string;
  embedUrl: string;
  thumbnailUrl: string;
  isLive: boolean;
  phase: string;
  prizePool: number;
}

export interface MockLeaderboardTeam {
  rank: number;
  teamName: string;
  captainTag: string;
  game: "bgmi" | "freefire";
  avatar: string;
  matchesPlayed: number;
  eliminations: number;
  placementPoints: number;
  totalPoints: number;
  badge?: "gold" | "silver" | "bronze";
}

export interface MockVerificationItem {
  id: string;
  tournamentId: string;
  tournamentTitle: string;
  matchNumber: number;
  teamName: string;
  captainName: string;
  playerGameId: string;
  submittedPlacement: number;
  submittedEliminations: number;
  evidenceUrl: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export const CURRENT_MOCK_USER: MockUser = {
  id: "usr_99182",
  name: "Arjun 'Viper' Sharma",
  username: "viper_esports",
  email: "arjun@playarena.gg",
  role: "player",
  avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
  whatsappNumber: "+91 98765 43210",
  whatsappAlertsEnabled: true,
  gameProfiles: [
    {
      game: "bgmi",
      gameId: "5129847291",
      inGameName: "Viper_GodLike",
      verified: true,
    },
    {
      game: "freefire",
      gameId: "981726354",
      inGameName: "Blaze_Viper",
      verified: true,
    },
  ],
  followersCount: 1420,
  followingCount: 38,
  referralCode: "VIPER99",
  walletBalance: 2450,
  stats: {
    tournamentsPlayed: 18,
    matchesPlayed: 42,
    totalEliminations: 164,
    winCount: 7,
    bestRank: 1,
  },
};

export const MOCK_TOURNAMENTS: MockTournament[] = [
  {
    id: "tour_bgmi_01",
    title: "BGMI Pro Scrims Season 4",
    slug: "bgmi-pro-scrims-s4",
    game: "bgmi",
    format: "squad",
    organizerName: "Nova Esports Hub",
    organizerVerified: true,
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    entryFee: 100,
    prizePool: 15000,
    maxSlots: 25,
    registeredSlots: 22,
    registrationEnd: "Today, 6:00 PM",
    tournamentDate: "Today, 8:00 PM IST",
    status: "registration_open",
    rules: "1. No emulators or iPad view permitted.\n2. In-game screenshot of results mandatory within 15 mins.\n3. Room ID will be released 15 mins prior to match start.",
    scoringRules: {
      firstPlacePoints: 15,
      killPoints: 1,
    },
  },
  {
    id: "tour_ff_01",
    title: "Free Fire MAX Clash Cup",
    slug: "ff-max-clash-cup",
    game: "freefire",
    format: "squad",
    organizerName: "Phoenix Gaming Guild",
    organizerVerified: true,
    bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
    entryFee: 50,
    prizePool: 8000,
    maxSlots: 24,
    registeredSlots: 24,
    registrationEnd: "Closed",
    tournamentDate: "Tomorrow, 7:00 PM IST",
    status: "live",
    rules: "1. Mobile devices only.\n2. Gun properties active as per tournament room rules.\n3. Organizers hold final decision on disputes.",
    scoringRules: {
      firstPlacePoints: 12,
      killPoints: 1,
    },
  },
  {
    id: "tour_bgmi_02",
    title: "BGMI Underdog Championship #12",
    slug: "bgmi-underdog-champ-12",
    game: "bgmi",
    format: "squad",
    organizerName: "Night Ops India",
    organizerVerified: true,
    bannerUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80",
    entryFee: 0,
    prizePool: 5000,
    maxSlots: 25,
    registeredSlots: 19,
    registrationEnd: "In 2 days",
    tournamentDate: "Sunday, 5:00 PM IST",
    status: "registration_open",
    rules: "Free to enter tournament for amateur and underdog squads. Must have verified BGMI Character ID.",
    scoringRules: {
      firstPlacePoints: 15,
      killPoints: 1,
    },
  },
  {
    id: "tour_ff_02",
    title: "Free Fire Solo Blitz #05",
    slug: "ff-solo-blitz-05",
    game: "freefire",
    format: "solo",
    organizerName: "Apex Community",
    organizerVerified: false,
    bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    entryFee: 30,
    prizePool: 3000,
    maxSlots: 48,
    registeredSlots: 35,
    registrationEnd: "In 3 days",
    tournamentDate: "Monday, 6:00 PM IST",
    status: "registration_open",
    rules: "Solo survival rules. Teaming will lead to permanent ban.",
    scoringRules: {
      firstPlacePoints: 10,
      killPoints: 1,
    },
  },
  {
    id: "tour_bgmi_03",
    title: "BGMI Morning Masters Cup",
    slug: "bgmi-morning-masters-01",
    game: "bgmi",
    format: "squad",
    organizerName: "Nova Esports Hub",
    organizerVerified: true,
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    entryFee: 80,
    prizePool: 10000,
    maxSlots: 25,
    registeredSlots: 25,
    registrationEnd: "Completed",
    tournamentDate: "Today, 11:00 AM IST",
    status: "completed",
    rules: "Morning competitive scrims. Room credentials broadcasted at 10:45 AM.",
    scoringRules: {
      firstPlacePoints: 15,
      killPoints: 1,
    },
  },
  {
    id: "tour_ff_03",
    title: "Free Fire Afternoon Rush #02",
    slug: "ff-afternoon-rush-02",
    game: "freefire",
    format: "duo",
    organizerName: "Phoenix Gaming Guild",
    organizerVerified: true,
    bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
    entryFee: 40,
    prizePool: 6000,
    maxSlots: 30,
    registeredSlots: 18,
    registrationEnd: "Tomorrow, 1:00 PM",
    tournamentDate: "Tomorrow, 2:30 PM IST",
    status: "registration_open",
    rules: "Duo battle royale match. Standard competitive scoring.",
    scoringRules: {
      firstPlacePoints: 12,
      killPoints: 1,
    },
  },
  {
    id: "tour_bgmi_04",
    title: "BGMI Midnight Mayhem",
    slug: "bgmi-midnight-mayhem-08",
    game: "bgmi",
    format: "squad",
    organizerName: "Night Ops India",
    organizerVerified: true,
    bannerUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80",
    entryFee: 150,
    prizePool: 20000,
    maxSlots: 25,
    registeredSlots: 25,
    registrationEnd: "Live Now",
    tournamentDate: "Today, 10:30 PM IST",
    status: "live",
    rules: "Late night high-stakes scrims. Spectator stream active on YouTube.",
    tag: "daily",
    isLiveStreamed: true,
    streamUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    streamViewerCount: "5.8K",
    casterNames: "Mamba & Hydra",
    scoringRules: {
      firstPlacePoints: 15,
      killPoints: 1,
    },
  },
  {
    id: "tour_daily_01",
    title: "BGMI Daily Prime Scrims #52",
    slug: "bgmi-daily-prime-scrims-52",
    game: "bgmi",
    format: "squad",
    organizerName: "Nova Esports Hub",
    organizerVerified: true,
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    entryFee: 50,
    prizePool: 12000,
    maxSlots: 25,
    registeredSlots: 21,
    registrationEnd: "Today, 7:30 PM",
    tournamentDate: "Today, 8:00 PM IST",
    status: "registration_open",
    rules: "Daily competitive scrims running every evening at 8 PM. Instant UPI payout upon official result verification.",
    tag: "daily",
    isLiveStreamed: true,
    streamViewerCount: "14.2K",
    casterNames: "Ocean Sharma & Mayavi",
    scoringRules: {
      firstPlacePoints: 15,
      killPoints: 1,
    },
  },
  {
    id: "tour_weekend_mega_01",
    title: "Free Fire Weekend All-Day Mega Contest",
    slug: "ff-weekend-all-day-mega-contest",
    game: "freefire",
    format: "squad",
    organizerName: "Phoenix Gaming Guild",
    organizerVerified: true,
    bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
    entryFee: 150,
    prizePool: 250000,
    maxSlots: 100,
    registeredSlots: 84,
    registrationEnd: "Saturday, 10:00 AM",
    tournamentDate: "Saturday, 11:00 AM - 9:00 PM IST",
    status: "registration_open",
    rules: "All-Day Weekend Marathon! 4 Stages: Qualifiers (11 AM), Quarters (2 PM), Semis (5 PM), Grand Finals (8 PM). Live on PlayArena Streams.",
    tag: "weekend_mega",
    isLiveStreamed: true,
    streamViewerCount: "38.6K",
    casterNames: "Aura Gaming & Pahadi",
    scoringRules: {
      firstPlacePoints: 15,
      killPoints: 1,
    },
  },
  {
    id: "tour_mega_prize_01",
    title: "PlayArena Grand National Championship (₹5 Lakhs)",
    slug: "playarena-grand-national-championship-5l",
    game: "bgmi",
    format: "squad",
    organizerName: "Nova Esports Hub",
    organizerVerified: true,
    bannerUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80",
    entryFee: 499,
    prizePool: 500000,
    maxSlots: 128,
    registeredSlots: 112,
    registrationEnd: "Sunday, 1:00 PM",
    tournamentDate: "Sunday, 2:00 PM IST",
    status: "registration_open",
    rules: "Mega Prize Pool Invitational! ₹2,50,000 for 1st Place, ₹1,25,000 for 2nd, ₹75,000 for 3rd, ₹50,000 for MVP Top Fragger. Direct UPI wire transfer within 3 hours.",
    tag: "mega_prize",
    isLiveStreamed: true,
    streamViewerCount: "54.8K",
    casterNames: "Kratos & Ghatak",
    scoringRules: {
      firstPlacePoints: 20,
      killPoints: 2,
    },
  },
];

export const MOCK_LEADERBOARDS: MockLeaderboardTeam[] = [
  {
    rank: 1,
    teamName: "Team SoulFire",
    captainTag: "Soul_Mortal",
    game: "bgmi",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    matchesPlayed: 6,
    eliminations: 48,
    placementPoints: 65,
    totalPoints: 113,
    badge: "gold",
  },
  {
    rank: 2,
    teamName: "GodLike Phoenix",
    captainTag: "GodL_Jonathan",
    game: "bgmi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    matchesPlayed: 6,
    eliminations: 44,
    placementPoints: 52,
    totalPoints: 96,
    badge: "silver",
  },
  {
    rank: 3,
    teamName: "Revenant Esports",
    captainTag: "Rev_Sensei",
    game: "bgmi",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    matchesPlayed: 6,
    eliminations: 38,
    placementPoints: 46,
    totalPoints: 84,
    badge: "bronze",
  },
  {
    rank: 4,
    teamName: "Team Tamilas",
    captainTag: "TT_Maxy",
    game: "bgmi",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80",
    matchesPlayed: 6,
    eliminations: 32,
    placementPoints: 40,
    totalPoints: 72,
  },
  {
    rank: 5,
    teamName: "Team Entity",
    captainTag: "Entity_Saumraj",
    game: "bgmi",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
    matchesPlayed: 6,
    eliminations: 28,
    placementPoints: 34,
    totalPoints: 62,
  },
  {
    rank: 6,
    teamName: "Orangutan Elite",
    captainTag: "OG_Aash",
    game: "bgmi",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    matchesPlayed: 6,
    eliminations: 24,
    placementPoints: 30,
    totalPoints: 54,
  },
];

export const MOCK_VERIFICATION_QUEUE: MockVerificationItem[] = [
  {
    id: "ver_001",
    tournamentId: "tour_bgmi_01",
    tournamentTitle: "BGMI Pro Scrims Season 4",
    matchNumber: 1,
    teamName: "Team SoulFire",
    captainName: "Soul_Mortal",
    playerGameId: "5129847291",
    submittedPlacement: 1,
    submittedEliminations: 8,
    evidenceUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
    submittedAt: "10 mins ago",
    status: "pending",
  },
  {
    id: "ver_002",
    tournamentId: "tour_bgmi_01",
    tournamentTitle: "BGMI Pro Scrims Season 4",
    matchNumber: 1,
    teamName: "GodLike Phoenix",
    captainName: "GodL_Jonathan",
    playerGameId: "5918237462",
    submittedPlacement: 2,
    submittedEliminations: 6,
    evidenceUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
    submittedAt: "14 mins ago",
    status: "pending",
  },
];

export const MOCK_ACHIEVEMENTS: MockAchievement[] = [
  {
    id: "ach_01",
    title: "First Blood Veteran",
    category: "combat",
    description: "Secure your first verified tournament elimination.",
    iconName: "Crosshair",
    targetValue: 1,
    currentValue: 0,
    unit: "elimination",
    rewardType: "upi_cash",
    rewardValue: "50",
    rewardFormatted: "₹50 UPI Cash",
    isClaimed: false,
    isUnlocked: false,
  },
  {
    id: "ach_02",
    title: "Century Fragger",
    category: "combat",
    description: "Accumulate 100 verified eliminations across official tournaments.",
    iconName: "Flame",
    targetValue: 100,
    currentValue: 0,
    unit: "eliminations",
    rewardType: "upi_cash",
    rewardValue: "250",
    rewardFormatted: "₹250 UPI Cash",
    isClaimed: false,
    isUnlocked: false,
  },
  {
    id: "ach_03",
    title: "Apex Eliminator",
    category: "combat",
    description: "Eliminate 500 opponents in ranked tournament matches.",
    iconName: "Skull",
    targetValue: 500,
    currentValue: 0,
    unit: "eliminations",
    rewardType: "upi_cash",
    rewardValue: "1000",
    rewardFormatted: "₹1,000 UPI Cash",
    isClaimed: false,
    isUnlocked: false,
  },
  {
    id: "ach_04",
    title: "Rookie Contender",
    category: "tournament",
    description: "Successfully complete registration and play in your 1st tournament.",
    iconName: "Trophy",
    targetValue: 1,
    currentValue: 0,
    unit: "tournament",
    rewardType: "xp",
    rewardValue: "100",
    rewardFormatted: "100 Season XP",
    isClaimed: false,
    isUnlocked: false,
  },
  {
    id: "ach_05",
    title: "Podium Dominator",
    category: "tournament",
    description: "Achieve Top 3 placement in 5 sanctioned tournaments.",
    iconName: "Award",
    targetValue: 5,
    currentValue: 0,
    unit: "podiums",
    rewardType: "upi_cash",
    rewardValue: "500",
    rewardFormatted: "₹500 UPI Cash",
    isClaimed: false,
    isUnlocked: false,
  },
  {
    id: "ach_06",
    title: "Weekend Mega Marathoner",
    category: "weekend",
    description: "Compete and qualify through 3 stages of a Weekend All-Day Mega Contest.",
    iconName: "Zap",
    targetValue: 3,
    currentValue: 0,
    unit: "stages",
    rewardType: "upi_cash",
    rewardValue: "350",
    rewardFormatted: "₹350 UPI Cash",
    isClaimed: false,
    isUnlocked: false,
  },
  {
    id: "ach_07",
    title: "Daily Grinder Tier 1",
    category: "tournament",
    description: "Participate in daily 8 PM scrims for 7 consecutive days.",
    iconName: "Calendar",
    targetValue: 7,
    currentValue: 0,
    unit: "days",
    rewardType: "upi_cash",
    rewardValue: "400",
    rewardFormatted: "₹400 UPI Cash",
    isClaimed: false,
    isUnlocked: false,
  },
  {
    id: "ach_08",
    title: "Squad Commander",
    category: "squad",
    description: "Recruit 5 verified players to your squad using in-game ID invites.",
    iconName: "Users",
    targetValue: 5,
    currentValue: 0,
    unit: "members",
    rewardType: "badge",
    rewardValue: "Gold Commander Frame",
    rewardFormatted: "Gold Commander Avatar Badge",
    isClaimed: false,
    isUnlocked: false,
  },
];

export const MOCK_LIVE_STREAMS: MockLiveStream[] = [
  {
    id: "stream_bgmi_pro",
    game: "bgmi",
    title: "BGMI Pro Scrims Season 4 - Erangel Showdown",
    subtitle: "Match 03 of 06 • Official Hindi & English Cast",
    tournamentName: "BGMI Pro Scrims S4",
    tournamentId: "tour_bgmi_01",
    casters: "Ocean Sharma & Mayavi",
    viewerCount: "14,280",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
    thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
    isLive: true,
    phase: "Match 03 Live (Zone 4 Closing)",
    prizePool: 15000,
  },
  {
    id: "stream_ff_weekend",
    game: "freefire",
    title: "Free Fire MAX Weekend All-Day Mega Contest - Semifinals",
    subtitle: "Bermuda Clash • High Octane Survival",
    tournamentName: "FF Weekend Mega Contest",
    tournamentId: "tour_weekend_mega_01",
    casters: "Aura Gaming & Pahadi",
    viewerCount: "38,620",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
    thumbnailUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
    isLive: true,
    phase: "Semifinals Bracket B (16 Squads)",
    prizePool: 250000,
  },
  {
    id: "stream_bgmi_national",
    game: "bgmi",
    title: "PlayArena Grand National Championship (₹5 Lakhs)",
    subtitle: "Grand Finale Broadcast • 24 Elite Teams",
    tournamentName: "National Championship",
    tournamentId: "tour_mega_prize_01",
    casters: "Kratos & Ghatak",
    viewerCount: "54,800",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
    thumbnailUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80",
    isLive: false,
    phase: "Pre-Show Broadcast (Starts 2:00 PM)",
    prizePool: 500000,
  },
];
