"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Send, 
  Loader2, 
  ShieldCheck, 
  Trophy, 
  Crosshair, 
  Crown, 
  Plus, 
  Trash2, 
  Edit3,
  Sparkles,
  Inbox,
  Search,
  Share2,
  Copy,
  Clock,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";

export default function SquadRostersPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"squad" | "recruit" | "directory">("squad");
  const [myTeam, setMyTeam] = useState<any>(null);
  const [loadingTeam, setLoadingTeam] = useState<boolean>(true);

  // Create Squad Form State
  const [squadName, setSquadName] = useState("");
  const [squadTag, setSquadTag] = useState("");
  const [squadGame, setSquadGame] = useState<"bgmi" | "freefire">("bgmi");
  const [captainGameId, setCaptainGameId] = useState("");
  const [creatingSquad, setCreatingSquad] = useState(false);

  // Recruit Teammate Form State
  const [recruitQuery, setRecruitQuery] = useState("");
  const [recruitSearchType, setRecruitSearchType] = useState<"all" | "username" | "gameId">("all");
  const [recruitSearching, setRecruitSearching] = useState(false);
  const [recruitSearchResult, setRecruitSearchResult] = useState<any>(null);
  const [candidateGameId, setCandidateGameId] = useState("");
  const [candidateUsername, setCandidateUsername] = useState("");
  const [candidateIgn, setCandidateIgn] = useState("");
  const [candidateRole, setCandidateRole] = useState<"assaulter" | "sniper" | "support" | "substitute">("assaulter");
  const [recruiting, setRecruiting] = useState(false);
  const [copiedSquadLink, setCopiedSquadLink] = useState(false);

  // Directory of Teams
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [directorySearch, setDirectorySearch] = useState("");

  // Fetch My Active Team
  const fetchMyTeam = () => {
    setLoadingTeam(true);
    fetch("/api/teams/my-team")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setMyTeam(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTeam(false));
  };

  useEffect(() => {
    fetchMyTeam();
  }, [user]);

  // Fetch Directory of Teams
  useEffect(() => {
    if (activeTab === "directory") {
      setLoadingDirectory(true);
      fetch("/api/teams")
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            setAllTeams(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingDirectory(false));
    }
  }, [activeTab]);

  // Handle Create Squad
  const handleCreateSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadName.trim() || !squadTag.trim()) {
      toast.warning("Please provide both Squad Name and Tactical Tag.", "Required Fields");
      return;
    }

    setCreatingSquad(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: squadName.trim(),
          tag: squadTag.trim().toUpperCase(),
          game: squadGame,
          captainGameId: captainGameId.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, "Squad Established!");
        setMyTeam(data.data);
        setSquadName("");
        setSquadTag("");
      } else {
        toast.error(data.error || "Could not establish squad.", "Creation Failed");
      }
    } catch {
      toast.error("Network error while creating squad.", "Error");
    } finally {
      setCreatingSquad(false);
    }
  };

  const handleSearchTeammateSocial = async () => {
    if (!recruitQuery.trim()) return;
    setRecruitSearching(true);
    setRecruitSearchResult(null);

    try {
      const res = await fetch("/api/teams/search-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: recruitQuery.trim(),
          searchType: recruitSearchType,
          game: myTeam?.game || "bgmi",
        }),
      });
      const data = await res.json();
      setRecruitSearchResult(data);
      if (data.found && data.user) {
        setCandidateGameId(data.user.gameId !== "N/A" ? data.user.gameId : "");
        setCandidateUsername(data.user.username || "");
        setCandidateIgn(data.user.inGameName || "");
      }
    } catch {
      setRecruitSearchResult({
        success: true,
        found: false,
        searchQuery: recruitQuery.trim(),
        message: `Athlete "${recruitQuery.trim()}" not registered on PlayArena yet.`,
      });
    } finally {
      setRecruitSearching(false);
    }
  };

  const squadInviteUrl = typeof window !== "undefined" && myTeam
    ? `${window.location.origin}/join?token=${encodeURIComponent(myTeam.tag)}&team=${encodeURIComponent(myTeam.name)}`
    : `https://playarena.gg/join?token=${myTeam?.tag || "SQUAD"}`;

  const handleCopySquadInviteUrl = (friendIdentifier?: string) => {
    const url = `${squadInviteUrl}${friendIdentifier ? `&friend=${encodeURIComponent(friendIdentifier)}` : ""}`;
    navigator.clipboard.writeText(url);
    setCopiedSquadLink(true);
    toast.success("Squad recruitment invite URL copied to clipboard!", "Link Copied");
    setTimeout(() => setCopiedSquadLink(false), 3000);
  };

  const handleShareWhatsAppSquad = (friendIdentifier?: string) => {
    const url = `${squadInviteUrl}${friendIdentifier ? `&friend=${encodeURIComponent(friendIdentifier)}` : ""}`;
    const text = encodeURIComponent(
      `🎮 You've been recruited to join esports squad "${myTeam?.name}" [${myTeam?.tag}] on PlayArena!\n\n` +
      `🏆 Game: ${myTeam?.game?.toUpperCase() || "BGMI"}\n` +
      `🔑 Squad Tag: *${myTeam?.tag}*\n\n` +
      `Claim your squad slot here:\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleReserveWaitingSlot = async (identifier: string) => {
    if (!myTeam) return;
    setRecruiting(true);
    const isDigits = /^\d+$/.test(identifier.trim().replace(/^@/, ""));
    const cleanId = identifier.trim().replace(/^@/, "");

    try {
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: isDigits ? cleanId : `PENDING_${cleanId}`,
          username: !isDigits ? cleanId : undefined,
          inGameName: isDigits ? `UID: ${cleanId}` : `@${cleanId}`,
          role: candidateRole,
          status: "waiting_for_login",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.info(`Slot reserved for "${identifier}". Share your squad link so they can log in & join!`, "Slot Reserved");
        setMyTeam(data.data);
        setRecruitQuery("");
        setRecruitSearchResult(null);
        setActiveTab("squad");
      } else {
        toast.error(data.error || "Could not reserve slot.", "Action Failed");
      }
    } catch {
      toast.error("Network error reserving slot.", "Error");
    } finally {
      setRecruiting(false);
    }
  };

  // Handle Recruit Teammate
  const handleRecruitTeammate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateGameId.trim() && !candidateUsername.trim() && !recruitQuery.trim()) {
      toast.warning("Please provide candidate's @username or Character UID.", "Missing Identifier");
      return;
    }

    setRecruiting(true);
    try {
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: candidateGameId.trim(),
          username: candidateUsername.trim() || (!candidateGameId.trim() ? recruitQuery.trim().replace(/^@/, "") : undefined),
          inGameName: candidateIgn.trim(),
          role: candidateRole,
          status: "active",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, "Roster Updated!");
        setMyTeam(data.data);
        setCandidateGameId("");
        setCandidateUsername("");
        setCandidateIgn("");
        setRecruitQuery("");
        setRecruitSearchResult(null);
        setActiveTab("squad");
      } else {
        toast.error(data.error || "Could not recruit athlete.", "Recruitment Error");
      }
    } catch {
      toast.error("Network error adding athlete to roster.", "Error");
    } finally {
      setRecruiting(false);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (gameId: string) => {
    if (!confirm(`Are you sure you want to remove athlete with UID ${gameId} from your squad?`)) return;

    try {
      const res = await fetch(`/api/teams/invite?gameId=${encodeURIComponent(gameId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Athlete removed from squad roster.", "Roster Updated");
        setMyTeam(data.data);
      } else {
        toast.error(data.error || "Could not remove member.", "Action Failed");
      }
    } catch {
      toast.error("Network error removing member.", "Error");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case "igl":
      case "captain":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "sniper":
        return "bg-sky-100 text-sky-900 border-sky-300";
      case "assaulter":
        return "bg-rose-100 text-rose-900 border-rose-300";
      case "support":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-xs font-mono text-emerald-800 mb-3 shadow-xs">
          <Users className="h-3.5 w-3.5 text-emerald-600" />
          <span>MY SQUAD &amp; TACTICAL LINEUP</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          My Squad Management
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Form permanent esports squads, assign tactical roles (IGL, Assaulter, Sniper), and unlock 1-click tournament squad autofill.
        </p>
      </div>

      {/* Symmetrical Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 pb-3 text-xs">
        <button
          onClick={() => setActiveTab("squad")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "squad"
              ? "bg-white text-slate-900 border border-slate-300 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>My Active Squad</span>
          {myTeam && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono">
              {myTeam.members?.length || 1}/6
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("recruit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "recruit"
              ? "bg-white text-slate-900 border border-slate-300 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5 text-sky-600" />
          <span>Recruit Teammate (Username / UID)</span>
        </button>

        <button
          onClick={() => setActiveTab("directory")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "directory"
              ? "bg-white text-slate-900 border border-slate-300 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Trophy className="h-3.5 w-3.5 text-amber-600" />
          <span>Squads Directory</span>
        </button>
      </div>

      {/* ================= TAB 1: MY ACTIVE SQUAD ================= */}
      {activeTab === "squad" && (
        <div className="space-y-6">
          {loadingTeam ? (
            <div className="p-12 text-center text-xs text-slate-500 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400 mb-2" />
              Loading your squad roster...
            </div>
          ) : myTeam ? (
            /* Squad Display Card */
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              {/* Squad Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <img
                    src={myTeam.logoUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200"}
                    alt={myTeam.name}
                    className="h-16 w-16 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{myTeam.name}</h2>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        [{myTeam.tag}]
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                        {myTeam.game?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{myTeam.bio}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-mono">
                      <span>Captain: <strong className="text-slate-800 font-semibold">{myTeam.captain?.name || "You"}</strong></span>
                      <span>•</span>
                      <span>Lineup: <strong>{myTeam.members?.length || 1} / 6 Athletes</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("recruit")}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Teammate</span>
                </button>
              </div>

              {/* Roster Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-3 flex items-center gap-1.5">
                  <Crosshair className="h-3.5 w-3.5 text-slate-600" />
                  Active Lineup &amp; Tactical Roles
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {myTeam.members?.map((m: { gameId: string; inGameName: string; role: string; status?: string }, idx: number) => {
                    const isWaiting = m.status === "waiting_for_login" || m.status === "invited_pending";
                    return (
                      <div
                        key={m.gameId || idx}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                          isWaiting
                            ? "border-amber-200 bg-amber-50/50"
                            : "border-slate-200 bg-slate-50/60 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`relative h-10 w-10 rounded-lg overflow-hidden border flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                              isWaiting
                                ? "border-amber-300 bg-amber-100 text-amber-900"
                                : "border-slate-300 bg-white text-slate-700"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 truncate">{m.inGameName}</span>
                              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border font-bold ${getRoleBadge(m.role)}`}>
                                {m.role}
                              </span>
                              {isWaiting && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                  Waiting for Login
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded inline-block mt-0.5 border border-emerald-200 truncate">
                              {isWaiting ? "Slot Reserved • Pending Signup" : `UID: ${m.gameId}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isWaiting && (
                            <button
                              onClick={() => handleCopySquadInviteUrl(m.gameId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Copy Invite Link"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {/* Remove button if not captain */}
                          {m.role !== "captain" && (
                            <button
                              onClick={() => handleRemoveMember(m.gameId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove from squad"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 1-Click Tournament Autofill Notice */}
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>1-Click Tournament Ready:</strong> This squad will automatically appear in your Tournament Registration modal for instant roster autofill.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* No Squad -> Found Squad Form */
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                  <Crown className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-mono">Found Your Esports Squad</h3>
                <p className="text-xs text-slate-600">
                  You are not currently leading a competitive squad. Create your official team profile to register together and track team standings.
                </p>
              </div>

              <form onSubmit={handleCreateSquad} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Squad Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SoulFire Esports"
                    value={squadName}
                    onChange={(e) => setSquadName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tactical Tag (3-5 Letters)</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. SOUL"
                      value={squadTag}
                      onChange={(e) => setSquadTag(e.target.value.toUpperCase())}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Primary Game</label>
                    <select
                      value={squadGame}
                      onChange={(e) => setSquadGame(e.target.value as "bgmi" | "freefire")}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                    >
                      <option value="bgmi">BGMI (Battlegrounds)</option>
                      <option value="freefire">Free Fire MAX</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Your Character UID (Captain)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5129847291 (10-digit UID)"
                    value={captainGameId}
                    onChange={(e) => setCaptainGameId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingSquad}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {creatingSquad ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Founding Squad...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="h-3.5 w-3.5" />
                      <span>Establish Competitive Squad</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: RECRUIT ATHLETE BY USERNAME OR UID ================= */}
      {activeTab === "recruit" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 max-w-xl mx-auto">
          <div className="text-center space-y-1">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center mx-auto mb-2">
              <UserPlus className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-mono">Recruit Teammate to Lineup</h3>
            <p className="text-xs text-slate-600">
              Search candidate athlete by their PlayArena website @username or Character UID and assign their tactical role.
            </p>
          </div>

          {!myTeam ? (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
              Please establish your squad first under &quot;My Active Squad&quot; before adding teammates.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search By Filter Pills */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">Search By:</span>
                  <button
                    type="button"
                    onClick={() => setRecruitSearchType("all")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      recruitSearchType === "all"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecruitSearchType("username")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      recruitSearchType === "username"
                        ? "bg-sky-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    @ Username
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecruitSearchType("gameId")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      recruitSearchType === "gameId"
                        ? "bg-sky-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Character UID
                  </button>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={recruitQuery}
                      onChange={(e) => setRecruitQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchTeammateSocial()}
                      placeholder={
                        recruitSearchType === "username"
                          ? "Enter PlayArena @username (e.g. @soul_mortal)..."
                          : recruitSearchType === "gameId"
                          ? "Enter 10-digit Character UID (e.g. 5129847291)..."
                          : "Search by @username or Character UID..."
                      }
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchTeammateSocial}
                    disabled={recruitSearching || !recruitQuery.trim()}
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs font-mono transition-all shrink-0 cursor-pointer shadow-xs"
                  >
                    {recruitSearching ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>

              {/* Search Result Card */}
              {recruitSearchResult && (
                <div className="rounded-xl transition-all animate-in fade-in">
                  {recruitSearchResult.found ? (
                    <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={recruitSearchResult.user.avatarUrl}
                          alt={recruitSearchResult.user.name}
                          className="h-11 w-11 rounded-full object-cover border border-sky-300 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-slate-900">{recruitSearchResult.user.name}</span>
                            <span className="text-xs font-mono font-semibold text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded">
                              @{recruitSearchResult.user.username}
                            </span>
                            {recruitSearchResult.user.verified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.2 rounded-full font-bold">
                                <ShieldCheck className="h-3 w-3 text-cyan-600" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-slate-600 mt-0.5">
                            IGN: <strong className="text-slate-900">{recruitSearchResult.user.inGameName}</strong>
                            {recruitSearchResult.user.gameId !== "N/A" && (
                              <span className="text-slate-400 ml-1.5">(UID: {recruitSearchResult.user.gameId})</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-sky-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-slate-700 shrink-0">Tactical Role:</label>
                          <select
                            value={candidateRole}
                            onChange={(e) => setCandidateRole(e.target.value as any)}
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-sky-600 shadow-2xs"
                          >
                            <option value="assaulter">Assaulter (Entry Fragger)</option>
                            <option value="sniper">Sniper / Marksman</option>
                            <option value="support">Support / Tactician</option>
                            <option value="substitute">Substitute Athlete</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleRecruitTeammate(e)}
                          disabled={recruiting}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {recruiting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                          <span>Recruit to Lineup</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3">
                      <div className="flex items-start gap-2.5 text-xs text-amber-900">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-sm font-bold text-amber-950 block">
                            Athlete &quot;{recruitSearchResult.searchQuery}&quot; is not registered on PlayArena yet.
                          </strong>
                          <p className="text-slate-600 mt-1 leading-relaxed">
                            Send a squad invite link to your friend! You can reserve their lineup slot right now while waiting for them to sign up &amp; log in.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/60">
                        <button
                          type="button"
                          onClick={() => handleCopySquadInviteUrl(recruitSearchResult.searchQuery)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Squad Invite Link</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareWhatsAppSquad(recruitSearchResult.searchQuery)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Share on WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReserveWaitingSlot(recruitSearchResult.searchQuery)}
                          disabled={recruiting}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer ml-auto shadow-xs disabled:opacity-50"
                        >
                          <Clock className="h-3.5 w-3.5 text-amber-400" />
                          <span>Reserve Slot (Waiting for Friend)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Direct Character UID Fallback form */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Or Direct Character UID Entry
                </span>
                <form onSubmit={handleRecruitTeammate} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Character UID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5129847291"
                        value={candidateGameId}
                        onChange={(e) => setCandidateGameId(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        In-Game Name (IGN) <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Soul_Viper"
                        value={candidateIgn}
                        onChange={(e) => setCandidateIgn(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <label className="font-semibold text-slate-700 shrink-0">Tactical Role:</label>
                      <select
                        value={candidateRole}
                        onChange={(e) => setCandidateRole(e.target.value as any)}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-900 focus:outline-none focus:border-sky-600 shadow-xs"
                      >
                        <option value="assaulter">Assaulter (Entry Fragger)</option>
                        <option value="sniper">Sniper / Marksman</option>
                        <option value="support">Support / Tactician</option>
                        <option value="substitute">Substitute Athlete</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={recruiting || (!candidateGameId.trim() && !candidateUsername.trim() && !recruitQuery.trim())}
                      className="py-2 px-4 rounded-lg bg-sky-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-sky-500 transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {recruiting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                      <span>Confirm Athlete</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: SQUADS DIRECTORY ================= */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Registered Esports Squads ({allTeams.length})
            </span>
          </div>

          {loadingDirectory ? (
            <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-white border border-slate-200 shadow-sm">
              Loading squads directory...
            </div>
          ) : allTeams.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Inbox className="h-6 w-6 mx-auto text-slate-400 mb-1" />
              No squads found in directory.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allTeams.map((team) => (
                <div
                  key={team._id}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                        <span>{team.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">[{team.tag}]</span>
                      </div>
                      <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200 font-semibold">
                        {team.game?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                    <span>Lineup: <strong>{team.members?.length || 1} Athletes</strong></span>
                    <span>Captain: <strong className="text-slate-800">{team.captain?.name || "Verified"}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
