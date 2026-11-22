import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/playarena";

async function seed() {
  console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB!");

  const db = mongoose.connection.db;

  // Clear existing collections
  console.log("Clearing existing PlayArena collections...");
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    if (!col.name.startsWith("system.")) {
      await db.collection(col.name).drop().catch(() => {});
    }
  }

  console.log("Creating Users with Game IDs & WhatsApp Numbers...");
  const usersCollection = db.collection("users");
  const organizersCollection = db.collection("organizers");
  const tournamentsCollection = db.collection("tournaments");
  const matchesCollection = db.collection("matches");
  const resultsCollection = db.collection("resultsubmissions");
  const leaderboardsCollection = db.collection("leaderboardentries");
  const invitesCollection = db.collection("gameinvites");

  // Insert Users
  const playerUser = {
    _id: new mongoose.Types.ObjectId(),
    username: "viper_esports",
    email: "arjun@playarena.gg",
    passwordHash: "$2a$10$wE2YFkIe0B59a99p91cZe.P5eH9p.dI70kRfg1hPskQ7m9H9oA1bW", // password123
    name: "Arjun 'Viper' Sharma",
    avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
    bio: "Competitive BGMI & Free Fire Assaulter",
    role: "player",
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
    friends: [],
    followers: [],
    following: [],
    referralCode: "VIPER99",
    walletBalance: 2450,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const organizerUser = {
    _id: new mongoose.Types.ObjectId(),
    username: "nova_organizer",
    email: "nova@esports.in",
    passwordHash: "$2a$10$wE2YFkIe0B59a99p91cZe.P5eH9p.dI70kRfg1hPskQ7m9H9oA1bW",
    name: "Nova Events Operator",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Official Indian Esports Organizer",
    role: "organizer",
    whatsappNumber: "+91 99887 76655",
    whatsappAlertsEnabled: true,
    gameProfiles: [],
    friends: [],
    followers: [],
    following: [],
    referralCode: "NOVA01",
    walletBalance: 40500,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const adminUser = {
    _id: new mongoose.Types.ObjectId(),
    username: "super_admin",
    email: "admin@playarena.gg",
    passwordHash: "$2a$10$wE2YFkIe0B59a99p91cZe.P5eH9p.dI70kRfg1hPskQ7m9H9oA1bW",
    name: "PlayArena Platform Owner",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Platform Super-Admin",
    role: "super_admin",
    whatsappNumber: "+91 90000 11111",
    whatsappAlertsEnabled: true,
    gameProfiles: [],
    friends: [],
    followers: [],
    following: [],
    referralCode: "ADMIN007",
    walletBalance: 125000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await usersCollection.insertMany([playerUser, organizerUser, adminUser]);

  // Insert Organizers
  console.log("Seeding Organizers with Super-Admin Commission Rates...");
  const organizerRecord = {
    _id: new mongoose.Types.ObjectId(),
    user: organizerUser._id,
    orgName: "Nova Esports Hub",
    logoUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=80",
    contactEmail: "nova@esports.in",
    contactPhone: "+91 99887 76655",
    status: "approved",
    commissionRate: 10.0, // 10% Platform Cut
    approvedAt: new Date(),
    approvedBy: adminUser._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const phoenixOrg = {
    _id: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(),
    orgName: "Phoenix Gaming Guild",
    logoUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&auto=format&fit=crop&q=80",
    contactEmail: "phoenix@guild.gg",
    contactPhone: "+91 98888 22222",
    status: "approved",
    commissionRate: 12.0,
    approvedAt: new Date(),
    approvedBy: adminUser._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const nightOpsOrg = {
    _id: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(),
    orgName: "Night Ops India",
    logoUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=100&auto=format&fit=crop&q=80",
    contactEmail: "ops@nightops.in",
    contactPhone: "+91 97777 33333",
    status: "approved",
    commissionRate: 8.0,
    approvedAt: new Date(),
    approvedBy: adminUser._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const apexOrg = {
    _id: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(),
    orgName: "Apex Community Tournaments",
    logoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80",
    contactEmail: "apex@tourneys.in",
    contactPhone: "+91 96666 44444",
    status: "pending",
    commissionRate: 15.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await organizersCollection.insertMany([organizerRecord, phoenixOrg, nightOpsOrg, apexOrg]);

  // Insert Tournaments
  console.log("Seeding BGMI and Free Fire MAX Tournaments...");
  const tournament1 = {
    _id: new mongoose.Types.ObjectId("65b91a182f09101112131415"),
    title: "BGMI Pro Scrims Season 4",
    slug: "bgmi-pro-scrims-s4",
    game: "bgmi",
    format: "squad",
    organizer: organizerRecord._id,
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    description: "Daily tier-1 and tier-2 BGMI squad scrims with verified kill point tracking.",
    entryFee: 100,
    prizePool: 15000,
    maxSlots: 25,
    registeredSlots: 22,
    registrationStart: new Date(),
    registrationEnd: new Date(Date.now() + 86400000),
    tournamentDate: new Date(Date.now() + 172800000),
    status: "registration_open",
    commissionRateSnapshot: 10.0,
    scoringRules: {
      placementPoints: {
        "1": 15, "2": 12, "3": 10, "4": 8, "5": 6, "6": 4, "7": 2, "8": 1, "9": 1, "10": 1,
      },
      eliminationPoints: 1.0,
    },
    rules: "1. Mobile devices only. Emulators prohibited.\n2. Screenshot of result screen mandatory.\n3. Room ID released 15 mins prior.",
    youtubeStreamUrl: "https://www.youtube.com/watch?v=yWbA1X18Qy4",
    streamUrl: "https://www.youtube.com/watch?v=yWbA1X18Qy4",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tournament2 = {
    _id: new mongoose.Types.ObjectId(),
    title: "Free Fire MAX Clash Cup",
    slug: "ff-max-clash-cup",
    game: "freefire",
    format: "squad",
    organizer: phoenixOrg._id,
    bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
    description: "High-octane Battle Royale squads tournament for Free Fire MAX players.",
    entryFee: 50,
    prizePool: 8000,
    maxSlots: 24,
    registeredSlots: 24,
    registrationStart: new Date(),
    registrationEnd: new Date(),
    tournamentDate: new Date(Date.now() + 3600000),
    status: "live",
    commissionRateSnapshot: 12.0,
    scoringRules: {
      placementPoints: { "1": 12, "2": 9, "3": 8, "4": 7, "5": 5, "6": 3, "7": 1 },
      eliminationPoints: 1.0,
    },
    rules: "Gun properties active as per tournament room rules.",
    youtubeStreamUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    streamUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tournament3 = {
    _id: new mongoose.Types.ObjectId(),
    title: "BGMI Underdog Championship #12",
    slug: "bgmi-underdog-champ-12",
    game: "bgmi",
    format: "squad",
    organizer: nightOpsOrg._id,
    bannerUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80",
    description: "Free to enter tournament for amateur and underdog squads.",
    entryFee: 0,
    prizePool: 5000,
    maxSlots: 25,
    registeredSlots: 19,
    registrationStart: new Date(),
    registrationEnd: new Date(Date.now() + 172800000),
    tournamentDate: new Date(Date.now() + 259200000),
    status: "registration_open",
    commissionRateSnapshot: 8.0,
    scoringRules: {
      placementPoints: { "1": 15, "2": 12, "3": 10, "4": 8, "5": 6 },
      eliminationPoints: 1.0,
    },
    rules: "Free entry for verified BGMI Character ID holders.",
    youtubeStreamUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    streamUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tournament4 = {
    _id: new mongoose.Types.ObjectId(),
    title: "BGMI Morning Masters Cup",
    slug: "bgmi-morning-masters-01",
    game: "bgmi",
    format: "squad",
    organizer: organizerRecord._id,
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    description: "Morning tier-2 squad scrims with verified kill points.",
    entryFee: 80,
    prizePool: 10000,
    maxSlots: 25,
    registeredSlots: 25,
    registrationStart: new Date(Date.now() - 86400000),
    registrationEnd: new Date(Date.now() - 3600000),
    tournamentDate: new Date(new Date().setHours(11, 0, 0, 0)), // Today 11:00 AM
    status: "completed",
    commissionRateSnapshot: 10.0,
    scoringRules: {
      placementPoints: { "1": 15, "2": 12, "3": 10, "4": 8 },
      eliminationPoints: 1.0,
    },
    rules: "Completed morning scrims. Results verified.",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tournament5 = {
    _id: new mongoose.Types.ObjectId(),
    title: "Free Fire Afternoon Rush #02",
    slug: "ff-afternoon-rush-02",
    game: "freefire",
    format: "duo",
    organizer: phoenixOrg._id,
    bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
    description: "Duo battle royale scrims for Free Fire MAX.",
    entryFee: 40,
    prizePool: 6000,
    maxSlots: 30,
    registeredSlots: 18,
    registrationStart: new Date(),
    registrationEnd: new Date(Date.now() + 86400000),
    tournamentDate: new Date(new Date(Date.now() + 86400000).setHours(14, 30, 0, 0)), // Tomorrow 2:30 PM
    status: "registration_open",
    commissionRateSnapshot: 12.0,
    scoringRules: {
      placementPoints: { "1": 12, "2": 9, "3": 8, "4": 7 },
      eliminationPoints: 1.0,
    },
    rules: "Standard mobile room rules apply.",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tournament6 = {
    _id: new mongoose.Types.ObjectId(),
    title: "BGMI Midnight Mayhem",
    slug: "bgmi-midnight-mayhem-08",
    game: "bgmi",
    format: "squad",
    organizer: nightOpsOrg._id,
    bannerUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80",
    description: "Late night high-stakes scrims with live spectating.",
    entryFee: 150,
    prizePool: 20000,
    maxSlots: 25,
    registeredSlots: 25,
    registrationStart: new Date(),
    registrationEnd: new Date(),
    tournamentDate: new Date(new Date().setHours(22, 30, 0, 0)), // Today 10:30 PM (Night)
    status: "live",
    commissionRateSnapshot: 8.0,
    scoringRules: {
      placementPoints: { "1": 15, "2": 12, "3": 10, "4": 8 },
      eliminationPoints: 1.0,
    },
    rules: "High stakes scrims. Stream delay active.",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await tournamentsCollection.insertMany([
    tournament1,
    tournament2,
    tournament3,
    tournament4,
    tournament5,
    tournament6,
  ]);

  // Insert Match with Room Credentials
  console.log("Seeding Match with Encrypted Room ID & Password...");
  const match1 = {
    _id: new mongoose.Types.ObjectId("65b91b292f09101112131416"),
    tournament: tournament1._id,
    matchNumber: 1,
    scheduledAt: new Date(Date.now() + 600000), // starts in 10 mins
    roomId: "882910",
    roomPassword: "play99",
    credentialsReleasedAt: new Date(),
    status: "live",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await matchesCollection.insertOne(match1);

  // Insert Result Submissions (Verification Queue)
  console.log("Seeding Result Submissions for Organizer Verification Queue...");
  const submission1 = {
    _id: new mongoose.Types.ObjectId(),
    match: match1._id,
    tournament: tournament1._id,
    teamName: "Team SoulFire",
    submittedBy: playerUser._id,
    submitterRole: "player",
    placement: 1,
    eliminations: 8,
    evidenceUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
    notes: "Victory screenshot uploaded via Cloudinary.",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const submission2 = {
    _id: new mongoose.Types.ObjectId(),
    match: match1._id,
    tournament: tournament1._id,
    teamName: "GodLike Phoenix",
    submittedBy: new mongoose.Types.ObjectId(),
    submitterRole: "player",
    placement: 2,
    eliminations: 6,
    evidenceUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
    notes: "Second place with 6 kills.",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await resultsCollection.insertMany([submission1, submission2]);

  // Insert Leaderboard Entries
  console.log("Seeding Official Leaderboard Standings...");
  const leaderboardDocs = [
    {
      tournament: tournament1._id,
      teamName: "Team SoulFire",
      gameIdTag: "Soul_Mortal",
      placement: 1,
      placementPoints: 65,
      eliminationPoints: 48,
      totalPoints: 113,
      rank: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tournament: tournament1._id,
      teamName: "GodLike Phoenix",
      gameIdTag: "GodL_Jonathan",
      placement: 2,
      placementPoints: 52,
      eliminationPoints: 44,
      totalPoints: 96,
      rank: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tournament: tournament1._id,
      teamName: "Revenant Esports",
      gameIdTag: "Rev_Sensei",
      placement: 3,
      placementPoints: 46,
      eliminationPoints: 38,
      totalPoints: 84,
      rank: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tournament: tournament1._id,
      teamName: "Team Tamilas",
      gameIdTag: "TT_Maxy",
      placement: 4,
      placementPoints: 40,
      eliminationPoints: 32,
      totalPoints: 72,
      rank: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await leaderboardsCollection.insertMany(leaderboardDocs);

  // Insert Game Invites
  console.log("Seeding Squad Game Invites...");
  const invite1 = {
    sender: playerUser._id,
    targetGameId: "5129847291",
    game: "bgmi",
    tournament: tournament1._id,
    teamName: "Team SoulFire",
    message: "Join our squad for BGMI Pro Scrims Season 4!",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await invitesCollection.insertOne(invite1);

  console.log("✅ PlayArena MongoDB Seed Completed Successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
