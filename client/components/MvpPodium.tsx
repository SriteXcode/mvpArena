"use client";

import React from "react";
import { Flame, Trophy, Crosshair, Sparkles, ShieldCheck } from "lucide-react";

export interface MvpPlayer {
  rank: number;
  gameId: string;
  inGameName: string;
  teamName: string;
  game: string;
  totalKills: number;
  matchesPlayed: number;
  bestPlacement: number;
  avgKills: number;
  avatar: string;
  badge?: "gold" | "silver" | "bronze";
}

interface MvpPodiumProps {
  players: MvpPlayer[];
  timeframeLabel?: string;
}

export default function MvpPodium({ players, timeframeLabel = "Daily" }: MvpPodiumProps) {
  if (players.length === 0) return null;

  const first = players[0];
  const second = players.length > 1 ? players[1] : null;
  const third = players.length > 2 ? players[2] : null;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-mono font-semibold">
          <Flame className="h-3 w-3 text-rose-600 animate-pulse" />
          <span>TOP 3 MVPs • {timeframeLabel.toUpperCase()} APEX FRAGGERS</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto pt-2 pb-4">
        {/* 2nd Place Fragger (Silver) */}
        {second && (
          <div className="order-2 md:order-1 flex flex-col items-center">
            <div className="relative mb-2">
              <div className="relative h-16 w-16 rounded-xl border-2 border-slate-300 overflow-hidden bg-slate-100 shadow-sm">
                <img
                  src={second.avatar}
                  alt={second.inGameName}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-800 border border-slate-300 text-[10px] font-bold px-2 py-0.2 rounded font-mono">
                #02 FRAGGER
              </span>
            </div>

            <div className="w-full rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider font-semibold">
                Silver Marksman
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5 truncate">{second.inGameName}</h4>
              <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 my-1">
                <span>UID:</span>
                <span className="font-bold">{second.gameId}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mb-2">{second.teamName}</span>

              <div className="flex items-center justify-around border-t border-slate-100 pt-2 text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 font-mono block">KILLS</span>
                  <span className="font-mono font-bold text-rose-600 flex items-center justify-center gap-0.5">
                    <Flame className="h-3 w-3 text-rose-500" />
                    {second.totalKills}
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-200"></div>
                <div>
                  <span className="text-[9px] text-slate-500 font-mono block">AVG / MATCH</span>
                  <span className="font-mono font-bold text-slate-900">{second.avgKills}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1st Place MVP (Gold Champion) */}
        {first && (
          <div className="order-1 md:order-2 flex flex-col items-center -translate-y-2">
            <div className="relative mb-2">
              <div className="relative h-20 w-20 rounded-xl border-2 border-amber-400 overflow-hidden bg-amber-50 shadow-md">
                <img
                  src={first.avatar}
                  alt={first.inGameName}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-2.5 py-0.2 rounded font-mono uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Trophy className="h-2.5 w-2.5" />
                #01 APEX MVP
              </span>
            </div>

            <div className="w-full rounded-xl border border-amber-300 bg-gradient-to-b from-amber-50/70 to-white p-5 text-center shadow-md">
              <span className="text-[10px] font-mono uppercase text-amber-600 tracking-widest font-bold flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" />
                Overall MVP Fragger
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5 truncate">{first.inGameName}</h3>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-300 my-1.5 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-semibold">UID:</span>
                <span className="font-bold">{first.gameId}</span>
              </div>
              <span className="text-xs text-slate-600 font-mono block mb-3">{first.teamName}</span>

              <div className="flex items-center justify-around border-t border-amber-200/60 pt-2 text-xs bg-white rounded-lg p-2 border border-amber-100 shadow-xs">
                <div>
                  <span className="text-[9px] text-slate-500 font-mono block">MOST KILLS</span>
                  <span className="font-mono font-black text-rose-600 text-sm flex items-center justify-center gap-1">
                    <Flame className="h-4 w-4 text-rose-500 animate-bounce" />
                    {first.totalKills}
                  </span>
                </div>
                <div className="h-5 w-px bg-slate-200"></div>
                <div>
                  <span className="text-[9px] text-slate-500 font-mono block">AVG / MATCH</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{first.avgKills}</span>
                </div>
                <div className="h-5 w-px bg-slate-200"></div>
                <div>
                  <span className="text-[9px] text-slate-500 font-mono block">MATCHES</span>
                  <span className="font-mono font-semibold text-slate-700">{first.matchesPlayed}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3rd Place Fragger (Bronze) */}
        {third && (
          <div className="order-3 flex flex-col items-center">
            <div className="relative mb-2">
              <div className="relative h-16 w-16 rounded-xl border-2 border-amber-600/60 overflow-hidden bg-amber-50/50 shadow-sm">
                <img
                  src={third.avatar}
                  alt={third.inGameName}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-800 text-amber-100 text-[10px] font-bold px-2 py-0.2 rounded font-mono">
                #03 FRAGGER
              </span>
            </div>

            <div className="w-full rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <span className="text-[10px] font-mono uppercase text-amber-700 tracking-wider font-semibold">
                Bronze Striker
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5 truncate">{third.inGameName}</h4>
              <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 my-1">
                <span>UID:</span>
                <span className="font-bold">{third.gameId}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mb-2">{third.teamName}</span>

              <div className="flex items-center justify-around border-t border-slate-100 pt-2 text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 font-mono block">KILLS</span>
                  <span className="font-mono font-bold text-rose-600 flex items-center justify-center gap-0.5">
                    <Flame className="h-3 w-3 text-rose-500" />
                    {third.totalKills}
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-200"></div>
                <div>
                  <span className="text-[9px] text-slate-500 font-mono block">AVG / MATCH</span>
                  <span className="font-mono font-bold text-slate-900">{third.avgKills}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
