"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Gamepad2, 
  ExternalLink,
  Users,
  Trophy,
  Loader2
} from "lucide-react";

export interface RegisteredEvent {
  id: string;
  tournamentId: string;
  title: string;
  game: "bgmi" | "freefire";
  format: string;
  teamName: string;
  assignedSlot: number;
  scheduledTime: string;
  startsInText: string;
  isNearest: boolean;
  credentialsAvailable: boolean;
  matchLobbyUrl: string;
  tournamentUrl: string;
  prizePool: string;
  mapName: string;
}

export default function RegisteredEventsList() {
  const [fixtures, setFixtures] = useState<RegisteredEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile/registrations")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setFixtures(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin mx-auto text-emerald-600 mb-2" />
        Loading your registered tournament fixtures...
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm space-y-3">
        <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">No Enrolled Tournaments Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            You have not registered for any upcoming esports scrims. Browse open qualifiers and claim your squad slot.
          </p>
        </div>
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-sm"
        >
          <span>Explore Tournaments &rarr;</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-emerald-600 font-bold tracking-wider mb-0.5">
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>Enrolled Scrims &amp; Match Lobbies</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Registered Tournaments ({fixtures.length})
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fixtures.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                  {item.game.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-600">
                  Slot #{item.assignedSlot}
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <Users className="h-3 w-3" />
                <span>Squad: <strong className="text-slate-800 font-semibold">{item.teamName}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <Calendar className="h-3 w-3" />
                <span>{item.scheduledTime}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 font-mono">{item.prizePool}</span>
              <Link
                href={item.credentialsAvailable ? item.matchLobbyUrl : item.tournamentUrl}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                <span>{item.credentialsAvailable ? "Match Lobby" : "Details"}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
