"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Trophy, 
  Users, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  CreditCard, 
  Share2, 
  AlertCircle,
  Key,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ScrollText,
  ShieldAlert,
  Play,
  Copy,
  Check,
  Tv,
  Edit3,
  Search,
  X
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { formatINR, normalizeStreamUrl } from "@/lib/utils";
import { MOCK_TOURNAMENTS } from "@/lib/mockData";
import TournamentDetailSkeleton from "@/components/skeletons/TournamentDetailSkeleton";
import { useToast } from "@/lib/context/ToastContext";
import { useAuth } from "@/lib/context/AuthContext";

// Lazy-load heavy interactive modals and widgets
const ShareInviteModal = dynamic(() => import("@/components/ShareInviteModal"), { ssr: false });
const TournamentRegistrationModal = dynamic(() => import("@/components/TournamentRegistrationModal"), { ssr: false });
const TournamentCountdownBanner = dynamic(() => import("@/components/TournamentCountdownBanner"), { ssr: false });
const JoinSquadTokenModal = dynamic(() => import("@/components/JoinSquadTokenModal"), { ssr: false });

function YoutubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function getYouTubeWatchUrl(url?: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube.com/watch?v=${v}`;
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "live" && parts[1]) {
        return `https://www.youtube.com/live/${parts[1]}`;
      }
      if (parts[0] === "embed" && parts[1]) {
        return `https://www.youtube.com/watch?v=${parts[1]}`;
      }
    }
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1);
      if (id) return `https://www.youtube.com/watch?v=${id}`;
    }
    return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  } catch {
    return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  }
}

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}?autoplay=0&rel=0`;
      const pathnameParts = parsed.pathname.split("/").filter(Boolean);
      if ((pathnameParts[0] === "live" || pathnameParts[0] === "embed") && pathnameParts[1]) {
        return `https://www.youtube-nocookie.com/embed/${pathnameParts[1]}?autoplay=0&rel=0`;
      }
    }
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1);
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&rel=0`;
    }
  } catch {}
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=0&rel=0`;
  }
  return null;
}

export default function TournamentDetailPage() {
  const toast = useToast();
  const { user } = useAuth();
  const isOrganizer = user?.role === "organizer" || user?.role === "super_admin";
  const params = useParams();
  const tournamentId = (params?.id as string) || "tour_bgmi_01";
  const [isLoading, setIsLoading] = useState(true);

  const matchedMock = MOCK_TOURNAMENTS.find(
    (m) => m.id === tournamentId || m.slug === tournamentId
  );

  const searchParams = useSearchParams();
  const urlToken = searchParams?.get("token") || searchParams?.get("squadToken") || "";

  const [tournament, setTournament] = useState<any>(() => {
    let localStream = "";
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("mvp_stream_active");
        localStream = localStorage.getItem(`mvp_stream_${tournamentId}`) || "";
      } catch {}
    }
    const rawDefault = localStream || matchedMock?.youtubeStreamUrl || matchedMock?.streamUrl || "";
    const defaultStream = normalizeStreamUrl(rawDefault);

    return {
      id: tournamentId,
      title: matchedMock?.title || "Tournament Fixture",
      slug: matchedMock?.slug || "tournament-fixture",
      game: matchedMock?.game || "bgmi",
      format: matchedMock?.format || "squad",
      organizerName: matchedMock?.organizerName || "Nova Esports Hub",
      bannerUrl: matchedMock?.bannerUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200",
      entryFee: matchedMock?.entryFee ?? 100,
      prizePool: matchedMock?.prizePool ?? 15000,
      maxSlots: matchedMock?.maxSlots ?? 25,
      registeredSlots: matchedMock?.registeredSlots ?? 1,
      registrationEnd: matchedMock?.registrationEnd || "Today, 6:00 PM",
      tournamentDate: matchedMock?.tournamentDate || "Today, 8:00 PM IST",
      status: matchedMock?.status || "registration_open",
      rules: matchedMock?.rules || "Standard esports guidelines. Emulators forbidden. Check-in 15 minutes prior to match time.",
      codeOfConduct: "Fair play and integrity are strictly enforced. Harassment, toxicity, stream sniping, or emulator usage results in immediate disqualification and forfeiture of rewards.",
      youtubeStreamUrl: defaultStream,
      prizeDistribution: [
        { rank: "1st Place (Champion)", reward: 7500, percentage: 50 },
        { rank: "2nd Place (Runner-Up)", reward: 4500, percentage: 30 },
        { rank: "3rd Place (2nd Runner-Up)", reward: 3000, percentage: 20 },
      ],
      scoringRules: { firstPlacePoints: 15, killPoints: 1 },
    };
  });

  const [showRegModal, setShowRegModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showJoinTokenModal, setShowJoinTokenModal] = useState(Boolean(urlToken));
  const [registration, setRegistration] = useState<any>(null);
  const [pendingInvite, setPendingInvite] = useState<any>(null);
  const [respondingInvite, setRespondingInvite] = useState(false);
  const [editingStream, setEditingStream] = useState(false);
  const [streamInput, setStreamInput] = useState("");
  const [savingStream, setSavingStream] = useState(false);
  const [copiedStream, setCopiedStream] = useState(false);

  const handleSaveStream = async (urlToSave?: string) => {
    const rawUrl = (urlToSave !== undefined ? urlToSave : streamInput).trim();
    const finalUrl = rawUrl ? normalizeStreamUrl(rawUrl) : "";
    setSavingStream(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("mvp_stream_active");
        localStorage.setItem(`mvp_stream_${tournamentId}`, finalUrl);
        if (tournament?.slug) {
          localStorage.setItem(`mvp_stream_${tournament.slug}`, finalUrl);
        }
      } catch {}
    }
    setTournament((prev: any) => ({
      ...prev,
      youtubeStreamUrl: finalUrl,
      streamUrl: finalUrl,
    }));

    try {
      await Promise.allSettled([
        fetch(`/api/tournaments/${tournamentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ youtubeStreamUrl: finalUrl, streamUrl: finalUrl }),
        }),
        fetch("/api/organizer/matches/credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tournamentId,
            youtubeStreamUrl: finalUrl,
            streamUrl: finalUrl,
          }),
        }),
      ]);
      setEditingStream(false);
      setStreamInput("");
      toast.success(finalUrl ? "Organiser live stream updated and activated!" : "Stream link cleared.", "Stream Updated");
    } catch {
      setEditingStream(false);
      setStreamInput("");
      toast.success("Organiser live stream updated!", "Stream Updated");
    } finally {
      setSavingStream(false);
    }
  };

  const fetchRegistration = () => {
    fetch(`/api/tournaments/${tournamentId}/register`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setRegistration(res.data);
        }
      })
      .catch(() => {});
  };

  const fetchInvitations = () => {
    fetch(`/api/tournaments/${tournamentId}/invitations`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.hasPendingInvite && res.registration) {
          setPendingInvite(res.registration);
        } else {
          setPendingInvite(null);
        }
      })
      .catch(() => {});
  };

  const handleRespondInvite = async (action: "accept" | "reject") => {
    if (!pendingInvite) return;
    setRespondingInvite(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/invitations/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: pendingInvite.id,
          action,
          gameId: (user?.gameProfiles?.find((p: any) => p.game === tournament?.game) || user?.gameProfiles?.[0])?.gameId || "",
          inGameName: (user?.gameProfiles?.find((p: any) => p.game === tournament?.game) || user?.gameProfiles?.[0])?.inGameName || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === "accept") {
          toast.success(data.message || "Successfully joined squad!", "Squad Joined");
          setRegistration(data.data);
        } else {
          toast.info(data.message || "Declined invitation. That slot is now open.", "Invitation Declined");
        }
        setPendingInvite(null);
        fetchRegistration();
      } else {
        toast.error(data.message || "Failed to respond to invitation.", "Response Error");
      }
    } catch {
      toast.error("Failed to connect to the server.", "Network Error");
    } finally {
      setRespondingInvite(false);
    }
  };

  const fetchTournamentData = () => {
    let localStream = "";
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("mvp_stream_active");
        localStream = localStorage.getItem(`mvp_stream_${tournamentId}`) || "";
      } catch {}
    }

    fetch(`/api/tournaments/${tournamentId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const t = res.data;
          const tourneySpecificLocal = typeof window !== "undefined" ? (localStorage.getItem(`mvp_stream_${t._id}`) || (t.slug ? localStorage.getItem(`mvp_stream_${t.slug}`) : "") || localStream) : localStream;
          const rawStream = t.youtubeStreamUrl || t.streamUrl || tourneySpecificLocal || "";
          const streamUrl = normalizeStreamUrl(rawStream);
          setTournament({
            id: t._id || t.id,
            title: t.title,
            slug: t.slug,
            game: t.game,
            format: t.format,
            organizerName: t.organizer?.orgName || matchedMock?.organizerName || "Nova Esports Hub",
            bannerUrl: t.bannerUrl || matchedMock?.bannerUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200",
            entryFee: t.entryFee,
            prizePool: t.prizePool,
            maxSlots: t.maxSlots,
            registeredSlots: t.registeredSlots || 0,
            registrationEnd: "Today, 6:00 PM",
            tournamentDate: new Date(t.tournamentDate).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: t.status,
            rules: t.rules || matchedMock?.rules || "Standard esports guidelines. Emulators forbidden.",
            codeOfConduct: t.codeOfConduct || "Fair play and integrity are strictly enforced. Harassment, toxicity, stream sniping, or emulator usage results in immediate disqualification and forfeiture of rewards.",
            youtubeStreamUrl: streamUrl,
            prizeDistribution: Array.isArray(t.prizeDistribution) && t.prizeDistribution.length > 0 ? t.prizeDistribution : [],
            visibility: t.visibility,
            privateToken: t.privateToken,
            matchRoomCredentials: t.matchRoomCredentials,
            scoringRules: {
              firstPlacePoints: t.scoringRules?.placementPoints?.["1"] || 15,
              killPoints: t.scoringRules?.eliminationPoints || 1,
            },
          });
        } else if (matchedMock) {
          const rawMock = localStream || matchedMock.youtubeStreamUrl || matchedMock.streamUrl || "";
          setTournament({
            ...matchedMock,
            youtubeStreamUrl: normalizeStreamUrl(rawMock),
          });
        }
      })
      .catch(() => {
        if (matchedMock) {
          const rawMock = localStream || matchedMock.youtubeStreamUrl || matchedMock.streamUrl || "";
          setTournament({
            ...matchedMock,
            youtubeStreamUrl: normalizeStreamUrl(rawMock),
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  React.useEffect(() => {
    if (tournamentId === "join-token") {
      window.location.replace("/join");
      return;
    }

    fetchTournamentData();
    fetchRegistration();
    fetchInvitations();
  }, [tournamentId, user]);

  if (isLoading) {
    return <TournamentDetailSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Pending Squad Invitation Alert Banner */}
      {pendingInvite && (
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900">
                  Squad Invitation from {pendingInvite.captainName}
                </span>
                {pendingInvite.captainUsername && (
                  <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    @{pendingInvite.captainUsername}
                  </span>
                )}
                <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                You have been invited to join squad <strong className="text-slate-900 font-bold">&quot;{pendingInvite.teamName}&quot;</strong> for this tournament!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => handleRespondInvite("accept")}
              disabled={respondingInvite}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>{respondingInvite ? "Confirming..." : "Accept & Join Squad"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleRespondInvite("reject")}
              disabled={respondingInvite}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>Decline</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Banner Hero */}
      <div className="relative rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden shadow-sm">
        <div className="relative min-h-[260px] sm:min-h-[300px] md:min-h-[280px] w-full flex flex-col justify-between p-4 sm:p-6">
          <img
            src={tournament.bannerUrl}
            alt={tournament.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/70 to-slate-900/40"></div>

          {/* Badges */}
          <div className="relative z-10 flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded bg-white/95 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold uppercase shadow-xs">
              {tournament.game === "bgmi" ? "BGMI" : "FREE FIRE MAX"}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/95 border border-slate-200 text-xs font-mono font-semibold text-slate-800 uppercase shadow-xs">
              {tournament.format}
            </span>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                <span>Organized by {tournament.organizerName}</span>
                <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight break-words">
                {tournament.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap shrink-0">
              {tournament.youtubeStreamUrl ? (
                <a
                  href={getYouTubeWatchUrl(tournament.youtubeStreamUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/25 transition-all cursor-pointer"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <YoutubeIcon className="h-4 w-4 fill-white" />
                  <span>Watch Live Match Stream</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const streamSec = document.getElementById("official-stream");
                    if (streamSec) streamSec.scrollIntoView({ behavior: "smooth" });
                    if (isOrganizer) {
                      setEditingStream(true);
                      setStreamInput("");
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  <YoutubeIcon className="h-4 w-4 fill-red-500" />
                  <span>Live Stream (Standby)</span>
                </button>
              )}
              <Link
                href={`/streams?tournamentId=${tournament.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-900 border border-slate-700 text-xs font-semibold text-white shadow-xs transition-all"
                title="Watch in Arena Stream Stadium"
              >
                <Tv className="h-3.5 w-3.5 text-red-400" />
                <span>Stream Stadium</span>
              </Link>
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/95 border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-white shadow-xs transition-all"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Event</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Details Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 p-4 sm:p-5 border-t border-slate-200 bg-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              Total Prize Pool
            </span>
            <span className="text-lg font-bold text-amber-600 font-mono">
              {formatINR(tournament.prizePool)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              Entry Fee
            </span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {tournament.entryFee === 0 ? "FREE" : `₹${tournament.entryFee}`}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              Enrolled Slots
            </span>
            <span className="text-lg font-bold text-emerald-600 font-mono">
              {tournament.registeredSlots}/{tournament.maxSlots}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              Schedule
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-1">
              {tournament.tournamentDate}
            </span>
          </div>

          <div className="flex flex-col col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              Official Stream
            </span>
            {tournament.youtubeStreamUrl ? (
              <a
                href={tournament.youtubeStreamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline mt-1 truncate"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="truncate">YouTube Live ↗</span>
              </a>
            ) : (
              <a
                href="#official-stream"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mt-1 truncate"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span className="truncate">Standby / Kickoff</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Live Pre-Match Countdown Banner & Roster Manager (Shown when Registered) */}
      {registration && (
        <TournamentCountdownBanner
          tournament={tournament}
          registration={registration}
          onRosterUpdated={() => {
            fetchRegistration();
            fetchTournamentData();
          }}
        />
      )}

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stream, Prize Distribution, Rules & Scoring */}
        <div className="lg:col-span-2 space-y-6">
          {/* Official YouTube Broadcast (Always visible) */}
          <div id="official-stream" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden scroll-mt-24">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-200">
                  <YoutubeIcon className="h-4 w-4 fill-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                    <span>Official Live Stream</span>
                    {tournament.youtubeStreamUrl ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold">
                        <span className="animate-ping inline-flex h-1.5 w-1.5 rounded-full bg-red-500 opacity-75"></span>
                        LIVE BROADCAST
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                        STANDBY
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {tournament.youtubeStreamUrl && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(normalizeStreamUrl(tournament.youtubeStreamUrl));
                        setCopiedStream(true);
                        toast.success("Stream link copied to clipboard!", "Link Copied");
                        setTimeout(() => setCopiedStream(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                      title="Copy Stream Link"
                    >
                      {copiedStream ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedStream ? "Copied" : "Copy"}</span>
                    </button>
                    <a
                      href={normalizeStreamUrl(tournament.youtubeStreamUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <span>Watch on YouTube</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </>
                )}
                {isOrganizer && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStream(!editingStream);
                      if (!editingStream) {
                        setStreamInput(tournament.youtubeStreamUrl || "");
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                    <span>{tournament.youtubeStreamUrl ? "Edit Link" : "Add Stream Link"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Inline Stream Editor ONLY for Organizers */}
            {isOrganizer && editingStream && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-300 mb-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <YoutubeIcon className="h-3.5 w-3.5 fill-red-600" />
                    <span>Set Organiser Stream Link</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingStream(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Enter YouTube Live Stream link (e.g. https://www.youtube.com/watch?v=...)"
                    value={streamInput}
                    onChange={(e) => setStreamInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveStream()}
                    disabled={savingStream}
                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {savingStream ? "Saving..." : "Save Stream Link"}
                  </button>
                </div>
              </div>
            )}

            {/* Stream Player & Organiser Stream Link */}
            {tournament.youtubeStreamUrl ? (
              <div className="space-y-3">
                {getYouTubeEmbedUrl(tournament.youtubeStreamUrl) && (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-black shadow-inner">
                    <iframe
                      src={getYouTubeEmbedUrl(tournament.youtubeStreamUrl)!}
                      title="Official Tournament Live Stream"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
                {/* Organiser Stream Link Bar with direct redirect */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                      <Play className="h-4 w-4 fill-red-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Organiser Stream Link</span>
                      <a
                        href={getYouTubeWatchUrl(tournament.youtubeStreamUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-slate-800 hover:text-red-600 truncate block transition-colors"
                      >
                        {tournament.youtubeStreamUrl}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(getYouTubeWatchUrl(tournament.youtubeStreamUrl));
                        setCopiedStream(true);
                        toast.info("Live stream link copied!", "Link Copied");
                        setTimeout(() => setCopiedStream(false), 2000);
                      }}
                      className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {copiedStream ? "Copied ✓" : "Copy Link"}
                    </button>
                    <a
                      href={getYouTubeWatchUrl(tournament.youtubeStreamUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 shadow-xs transition-colors"
                    >
                      <span>Watch Stream ↗</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Clean Standby State without extra unwanted details */
              <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <YoutubeIcon className="h-5 w-5 fill-slate-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Organiser Live Stream Standby
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    The organiser has not linked an official live stream URL for this fixture yet.
                  </p>
                </div>
                {isOrganizer ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStream(true);
                      setStreamInput("");
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <YoutubeIcon className="h-3.5 w-3.5 fill-white" />
                    <span>Add Organiser Stream Link</span>
                  </button>
                ) : (
                  <span className="inline-block text-[11px] font-mono text-slate-400">
                    Official broadcast link will appear here once published by the organiser.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Rank Prize Pool Rewards (Prices) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                    <span>Rank Prize Pool Rewards</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {formatINR(tournament.prizePool)} Total
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Guaranteed cash allocation for top placements &amp; ranks
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                100% Verified Payouts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(Array.isArray(tournament.prizeDistribution) && tournament.prizeDistribution.length > 0
                ? tournament.prizeDistribution
                : [
                    { rank: "1st Place (Champion)", reward: Math.round((tournament.prizePool || 15000) * 0.5), percentage: 50 },
                    { rank: "2nd Place (Runner-Up)", reward: Math.round((tournament.prizePool || 15000) * 0.3), percentage: 30 },
                    { rank: "3rd Place (2nd Runner-Up)", reward: Math.round((tournament.prizePool || 15000) * 0.2), percentage: 20 },
                  ]
              ).map((item: any, idx: number) => {
                const lowerRank = (item.rank || "").toLowerCase();
                const isFirst = idx === 0 || lowerRank.includes("1st") || lowerRank.includes("champion");
                const isSecond = idx === 1 || lowerRank.includes("2nd");
                const isThird = idx === 2 || lowerRank.includes("3rd");

                let cardClasses = "bg-slate-50/70 border-slate-200 text-slate-700";
                let amountColor = "text-slate-900";
                let rankEmoji = "🎖️";

                if (isFirst) {
                  cardClasses = "bg-gradient-to-br from-amber-50 via-amber-100/30 to-amber-50 border-amber-300 text-amber-900 shadow-2xs";
                  amountColor = "text-amber-700 font-extrabold";
                  rankEmoji = "🥇";
                } else if (isSecond) {
                  cardClasses = "bg-gradient-to-br from-slate-100/80 via-slate-200/30 to-slate-100 border-slate-300 text-slate-800 shadow-2xs";
                  amountColor = "text-slate-800 font-bold";
                  rankEmoji = "🥈";
                } else if (isThird) {
                  cardClasses = "bg-gradient-to-br from-orange-50 via-orange-100/30 to-orange-50 border-orange-300 text-orange-900 shadow-2xs";
                  amountColor = "text-orange-700 font-bold";
                  rankEmoji = "🥉";
                }

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${cardClasses} flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-xs`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-xs font-bold font-mono flex items-center gap-1.5 truncate">
                        <span>{rankEmoji}</span>
                        <span className="truncate">{item.rank}</span>
                      </span>
                    </div>
                    <div className="text-base sm:text-lg font-bold font-mono tracking-tight mt-1">
                      <span className={amountColor}>{formatINR(item.reward)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
              Prize amounts are directly disbursed to verified winning player UPI / bank accounts upon match conclusion and organizer verification.
            </p>
          </div>

          {/* Official Tournament Rules */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 font-mono uppercase tracking-wider flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-emerald-600" />
              Official Tournament Rules
            </h3>
            <div className="text-xs text-slate-600 space-y-2 whitespace-pre-line leading-relaxed bg-slate-50/60 p-4 rounded-lg border border-slate-200">
              {tournament.rules}
            </div>
          </div>

          {/* Code of Conduct & Fair Play */}
          {tournament.codeOfConduct && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 font-mono uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                Player Code of Conduct &amp; Fair Play Policy
              </h3>
              <div className="text-xs text-slate-600 space-y-2 whitespace-pre-line leading-relaxed bg-rose-50/40 p-4 rounded-lg border border-rose-100">
                {tournament.codeOfConduct}
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-500">
                <div className="flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  <span>Zero Emulator Cheating</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  <span>Anti-Toxicity Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Verified Prize Payouts</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Registration Card */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {registration ? (
              <div className="space-y-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto border border-emerald-200">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Slot Confirmed &amp; Early Locked
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    {registration.teamName}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 font-mono">
                    Squad Token: <strong className="text-slate-900">{registration.squadToken}</strong>
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                  <div>Roster Filled: <strong>{registration.members?.length || 1} / {registration.maxMembers || 4}</strong></div>
                  <div className="text-[11px] text-slate-400">Tokens valid until 10 min before kickoff</div>
                </div>

                <Link
                  href="/matches/match_01"
                  className="block w-full py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider text-center hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20"
                >
                  Enter Match Lobby →
                </Link>

                <button
                  type="button"
                  onClick={() => setShowJoinTokenModal(true)}
                  className="w-full py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key className="h-3.5 w-3.5 text-slate-400" />
                  <span>Join Another Squad via Token</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Roster Enrollment
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {tournament.format}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Register solo or search teammates by Game ID. Lock your team slot early — teammates can join using your Squad Token until 10 minutes before kickoff!
                </p>

                <div className="space-y-2 border-t border-slate-200 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Participation Tariff</span>
                    <span className="font-mono font-bold text-slate-900">
                      {tournament.entryFee === 0 ? "FREE ENTRY" : `₹${tournament.entryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Roster Lock Window</span>
                    <span className="text-emerald-700 font-semibold font-mono">
                      10 Min Prior to Start
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRegModal(true)}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Register Squad Roster</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowJoinTokenModal(true)}
                  className="w-full py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Key className="h-3.5 w-3.5 text-amber-600" />
                  <span>Join via Squad Invitation Token</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ShareInviteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        tournamentTitle={tournament.title}
      />

      <TournamentRegistrationModal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        tournament={tournament}
        onRegistrationSuccess={(data) => {
          setRegistration(data);
        }}
      />

      <JoinSquadTokenModal
        isOpen={showJoinTokenModal}
        onClose={() => setShowJoinTokenModal(false)}
        tournamentId={tournament.id}
        tournamentTitle={tournament.title}
        game={tournament.game}
        defaultToken={urlToken}
        onSuccess={() => {
          fetchRegistration();
        }}
      />
    </div>
  );
}
