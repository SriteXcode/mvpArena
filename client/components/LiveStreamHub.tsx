"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  ExternalLink, 
  ShieldCheck, 
  Volume2,
  Sparkles,
  Radio
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import StreamHubSkeleton from "@/components/skeletons/StreamHubSkeleton";

export interface LiveStreamItem {
  id: string;
  game: "bgmi" | "freefire";
  title: string;
  subtitle: string;
  tournamentName: string;
  tournamentId: string;
  casters: string;
  viewerCount: string;
  embedUrl: string;
  streamUrl?: string;
  thumbnailUrl: string;
  isLive: boolean;
  phase: string;
  prizePool: number;
  isReal?: boolean;
}

function YoutubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
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

interface LiveStreamHubProps {
  externalSelectedId?: string;
  onStreamChange?: (streamId: string) => void;
}

export default function LiveStreamHub({ externalSelectedId, onStreamChange }: LiveStreamHubProps = {}) {
  const [streams, setStreams] = useState<LiveStreamItem[]>([]);
  const [selectedStreamId, setSelectedStreamId] = useState<string>("");
  const [filterGame, setFilterGame] = useState<"all" | "bgmi" | "freefire">("all");
  const [loading, setLoading] = useState<boolean>(true);

  // Sync external stream ID if passed from schedule list
  useEffect(() => {
    if (externalSelectedId) {
      setSelectedStreamId(externalSelectedId);
    }
  }, [externalSelectedId]);

  // Read URL params on mount (e.g. /streams?tournamentId=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get("tournamentId") || params.get("tournament");
      if (targetId) {
        setSelectedStreamId(targetId);
        onStreamChange?.(targetId);
      }
    }
  }, []);

  // Live emoji hype reactions state (starts clean at 0)
  const [hypeCounts, setHypeCounts] = useState<{ [key: string]: number }>({
    fire: 0,
    trophy: 0,
    thunder: 0,
    headshot: 0,
  });

  // Sync strictly with real tournaments from the database
  useEffect(() => {
    fetch("/api/tournaments")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const realLiveStreams: LiveStreamItem[] = [];
          const realFixtures: LiveStreamItem[] = [];

          res.data.forEach((t: any) => {
            const rawStream = t.youtubeStreamUrl || t.streamUrl || "";
            const embed = getYouTubeEmbedUrl(rawStream);
            const hasCustomStream = Boolean(rawStream);
            const isLive = Boolean(hasCustomStream || t.status === "live" || t.isLiveStreamed);

            const streamItem: LiveStreamItem = {
              id: (t._id || t.id)?.toString(),
              game: t.game === "freefire" ? "freefire" : "bgmi",
              title: t.title,
              subtitle: `${(t.format || "squad").toUpperCase()} Fixture • ${t.organizer?.orgName || "MVP Arena"}`,
              tournamentName: t.title,
              tournamentId: (t._id || t.id)?.toString(),
              casters: t.casters || (hasCustomStream ? "Live Spectator Feed" : "MVP Arena Desk"),
              viewerCount: hasCustomStream ? "LIVE BROADCAST" : (t.status === "live" ? "MATCH IN PLAY" : "STANDBY"),
              embedUrl: embed || "",
              streamUrl: rawStream,
              thumbnailUrl: t.bannerUrl || "",
              isLive: isLive,
              phase: t.status === "live" ? "🔴 Live Match in Arena" : (hasCustomStream ? "🔴 Active Stream Broadcast" : "Match Kickoff Standby"),
              prizePool: t.prizePool || 0,
              isReal: true,
            };

            if (hasCustomStream || t.status === "live" || t.isLiveStreamed) {
              realLiveStreams.push(streamItem);
            } else {
              realFixtures.push(streamItem);
            }
          });

          // Strictly use real tournaments from the database; prioritize those with streams or live status
          const combined = realLiveStreams.length > 0 ? realLiveStreams : realFixtures;
          const unique = combined.filter((s, idx, arr) => arr.findIndex((x) => x.id === s.id) === idx);
          setStreams(unique);

          // Preserve selected stream if requested by props/URL or select first available real tournament
          if (unique.length > 0) {
            setSelectedStreamId((prev) => {
              const prevMatch = unique.find((x) => x.id === prev || x.tournamentId === prev);
              if (prevMatch) return prevMatch.id;
              if (externalSelectedId) {
                const extMatch = unique.find((x) => x.id === externalSelectedId || x.tournamentId === externalSelectedId);
                if (extMatch) return extMatch.id;
              }
              return unique[0].id;
            });
          }
        } else {
          setStreams([]);
        }
      })
      .catch(() => {
        setStreams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredStreams = useMemo(() => {
    if (filterGame === "all") return streams;
    return streams.filter((s) => s.game === filterGame);
  }, [streams, filterGame]);

  const activeStream =
    streams.find((s) => s.id === selectedStreamId) || filteredStreams[0] || streams[0];

  const liveBroadcastCount = useMemo(() => {
    return streams.filter((s) => s.isLive).length;
  }, [streams]);

  const handleReaction = (type: "fire" | "trophy" | "thunder" | "headshot") => {
    setHypeCounts((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  const isEmbeddable = activeStream?.embedUrl && activeStream.embedUrl.includes("/embed/");

  if (loading) {
    return <StreamHubSkeleton />;
  }

  // If no tournaments are currently in the database
  if (streams.length === 0) {
    return (
      <section 
        id="live-streams"
        aria-labelledby="livestream-heading"
        className="w-full py-12 sm:py-16 bg-slate-900 text-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Radio className="h-3.5 w-3.5 text-emerald-400" />
                <span>Broadcast Hub</span>
              </div>
              <h2 
                id="livestream-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight"
              >
                Esports Stadium Broadcast
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                Watch official BGMI and Free Fire MAX tournaments with synchronized spectator feeds and real-time lobby action.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/60 p-10 sm:p-14 text-center space-y-4 max-w-2xl mx-auto">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
              <Radio className="h-7 w-7 text-emerald-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">No Live Broadcasts Active</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
              There are currently no active tournament broadcasts streaming right now. Organizers can configure stream links directly when scheduling tournaments.
            </p>
            <div className="pt-2">
              <Link
                href="/tournaments"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                <span>Browse Tournaments</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="live-streams"
      aria-labelledby="livestream-heading"
      className="w-full py-12 sm:py-16 bg-slate-900 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping mr-1" />
              <span>Official Broadcast Hub</span>
            </div>
            <h2 
              id="livestream-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight"
            >
              Live Esports Stadium
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Watch sanctioned BGMI and Free Fire MAX tournaments with synchronized spectator feeds, live lobby action, and real-time hype reactions.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono">
            <Radio className="h-4 w-4 text-rose-400 animate-pulse" />
            <span className="text-slate-300">
              {liveBroadcastCount} {liveBroadcastCount === 1 ? "Broadcast" : "Broadcasts"} Live Now
            </span>
          </div>
        </div>

        {/* Main Broadcast Viewer & Channel Switcher */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Video Stream Container (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl group">
              {/* Broadcast Header Overlay */}
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-white text-xs font-mono font-bold tracking-wider shadow-md ${
                    activeStream?.isLive ? "bg-rose-600" : "bg-slate-700"
                  }`}>
                    {activeStream?.isLive && <span className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                    {activeStream?.isLive ? "LIVE BROADCAST" : "BROADCAST STANDBY"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-white text-xs font-mono border border-white/10">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{activeStream?.viewerCount || "LIVE"}</span>
                  </span>
                  {activeStream?.isReal && (
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase">
                      Official Tournament
                    </span>
                  )}
                </div>

                <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                  {formatINR(activeStream?.prizePool || 0)} Prize Pool
                </span>
              </div>

              {/* Video Player / Embed */}
              {isEmbeddable ? (
                <iframe
                  src={activeStream.embedUrl}
                  title={activeStream.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950">
                  {activeStream?.thumbnailUrl ? (
                    <img
                      src={activeStream.thumbnailUrl}
                      alt={activeStream.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 opacity-60" />
                  )}
                  <div className="relative z-10 space-y-3 max-w-md">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-lg">
                      <YoutubeIcon className="h-8 w-8 fill-red-500" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {activeStream?.title}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Live spectator and broadcast link configured for this tournament fixture.
                    </p>
                    {activeStream?.streamUrl && (
                      <a
                        href={activeStream.streamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md"
                      >
                        <YoutubeIcon className="h-4 w-4 fill-white" />
                        <span>Watch on YouTube</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Ticker Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 z-20 flex flex-wrap items-end justify-between gap-3 pointer-events-none">
                <div>
                  <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    {activeStream?.phase}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                    {activeStream?.title}
                  </h3>
                  <div className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>Broadcast: <strong>{activeStream?.casters}</strong></span>
                  </div>
                </div>

                <div className="pointer-events-auto flex items-center gap-2">
                  {activeStream?.streamUrl && (
                    <a
                      href={activeStream.streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-500 transition-colors shadow-sm"
                    >
                      <YoutubeIcon className="h-3.5 w-3.5 fill-white" />
                      <span>YouTube Stream</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {activeStream?.tournamentId && (
                    <Link
                      href={`/tournaments/${activeStream.tournamentId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-sm"
                    >
                      <span>Tournament Lobby</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Live Interactive Hype Reactions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-slate-200">Live Reactions:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleReaction("fire")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-mono font-bold transition-transform active:scale-95 cursor-pointer text-amber-400"
                >
                  <span>🔥</span>
                  <span>{hypeCounts.fire.toLocaleString()}</span>
                </button>

                <button
                  onClick={() => handleReaction("trophy")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-mono font-bold transition-transform active:scale-95 cursor-pointer text-yellow-400"
                >
                  <span>🏆</span>
                  <span>{hypeCounts.trophy.toLocaleString()}</span>
                </button>

                <button
                  onClick={() => handleReaction("thunder")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-mono font-bold transition-transform active:scale-95 cursor-pointer text-cyan-400"
                >
                  <span>⚡</span>
                  <span>{hypeCounts.thunder.toLocaleString()}</span>
                </button>

                <button
                  onClick={() => handleReaction("headshot")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-mono font-bold transition-transform active:scale-95 cursor-pointer text-rose-400"
                >
                  <span>🎯</span>
                  <span>{hypeCounts.headshot.toLocaleString()}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Multi-Channel Switcher Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-slate-400 uppercase tracking-wider">
              <span>Match Broadcast Channels</span>
              <span className="text-emerald-400 font-bold">{filteredStreams.length} {filteredStreams.length === 1 ? "Channel" : "Channels"}</span>
            </div>

            {/* Game Filter Pills */}
            <div className="flex items-center gap-1.5 pb-1">
              <button
                type="button"
                onClick={() => setFilterGame("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                  filterGame === "all" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                All ({streams.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterGame("bgmi")}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                  filterGame === "bgmi" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                BGMI
              </button>
              <button
                type="button"
                onClick={() => setFilterGame("freefire")}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                  filterGame === "freefire" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Free Fire
              </button>
            </div>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredStreams.map((stream) => {
                const isSelected = stream.id === activeStream?.id;
                const hasStreamLink = Boolean(stream.streamUrl);

                return (
                  <button
                    key={stream.id}
                    onClick={() => setSelectedStreamId(stream.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 group ${
                      isSelected
                        ? "bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/20"
                        : "bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Thumbnail preview */}
                    <div className="relative h-16 w-24 shrink-0 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
                      {stream.thumbnailUrl ? (
                        <img
                          src={stream.thumbnailUrl}
                          alt={stream.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-800 flex items-center justify-center text-slate-500">
                          <Radio className="h-5 w-5 text-slate-400" />
                        </div>
                      )}
                      {hasStreamLink ? (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-mono font-bold flex items-center gap-1 shadow-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                          <span>LIVE</span>
                        </div>
                      ) : stream.isLive ? (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-mono font-bold">
                          READY
                        </div>
                      ) : (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-300 text-[9px] font-mono">
                          STANDBY
                        </div>
                      )}
                    </div>

                    {/* Stream Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                          {stream.game === "bgmi" ? "BGMI" : "Free Fire MAX"}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatINR(stream.prizePool)}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {stream.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {stream.subtitle || `Broadcast: ${stream.casters}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Broadcast Guarantee Box */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Anti-Cheat Spectator Delay</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                All tournament streams operate on an enforced 3-minute broadcast delay to prevent screen-sniping and uphold competitive tournament integrity.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
