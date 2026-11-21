"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Flame, 
  Crosshair, 
  Share2, 
  ShieldCheck, 
  Trophy,
  Award
} from "lucide-react";
import GameIdsVault from "@/components/GameIdsVault";
import RegisteredEventsList from "@/components/RegisteredEventsList";
import ShareInviteModal from "@/components/ShareInviteModal";
import AchievementsHub from "@/components/AchievementsHub";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const toast = useToast();
  const [user, setUser] = useState<any>({
    name: authUser?.name || "Athlete Profile",
    username: authUser?.username || "player",
    whatsappNumber: "",
    whatsappAlertsEnabled: true,
    gameProfiles: [],
    walletBalance: 0,
    avatarUrl: authUser?.avatarUrl || "/avatar.png",
    referralCode: "ARENA2026",
    followersCount: 12,
    followingCount: 8,
    stats: {
      tournamentsPlayed: 4,
      matchesPlayed: 12,
      totalEliminations: 38,
      winCount: 2,
      bestRank: 1,
    },
  });
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setUser((prev: any) => ({
            ...prev,
            name: res.data.name || prev.name,
            username: res.data.username || prev.username,
            whatsappNumber: res.data.whatsappNumber || prev.whatsappNumber,
            whatsappAlertsEnabled: res.data.whatsappAlertsEnabled ?? prev.whatsappAlertsEnabled,
            gameProfiles: res.data.gameProfiles || prev.gameProfiles,
            walletBalance: res.data.walletBalance ?? prev.walletBalance,
          }));
        }
      })
      .catch(() => {
        toast.error("Failed to load profile details.", "Connection Error");
      });
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Profile Header */}
      <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-slate-100 via-emerald-50 to-slate-100 border-b border-slate-200"></div>

        <div className="relative px-5 pb-5 pt-0 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 sm:-mt-14 gap-3 mb-5">
            <div className="flex items-end gap-3.5">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl border-2 border-white shadow-md overflow-hidden bg-white">
                <Image
                  src={user.avatarUrl || "/avatar.png"}
                  alt={user.name || "User Avatar"}
                  fill
                  sizes="96px"
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col mb-0.5">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                    {user.name}
                  </h1>
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-xs font-mono text-slate-500">
                  @{user.username}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Competitive Participant • Tier 1 Division
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 shadow-xs transition-all"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share Athlete Dossier</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                Followers
              </span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {user.followersCount.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                Following
              </span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {user.followingCount}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                Championship Victories
              </span>
              <span className="text-base font-bold text-amber-600 font-mono">
                {user.stats.winCount} Titles
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                Eliminations
              </span>
              <span className="text-base font-bold text-rose-600 font-mono">
                {user.stats.totalEliminations} Confirmed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Enrolled Events, Game IDs Vault & Notifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Registered Events List - Prioritized by Nearest Match & Horizontal Scrollable */}
          <RegisteredEventsList />

          <GameIdsVault />
        </div>

        {/* Right Column: Career Statistics */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Career Performance
              </h4>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Audited
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Tournaments Contested */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-amber-100/70 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                    <Trophy className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    Tournaments Contested
                  </span>
                </div>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-md text-xs">
                  {user.stats.tournamentsPlayed}
                </span>
              </div>

              {/* Total Scrim Matches */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-emerald-100/70 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                    <Flame className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    Total Scrim Matches
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md text-xs">
                  {user.stats.matchesPlayed}
                </span>
              </div>

              {/* Total Eliminations */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-rose-100/70 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                    <Crosshair className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    Total Eliminations
                  </span>
                </div>
                <span className="font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-md text-xs">
                  {user.stats.totalEliminations}
                </span>
              </div>

              {/* Peak Standing */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-sky-100/70 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    Peak Standing
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md text-xs">
                  #01 Champion
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements & Milestone Rewards Section */}
      <div id="achievements" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-emerald-600 font-bold tracking-wider mb-0.5">
              <Award className="h-4 w-4" />
              <span>Player Milestones & Bounties</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Rewards on Achievements & Milestones
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            Instant UPI Cash Credits
          </span>
        </div>

        <AchievementsHub />
      </div>

      <ShareInviteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}
