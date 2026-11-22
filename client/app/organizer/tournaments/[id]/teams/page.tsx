"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Trophy, 
  Users, 
  ArrowLeft, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  Calendar, 
  Gamepad2, 
  MessageCircle, 
  Phone, 
  Mail, 
  Crown, 
  Download, 
  RefreshCw, 
  Key, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";
import { formatINR } from "@/lib/utils";
import TeamsRosterSkeleton from "@/components/skeletons/TeamsRosterSkeleton";

interface SquadMember {
  gameId: string;
  inGameName: string;
  role: "captain" | "member" | "substitute";
  status: "confirmed" | "invited_pending";
  joinedAt?: string;
}

interface TeamRegistration {
  _id?: string;
  id?: string;
  tournament: string | any;
  teamName: string;
  format: "solo" | "duo" | "squad";
  captain?: {
    name?: string;
    email?: string;
    phone?: string;
    whatsappNumber?: string;
  };
  captainName?: string;
  captainGameId?: string;
  captainPhone?: string;
  captainEmail?: string;
  squadToken: string;
  members: SquadMember[];
  maxMembers: number;
  isEarlyLocked: boolean;
  paymentStatus: "completed" | "free" | "pending";
  paymentId?: string;
  credentialsDelivered?: boolean;
  createdAt: string;
}

export default function TournamentTeamsDetailPage() {
  const toast = useToast();
  const router = useRouter();
  const params = useParams();
  const tournamentId = (params?.id as string) || "";

  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "free" | "pending">("all");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedRosterId, setCopiedRosterId] = useState<string | null>(null);

  const fetchTournamentAndTeams = async () => {
    setLoading(true);
    try {
      // 1. Fetch tournament details
      const tourRes = await fetch(`/api/tournaments/${tournamentId}`);
      const tourData = await tourRes.json();
      if (tourData.success && tourData.data) {
        setTournament(tourData.data);
      }

      // 2. Fetch real registrations for this tournament
      const regRes = await fetch(`/api/organizer/registrations?tournamentId=${tournamentId}`);
      const regData = await regRes.json();
      if (regData.success && Array.isArray(regData.data)) {
        const mapped: TeamRegistration[] = regData.data.map((r: any) => ({
          _id: r._id,
          id: r._id,
          tournament: r.tournament,
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
        setTeams(mapped);
      } else {
        setTeams([]);
      }
    } catch {
      toast.error("Could not fetch tournament fixture data.", "Data Notice");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      fetchTournamentAndTeams();
    }
  }, [tournamentId]);

  const handleCopySquadToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    toast.success(`Squad Token "${token}" copied!`, "Token Copied");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleCopyTeamRoster = (team: TeamRegistration) => {
    const lines = [
      `TEAM: ${team.teamName} [${team.format.toUpperCase()} | Token: ${team.squadToken}]`,
      `Captain: ${team.captainName} (UID: ${team.captainGameId})${team.captainPhone ? ` | WA: ${team.captainPhone}` : ""}`,
      `Roster Members:`,
      ...team.members.map((m, i) => `  Slot #${i + 1}: [${m.role.toUpperCase()}] ${m.inGameName} (UID: ${m.gameId}) - ${m.status}`),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    const key = team.id || team._id || team.squadToken;
    setCopiedRosterId(key);
    toast.success(`Roster for "${team.teamName}" copied!`, "Roster Copied");
    setTimeout(() => setCopiedRosterId(null), 2000);
  };

  const handleExportAllRosters = () => {
    if (filteredTeams.length === 0) {
      toast.warning("No teams currently match your filter.", "No Teams");
      return;
    }
    const fullSheet = [
      `=== OFFICIAL TOURNAMENT ROSTER SHEET ===`,
      `Tournament: ${tournament?.title || "Match Fixture"}`,
      `Game: ${(tournament?.game || "esports").toUpperCase()} | Format: ${(tournament?.format || "squad").toUpperCase()}`,
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      `Total Confirmed Teams: ${filteredTeams.length}`,
      ``,
      ...filteredTeams.map((t, idx) => {
        return [
          `SLOT #${idx + 1}: ${t.teamName.toUpperCase()} [Token: ${t.squadToken} | Payment: ${t.paymentStatus.toUpperCase()}]`,
          `Captain: ${t.captainName} (UID: ${t.captainGameId}) ${t.captainPhone ? `| WA: ${t.captainPhone}` : ""}`,
          `Members (${t.members.length}/${t.maxMembers}):`,
          ...t.members.map((m, mi) => `   ${mi + 1}. ${m.inGameName} [UID: ${m.gameId}] (${m.role})`),
          `------------------------------------------------`,
        ].join("\n");
      }),
    ].join("\n");

    navigator.clipboard.writeText(fullSheet);
    toast.success(`Exported complete sheet of ${filteredTeams.length} teams to clipboard!`, "Roster Sheet Exported");
  };

  const filteredTeams = teams.filter((t) => {
    if (statusFilter !== "all" && t.paymentStatus !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTeam = t.teamName.toLowerCase().includes(q);
      const matchToken = t.squadToken.toLowerCase().includes(q);
      const matchCaptain = (t.captainName || "").toLowerCase().includes(q);
      const matchUID = (t.captainGameId || "").toLowerCase().includes(q);
      const matchMember = t.members.some(
        (m) => m.inGameName.toLowerCase().includes(q) || m.gameId.toLowerCase().includes(q)
      );
      if (!matchTeam && !matchToken && !matchCaptain && !matchUID && !matchMember) {
        return false;
      }
    }
    return true;
  });

  const totalPlayersCount = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);
  const maxCapacitySlots = tournament?.maxSlots || 25;
  const registeredSlotsCount = tournament?.registeredSlots || teams.length;
  const slotFillPct = Math.min(100, Math.round((registeredSlotsCount / maxCapacitySlots) * 100));

  const isLive = tournament?.status === "live";
  const isConcluded = tournament?.status === "completed" || tournament?.status === "cancelled";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            href="/organizer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Organizer Command Center</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold uppercase shadow-2xs">
              {tournament?.game === "bgmi" ? "BGMI" : "FREE FIRE MAX"}
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-xs font-mono font-semibold text-slate-700 uppercase shadow-2xs">
              {tournament?.format || "squad"}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                isLive
                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                  : isConcluded
                  ? "bg-slate-100 text-slate-700 border border-slate-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {isLive ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  LIVE MATCH
                </>
              ) : isConcluded ? (
                "CONCLUDED"
              ) : (
                "UPCOMING"
              )}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {tournament?.title || "Tournament Fixture"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered Squads Roster &amp; Player Verification Ledger
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchTournamentAndTeams}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
            title="Refresh Teams List"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportAllRosters}
            disabled={filteredTeams.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Lobby Sheet</span>
          </button>

          <Link
            href={`/tournaments/${tournamentId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
          >
            <span>Public Fixture</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Registered Teams
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {teams.length} Teams
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">
            {teams.length} squads locked
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Total Enrolled Players
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1 font-mono">
            {totalPlayersCount} Players
          </div>
          <span className="text-[10px] text-slate-500">Verified Character UIDs</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Slot Capacity ({slotFillPct}%)
          </span>
          <div className="text-xl font-bold text-amber-600 mt-1 font-mono">
            {registeredSlotsCount}/{maxCapacitySlots}
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${slotFillPct}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Room Credentials
          </span>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono truncate">
            {tournament?.matchRoomCredentials?.roomId ? (
              <span className="text-emerald-700">Room: {tournament.matchRoomCredentials.roomId}</span>
            ) : (
              <span className="text-amber-600">Pending Setup</span>
            )}
          </div>
          <span className="text-[10px] text-slate-500">Auto-released 10m before kickoff</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Team Name, Captain, Player IGN, Character UID, or Squad Token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-xs placeholder:text-slate-400 focus:outline-emerald-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1 shrink-0">
            <Filter className="h-3.5 w-3.5" />
            Payment:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(["all", "completed", "free", "pending"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                  statusFilter === s
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s === "completed" ? "Paid" : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Teams Roster List */}
      {loading ? (
        <TeamsRosterSkeleton />
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200 space-y-4">
          <div className="h-14 w-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {searchQuery || statusFilter !== "all" ? "No Matching Squads Found" : "0 Teams Registered Yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              {searchQuery || statusFilter !== "all"
                ? "No registered squads match your active search filters. Try clearing your filters."
                : "This tournament fixture does not have any registered teams yet. Share the tournament registration link with players to begin filling team slots."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => {
                const url = typeof window !== "undefined" ? `${window.location.origin}/tournaments/${tournamentId}` : "";
                navigator.clipboard.writeText(url);
                toast.success("Tournament registration link copied!", "Link Copied");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Tournament Link</span>
            </button>

            <Link
              href={`/tournaments/${tournamentId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors"
            >
              <span>Register a Team</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeams.map((team, index) => {
            const teamKey = team.id || team._id || `team_${index}`;
            const totalMembers = team.members?.length || 0;
            const isFull = totalMembers >= team.maxMembers;
            const cleanPhone = (team.captainPhone || "").replace(/\D/g, "");

            return (
              <div
                key={teamKey}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-slate-300 transition-all"
              >
                {/* Team Card Header */}
                <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                      #{String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                          {team.teamName}
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono font-bold uppercase text-slate-700 shadow-2xs">
                          {team.format}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            team.paymentStatus === "completed"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : team.paymentStatus === "free"
                              ? "bg-cyan-50 text-cyan-800 border border-cyan-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {team.paymentStatus === "completed" ? "Paid Entry ✓" : team.paymentStatus === "free" ? "Free Entry" : "Payment Pending"}
                        </span>
                        {team.isEarlyLocked && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-mono font-semibold">
                            Slot Locked 🔒
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                        Registered on {new Date(team.createdAt).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Squad Token & Actions */}
                  <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-mono">Token:</span>
                      <span className="text-xs font-mono font-bold text-slate-900">{team.squadToken}</span>
                      <button
                        onClick={() => handleCopySquadToken(team.squadToken)}
                        className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Copy Squad Token"
                      >
                        {copiedToken === team.squadToken ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopyTeamRoster(team)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        copiedRosterId === teamKey
                          ? "bg-emerald-600 text-white"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                      title="Copy formatted roster text"
                    >
                      {copiedRosterId === teamKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedRosterId === teamKey ? "Copied" : "Copy Roster"}</span>
                    </button>

                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(`Hi ${team.captainName}, regarding your tournament registration for team "${team.teamName}" on PlayArena:`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                        title="Chat with Captain on WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Captain Strip & Members Grid */}
                <div className="p-4 space-y-4">
                  {/* Captain Details Strip */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <Crown className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-slate-400">Captain:</span>
                      <strong className="text-slate-900">{team.captainName}</strong>
                    </div>
                    {team.captainPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span className="font-mono text-slate-800">{team.captainPhone}</span>
                      </div>
                    )}
                    {team.captainEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-600">{team.captainEmail}</span>
                      </div>
                    )}
                    <div className="ml-auto text-[11px] font-mono text-slate-500">
                      Roster: <strong className={isFull ? "text-emerald-700" : "text-amber-700"}>{totalMembers}/{team.maxMembers}</strong> {isFull ? "Full" : "Open Slots"}
                    </div>
                  </div>

                  {/* Players Grid */}
                  <div>
                    <div className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center justify-between">
                      <span>Squad Roster ({totalMembers} Confirmed Players)</span>
                      <span className="text-[10px] font-normal text-slate-400">Mobile IDs verified</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {team.members.map((member, mIdx) => {
                        const isCaptain = member.role === "captain" || mIdx === 0;
                        return (
                          <div
                            key={mIdx}
                            className={`p-3 rounded-lg border transition-all ${
                              isCaptain
                                ? "bg-amber-50/40 border-amber-200"
                                : "bg-slate-50/60 border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                                  isCaptain
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-200/70 text-slate-700"
                                }`}
                              >
                                {isCaptain && <Crown className="h-2.5 w-2.5 text-amber-600" />}
                                <span>{isCaptain ? "Captain" : member.role || "Member"}</span>
                              </span>

                              <span
                                className={`text-[9px] font-mono font-bold uppercase px-1 py-0.2 rounded ${
                                  member.status === "confirmed"
                                    ? "text-emerald-700"
                                    : "text-amber-600"
                                }`}
                              >
                                {member.status === "confirmed" ? "Active ✓" : "Pending ⏳"}
                              </span>
                            </div>

                            <div className="font-bold text-xs text-slate-900 truncate">
                              {member.inGameName || "Player"}
                            </div>

                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60 text-[11px] font-mono text-slate-500">
                              <span className="truncate">UID: <strong className="text-slate-800">{member.gameId}</strong></span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(member.gameId);
                                  toast.success(`Copied UID ${member.gameId}`, "UID Copied");
                                }}
                                className="p-0.5 text-slate-400 hover:text-slate-700"
                                title="Copy Game UID"
                              >
                                <Copy className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Open unfilled slots */}
                      {Array.from({ length: Math.max(0, team.maxMembers - totalMembers) }).map((_, emptyIdx) => (
                        <div
                          key={`empty_${emptyIdx}`}
                          className="p-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/30 flex flex-col items-center justify-center text-center min-h-[75px]"
                        >
                          <span className="text-[10px] font-mono text-slate-400 block">
                            Slot #{totalMembers + emptyIdx + 1} Open
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            Teammate can join with Token
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
