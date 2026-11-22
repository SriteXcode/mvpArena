"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Tv, 
  Flame, 
  Calendar, 
  Radio, 
  Users, 
  Trophy, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  ExternalLink, 
  Play,
  Search,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";
import StreamHubSkeleton, { StreamScheduleSkeleton } from "@/components/skeletons/StreamHubSkeleton";
import { formatINR } from "@/lib/utils";

// Lazy-load live stream stadium
const LiveStreamHub = dynamic(() => import("@/components/LiveStreamHub"), {
  loading: () => <StreamHubSkeleton />,
  ssr: false,
});

function YoutubeIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function StreamsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeStreamId, setActiveStreamId] = useState<string>("");
  const [searchSchedule, setSearchSchedule] = useState<string>("");
  const [filterSchedule, setFilterSchedule] = useState<"all" | "active" | "bgmi" | "freefire">("all");

  useEffect(() => {
    fetch("/api/tournaments")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setTournaments(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const liveBroadcastsCount = useMemo(() => {
    return tournaments.filter(
      (t) => Boolean(t.youtubeStreamUrl || t.streamUrl || t.isLiveStreamed || t.status === "live")
    ).length;
  }, [tournaments]);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const title = (t.title || "").toLowerCase();
      const org = (t.organizer?.orgName || "").toLowerCase();
      const q = searchSchedule.toLowerCase().trim();

      if (q && !title.includes(q) && !org.includes(q)) return false;

      if (filterSchedule === "active") {
        return Boolean(t.youtubeStreamUrl || t.streamUrl || t.isLiveStreamed || t.status === "live");
      }
      if (filterSchedule === "bgmi") return t.game === "bgmi";
      if (filterSchedule === "freefire") return t.game === "freefire";

      return true;
    });
  }, [tournaments, searchSchedule, filterSchedule]);

  const handlePlayInStadium = (tourneyId: string) => {
    setActiveStreamId(tourneyId);
    if (typeof window !== "undefined") {
      document.getElementById("live-streams")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Banner / Back Nav */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Arena Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
              {liveBroadcastsCount > 0 ? `${liveBroadcastsCount} Live Broadcasts Active` : "Esports Stadium Live"}
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Live Streaming Hub (Synced with MongoDB tournaments) */}
      <Suspense fallback={<StreamHubSkeleton />}>
        <LiveStreamHub
          externalSelectedId={activeStreamId}
          onStreamChange={setActiveStreamId}
        />
      </Suspense>

      {/* Real Schedule Stream List & Caster Desk */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Real Scheduled Stream List (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider font-mono text-emerald-400">
                  <Calendar className="h-4 w-4" />
                  <span>Real Tournament Stream Schedule</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified match schedules &amp; live spectator broadcast links
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400 font-mono">
                  {filteredTournaments.length} {filteredTournaments.length === 1 ? "Fixture" : "Fixtures"}
                </span>
              </div>
            </div>

            {/* Filter & Search Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setFilterSchedule("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 ${
                    filterSchedule === "all" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  All ({tournaments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterSchedule("active")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    filterSchedule === "active" ? "bg-red-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                  <span>Active Streams ({liveBroadcastsCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterSchedule("bgmi")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 ${
                    filterSchedule === "bgmi" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  BGMI
                </button>
                <button
                  type="button"
                  onClick={() => setFilterSchedule("freefire")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 ${
                    filterSchedule === "freefire" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Free Fire
                </button>
              </div>

              <div className="relative w-full sm:w-60 shrink-0">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter schedule by title..."
                  value={searchSchedule}
                  onChange={(e) => setSearchSchedule(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Scheduled Stream Cards */}
            <div className="space-y-3">
              {loading ? (
                <StreamScheduleSkeleton count={4} />
              ) : filteredTournaments.length > 0 ? (
                filteredTournaments.map((t: any) => {
                  const rawStream = t.youtubeStreamUrl || t.streamUrl || "";
                  const hasStream = Boolean(rawStream);
                  const isLive = t.status === "live";
                  const dateStr = t.tournamentDate
                    ? new Date(t.tournamentDate).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Scheduled Today";

                  return (
                    <div
                      key={t._id}
                      className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 uppercase">
                            {t.game === "bgmi" ? "BGMI" : "FREE FIRE MAX"}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800/80 text-slate-300 uppercase">
                            {t.format || "squad"}
                          </span>
                          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{dateStr}</span>
                          </span>

                          {hasStream ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                              LIVE STREAM READY
                            </span>
                          ) : isLive ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                              MATCH LOBBY LIVE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
                              BROADCAST SCHEDULED
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1 hover:text-emerald-400 transition-colors">
                          <Link href={`/tournaments/${t._id}`}>
                            {t.title}
                          </Link>
                        </h4>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
                          <span>
                            Prize Pool: <strong className="text-amber-400 font-mono">{formatINR(t.prizePool || 0)}</strong>
                          </span>
                          <span>
                            Entry: <strong className="text-slate-200">{t.entryFee === 0 ? "FREE" : `₹${t.entryFee}`}</strong>
                          </span>
                          <span>
                            Slots: <strong className="text-emerald-400">{t.registeredSlots || 0}/{t.maxSlots || 25}</strong>
                          </span>
                          <span>
                            Organizer: <strong className="text-slate-300">{t.organizer?.orgName || "Official Arena Arbiter"}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Stream Action Strip */}
                      <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
                        {hasStream ? (
                          <a
                            href={rawStream}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-all shadow-xs"
                            title="Open direct live YouTube stream"
                          >
                            <YoutubeIcon className="h-3.5 w-3.5 fill-white" />
                            <span>Watch Stream</span>
                            <ExternalLink className="h-3 w-3 opacity-80" />
                          </a>
                        ) : (
                          <Link
                            href={`/tournaments/${t._id}#official-stream`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                            title="View Broadcast Standby in Tournament Lobby"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            <span>Standby Stream</span>
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => handlePlayInStadium(t._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                          title="Load this match in the top stadium video player"
                        >
                          <Play className="h-3 w-3 text-emerald-400" />
                          <span>Load in Player ▲</span>
                        </button>

                        <Link
                          href={`/tournaments/${t._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                        >
                          <span>Lobby</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                  <Calendar className="h-8 w-8 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">No scheduled streams found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try adjusting your filters or search terms. New tournament fixtures scheduled by organizers appear here automatically.
                  </p>
                  <button
                    onClick={() => {
                      setSearchSchedule("");
                      setFilterSchedule("all");
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Broadcast Standards & Organizer Desk (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white font-mono uppercase tracking-wider">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span>Broadcast Standards</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  🔒 <strong>Enforced Spectator Delay:</strong> All official match broadcasts implement an enforced 180-second stream delay to eliminate stream-sniping and protect squad positioning.
                </p>
                <p>
                  🎙️ <strong>Verified Casters:</strong> Stream commentary is powered by authorized casters with observer lobby credentials provided by tournament arbiters.
                </p>
                <p>
                  ⚡ <strong>Auto Leaderboard Sync:</strong> Match statistics shown on stream sync directly with referee screenshot verifications before prizes are disbursed.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <Link
                  href="/organizer/dashboard"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>Organizers: Manage tournament streams in Command Center →</span>
                </Link>
              </div>
            </div>

            {/* Quick Link Card to Tournaments Discovery */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Register to Compete</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Want your squad featured on the main stage broadcast? Join open scrims and championship fixtures.
              </p>
              <Link
                href="/tournaments"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 rounded-xl transition-colors shadow-sm w-full justify-center"
              >
                <span>Explore All Open Tournaments</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
