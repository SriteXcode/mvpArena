"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Tv, 
  Users, 
  Flame, 
  Trophy, 
  Zap, 
  Crosshair, 
  Radio, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Volume2,
  Share2,
  Sparkles
} from "lucide-react";
import { MOCK_LIVE_STREAMS, MockLiveStream } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function LiveStreamHub() {
  const [streams] = useState<MockLiveStream[]>(MOCK_LIVE_STREAMS);
  const [selectedStreamId, setSelectedStreamId] = useState<string>(
    MOCK_LIVE_STREAMS[0]?.id || "stream_bgmi_pro"
  );

  // Live emoji hype reactions state
  const [hypeCounts, setHypeCounts] = useState<{ [key: string]: number }>({
    fire: 4210,
    trophy: 2180,
    thunder: 3640,
    headshot: 1890,
  });

  const activeStream =
    streams.find((s) => s.id === selectedStreamId) || streams[0];

  const handleReaction = (type: "fire" | "trophy" | "thunder" | "headshot") => {
    setHypeCounts((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

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
              Watch sanctioned BGMI and Free Fire MAX tournaments casted by top casters with live spectator feeds and real-time hype reactions.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono">
            <Radio className="h-4 w-4 text-rose-400 animate-pulse" />
            <span className="text-slate-300">2 Broadcasts Live Now</span>
            <span className="px-2 py-0.5 rounded bg-slate-700 text-emerald-400 font-bold">
              52.9K Watching
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
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-600 text-white text-xs font-mono font-bold tracking-wider shadow-md">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-white text-xs font-mono border border-white/10">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{activeStream.viewerCount} Viewers</span>
                  </span>
                </div>

                <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                  {formatINR(activeStream.prizePool)} Prize Pool
                </span>
              </div>

              {/* Video Player / Embed */}
              <iframe
                src={activeStream.embedUrl}
                title={activeStream.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* Bottom Ticker Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 z-20 flex flex-wrap items-end justify-between gap-3 pointer-events-none">
                <div>
                  <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    {activeStream.phase}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                    {activeStream.title}
                  </h3>
                  <div className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>Casters: <strong>{activeStream.casters}</strong></span>
                  </div>
                </div>

                <div className="pointer-events-auto">
                  <Link
                    href={`/tournaments/${activeStream.tournamentId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-sm"
                  >
                    <span>Tournament Lobby</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Live Interactive Hype Reactions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-slate-200">Tap Reactions:</span>
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
              <span>Select Match Broadcast</span>
              <span className="text-emerald-400 font-bold">{streams.length} Channels</span>
            </div>

            <div className="space-y-2.5">
              {streams.map((stream) => {
                const isSelected = stream.id === activeStream.id;

                return (
                  <button
                    key={stream.id}
                    onClick={() => setSelectedStreamId(stream.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 group ${
                      isSelected
                        ? "bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/20"
                        : "bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Thumbnail preview */}
                    <div className="relative h-16 w-24 shrink-0 rounded-lg overflow-hidden bg-slate-700">
                      <img
                        src={stream.thumbnailUrl}
                        alt={stream.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      {stream.isLive ? (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-mono font-bold">
                          LIVE
                        </div>
                      ) : (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-300 text-[9px] font-mono">
                          SOON
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
                          {stream.viewerCount}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {stream.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        Caster: {stream.casters}
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
