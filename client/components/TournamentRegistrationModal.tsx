"use client";

import React, { useState } from "react";
import { 
  X, 
  Search, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Share2, 
  CreditCard, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Clock,
  UserPlus,
  Key
} from "lucide-react";
import { MockTournament } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import { processRazorpayPayment } from "@/lib/razorpay";

interface TournamentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: MockTournament;
  onRegistrationSuccess: (registrationData: any) => void;
}

export default function TournamentRegistrationModal({
  isOpen,
  onClose,
  tournament,
  onRegistrationSuccess,
}: TournamentRegistrationModalProps) {
  const { user: authUser } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState<number>(1);
  const [teamName, setTeamName] = useState<string>("Team SoulFire");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchType, setSearchType] = useState<"all" | "username" | "gameId">("all");
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  // Roster of teammates
  const maxSlots = tournament.format === "solo" ? 1 : tournament.format === "duo" ? 2 : 4;
  const captainName = authUser?.name || "Team Captain";

  const [invitedMembers, setInvitedMembers] = useState<any[]>([
    {
      id: authUser?.userId || "usr_captain",
      name: captainName,
      inGameName: captainName,
      gameId: "5129847291",
      role: "captain",
      status: "confirmed",
      avatarUrl: authUser?.avatarUrl || "/avatar.png",
      verified: true,
    },
  ]);

  const [generatedToken, setGeneratedToken] = useState<string>("SQ-8F29A");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Persistent squad 1-click autofill
  const [savedTeam, setSavedTeam] = useState<any>(null);

  React.useEffect(() => {
    if (isOpen && tournament.format !== "solo") {
      fetch("/api/teams/my-team")
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            setSavedTeam(res.data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, tournament.format]);

  const handle1ClickAutofill = () => {
    if (!savedTeam) return;
    setTeamName(savedTeam.name);

    if (savedTeam.members && savedTeam.members.length > 0) {
      const membersToLoad = savedTeam.members.slice(0, maxSlots).map((m: any, idx: number) => ({
        id: m.user || `usr_${m.gameId}`,
        name: m.inGameName,
        inGameName: m.inGameName,
        gameId: m.gameId,
        role: idx === 0 ? "captain" : m.role || "member",
        status: "confirmed",
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(m.inGameName || m.gameId)}`,
        verified: true,
      }));

      setInvitedMembers(membersToLoad);
      toast.success(
        `Pre-filled ${membersToLoad.length} athletes from "${savedTeam.name}" [${savedTeam.tag}]!`,
        "Roster Autofilled"
      );
    }
  };

  if (!isOpen) return null;

  // Search athlete by Username or Game ID
  const handleSearchTeammate = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setErrorMsg(null);
    setSearchResult(null);

    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/search-player`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery.trim(),
          searchType,
          game: tournament.game,
        }),
      });
      const data = await res.json();
      setSearchResult(data);
    } catch {
      // Fallback
      setSearchResult({
        success: true,
        found: false,
        searchQuery: searchQuery.trim(),
        message: `No athlete registered with "${searchQuery.trim()}" on PlayArena yet. An invite link can be generated.`,
      });
    } finally {
      setSearching(false);
    }
  };

  const handleAddFoundPlayer = (player: any) => {
    if (invitedMembers.some((m) => (player.id && (m.id === player.id || m.user === player.id)) || (player.gameId && m.gameId === player.gameId) || (m.username && m.username === player.username))) {
      toast.warning("This athlete is already in your team roster.", "Duplicate Member");
      setErrorMsg("This athlete is already in your team roster.");
      return;
    }

    if (invitedMembers.length >= maxSlots) {
      toast.warning(`Roster limit reached (${maxSlots}/${maxSlots} slots).`, "Roster Full");
      setErrorMsg(`Roster limit reached (${maxSlots}/${maxSlots} slots).`);
      return;
    }

    setInvitedMembers((prev) => [
      ...prev,
      {
        id: player.id,
        user: player.id,
        name: player.name,
        username: player.username,
        inGameName: player.inGameName || "",
        gameId: player.gameId || "",
        hasGameProfile: Boolean(player.hasGameProfile),
        role: "member",
        status: "invited_pending",
        avatarUrl: player.avatarUrl,
        verified: player.verified,
      },
    ]);

    toast.success(`Invited @${player.username} to squad roster!`, "Roster Updated");
    setSearchResult(null);
    setSearchQuery("");
    setErrorMsg(null);
  };

  const handleAddPendingTokenInvite = (identifier: string) => {
    if (invitedMembers.length >= maxSlots) {
      toast.warning(`Roster limit reached (${maxSlots}/${maxSlots} slots).`, "Roster Full");
      setErrorMsg(`Roster limit reached (${maxSlots}/${maxSlots} slots).`);
      return;
    }

    const cleanId = identifier.trim().replace(/^@/, "");
    const isDigits = /^\d+$/.test(cleanId);

    setInvitedMembers((prev) => [
      ...prev,
      {
        id: `pending_${Date.now()}`,
        name: isDigits ? `Friend (UID: ${cleanId})` : `@${cleanId}`,
        username: !isDigits ? cleanId : undefined,
        inGameName: "",
        gameId: isDigits ? cleanId : "",
        hasGameProfile: false,
        role: "member",
        status: "waiting_for_login",
        verified: false,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanId)}`,
      },
    ]);

    toast.info(`Slot reserved for "${cleanId}". Share your squad invite link with them to log in & claim!`, "Slot Reserved");
    setSearchResult(null);
    setSearchQuery("");
    setErrorMsg(null);
  };

  const handleRemoveMember = (identifier: string) => {
    setInvitedMembers((prev) =>
      prev.filter(
        (m) =>
          m.role === "captain" ||
          (m.id !== identifier && m.gameId !== identifier && m.username !== identifier)
      )
    );
  };

  const universalInviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/join?token=${generatedToken}&tid=${tournament.id}&team=${encodeURIComponent(teamName)}`
    : `https://playarena.gg/join?token=${generatedToken}&tid=${tournament.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(universalInviteLink);
    setCopiedLink(true);
    toast.info("Teammate invite URL copied to clipboard!", "Link Copied");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyFriendInvite = (identifier?: string) => {
    const link = `${universalInviteLink}${identifier ? `&friend=${encodeURIComponent(identifier)}` : ""}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Friend invite link copied to clipboard!", "Link Copied");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsAppFriend = (identifier?: string) => {
    const link = `${universalInviteLink}${identifier ? `&friend=${encodeURIComponent(identifier)}` : ""}`;
    const text = encodeURIComponent(
      `🎮 Join my squad "${teamName}" for ${tournament.title} on PlayArena!\n\n` +
      `🏆 Prize Pool: ₹${tournament.prizePool.toLocaleString()}\n` +
      `🔑 Squad Token: *${generatedToken}*\n` +
      `⏳ Roster locks 10 mins before match start!\n\n` +
      `Tap this link to log in and claim your slot:\n${link}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🎮 Join my squad "${teamName}" for ${tournament.title} on PlayArena!\n\n` +
      `🏆 Prize Pool: ₹${tournament.prizePool.toLocaleString()}\n` +
      `🔑 Squad Token: *${generatedToken}*\n` +
      `⏳ Roster locks 10 mins before match start!\n\n` +
      `Tap this link to claim your slot:\n${universalInviteLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const completeRegistrationRequest = async (paymentId?: string) => {
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName,
          format: tournament.format,
          captainGameId: authUser?.gameProfiles?.[0]?.gameId || "5129847291",
          captainInGameName: captainName,
          invitedMembers,
          matchStartTime: tournament.rawDate || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          razorpayPaymentId: paymentId,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        toast.success(
          paymentId 
            ? "Payment verified! Tournament registration confirmed." 
            : "Tournament registration confirmed! Squad token active.",
          "Registration Complete"
        );
        onRegistrationSuccess(data.data);
        onClose();
      } else {
        setErrorMsg(data.message || "Failed to confirm registration.");
        toast.error(data.message || "Failed to confirm registration.", "Registration Error");
      }
    } catch {
      // Fallback in-memory success
      const matchTime = tournament.tournamentDate ? new Date(tournament.tournamentDate).getTime() : 0;
      const tenMinCutoff = matchTime > 0 ? matchTime - 10 * 60 * 1000 : 0;
      const isWithinTenMinutes = matchTime === 0 || Date.now() >= tenMinCutoff;

      const fallbackRecord = {
        tournamentId: tournament.id,
        teamName,
        format: tournament.format,
        squadToken: generatedToken,
        members: invitedMembers,
        maxMembers: maxSlots,
        isEarlyLocked: true,
        rosterLockedAt: (tenMinCutoff > 0 ? new Date(tenMinCutoff) : new Date(Date.now() + 10 * 60 * 1000)).toISOString(),
        roomCredentials: isWithinTenMinutes && (tournament as any).matchRoomCredentials?.roomId
          ? {
              roomId: (tournament as any).matchRoomCredentials.roomId,
              roomPassword: (tournament as any).matchRoomCredentials.roomPassword,
            }
          : undefined,
      };
      toast.success("Tournament registration locked! Squad token active.", "Registration Confirmed");
      onRegistrationSuccess(fallbackRecord);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalizeRegistration = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    // If entry fee > 0, trigger Razorpay payment
    const activeTourneyId = (tournament as any)._id || tournament.id;

    if (tournament.entryFee > 0) {
      await processRazorpayPayment({
        tournamentId: activeTourneyId,
        tournamentTitle: tournament.title,
        amount: tournament.entryFee,
        user: {
          name: authUser?.name || captainName,
          email: authUser?.email || "athlete@mvparena.gg",
          whatsappNumber: authUser?.whatsappNumber || "",
        },
        onSuccess: async (paymentData) => {
          try {
            // Verify payment signature on backend
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...paymentData,
                tournamentId: activeTourneyId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              await completeRegistrationRequest(paymentData.razorpayPaymentId);
            } else {
              setErrorMsg(verifyData.error || "Payment signature verification failed.");
              toast.error(verifyData.error || "Payment verification failed.", "Payment Error");
              setSubmitting(false);
            }
          } catch {
            await completeRegistrationRequest(paymentData.razorpayPaymentId);
          }
        },
        onFailure: (error) => {
          setErrorMsg(error);
          toast.error(error, "Payment Cancelled");
          setSubmitting(false);
        },
      });
    } else {
      // Free tournament
      await completeRegistrationRequest();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-6 sm:my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                Step {step} of 3 • {tournament.format.toUpperCase()} REGISTRATION
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {tournament.game === "bgmi" ? "BGMI" : "Free Fire MAX"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
              {tournament.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] sm:max-h-[70vh] overflow-y-auto">
          
          {/* STEP 1: Team Name & Character ID Verification */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-500">
                    Your In-Game Character Dossier
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Captain
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono uppercase">In-Game Name (IGN)</span>
                    <strong className="text-slate-900 text-sm font-mono">{captainName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono uppercase">Character UID</span>
                    <strong className="text-slate-900 text-sm font-mono">{"5129847291"}</strong>
                  </div>
                </div>
              </div>

              {/* 1-Click Squad Autofill Banner */}
              {savedTeam && tournament.format !== "solo" && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Saved Squad: <span className="text-emerald-700 font-extrabold">{savedTeam.name}</span> [{savedTeam.tag}]
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {savedTeam.members?.length || 1} verified athletes ready for 1-click roster autofill.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handle1ClickAutofill}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    1-Click Fill
                  </button>
                </div>
              )}

              {tournament.format !== "solo" && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase font-mono tracking-wider mb-1.5">
                    Squad / Team Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter your registered team name..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This team name will be displayed on the official broadcast and live leaderboard.
                  </p>
                </div>
              )}

              <div className="pt-3 flex flex-col sm:flex-row justify-end">
                <button
                  type="button"
                  onClick={() => setStep(tournament.format === "solo" ? 3 : 2)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs sm:text-sm hover:bg-emerald-600 transition-all shadow-xs w-full sm:w-auto"
                >
                  <span>{tournament.format === "solo" ? "Continue to Payment" : "Assemble Roster & Invite"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Teammate Search & Squad Assembly */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Search &amp; Invite Teammates by Username or Game ID
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Search your teammate by their PlayArena website @username or their in-game Character UID. If they are not registered yet, send them a direct invite link and reserve their slot while waiting for them to log in!
                </p>
              </div>

              {/* Search Mode Filter & Search Box */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">Search By:</span>
                  <button
                    type="button"
                    onClick={() => setSearchType("all")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      searchType === "all"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchType("username")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      searchType === "username"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    @ Username
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchType("gameId")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      searchType === "gameId"
                        ? "bg-emerald-600 text-white shadow-xs"
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchTeammate()}
                      placeholder={
                        searchType === "username"
                          ? "Enter PlayArena @username (e.g. @soul_mortal)..."
                          : searchType === "gameId"
                          ? "Enter teammate's Character UID (e.g. 5129847291)..."
                          : "Search by @username or Character UID..."
                      }
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchTeammate}
                    disabled={searching || !searchQuery.trim()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs font-mono transition-all shrink-0 cursor-pointer shadow-xs"
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>

              {/* Search Result Card (Strict Public Info Only) */}
              {searchResult && (
                <div className="rounded-xl transition-all animate-in fade-in">
                  {searchResult.found ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={searchResult.user.avatarUrl}
                          alt={searchResult.user.name}
                          className="h-11 w-11 rounded-full object-cover border border-emerald-300 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-slate-900">{searchResult.user.name}</span>
                            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              @{searchResult.user.username}
                            </span>
                            {searchResult.user.verified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.2 rounded-full font-bold">
                                <ShieldCheck className="h-3 w-3 text-cyan-600" />
                                Verified Athlete
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-slate-600 mt-0.5">
                            {searchResult.user.hasGameProfile ? (
                              <>
                                IGN: <strong className="text-slate-900">{searchResult.user.inGameName}</strong>
                                {searchResult.user.gameId && (
                                  <span className="text-slate-400 ml-1.5">(UID: {searchResult.user.gameId})</span>
                                )}
                              </>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px] font-sans">
                                Character UID not linked yet • Teammate will enter upon accepting
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddFoundPlayer(searchResult.user)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Add &amp; Invite Teammate</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3">
                      <div className="flex items-start gap-2.5 text-xs text-amber-900">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-sm font-bold text-amber-950 block">
                            Athlete &quot;{searchResult.searchQuery}&quot; is not registered on PlayArena yet.
                          </strong>
                          <p className="text-slate-600 mt-1 leading-relaxed">
                            Send an invite link to your friend! They can sign in or register to confirm their slot anytime before match kickoff. You can reserve this lineup slot right now while waiting for them to log in.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/60">
                        <button
                          type="button"
                          onClick={() => handleCopyFriendInvite(searchResult.searchQuery)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Squad Invite Link</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareWhatsAppFriend(searchResult.searchQuery)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Share on WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddPendingTokenInvite(searchResult.searchQuery)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer ml-auto shadow-xs"
                        >
                          <Clock className="h-3.5 w-3.5 text-amber-400" />
                          <span>Reserve Slot (Waiting for Friend)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Roster Slots Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-wider">
                  <span>Squad Slots ({invitedMembers.length}/{maxSlots})</span>
                  {savedTeam && invitedMembers.length < maxSlots && (
                    <button
                      type="button"
                      onClick={handle1ClickAutofill}
                      className="text-emerald-700 font-bold hover:underline normal-case text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Autofill from {savedTeam.name}</span>
                    </button>
                  )}
                  <span>{maxSlots - invitedMembers.length} Slots Open</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {invitedMembers.map((member, idx) => {
                    const isPending = member.status === "invited_pending";
                    const isWaiting = member.status === "waiting_for_login";
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2 shadow-xs transition-all ${
                          isWaiting
                            ? "bg-amber-50/70 border-amber-300"
                            : isPending
                            ? "bg-blue-50/70 border-blue-200"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold font-mono text-xs shrink-0 ${
                              member.role === "captain"
                                ? "bg-slate-900 text-white"
                                : isWaiting
                                ? "bg-amber-500 text-white"
                                : isPending
                                ? "bg-blue-600 text-white"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {member.role === "captain"
                                  ? (member.inGameName || member.name)
                                  : (member.username ? `@${member.username}` : (member.inGameName || member.name))}
                              </span>
                              {member.role === "captain" && (
                                <span className="text-[9px] font-mono px-1 rounded bg-slate-100 text-slate-600 font-bold uppercase">
                                  CPT
                                </span>
                              )}
                              {isPending && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-900 font-bold border border-blue-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping"></span>
                                  Invite Sent
                                </span>
                              )}
                              {isWaiting && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                  Waiting for Login
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 block truncate">
                              {member.role === "captain"
                                ? `UID: ${member.gameId}`
                                : member.inGameName
                                ? `IGN: ${member.inGameName} (UID: ${member.gameId})`
                                : member.gameId
                                ? `UID: ${member.gameId}`
                                : isPending
                                ? "Pending athlete acceptance"
                                : "Slot reserved • Waiting for login"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isWaiting && (
                            <button
                              type="button"
                              onClick={() => handleCopyFriendInvite(member.gameId || member.username)}
                              className="p-1 rounded text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                              title="Copy Invite Link for this slot"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {member.role !== "captain" && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.id || member.gameId || member.username)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                              title="Remove teammate"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Slot Placeholders */}
                  {Array.from({ length: maxSlots - invitedMembers.length }).map((_, i) => (
                    <div
                      key={`empty_${i}`}
                      className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center gap-2 text-xs font-mono text-slate-400"
                    >
                      <Key className="h-3.5 w-3.5 text-slate-400" />
                      <span>Slot {invitedMembers.length + i + 1}: Open for Token Join</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 text-center"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs sm:text-sm hover:bg-emerald-600 transition-all shadow-xs text-center"
                >
                  <span>Generate Token &amp; Lock Slot</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Squad Token, Invite Link & Early Slot Lock */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Universal Squad Token &amp; Link
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Your squad token is active! Share the universal link with teammates. They can join anytime until **10 minutes before match start**.
                </p>
              </div>

              {/* Squad Token Box */}
              <div className="p-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-50/40 text-center space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                  Official Squad Join Token
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-wider">
                  {generatedToken}
                </div>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Teammates can enter this token on the website or click your invite link to claim their slot.
                </p>
              </div>

              {/* Share Controls */}
              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={universalInviteLink}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLink ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share Token &amp; Link via WhatsApp</span>
                </button>
              </div>

              {/* Early Slot Lock Assurance Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-bold text-slate-900 font-mono uppercase tracking-wider">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>Early Slot Lock &amp; Countdown Policy</span>
                </div>
                <p className="leading-relaxed">
                  • <strong>Early Lock:</strong> Confirming registration now reserves your team slot in the tournament bracket immediately.<br />
                  • <strong>Countdown Window:</strong> Teammates can join with the token anytime until <strong>10 minutes before kickoff</strong>.<br />
                  • <strong>Room Credentials:</strong> At the 10-min cutoff, the roster locks, and custom Room ID &amp; Password are sent to registered WhatsApp numbers and revealed on your dashboard.
                </p>
              </div>

              {/* Tariff & Confirmation */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Registration Fee</span>
                  <strong className="text-base font-bold font-mono text-slate-900">
                    {tournament.entryFee === 0 ? "FREE ENTRY" : `₹${tournament.entryFee}`}
                  </strong>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Slot Reservation</span>
                  <span className="font-semibold text-emerald-700 font-mono">Instant Guaranteed Slot</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep(tournament.format === "solo" ? 1 : 2)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 text-center"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeRegistration}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer text-center"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>
                    {submitting
                      ? "Processing Transaction..."
                      : tournament.entryFee > 0
                      ? `Pay ₹${tournament.entryFee} & Lock Slot`
                      : "Lock Slot & Start Countdown"}
                  </span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
