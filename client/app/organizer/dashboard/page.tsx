"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Users, 
  Plus, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  FileCheck,
  Key,
  CreditCard,
  Percent,
  Settings,
  History,
  Lock,
  Globe,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  DollarSign,
  Calendar,
  Gamepad2,
  Send,
  Eye,
  Calculator,
  Inbox,
  Upload,
  Link as LinkIcon,
  Video,
  Trash2,
  Award,
  Search,
  Filter,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Download,
  Crown,
  RotateCcw
} from "lucide-react";
import ImageDropzone from "@/components/ImageDropzone";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { useToast } from "@/lib/context/ToastContext";
import { formatINR, normalizeStreamUrl } from "@/lib/utils";

function YoutubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

type TabKey = 
  | "tournaments_matches"
  | "create" 
  | "previous_results" 
  | "payouts_schedule" 
  | "commission" 
  | "add_result" 
  | "room_credentials" 
  | "profile_upi";

interface RegisteredTeamMember {
  gameId: string;
  inGameName: string;
  role: "captain" | "member" | "substitute";
  status: "confirmed" | "invited_pending";
  joinedAt?: string;
}

interface RegisteredTeam {
  _id?: string;
  id?: string;
  tournamentId: string;
  tournamentTitle?: string;
  teamName: string;
  format: "solo" | "duo" | "squad";
  captainName: string;
  captainGameId?: string;
  captainPhone?: string;
  captainEmail?: string;
  squadToken: string;
  members: RegisteredTeamMember[];
  maxMembers: number;
  isEarlyLocked: boolean;
  paymentStatus: "completed" | "free" | "pending";
  paymentId?: string;
  credentialsDelivered?: boolean;
  createdAt: string;
}

interface OrganizerProfile {
  _id?: string;
  orgName: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
  commissionRate: number;
  upiId: string;
  walletBalance: number;
  totalSettledPayouts: number;
}

interface TournamentItem {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  game: "bgmi" | "freefire";
  format: "solo" | "duo" | "squad";
  entryFee: number;
  prizePool: number;
  maxSlots: number;
  registeredSlots: number;
  status: string;
  visibility?: "public" | "private";
  privateToken?: string;
  youtubeStreamUrl?: string;
  streamUrl?: string;
  matchRoomCredentials?: {
    roomId: string;
    roomPassword: string;
    announcedAt?: string;
  };
  tournamentDate: string;
}

interface ResultArchiveItem {
  id: string;
  tournamentTitle: string;
  teamName: string;
  placement: number;
  eliminations: number;
  points: number;
  evidenceUrl: string;
  status: string;
  date: string;
}

export default function OrganizerDashboardPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("tournaments_matches");
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState(false);

  // Profile & Data State (Real state initialized empty)
  const [profile, setProfile] = useState<OrganizerProfile>({
    orgName: "Nova Esports Hub",
    contactEmail: "nova.esports@arena.gg",
    contactPhone: "+91 98765 43210",
    status: "approved",
    commissionRate: 10.0,
    upiId: "nova.esports@okhdfcbank",
    walletBalance: 0,
    totalSettledPayouts: 0,
  });

  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [resultsArchive, setResultsArchive] = useState<ResultArchiveItem[]>([]);

  // Matches & Tournaments / Registered Teams State (Real data only, no dummy data)
  const [matchCategoryFilter, setMatchCategoryFilter] = useState<"all" | "live" | "upcoming" | "concluded">("all");
  const [matchSearchQuery, setMatchSearchQuery] = useState<string>("");
  const [expandedTourneyTeamsId, setExpandedTourneyTeamsId] = useState<string | null>(null);
  const [registeredTeams, setRegisteredTeams] = useState<RegisteredTeam[]>([]);
  const [selectedTourneyForTeams, setSelectedTourneyForTeams] = useState<string>("all");
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>("");
  const [teamStatusFilter, setTeamStatusFilter] = useState<"all" | "completed" | "free" | "pending">("all");
  const [copiedRosterTeamId, setCopiedRosterTeamId] = useState<string | null>(null);

  // Tab 1 Form State: Create Tournament Defaults
  const defaultCreateForm = {
    title: "",
    game: "bgmi" as "bgmi" | "freefire",
    format: "squad" as "solo" | "duo" | "squad",
    visibility: "public" as "public" | "private",
    entryFee: 100,
    prizePool: 15000,
    maxSlots: 25,
    eventDate: "2026-11-26T20:00",
    firstPlacePoints: 15,
    killPoints: 1,
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    youtubeStreamUrl: "",
    description: "Official competitive tournament with automated standings and instant prize pool.",
    rules: "1. Device Policy: Mobile phones only (iOS / Android). Emulators, triggers, and iPad/tablets are strictly forbidden.\n2. Integrity: Cheating, teaming, hacking, or third-party config files will result in an immediate lifetime ban.\n3. Punctuality: Room credentials are dispatched 15 minutes before kick-off. Matches start on schedule.",
    codeOfConduct: "1. Fair Play: All participants must maintain esports integrity and respect referees and fellow competitors.\n2. Non-Toxic Environment: Abusive language, harassment, hate speech, or toxicity in lobbies will lead to disqualification.\n3. Disqualification & Forfeiture: Failing to verify results, submitting falsified screenshots, or intentional disconnects will forfeit prize entitlements.",
  };

  const defaultPrizeRanks = [
    { rank: "1st Place (Champion)", reward: 7500, percentage: 50 },
    { rank: "2nd Place (Runner-Up)", reward: 4500, percentage: 30 },
    { rank: "3rd Place (2nd Runner-Up)", reward: 3000, percentage: 20 },
  ];

  const [createForm, setCreateForm] = useState(defaultCreateForm);
  const [prizeRanks, setPrizeRanks] = useState<Array<{ rank: string; reward: number; percentage: number }>>(defaultPrizeRanks);

  const handleResetCreateForm = () => {
    setCreateForm(defaultCreateForm);
    setPrizeRanks(defaultPrizeRanks);
    toast.info("Tournament creation form has been reset to defaults.", "Form Reset");
  };
  const [newPrivateToken, setNewPrivateToken] = useState<string | null>(null);
  const [bannerUploadMode, setBannerUploadMode] = useState<"upload" | "url">("upload");
  const [evidenceUploadMode, setEvidenceUploadMode] = useState<"upload" | "url">("upload");

  const applyPrizePreset = (preset: "top3" | "top5" | "winner") => {
    const total = Number(createForm.prizePool) || 0;
    if (preset === "top3") {
      setPrizeRanks([
        { rank: "1st Place (Champion)", reward: Math.round(total * 0.5), percentage: 50 },
        { rank: "2nd Place (Runner-Up)", reward: Math.round(total * 0.3), percentage: 30 },
        { rank: "3rd Place (2nd Runner-Up)", reward: Math.round(total * 0.2), percentage: 20 },
      ]);
    } else if (preset === "top5") {
      setPrizeRanks([
        { rank: "1st Place (Champion)", reward: Math.round(total * 0.4), percentage: 40 },
        { rank: "2nd Place (Runner-Up)", reward: Math.round(total * 0.25), percentage: 25 },
        { rank: "3rd Place", reward: Math.round(total * 0.15), percentage: 15 },
        { rank: "4th Place", reward: Math.round(total * 0.1), percentage: 10 },
        { rank: "5th Place", reward: Math.round(total * 0.1), percentage: 10 },
      ]);
    } else if (preset === "winner") {
      setPrizeRanks([
        { rank: "1st Place (Winner Takes All)", reward: total, percentage: 100 },
      ]);
    }
  };

  const handleRankRewardChange = (index: number, newReward: number) => {
    const updated = [...prizeRanks];
    const total = Number(createForm.prizePool) || 1;
    updated[index].reward = newReward;
    updated[index].percentage = Math.round((newReward / total) * 100);
    setPrizeRanks(updated);
  };

  const handleAddRankTier = () => {
    const nextNum = prizeRanks.length + 1;
    setPrizeRanks([
      ...prizeRanks,
      { rank: `${nextNum}th Place`, reward: 0, percentage: 0 },
    ]);
  };

  const handleRemoveRankTier = (index: number) => {
    if (prizeRanks.length <= 1) return;
    setPrizeRanks(prizeRanks.filter((_, i) => i !== index));
  };

  // Tab 5 Form State: Add Result of Match
  const [resultForm, setResultForm] = useState({
    tournamentId: "",
    teamName: "",
    placement: 1,
    eliminations: 8,
    evidenceUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200",
    notes: "Official end-game leaderboard screenshot verified.",
  });

  // Tab 6 Form State: Room ID & Password
  const [credentialForm, setCredentialForm] = useState({
    tournamentId: "",
    roomId: "",
    roomPassword: "",
    youtubeStreamUrl: "",
  });

  // Tab 7 Form State: Edit Profile & UPI ID
  const [profileForm, setProfileForm] = useState({
    orgName: "",
    contactEmail: "",
    contactPhone: "",
    upiId: "",
  });

  // Tab 4 Calculator State
  const [calcFee, setCalcFee] = useState(100);
  const [calcSlots, setCalcSlots] = useState(25);

  // Load from API on mount
  useEffect(() => {
    fetch("/api/organizer/dashboard")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          if (res.data.organizer) {
            setProfile(res.data.organizer);
            setProfileForm({
              orgName: res.data.organizer.orgName || "",
              contactEmail: res.data.organizer.contactEmail || "",
              contactPhone: res.data.organizer.contactPhone || "",
              upiId: res.data.organizer.upiId || "",
            });
          }
          if (res.data.tournaments) {
            setTournaments(res.data.tournaments);
            if (res.data.tournaments.length > 0) {
              setCredentialForm((prev) => ({
                ...prev,
                tournamentId: res.data.tournaments[0]._id,
                roomId: res.data.tournaments[0].matchRoomCredentials?.roomId || "",
                roomPassword: res.data.tournaments[0].matchRoomCredentials?.roomPassword || "",
                youtubeStreamUrl: res.data.tournaments[0].youtubeStreamUrl || res.data.tournaments[0].streamUrl || "",
              }));
              setResultForm((prev) => ({
                ...prev,
                tournamentId: res.data.tournaments[0]._id,
              }));
            }
          }
          if (res.data.results && res.data.results.length > 0) {
            const mappedResults: ResultArchiveItem[] = res.data.results.map((r: any) => ({
              id: r._id,
              tournamentTitle: r.tournament?.title || "Match Fixture",
              teamName: r.teamName,
              placement: r.placement,
              eliminations: r.eliminations,
              points: (r.placement === 1 ? 15 : 10) + (r.eliminations || 0),
              evidenceUrl: r.evidenceUrl,
              status: r.status,
              date: new Date(r.createdAt).toLocaleDateString("en-IN"),
            }));
            setResultsArchive(mappedResults);
          }
          if (res.data.registrations && res.data.registrations.length > 0) {
            const mapped: RegisteredTeam[] = res.data.registrations.map((r: any) => ({
              _id: r._id,
              id: r._id,
              tournamentId: typeof r.tournament === "object" ? r.tournament?._id : (r.tournament || "all"),
              tournamentTitle: typeof r.tournament === "object" ? r.tournament?.title : undefined,
              teamName: r.teamName,
              format: r.format || "squad",
              captainName: r.captain?.name || "Team Captain",
              captainGameId: r.members?.[0]?.gameId || "N/A",
              captainPhone: r.captain?.phone || r.captain?.whatsappNumber || "",
              captainEmail: r.captain?.email || "",
              squadToken: r.squadToken,
              members: r.members || [],
              maxMembers: r.maxMembers || 4,
              isEarlyLocked: r.isEarlyLocked ?? true,
              paymentStatus: r.paymentStatus || "completed",
              paymentId: r.paymentId,
              credentialsDelivered: r.credentialsDelivered || false,
              createdAt: r.createdAt || new Date().toISOString(),
            }));
            setRegisteredTeams(mapped);
          } else {
            setRegisteredTeams([]);
          }
        }
      })
      .catch((err) => {
        toast.error("Could not fetch organizer dashboard telemetry from server.", "Connection Warning");
      })
      .finally(() => setLoading(false));
  }, []);

  // 1. Handle Create Tournament
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      toast.warning("Please provide a tournament title before publishing.", "Title Required");
      return;
    }

    try {
      const normalizedCreateStream = createForm.youtubeStreamUrl
        ? normalizeStreamUrl(createForm.youtubeStreamUrl)
        : "";
      const payload = {
        ...createForm,
        youtubeStreamUrl: normalizedCreateStream,
        streamUrl: normalizedCreateStream,
        prizeDistribution: prizeRanks,
      };

      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTournaments([data.data, ...tournaments]);
        if (data.data.visibility === "private" && data.data.privateToken) {
          setNewPrivateToken(data.data.privateToken);
          toast.success(`Private tournament created with access token ${data.data.privateToken}`, "Private Event Live");
          toast.info("Direct registration invite link generated below.", "Access Control");
        } else {
          toast.success("Tournament published and live on PlayArena public marketplace!", "Event Created");
        }
        if (normalizedCreateStream) {
          try {
            localStorage.removeItem("mvp_stream_active");
            if (data.data._id) {
              localStorage.setItem(`mvp_stream_${data.data._id}`, normalizedCreateStream);
            }
            if (data.data.slug) {
              localStorage.setItem(`mvp_stream_${data.data.slug}`, normalizedCreateStream);
            }
          } catch {}
        }
        // Reset tournament creation form completely to fresh defaults
        setCreateForm(defaultCreateForm);
        setPrizeRanks(defaultPrizeRanks);
      } else {
        toast.error(data.error || "Failed to create tournament.", "Creation Error");
      }
    } catch {
      toast.error("Network error while connecting to server. Please retry.", "Server Error");
    }
  };

  // 2. Handle Submit Result
  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultForm.teamName.trim()) {
      toast.warning("Please enter the winning team or squad name.", "Validation Warning");
      return;
    }

    try {
      const res = await fetch("/api/organizer/matches/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Match result verified and committed to official standings!", "Result Certified");
        const chosenTour = tournaments.find((t) => t._id === resultForm.tournamentId);
        setResultsArchive([
          {
            id: `res_${Date.now()}`,
            tournamentTitle: chosenTour?.title || "BGMI Match",
            teamName: resultForm.teamName,
            placement: Number(resultForm.placement),
            eliminations: Number(resultForm.eliminations),
            points: Number(resultForm.placement) === 1 ? 15 + Number(resultForm.eliminations) : 10 + Number(resultForm.eliminations),
            evidenceUrl: resultForm.evidenceUrl,
            status: "approved",
            date: "Just Now",
          },
          ...resultsArchive,
        ]);
        setResultForm({
          ...resultForm,
          teamName: "",
          placement: 1,
          eliminations: 0,
        });
      } else {
        toast.error(data.error || "Failed to submit result.", "Submission Error");
      }
    } catch {
      toast.error("Network error saving match result.", "Network Failure");
    }
  };

  // 3. Handle Update Credentials & Stream Link
  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasRoom = Boolean(credentialForm.roomId.trim() && credentialForm.roomPassword.trim());
    const normalizedStream = credentialForm.youtubeStreamUrl ? normalizeStreamUrl(credentialForm.youtubeStreamUrl) : "";
    const hasStream = Boolean(normalizedStream);

    if (!hasRoom && !hasStream) {
      toast.warning("Please provide either Room credentials or a Live Stream link.", "Nothing to Save");
      return;
    }

    if (hasStream) {
      try {
        localStorage.removeItem("mvp_stream_active");
        if (credentialForm.tournamentId) {
          localStorage.setItem(`mvp_stream_${credentialForm.tournamentId}`, normalizedStream);
        }
      } catch {}
    }

    try {
      const payload = {
        ...credentialForm,
        youtubeStreamUrl: normalizedStream,
        streamUrl: normalizedStream,
      };

      const res = await fetch("/api/organizer/matches/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        if (hasRoom && hasStream) {
          toast.success("Room ID, Password & Live Stream link saved successfully!", "Credentials & Stream Stored");
        } else if (hasStream) {
          toast.success("Live stream link activated and published to tournament page!", "Stream Link Updated");
        } else {
          toast.success("Room ID & Password saved successfully!", "Credentials Stored");
        }
        if (hasRoom) {
          toast.info("Lobby credentials will unlock for players exactly 10 min before match time.", "Automated Release");
        }
        setTournaments(
          tournaments.map((t) =>
            t._id === credentialForm.tournamentId || t.slug === credentialForm.tournamentId
              ? {
                  ...t,
                  matchRoomCredentials: hasRoom
                    ? {
                        roomId: credentialForm.roomId,
                        roomPassword: credentialForm.roomPassword,
                      }
                    : t.matchRoomCredentials,
                  youtubeStreamUrl: hasStream ? normalizedStream : t.youtubeStreamUrl,
                  streamUrl: hasStream ? normalizedStream : t.streamUrl,
                }
              : t
          )
        );
      } else {
        toast.error(data.error || "Failed to update room credentials.", "Update Failed");
      }
    } catch {
      toast.error("Network error while updating credentials.", "Connection Error");
    }
  };

  // 4. Handle Update Profile & UPI ID
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.upiId.includes("@")) {
      toast.warning("Please specify a valid UPI ID (e.g. nova.esports@okhdfcbank).", "UPI Validation");
      return;
    }

    try {
      const res = await fetch("/api/organizer/dashboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (data.success) {
        setProfile({
          ...profile,
          ...profileForm,
        });
        toast.success("Organizer Profile and UPI ID saved successfully!", "Profile Updated");
      } else {
        toast.error(data.error || "Update failed.", "Profile Error");
      }
    } catch {
      toast.error("Network error updating profile.", "Update Error");
    }
  };

  // Handlers for Registered Teams Tab
  const handleCopySquadToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    toast.success(`Squad Token "${token}" copied to clipboard!`, "Token Copied");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyTeamRoster = (team: RegisteredTeam) => {
    const lines = [
      `TEAM: ${team.teamName} [Format: ${team.format.toUpperCase()} | Token: ${team.squadToken}]`,
      `Captain: ${team.captainName} (UID: ${team.captainGameId || "N/A"})${team.captainPhone ? ` | WA: ${team.captainPhone}` : ""}`,
      `Roster Members:`,
      ...team.members.map((m, i) => `  Slot ${i + 1}: [${(m.role || "member").toUpperCase()}] ${m.inGameName} (UID: ${m.gameId}) - ${m.status}`),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    const key = team.id || team._id || team.squadToken;
    setCopiedRosterTeamId(key);
    toast.success(`Roster for "${team.teamName}" copied to clipboard!`, "Roster Copied");
    setTimeout(() => setCopiedRosterTeamId(null), 2500);
  };

  const filteredRegisteredTeams = registeredTeams.filter((team) => {
    // 1. Tournament filter
    if (selectedTourneyForTeams !== "all") {
      if (team.tournamentId !== selectedTourneyForTeams && team.tournamentId !== "all") {
        return false;
      }
    }

    // 2. Status filter
    if (teamStatusFilter !== "all") {
      if (team.paymentStatus !== teamStatusFilter) {
        return false;
      }
    }

    // 3. Search query
    if (teamSearchQuery.trim()) {
      const q = teamSearchQuery.toLowerCase();
      const matchTeam = team.teamName.toLowerCase().includes(q);
      const matchToken = team.squadToken.toLowerCase().includes(q);
      const matchCaptain = team.captainName.toLowerCase().includes(q);
      const matchUID = team.captainGameId?.toLowerCase().includes(q);
      const matchMember = team.members.some(
        (m) => m.inGameName.toLowerCase().includes(q) || m.gameId.toLowerCase().includes(q)
      );
      if (!matchTeam && !matchToken && !matchCaptain && !matchUID && !matchMember) {
        return false;
      }
    }

    return true;
  });

  const handleExportAllRosters = () => {
    if (filteredRegisteredTeams.length === 0) {
      toast.warning("No teams currently match your filter.", "No Teams");
      return;
    }
    const fullSheet = [
      `=== OFFICIAL TOURNAMENT ROSTER SHEET ===`,
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      `Total Registered Teams: ${filteredRegisteredTeams.length}`,
      ``,
      ...filteredRegisteredTeams.map((t, idx) => {
        return [
          `SLOT #${idx + 1}: ${t.teamName.toUpperCase()} [Token: ${t.squadToken} | Payment: ${t.paymentStatus.toUpperCase()}]`,
          `Captain: ${t.captainName} (UID: ${t.captainGameId || "N/A"})${t.captainPhone ? ` | WA: ${t.captainPhone}` : ""}`,
          `Members (${t.members.length}/${t.maxMembers}):`,
          ...t.members.map((m, mi) => `   ${mi + 1}. ${m.inGameName} [UID: ${m.gameId}] (${m.role})`),
          `------------------------------------------------`,
        ].join("\n");
      }),
    ].join("\n");

    navigator.clipboard.writeText(fullSheet);
    toast.success(`Exported complete sheet of ${filteredRegisteredTeams.length} teams to clipboard!`, "Roster Sheet Exported");
  };

  // Matches & Tournaments Categorization (Live, Upcoming, Concluded)
  const getTourneyCategory = (t: TournamentItem): "live" | "upcoming" | "concluded" => {
    if (t.status === "live") return "live";
    if (t.status === "completed" || t.status === "cancelled") return "concluded";
    return "upcoming";
  };

  const liveTournamentsCount = tournaments.filter((t) => getTourneyCategory(t) === "live").length;
  const upcomingTournamentsCount = tournaments.filter((t) => getTourneyCategory(t) === "upcoming").length;
  const concludedTournamentsCount = tournaments.filter((t) => getTourneyCategory(t) === "concluded").length;

  const filteredTournamentsMatches = tournaments.filter((t) => {
    const cat = getTourneyCategory(t);
    if (matchCategoryFilter !== "all" && cat !== matchCategoryFilter) {
      return false;
    }
    if (matchSearchQuery.trim()) {
      const q = matchSearchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchGame = t.game.toLowerCase().includes(q);
      const matchFormat = t.format.toLowerCase().includes(q);
      if (!matchTitle && !matchGame && !matchFormat) {
        return false;
      }
    }
    return true;
  });

  // Financial aggregates
  const totalTournamentsCount = tournaments.length;
  const ticketGrossVolume = tournaments.reduce((acc, t) => acc + (t.registeredSlots * t.entryFee), 0);
  const platformFee = Math.round((ticketGrossVolume * (profile.commissionRate || 10)) / 100);
  const netEarnings = ticketGrossVolume - platformFee;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-medium text-emerald-800 mb-2 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            ORGANIZER COMMAND CENTER
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {profile.orgName}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-2">
            <span>Commission Tier: <strong className="text-emerald-700 font-mono">{profile.commissionRate}% Standard</strong></span>
            <span>•</span>
            <span>Settlement UPI: <strong className="font-mono text-slate-800">{profile.upiId || "Not Configured"}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("tournaments_matches")}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all shadow-xs"
          >
            <Gamepad2 className="h-4 w-4 text-emerald-600" />
            <span>Matches &amp; Tournaments</span>
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create Tournament</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Total Tournaments
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {totalTournamentsCount} Events
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Public &amp; Private active</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Ticket Gross Volume
          </span>
          <div className="text-xl font-bold text-amber-600 mt-1 font-mono">
            ₹{ticketGrossVolume.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-slate-500">Player registrations total</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Net Earnings ({100 - profile.commissionRate}%)
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1 font-mono">
            ₹{netEarnings.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">After {profile.commissionRate}% platform fee</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Settled to UPI
          </span>
          <div className="text-xl font-bold text-indigo-600 mt-1 font-mono">
            ₹{profile.totalSettledPayouts.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-indigo-700 font-medium">100% verified bank transfers</span>
        </div>
      </div>

      {/* 8 Tabs Navigation Bar */}
      <div className="border-b border-slate-200 bg-white rounded-xl shadow-xs overflow-x-auto">
        <div className="flex items-center min-w-max p-1.5 gap-1">
          {[
            { key: "tournaments_matches" as TabKey, label: "Matches & Tournaments", icon: Gamepad2 },
            { key: "create" as TabKey, label: "Create Tournament", icon: Plus },
            { key: "previous_results" as TabKey, label: "Previous Match Results", icon: History },
            { key: "payouts_schedule" as TabKey, label: "Payouts & Schedule", icon: DollarSign },
            { key: "commission" as TabKey, label: "Default Commission", icon: Percent },
            { key: "add_result" as TabKey, label: "Add Match Result", icon: FileCheck },
            { key: "room_credentials" as TabKey, label: "Room ID & Password", icon: Key },
            { key: "profile_upi" as TabKey, label: "Edit Profile & UPI", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: CREATE TOURNAMENT */}
      {activeTab === "create" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Host New Tournament</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Launch public tournaments on the website discovery or generate private invited-only scrim tokens.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateTournament} className="space-y-6">
            {/* Visibility Mode Switcher */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold mb-2">
                Tournament Visibility Mode *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setCreateForm({ ...createForm, visibility: "public" })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    createForm.visibility === "public"
                      ? "border-emerald-600 bg-emerald-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className={`h-5 w-5 ${createForm.visibility === "public" ? "text-emerald-600" : "text-slate-400"}`} />
                    <span className="font-bold text-xs text-slate-900">Public Tournament</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Available to everyone on website discovery. Anyone can search, explore, and register.
                  </p>
                </div>

                <div
                  onClick={() => setCreateForm({ ...createForm, visibility: "private" })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    createForm.visibility === "private"
                      ? "border-purple-600 bg-purple-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className={`h-5 w-5 ${createForm.visibility === "private" ? "text-purple-600" : "text-slate-400"}`} />
                    <span className="font-bold text-xs text-slate-900">Private (Invite Only)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Unlisted from public marketplace. Generates a private invite link &amp; secret access token.
                  </p>
                </div>
              </div>
            </div>

            {/* Title & Game */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tournament Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BGMI Pro Championship Cup Season 5"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Game *
                </label>
                <select
                  value={createForm.game}
                  onChange={(e) => setCreateForm({ ...createForm, game: e.target.value as "bgmi" | "freefire" })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  <option value="bgmi">BGMI (Battlegrounds India)</option>
                  <option value="freefire">Free Fire MAX</option>
                </select>
              </div>
            </div>

            {/* Format, Slots, Entry Fee & Prize Pool */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Format
                </label>
                <select
                  value={createForm.format}
                  onChange={(e) => setCreateForm({ ...createForm, format: e.target.value as "solo" | "duo" | "squad" })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  <option value="squad">Squad (4 Players)</option>
                  <option value="duo">Duo (2 Players)</option>
                  <option value="solo">Solo (1 Player)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Max Slots
                </label>
                <input
                  type="number"
                  min={2}
                  max={100}
                  value={createForm.maxSlots}
                  onChange={(e) => setCreateForm({ ...createForm, maxSlots: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Entry Fee (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={createForm.entryFee}
                  onChange={(e) => setCreateForm({ ...createForm, entryFee: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Prize Pool (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={createForm.prizePool}
                  onChange={(e) => setCreateForm({ ...createForm, prizePool: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            {/* Event Schedule */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Schedule (Date &amp; Time)
              </label>
              <input
                type="datetime-local"
                value={createForm.eventDate}
                onChange={(e) => setCreateForm({ ...createForm, eventDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
              />
            </div>

            {/* Banner Artwork: Upload Image or URL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Tournament Cover Artwork / Banner
                </label>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setBannerUploadMode("upload")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                      bannerUploadMode === "upload"
                        ? "bg-white text-emerald-700 shadow-xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerUploadMode("url")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                      bannerUploadMode === "url"
                        ? "bg-white text-emerald-700 shadow-xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <LinkIcon className="h-3 w-3" />
                    <span>Image URL</span>
                  </button>
                </div>
              </div>

              {bannerUploadMode === "upload" ? (
                <ImageDropzone
                  value={createForm.bannerUrl}
                  onChange={(url) => setCreateForm({ ...createForm, bannerUrl: url })}
                  aspectRatio="video"
                  label=""
                  hint="Drag & drop custom banner artwork, click to browse files, or paste (Ctrl+V)"
                />
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={createForm.bannerUrl}
                    onChange={(e) => setCreateForm({ ...createForm, bannerUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                  />
                  {createForm.bannerUrl && (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 max-h-48 flex items-center justify-center">
                      <img
                        src={createForm.bannerUrl}
                        alt="Banner Preview"
                        className="max-h-48 w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* YouTube Stream Link (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-rose-600" />
                  <span>YouTube Stream Link (Optional)</span>
                </label>
                <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-semibold">Optional</span>
              </div>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={createForm.youtubeStreamUrl}
                onChange={(e) => setCreateForm({ ...createForm, youtubeStreamUrl: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder-slate-400"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Provide a YouTube stream or channel link if this tournament will be broadcasted live.
              </span>
            </div>

            {/* Prize Pool Breakdown & Rank Rewards */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                      Prize Pool Breakdown by Rank
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure rank rewards. Total allocated: ₹{prizeRanks.reduce((sum, r) => sum + (Number(r.reward) || 0), 0).toLocaleString("en-IN")} of ₹{Number(createForm.prizePool).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-500">Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyPrizePreset("top3")}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-emerald-600 text-slate-700 font-medium"
                  >
                    Top 3 (50/30/20)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPrizePreset("top5")}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-emerald-600 text-slate-700 font-medium"
                  >
                    Top 5
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPrizePreset("winner")}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-emerald-600 text-slate-700 font-medium"
                  >
                    Winner 100%
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {prizeRanks.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                    <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200">
                      #{idx + 1}
                    </div>
                    <input
                      type="text"
                      required
                      value={item.rank}
                      onChange={(e) => {
                        const updated = [...prizeRanks];
                        updated[idx].rank = e.target.value;
                        setPrizeRanks(updated);
                      }}
                      placeholder="e.g. 1st Place (Champion)"
                      className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 text-xs text-slate-800"
                    />
                    <div className="relative w-32 shrink-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">₹</span>
                      <input
                        type="number"
                        min={0}
                        required
                        value={item.reward}
                        onChange={(e) => handleRankRewardChange(idx, Number(e.target.value))}
                        className="w-full pl-6 pr-2.5 py-1.5 rounded border border-slate-200 text-xs font-mono font-bold text-amber-700"
                      />
                    </div>
                    {item.percentage !== undefined && (
                      <span className="text-[11px] font-mono text-slate-400 w-12 text-right shrink-0">
                        {item.percentage}%
                      </span>
                    )}
                    {prizeRanks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRankTier(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remove tier"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddRankTier}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline pt-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Rank Tier</span>
              </button>
            </div>

            {/* Rules and Code of Conduct */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Tournament Official Rules *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Format, Devices, Punctuality</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={createForm.rules}
                  onChange={(e) => setCreateForm({ ...createForm, rules: e.target.value })}
                  placeholder="1. Mobile devices only. Emulators prohibited..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Code of Conduct &amp; Fair Play *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Anti-Cheat, Respect, Toxicity Policy</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={createForm.codeOfConduct}
                  onChange={(e) => setCreateForm({ ...createForm, codeOfConduct: e.target.value })}
                  placeholder="1. Respect arbiters and opponents..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetCreateForm}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-slate-300 shadow-xs cursor-pointer"
                title="Clear all fields and reset form"
              >
                <RotateCcw className="h-4 w-4 text-slate-500" />
                <span>Reset Form</span>
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Publish {createForm.visibility === "private" ? "Private" : "Public"} Tournament</span>
              </button>
            </div>
          </form>

          {/* New Private Token Result */}
          {newPrivateToken && (
            <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-900 uppercase">
                  Private Registration Link Created
                </span>
                <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  Secret Invite
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={typeof window !== "undefined" ? `${window.location.origin}/join?token=${newPrivateToken}` : `http://localhost:3000/join?token=${newPrivateToken}`}
                  className="w-full bg-white border border-purple-300 px-3 py-2 rounded-lg text-xs font-mono text-purple-900"
                />
                <button
                  onClick={() => {
                    const url = typeof window !== "undefined" ? `${window.location.origin}/join?token=${newPrivateToken}` : `http://localhost:3000/join?token=${newPrivateToken}`;
                    navigator.clipboard.writeText(url);
                    setCopiedToken(true);
                    toast.info("Private invite link copied to clipboard!", "Link Copied");
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                  className="px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  {copiedToken ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedToken ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: MATCHES & TOURNAMENTS (Live, Upcoming, Concluded) */}
      {activeTab === "tournaments_matches" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold uppercase">
                  Tournament Operations
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-mono">
                  {tournaments.length} Matches &amp; Tournaments Active
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Matches &amp; Tournaments Ledger
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Explore Live, Upcoming, and Concluded matches. Click on any tournament or match to view real registered teams &amp; player details.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveTab("create")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Host New Tournament</span>
              </button>
            </div>
          </div>

          {/* Sub-Category Filter Tabs: All, Live, Upcoming, Concluded */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto w-full sm:w-auto no-scrollbar">
              {[
                { key: "all" as const, label: "All Fixtures", count: tournaments.length },
                { key: "live" as const, label: "🔴 Live Matches", count: liveTournamentsCount },
                { key: "upcoming" as const, label: "⏳ Upcoming Scheduled", count: upcomingTournamentsCount },
                { key: "concluded" as const, label: "✅ Concluded Matches", count: concludedTournamentsCount },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setMatchCategoryFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                    matchCategoryFilter === tab.key
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    matchCategoryFilter === tab.key ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search fixture title or game..."
                value={matchSearchQuery}
                onChange={(e) => setMatchSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-emerald-500 shadow-2xs"
              />
              {matchSearchQuery && (
                <button
                  onClick={() => setMatchSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Tournaments List Grid */}
          {filteredTournamentsMatches.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Gamepad2 className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {matchCategoryFilter !== "all"
                  ? `No ${matchCategoryFilter.toUpperCase()} Matches Found`
                  : "No Tournaments or Matches Created Yet"}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {matchSearchQuery
                  ? "No fixtures match your current search keyword. Try a different search."
                  : "Publish an esports fixture to generate public registrations or secret scrim tokens."}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("create")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create First Tournament</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTournamentsMatches.map((t) => {
                const category = getTourneyCategory(t);
                const isLive = category === "live";
                const isConcluded = category === "concluded";
                const registeredCount = t.registeredSlots || 0;
                const fillPct = Math.min(100, Math.round((registeredCount / t.maxSlots) * 100));
                const isExpanded = expandedTourneyTeamsId === t._id;
                const realTeams = registeredTeams.filter((rt) => rt.tournamentId === t._id);

                return (
                  <div
                    key={t._id}
                    className={`rounded-xl border bg-white overflow-hidden shadow-2xs hover:shadow-xs transition-all ${
                      isLive
                        ? "border-rose-200 ring-1 ring-rose-200/50"
                        : isConcluded
                        ? "border-slate-200 opacity-90"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Top Row: Badges & Schedule */}
                    <div className="p-4 bg-slate-50/70 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          t.game === "bgmi"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}>
                          {t.game === "bgmi" ? "BGMI" : "FREE FIRE MAX"}
                        </span>

                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono font-semibold text-slate-700 uppercase">
                          {t.format}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isLive
                              ? "bg-rose-600 text-white shadow-2xs"
                              : isConcluded
                              ? "bg-slate-200 text-slate-700"
                              : "bg-emerald-600 text-white shadow-2xs"
                          }`}
                        >
                          {isLive && <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />}
                          {isLive ? "LIVE NOW" : isConcluded ? "CONCLUDED" : "UPCOMING"}
                        </span>

                        {t.visibility === "private" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-mono font-semibold">
                            <Lock className="h-2.5 w-2.5" />
                            PRIVATE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {new Date(t.tournamentDate).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Middle Section: Title & Key Metrics */}
                    <div className="p-4 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <Link
                            href={`/organizer/tournaments/${t._id}/teams`}
                            className="text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors tracking-tight flex items-center gap-2 group"
                          >
                            <span>{t.title}</span>
                            <span className="text-xs text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              (Click to open teams page →)
                            </span>
                          </Link>
                          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                            Fixture ID: <strong className="text-slate-700">{t._id}</strong>
                          </span>
                        </div>

                        {/* Slots Fill Bar */}
                        <div className="min-w-[180px] p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[10px] font-mono text-slate-500 uppercase">Roster Capacity</span>
                            <span className="font-bold font-mono text-emerald-700">
                              {registeredCount}/{t.maxSlots} Slots
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Financial & Room Details Bar */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Prize Pool</span>
                          <span className="font-bold font-mono text-amber-700">
                            {formatINR(t.prizePool)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase block">Participation Tariff</span>
                          <span className="font-bold font-mono text-slate-900">
                            {t.entryFee === 0 ? "FREE" : `₹${t.entryFee}`}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase block">Room ID &amp; Password</span>
                          <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${
                            t.matchRoomCredentials?.roomId ? "text-emerald-700" : "text-amber-600"
                          }`}>
                            {t.matchRoomCredentials?.roomId ? `ID: ${t.matchRoomCredentials.roomId}` : "Pending Setup ⚠️"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase block">Official Stream</span>
                          {t.youtubeStreamUrl || t.streamUrl ? (
                            <a
                              href={t.youtubeStreamUrl || t.streamUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-red-600 hover:underline"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping"></span>
                              <span>Live Stream ↗</span>
                            </a>
                          ) : (
                            <span className="text-[11px] font-mono text-slate-400">
                              Standby ⏳
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase block">Direct Teams Link</span>
                          <span className="text-[11px] font-mono text-slate-500">
                            /tournaments/{t._id}/teams
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="p-3 bg-slate-50/50 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Primary Button to Open Teams Page */}
                        <Link
                          href={`/organizer/tournaments/${t._id}/teams`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors"
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>View Registered Teams ({registeredCount})</span>
                        </Link>

                        {/* Inline Quick Inspect Toggle */}
                        <button
                          onClick={() => setExpandedTourneyTeamsId(isExpanded ? null : t._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
                        >
                          <span>{isExpanded ? "Hide Inline Teams ▲" : "Quick Inspect Roster ▼"}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setCredentialForm({
                              tournamentId: t._id,
                              roomId: t.matchRoomCredentials?.roomId || "",
                              roomPassword: t.matchRoomCredentials?.roomPassword || "",
                              youtubeStreamUrl: t.youtubeStreamUrl || t.streamUrl || "",
                            });
                            setActiveTab("room_credentials");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-colors"
                        >
                          <Key className="h-3 w-3" />
                          <span>Room ID &amp; Pass</span>
                        </button>

                        <button
                          onClick={() => {
                            setCredentialForm({
                              tournamentId: t._id,
                              roomId: t.matchRoomCredentials?.roomId || "",
                              roomPassword: t.matchRoomCredentials?.roomPassword || "",
                              youtubeStreamUrl: t.youtubeStreamUrl || t.streamUrl || "",
                            });
                            setActiveTab("room_credentials");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-colors"
                        >
                          <YoutubeIcon className="h-3.5 w-3.5 fill-red-600" />
                          <span>{t.youtubeStreamUrl || t.streamUrl ? "Stream Link ✓" : "Set Stream Link"}</span>
                        </button>

                        <Link
                          href={`/tournaments/${t._id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-colors"
                        >
                          <span>Public Fixture</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Inline Teams Display (when toggled) - REAL DATA ONLY, NO DUMMY DATA */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-100/50 border-t border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono font-bold uppercase text-slate-700 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Real Registered Teams for "{t.title}"</span>
                          </h4>
                          <Link
                            href={`/organizer/tournaments/${t._id}/teams`}
                            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <span>Open Dedicated Page</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>

                        {realTeams.length === 0 ? (
                          <div className="p-5 bg-white rounded-xl border border-dashed border-slate-200 text-center space-y-2">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-400 mx-auto">
                              <Users className="h-4 w-4" />
                            </div>
                            <p className="text-xs font-mono font-semibold text-slate-800">
                              0 Real Teams Registered Yet
                            </p>
                            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                              No dummy data is shown. When real squads register for this tournament, their team details, UIDs, and captain info will appear right here.
                            </p>
                            <div className="pt-1">
                              <Link
                                href={`/tournaments/${t._id}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline"
                              >
                                <span>Go to registration fixture page to test registering a real team →</span>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {realTeams.map((team, idx) => (
                              <div
                                key={team.id || team._id || idx}
                                className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-emerald-700">
                                      #{idx + 1}
                                    </span>
                                    <strong className="text-xs text-slate-900 font-bold">
                                      {team.teamName}
                                    </strong>
                                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                                      Token: {team.squadToken}
                                    </span>
                                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                                      team.paymentStatus === "completed"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-slate-100 text-slate-700"
                                    }`}>
                                      {team.paymentStatus === "completed" ? "Paid" : team.paymentStatus}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono mt-1 flex flex-wrap items-center gap-3">
                                    <span>Captain: <strong className="text-slate-800">{team.captainName}</strong> (UID: {team.captainGameId})</span>
                                    {team.captainPhone && <span>Phone: {team.captainPhone}</span>}
                                    <span>Roster: {team.members?.length || 1}/{team.maxMembers}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleCopyTeamRoster(team)}
                                    className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-100"
                                  >
                                    Copy Roster
                                  </button>
                                  {team.captainPhone && (
                                    <a
                                      href={`https://wa.me/${team.captainPhone.replace(/\D/g, "")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold hover:bg-emerald-100 flex items-center gap-1"
                                    >
                                      <MessageCircle className="h-3 w-3 text-emerald-600" />
                                      <span>WA</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PREVIOUS MATCH RESULTS */}
      {activeTab === "previous_results" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Historical Match Results Archive</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review verified team standings, placement ranks, eliminations, and screenshot evidence.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("add_result")}
              className="px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record New Result</span>
            </button>
          </div>

          {resultsArchive.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Match Results Logged Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                When you or your tournament arbiters submit placement ranks and kill feeds, they will appear in this audited ledger.
              </p>
              <button
                onClick={() => setActiveTab("add_result")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Submit First Result →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Tournament Title</th>
                    <th className="py-3 px-4">Squad / Team</th>
                    <th className="py-3 px-4 text-center">Placement</th>
                    <th className="py-3 px-4 text-center">Kills</th>
                    <th className="py-3 px-4 text-center">Score Pts</th>
                    <th className="py-3 px-4 text-center">Proof Screenshot</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultsArchive.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {r.tournamentTitle}
                        <span className="block text-[10px] font-mono text-slate-400 font-normal">{r.date}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{r.teamName}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] ${
                          r.placement === 1 ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-slate-100 text-slate-700"
                        }`}>
                          #{r.placement}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-rose-600">{r.eliminations} Kills</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">{r.points} Pts</td>
                      <td className="py-3 px-4 text-center">
                        <a
                          href={r.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 underline font-mono"
                        >
                          <Eye className="h-3 w-3" /> View Proof
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          <Check className="h-3 w-3 text-emerald-600" /> Audit Approved
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PAYOUTS & SCHEDULE */}
      {activeTab === "payouts_schedule" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Active &amp; Upcoming Tournament Schedule
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time slots filled and room credential readiness status.
                </p>
              </div>
            </div>

            {tournaments.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Calendar className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">No Tournaments Scheduled</h4>
                <p className="text-[11px] text-slate-500">Create your first public or private event to begin registration.</p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Tournament
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Event Title</th>
                      <th className="py-3 px-4">Game &amp; Visibility</th>
                      <th className="py-3 px-4 text-center">Format</th>
                      <th className="py-3 px-4 text-center">Slots</th>
                      <th className="py-3 px-4 text-center">Ticket Gross</th>
                      <th className="py-3 px-4 text-center">Room Credentials</th>
                      <th className="py-3 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tournaments.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {t.title}
                          <span className="block text-[10px] font-mono text-slate-500 font-normal">
                            {t.tournamentDate ? new Date(t.tournamentDate).toLocaleDateString("en-IN") : "Today"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {t.game}
                          </span>
                          {t.visibility === "private" ? (
                            <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-purple-100 text-purple-800 font-bold">
                              Private
                            </span>
                          ) : (
                            <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-100 text-slate-600">
                              Public
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono uppercase text-slate-600">{t.format}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium">
                          {t.registeredSlots}/{t.maxSlots}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-amber-700 font-bold">
                          ₹{(t.registeredSlots * t.entryFee).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {t.matchRoomCredentials?.roomId ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 font-medium">
                              <Key className="h-3 w-3 text-emerald-600" />
                              {t.matchRoomCredentials.roomId}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-rose-500 font-medium">
                              Not Set Yet
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setCredentialForm({
                                tournamentId: t._id,
                                roomId: t.matchRoomCredentials?.roomId || "",
                                roomPassword: t.matchRoomCredentials?.roomPassword || "",
                                youtubeStreamUrl: t.youtubeStreamUrl || t.streamUrl || "",
                              });
                              setActiveTab("room_credentials");
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium transition-colors"
                          >
                            Set Room ID →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Settlement History &amp; UPI Dispatches
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Platform disbursements wired to organizer bank UPI ID ({profile.upiId || "Pending Setup"}).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-slate-500">Gross Ticket Collection</span>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  ₹{ticketGrossVolume.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-slate-500">Platform Retainer (10%)</span>
                <div className="text-lg font-bold font-mono text-rose-600 mt-0.5">
                  - ₹{platformFee.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-mono uppercase text-emerald-800">Net Organizer Entitlement</span>
                <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                  ₹{netEarnings.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEFAULT COMMISSION & CALCULATOR */}
      {activeTab === "commission" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Platform Commission Agreement</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Super-admin assigned rate, revenue breakdown policy, and interactive tournament earnings calculator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rate Overview Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-emerald-800">Current Rate Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold font-mono">
                  ACTIVE
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono text-slate-900">{profile.commissionRate}%</span>
                <span className="text-xs text-slate-600 font-medium">Standard Ecosystem Cut</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                As a verified tournament partner, you retain <strong className="text-emerald-700 font-bold">{100 - profile.commissionRate}% of gross ticket sales</strong>. The platform cut covers:
              </p>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Escrow banking and 0% payment gateway processing fees</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Automated WhatsApp &amp; push notification SMS dispatches</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>24/7 arbitrator dispute resolution and anti-cheat compliance</span>
                </li>
              </ul>
            </div>

            {/* Interactive Calculator */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 uppercase">
                <Calculator className="h-4 w-4 text-emerald-600" />
                <span>Live Tournament Earnings Simulator</span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span>Entry Fee per Squad:</span>
                  <span className="font-bold font-mono">₹{calcFee}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={calcFee}
                  onChange={(e) => setCalcFee(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span>Registered Squads:</span>
                  <span className="font-bold font-mono">{calcSlots} Squads</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={calcSlots}
                  onChange={(e) => setCalcSlots(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Ticket Volume:</span>
                  <span className="font-semibold text-slate-900">₹{(calcFee * calcSlots).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Platform Fee ({profile.commissionRate}%):</span>
                  <span>- ₹{Math.round(((calcFee * calcSlots) * profile.commissionRate) / 100).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-700 pt-1 border-t border-slate-200">
                  <span>Your Net Payout:</span>
                  <span>₹{((calcFee * calcSlots) - Math.round(((calcFee * calcSlots) * profile.commissionRate) / 100)).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ADD RESULT OF MATCH */}
      {activeTab === "add_result" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Submit Match Result</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter official placement ranks, total kills, and proof screenshot URL to finalize scores.
            </p>
          </div>

          {tournaments.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-xs text-slate-600">You must create a tournament first before submitting results.</p>
              <button
                onClick={() => setActiveTab("create")}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Create Tournament Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitResult} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Tournament *
                </label>
                <select
                  value={resultForm.tournamentId}
                  onChange={(e) => setResultForm({ ...resultForm, tournamentId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  {tournaments.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title} ({t.game.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Winning Squad / Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Soul Gaming / Team Total"
                    value={resultForm.teamName}
                    onChange={(e) => setResultForm({ ...resultForm, teamName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Rank Placement *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    required
                    value={resultForm.placement}
                    onChange={(e) => setResultForm({ ...resultForm, placement: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Eliminations (Kills) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={resultForm.eliminations}
                    onChange={(e) => setResultForm({ ...resultForm, eliminations: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* End Game Screenshot Evidence: Upload or URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    End Game Screenshot Evidence *
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => setEvidenceUploadMode("upload")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                        evidenceUploadMode === "upload"
                          ? "bg-white text-emerald-700 shadow-xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Upload className="h-3 w-3" />
                      <span>Upload Screenshot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEvidenceUploadMode("url")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                        evidenceUploadMode === "url"
                          ? "bg-white text-emerald-700 shadow-xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <LinkIcon className="h-3 w-3" />
                      <span>Screenshot URL</span>
                    </button>
                  </div>
                </div>

                {evidenceUploadMode === "upload" ? (
                  <ImageDropzone
                    value={resultForm.evidenceUrl}
                    onChange={(url) => setResultForm({ ...resultForm, evidenceUrl: url })}
                    aspectRatio="video"
                    label=""
                    hint="Upload end-game leaderboard screenshot, drag & drop, or paste (Ctrl+V)"
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={resultForm.evidenceUrl}
                      onChange={(e) => setResultForm({ ...resultForm, evidenceUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                    />
                    {resultForm.evidenceUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 max-h-40 flex items-center justify-center">
                        <img
                          src={resultForm.evidenceUrl}
                          alt="Screenshot Evidence Preview"
                          className="max-h-40 w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Arbitrator Notes
                </label>
                <textarea
                  rows={2}
                  value={resultForm.notes}
                  onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
              >
                <FileCheck className="h-4 w-4" />
                <span>Submit &amp; Certify Result</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 6: ADD ROOM ID AND PASSWORD */}
      {activeTab === "room_credentials" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Match Lobby Credentials Dispatch</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely set the in-game Room ID &amp; Password. Automated countdown reveals them to players 10 minutes prior to match.
            </p>
          </div>

          {tournaments.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-xs text-slate-600">Please host a tournament event before adding room credentials.</p>
              <button
                onClick={() => setActiveTab("create")}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Create Tournament
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateCredentials} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Active Tournament *
                </label>
                <select
                  value={credentialForm.tournamentId}
                  onChange={(e) => {
                    const selTour = tournaments.find((t) => t._id === e.target.value);
                    setCredentialForm({
                      tournamentId: e.target.value,
                      roomId: selTour?.matchRoomCredentials?.roomId || "",
                      roomPassword: selTour?.matchRoomCredentials?.roomPassword || "",
                      youtubeStreamUrl: selTour?.youtubeStreamUrl || selTour?.streamUrl || "",
                    });
                  }}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  {tournaments.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title} ({t.game.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Custom In-Game Room ID <span className="text-slate-400 font-normal">(Optional if setting stream)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5928192"
                    value={credentialForm.roomId}
                    onChange={(e) => setCredentialForm({ ...credentialForm, roomId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Room Password <span className="text-slate-400 font-normal">(Optional if setting stream)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. playarena77"
                    value={credentialForm.roomPassword}
                    onChange={(e) => setCredentialForm({ ...credentialForm, roomPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-[11px] text-emerald-900 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span><strong>Automated T-10m Release:</strong> You can publish credentials anytime. They will remain securely locked and will automatically unlock for registered players exactly 10 minutes before kickoff.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <YoutubeIcon className="h-3.5 w-3.5 fill-red-600" />
                    <span>Official Live Stream Link (YouTube / Twitch / Kick)</span>
                  </span>
                  {credentialForm.youtubeStreamUrl && (
                    <a
                      href={normalizeStreamUrl(credentialForm.youtubeStreamUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <span>Test Stream Link ↗</span>
                    </a>
                  )}
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={credentialForm.youtubeStreamUrl || ""}
                  onChange={(e) => setCredentialForm({ ...credentialForm, youtubeStreamUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Caster or observer live stream link displayed prominently on tournament page and spectator feeds with an instant redirect button.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Automated Security Rule:</strong> Room credentials remain encrypted on the server until exactly <strong>10 minutes before the scheduled match start</strong>. The live stream link is published immediately so fans and players can watch caster coverage.
                </p>
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Key className="h-4 w-4 text-emerald-400" />
                <span>
                  {credentialForm.roomId && credentialForm.roomPassword && credentialForm.youtubeStreamUrl
                    ? "Save Credentials & Live Stream Link"
                    : credentialForm.youtubeStreamUrl
                    ? "Save & Activate Stream Link"
                    : "Save & Schedule Room Credentials"}
                </span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 7: EDIT PROFILE & UPI ID */}
      {activeTab === "profile_upi" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Organizer Profile &amp; Payout Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your organization identity and verified settlement UPI ID for automated prize &amp; ticket disbursements.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Organization / Brand Name *
              </label>
              <input
                type="text"
                required
                value={profileForm.orgName}
                onChange={(e) => setProfileForm({ ...profileForm, orgName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.contactEmail}
                  onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  WhatsApp Contact Phone *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.contactPhone}
                  onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payout Settlement UPI ID (GPay / PhonePe / Paytm / BHIM) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. nova.esports@okhdfcbank"
                value={profileForm.upiId}
                onChange={(e) => setProfileForm({ ...profileForm, upiId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono font-bold text-emerald-800"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Platform ticket revenues are automatically credited to this VPA address.
              </span>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>Save Profile &amp; UPI ID</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
