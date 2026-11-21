"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Gamepad2, 
  ExternalLink,
  Users
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

const REGISTERED_FIXTURES: RegisteredEvent[] = [
  {
    id: "reg_01",
    tournamentId: "tour_bgmi_01",
    title: "BGMI Pro Scrims Season 4",
    game: "bgmi",
    format: "Squads (4v4)",
    teamName: "Team SoulFire",
    assignedSlot: 14,
    scheduledTime: "Today at 8:00 PM IST",
    startsInText: "COMMENCING IN 18 MINS",
    isNearest: true,
    credentialsAvailable: true,
    matchLobbyUrl: "/matches/match_01",
    tournamentUrl: "/tournaments/tour_bgmi_01",
    prizePool: "₹15,000",
    mapName: "Erangel",
  },
  {
    id: "reg_02",
    tournamentId: "tour_ff_01",
    title: "Free Fire MAX All-Star Cup",
    game: "freefire",
    format: "Clash Squad (4v4)",
    teamName: "SoulFire FF",
    assignedSlot: 8,
    scheduledTime: "Tomorrow at 7:00 PM IST",
    startsInText: "STARTS IN 24H",
    isNearest: false,
    credentialsAvailable: false,
    matchLobbyUrl: "/matches/match_01",
    tournamentUrl: "/tournaments/tour_ff_01",
    prizePool: "₹5,000",
    mapName: "Bermuda",
  },
  {
    id: "reg_03",
    tournamentId: "tour_bgmi_02",
    title: "BGMI Underdog Championship #12",
    game: "bgmi",
    format: "Squads (4v4)",
    teamName: "Team SoulFire",
    assignedSlot: 3,
    scheduledTime: "Sunday at 5:00 PM IST",
    startsInText: "STARTS IN 2 DAYS",
    isNearest: false,
    credentialsAvailable: false,
    matchLobbyUrl: "/matches/match_01",
    tournamentUrl: "/tournaments",
    prizePool: "₹10,000",
    mapName: "Miramar",
  },
  {
    id: "reg_04",
    tournamentId: "tour_ff_02",
    title: "Free Fire Solo Survival #05",
    game: "freefire",
    format: "Solo Battle Royale",
    teamName: "Viper (Solo)",
    assignedSlot: 22,
    scheduledTime: "Monday at 6:00 PM IST",
    startsInText: "STARTS IN 3 DAYS",
    isNearest: false,
    credentialsAvailable: false,
    matchLobbyUrl: "/matches/match_01",
    tournamentUrl: "/tournaments",
    prizePool: "₹3,000",
    mapName: "Purgatory",
  },
];

export default function RegisteredEventsList() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -330 : 330;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header with Priority indicator and horizontal scroll buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Enrolled Fixtures &amp; Match Schedule
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-semibold">
              {REGISTERED_FIXTURES.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fixtures prioritized by nearest start time. Scroll horizontally to inspect upcoming tournament lobbies.
          </p>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Row along X-Axis (Scrollbar Hidden) */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x no-scrollbar select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {REGISTERED_FIXTURES.map((event) => {
          const isBGMI = event.game === "bgmi";
          return (
            <div
              key={event.id}
              className={`min-w-[290px] sm:min-w-[320px] max-w-[330px] shrink-0 snap-start rounded-xl border p-4 flex flex-col justify-between transition-all ${
                event.isNearest
                  ? "border-emerald-300 ring-2 ring-emerald-500/10 bg-gradient-to-b from-emerald-50/40 via-white to-white shadow-sm"
                  : "border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-white shadow-xs"
              }`}
            >
              <div className="space-y-3">
                {/* Priority Status Header */}
                <div className="flex items-center justify-between gap-2">
                  {event.isNearest ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold tracking-wider uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      {event.startsInText}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 font-semibold uppercase">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {event.startsInText}
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                      isBGMI
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {isBGMI ? "BGMI" : "FREE FIRE"}
                  </span>
                </div>

                {/* Fixture Title */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight line-clamp-1">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{event.format}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-600">{event.mapName}</span>
                  </div>
                </div>

                {/* Team & Slot Allocation */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 space-y-1.5 text-xs shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      Roster Lineup:
                    </span>
                    <span className="font-semibold text-slate-900 font-mono text-[11px]">
                      {event.teamName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Gamepad2 className="h-3.5 w-3.5 text-slate-400" />
                      Assigned Slot:
                    </span>
                    <span className="font-bold text-emerald-700 font-mono text-xs">
                      Slot #{event.assignedSlot}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Schedule:
                    </span>
                    <span className="font-mono text-[11px] text-slate-700">
                      {event.scheduledTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-1">
                {event.credentialsAvailable ? (
                  <Link
                    href={event.matchLobbyUrl}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <span>Enter Match Lobby</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <Link
                    href={event.tournamentUrl}
                    className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <span>View Bracket &amp; Rules</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
