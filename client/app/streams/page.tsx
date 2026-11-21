"use client";

import React from "react";
import Link from "next/link";
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
  ExternalLink
} from "lucide-react";
import LiveStreamHub from "@/components/LiveStreamHub";

export default function StreamsPage() {
  const upcomingBroadcasts = [
    {
      id: "up_1",
      title: "BGMI Daily Prime Scrims #52",
      time: "Today, 8:00 PM IST",
      casters: "Ocean Sharma & Mayavi",
      tournament: "BGMI Daily Scrims",
      prize: "₹12,000",
      game: "BGMI",
    },
    {
      id: "up_2",
      title: "Free Fire Weekend All-Day Mega Contest - Grand Finals",
      time: "Saturday, 11:00 AM IST",
      casters: "Aura Gaming & Pahadi",
      tournament: "Weekend Mega Marathon",
      prize: "₹2,50,000",
      game: "Free Fire MAX",
    },
    {
      id: "up_3",
      title: "PlayArena Grand National Championship (₹5 Lakhs)",
      time: "Sunday, 2:00 PM IST",
      casters: "Kratos & Ghatak",
      tournament: "National Invitational",
      prize: "₹5,00,000",
      game: "BGMI",
    },
  ];

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
              2 Live Broadcasts
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Live Streaming Hub */}
      <LiveStreamHub />

      {/* Broadcast Schedule & Caster Desk */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Upcoming Schedule (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider font-mono text-emerald-400">
                <Calendar className="h-4 w-4" />
                <span>Upcoming Stream Schedule</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">IST Timings</span>
            </div>

            <div className="space-y-3">
              {upcomingBroadcasts.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400">
                        {b.game}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{b.time}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{b.title}</h4>
                    <p className="text-xs text-slate-400">
                      Casters: <strong className="text-slate-300">{b.casters}</strong> • Prize Pool: <strong className="text-emerald-400">{b.prize}</strong>
                    </p>
                  </div>

                  <Link
                    href="/tournaments"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 self-start sm:self-center transition-colors"
                  >
                    <span>View Bracket</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Broadcast Integrity & Fair Play Desk (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white font-mono uppercase tracking-wider">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span>Broadcast Fair-Play Standards</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  🔒 <strong>Enforced Spectator Delay:</strong> All official broadcasts implement an enforced 180-second stream delay to eliminate stream-sniping and protect in-game squad positioning.
                </p>
                <p>
                  🎙️ <strong>Sanctioned Casters:</strong> Commentary is provided by vetted esports casters with direct observer lobby credentials authorized by tournament organizers.
                </p>
                <p>
                  ⚡ <strong>Auto Result Synchronization:</strong> Match end results displayed on stream are matched directly against referee screenshot audits before leaderboards become official.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
