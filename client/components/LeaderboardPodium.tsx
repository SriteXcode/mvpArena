import React from "react";
import { Trophy, Crosshair, Medal } from "lucide-react";
import { MockLeaderboardTeam } from "@/lib/mockData";

interface LeaderboardPodiumProps {
  teams: MockLeaderboardTeam[];
}

export default function LeaderboardPodium({ teams }: LeaderboardPodiumProps) {
  if (teams.length < 3) return null;

  const first = teams[0];
  const second = teams[1];
  const third = teams[2];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto pt-2 pb-6">
      {/* 2nd Place (Silver) */}
      <div className="order-2 md:order-1 flex flex-col items-center">
        <div className="relative mb-2">
          <div className="relative h-16 w-16 rounded-xl border-2 border-slate-300 overflow-hidden bg-slate-100 shadow-sm">
            <img
              src={second.avatar}
              alt={second.teamName}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-800 border border-slate-300 text-[10px] font-bold px-2 py-0.2 rounded font-mono">
            #02
          </span>
        </div>

        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider font-semibold">
            Silver Finalist
          </span>
          <h4 className="text-sm font-bold text-slate-900 mt-0.5 truncate">{second.teamName}</h4>
          <span className="text-[11px] text-slate-500 font-mono block mb-3">{second.captainTag}</span>

          <div className="flex items-center justify-around border-t border-slate-100 pt-2 text-xs">
            <div>
              <span className="text-[9px] text-slate-500 font-mono block">ELIMS</span>
              <span className="font-mono font-semibold text-slate-800">{second.eliminations}</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono block">POINTS</span>
              <span className="font-mono font-bold text-slate-900">{second.totalPoints}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1st Place (Gold Champion) */}
      <div className="order-1 md:order-2 flex flex-col items-center -translate-y-2">
        <div className="relative mb-2">
          <div className="relative h-20 w-20 rounded-xl border-2 border-amber-400 overflow-hidden bg-amber-50 shadow-md">
            <img
              src={first.avatar}
              alt={first.teamName}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-2.5 py-0.2 rounded font-mono uppercase tracking-wider">
            #01 CHAMPION
          </span>
        </div>

        <div className="w-full rounded-xl border border-amber-300 bg-gradient-to-b from-amber-50/70 to-white p-5 text-center shadow-md">
          <span className="text-[10px] font-mono uppercase text-amber-600 tracking-widest font-bold">
            Tournament Champion
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5 truncate">{first.teamName}</h3>
          <span className="text-xs text-emerald-600 font-mono block mb-3">{first.captainTag}</span>

          <div className="flex items-center justify-around border-t border-amber-200/60 pt-2 text-xs bg-white rounded-lg p-2 border border-amber-100 shadow-xs">
            <div>
              <span className="text-[9px] text-slate-500 font-mono block">ELIMS</span>
              <span className="font-mono font-bold text-rose-600">{first.eliminations}</span>
            </div>
            <div className="h-5 w-px bg-slate-200"></div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono block">TOTAL PTS</span>
              <span className="font-mono font-bold text-amber-600 text-sm">
                {first.totalPoints}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3rd Place (Bronze) */}
      <div className="order-3 flex flex-col items-center">
        <div className="relative mb-2">
          <div className="relative h-16 w-16 rounded-xl border-2 border-orange-300 overflow-hidden bg-orange-50 shadow-sm">
            <img
              src={third.avatar}
              alt={third.teamName}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-800 border border-orange-300 text-[10px] font-bold px-2 py-0.2 rounded font-mono">
            #03
          </span>
        </div>

        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <span className="text-[10px] font-mono uppercase text-orange-600 tracking-wider font-semibold">
            Bronze 3rd
          </span>
          <h4 className="text-sm font-bold text-slate-900 mt-0.5 truncate">{third.teamName}</h4>
          <span className="text-[11px] text-slate-500 font-mono block mb-3">{third.captainTag}</span>

          <div className="flex items-center justify-around border-t border-slate-100 pt-2 text-xs">
            <div>
              <span className="text-[9px] text-slate-500 font-mono block">ELIMS</span>
              <span className="font-mono font-semibold text-slate-800">{third.eliminations}</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono block">POINTS</span>
              <span className="font-mono font-bold text-orange-600">{third.totalPoints}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
