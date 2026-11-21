import React from "react";
import Link from "next/link";
import { Users, Clock, ShieldCheck, ArrowUpRight } from "lucide-react";
import { MockTournament } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

interface TournamentCardProps {
  tournament: MockTournament;
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const isBGMI = tournament.game === "bgmi";
  const slotPercentage = Math.round((tournament.registeredSlots / tournament.maxSlots) * 100);

  return (
    <div className="group relative flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-200 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img
          src={tournament.bannerUrl}
          alt={tournament.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
              isBGMI
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs"
                : "bg-rose-50 text-rose-800 border border-rose-200 shadow-xs"
            }`}
          >
            {isBGMI ? "BGMI" : "FREE FIRE MAX"}
          </span>

          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/95 border border-slate-200 text-[10px] font-mono font-medium text-slate-700 uppercase shadow-xs">
            {tournament.format}
          </span>
        </div>

        {/* Entry Tag */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {tournament.isLiveStreamed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
              LIVE
            </span>
          )}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              tournament.entryFee === 0
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs"
                : "bg-white/95 text-slate-900 border border-slate-200 shadow-xs"
            }`}
          >
            {tournament.entryFee === 0 ? "FREE ENTRY" : `₹${tournament.entryFee}`}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Organizer & Feature Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 min-w-0">
            <span className="truncate">{tournament.organizerName}</span>
            {tournament.organizerVerified && (
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
            )}
          </div>

          {tournament.tag === "weekend_mega" && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
              🔥 Weekend Mega
            </span>
          )}
          {tournament.tag === "mega_prize" && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 shrink-0">
              💎 Mega Prize
            </span>
          )}
          {tournament.tag === "daily" && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              📅 Daily
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1 mb-3">
          {tournament.title}
        </h3>

        {/* Prize Pool Panel */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 mb-3">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">
              Prize Pool
            </span>
            <span className="text-sm font-bold text-amber-600 font-mono">
              {formatINR(tournament.prizePool)}
            </span>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">
              1st Place
            </span>
            <span className="text-xs font-semibold text-slate-700 font-mono">
              {formatINR(tournament.prizePool * 0.5)}
            </span>
          </div>
        </div>

        {/* Slots Metric */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 flex items-center gap-1">
              <Users className="h-3 w-3 text-slate-400" />
              Slots
            </span>
            <span className="font-mono text-xs text-slate-800 font-medium">
              {tournament.registeredSlots}/{tournament.maxSlots}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                slotPercentage > 85 ? "bg-rose-500" : "bg-emerald-500"
              }`}
              style={{ width: `${slotPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <Clock className="h-3 w-3" />
            <span>{tournament.tournamentDate}</span>
          </div>

          <Link
            href={`/tournaments/${tournament.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-white hover:bg-emerald-600 hover:border-emerald-600 transition-all shadow-xs"
          >
            <span>View Event</span>
            <ArrowUpRight className="h-3 w-3 opacity-80" />
          </Link>
        </div>
      </div>
    </div>
  );
}
