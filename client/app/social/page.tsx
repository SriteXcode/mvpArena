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
  Inbox
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
  const [candidateGameId, setCandidateGameId] = useState("");
  const [candidateIgn, setCandidateIgn] = useState("");
  const [candidateRole, setCandidateRole] = useState<"assaulter" | "sniper" | "support" | "substitute">("assaulter");
  const [recruiting, setRecruiting] = useState(false);

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

  // Handle Recruit Teammate
  const handleRecruitTeammate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateGameId.trim()) {
      toast.warning("Please enter candidate's 10-digit Character UID.", "Missing UID");
      return;
    }

    setRecruiting(true);
    try {
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: candidateGameId.trim(),
          inGameName: candidateIgn.trim(),
          role: candidateRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, "Roster Updated!");
        setMyTeam(data.data);
        setCandidateGameId("");
        setCandidateIgn("");
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-sky-200 bg-sky-50 text-xs font-mono text-sky-800 mb-3 shadow-xs">
          <Users className="h-3.5 w-3.5 text-sky-600" />
          <span>INSTITUTIONAL ESPORTS ROSTER HUB</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Squad Management &amp; Tactical Lineups
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Form permanent esports rosters, assign tactical roles (IGL, Assaulter, Sniper), and unlock 1-click tournament squad autofill.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 text-xs">
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
          <span>Recruit Athlete by UID</span>
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
                  {myTeam.members?.map((m: any, idx: number) => (
                    <div
                      key={m.gameId || idx}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center font-mono font-bold text-slate-700 text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{m.inGameName}</span>
                            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border font-bold ${getRoleBadge(m.role)}`}>
                              {m.role}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded inline-block mt-0.5 border border-emerald-200">
                            UID: <span className="font-bold">{m.gameId}</span>
                          </div>
                        </div>
                      </div>

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
                  ))}
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

      {/* ================= TAB 2: RECRUIT ATHLETE BY UID ================= */}
      {activeTab === "recruit" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 max-w-xl mx-auto">
          <div className="text-center space-y-1">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center mx-auto mb-2">
              <UserPlus className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-mono">Recruit Teammate to Lineup</h3>
            <p className="text-xs text-slate-600">
              Enter candidate athlete&apos;s 10-digit character identifier and assign their tactical role.
            </p>
          </div>

          {!myTeam ? (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
              Please establish your squad first under &quot;My Active Squad&quot; before adding teammates.
            </div>
          ) : (
            <form onSubmit={handleRecruitTeammate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Athlete 10-Digit Character UID
                </label>
                <input
                  type="text"
                  required
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tactical Roster Role</label>
                <select
                  value={candidateRole}
                  onChange={(e) => setCandidateRole(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-600 shadow-xs"
                >
                  <option value="assaulter">Assaulter (Entry Fragger)</option>
                  <option value="sniper">Sniper / Marksman</option>
                  <option value="support">Support / Tactician</option>
                  <option value="substitute">Substitute Athlete</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={recruiting}
                className="w-full py-2.5 rounded-lg bg-sky-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-sky-500 transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {recruiting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Confirming Athlete...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Confirm Athlete to Lineup</span>
                  </>
                )}
              </button>
            </form>
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
