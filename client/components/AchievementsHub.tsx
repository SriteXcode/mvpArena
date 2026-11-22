"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Award, 
  Flame, 
  Crosshair, 
  Trophy, 
  Zap, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Check
} from "lucide-react";
import { MOCK_ACHIEVEMENTS, MockAchievement } from "@/lib/mockData";
import { useToast } from "@/lib/context/ToastContext";

interface AchievementsHubProps {
  userStats?: {
    tournamentsPlayed?: number;
    matchesPlayed?: number;
    totalEliminations?: number;
    winCount?: number;
    bestRank?: number;
    squadMembersCount?: number;
  };
}

export default function AchievementsHub({ userStats }: AchievementsHubProps) {
  const toast = useToast();
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | "combat" | "tournament" | "squad" | "weekend">("all");
  const [claimedRewardMessage, setClaimedRewardMessage] = useState<string | null>(null);

  // Load claimed milestone IDs from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem("playarena_claimed_milestones");
      if (saved) {
        setClaimedIds(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Dynamically compute milestone progression from real athlete stats
  const achievements = useMemo<MockAchievement[]>(() => {
    const kills = userStats?.totalEliminations || 0;
    const tourneys = userStats?.tournamentsPlayed || 0;
    const wins = userStats?.winCount || 0;
    const squad = userStats?.squadMembersCount || 0;

    return MOCK_ACHIEVEMENTS.map((ach) => {
      let currentValue = 0;
      if (ach.id === "ach_01" || ach.id === "ach_02" || ach.id === "ach_03") {
        currentValue = kills;
      } else if (ach.id === "ach_04") {
        currentValue = tourneys;
      } else if (ach.id === "ach_05") {
        currentValue = wins;
      } else if (ach.id === "ach_06") {
        currentValue = 0; // Weekend mega stages
      } else if (ach.id === "ach_07") {
        currentValue = 0; // Daily consecutive scrim streak
      } else if (ach.id === "ach_08") {
        currentValue = squad;
      }

      const isUnlocked = ach.targetValue > 0 && currentValue >= ach.targetValue;
      const isClaimed = isUnlocked && claimedIds.includes(ach.id);

      return {
        ...ach,
        currentValue,
        isUnlocked,
        isClaimed,
      };
    });
  }, [userStats, claimedIds]);

  const filteredAchievements = achievements.filter((a) => {
    if (activeCategory === "all") return true;
    return a.category === activeCategory;
  });

  const totalClaimableCash = achievements
    .filter((a) => a.isUnlocked && !a.isClaimed && a.rewardType === "upi_cash")
    .reduce((acc, curr) => acc + parseInt(curr.rewardValue, 10), 0);

  const totalEarnedCash = achievements
    .filter((a) => a.isClaimed && a.rewardType === "upi_cash")
    .reduce((acc, curr) => acc + parseInt(curr.rewardValue, 10), 0);

  const handleClaimReward = (id: string, title: string, rewardFormatted: string) => {
    const nextClaimed = [...claimedIds, id];
    setClaimedIds(nextClaimed);
    try {
      localStorage.setItem("playarena_claimed_milestones", JSON.stringify(nextClaimed));
    } catch {
      // Ignore storage errors
    }

    toast.success(`Claimed ${rewardFormatted} for completing "${title}"!`, "Milestone Reward");
    setClaimedRewardMessage(
      `🎉 Claimed ${rewardFormatted}! UPI transfer initiated to registered VPA.`
    );

    setTimeout(() => {
      setClaimedRewardMessage(null);
    }, 5000);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Toast Banner for Claimed Reward */}
      {claimedRewardMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between shadow-md transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{claimedRewardMessage}</span>
          </div>
          <button
            onClick={() => setClaimedRewardMessage(null)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Claimable UPI Cash
            </span>
            <Zap className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono">
            ₹{totalClaimableCash}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unlocked milestones ready for 1-click withdrawal
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Lifetime Earned
            </span>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
            ₹{totalEarnedCash}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total milestone rewards credited to your UPI ID
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Unlocked Tiers
            </span>
            <Award className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-indigo-700 font-mono">
            {achievements.filter((a) => a.isUnlocked).length} / {achievements.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Competitive milestone badges and achievement ranks
          </p>
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Milestones
          </button>
          <button
            onClick={() => setActiveCategory("combat")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeCategory === "combat"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Combat (Kills)
          </button>
          <button
            onClick={() => setActiveCategory("tournament")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeCategory === "tournament"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tournaments
          </button>
          <button
            onClick={() => setActiveCategory("weekend")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeCategory === "weekend"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Weekend Mega
          </button>
          <button
            onClick={() => setActiveCategory("squad")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeCategory === "squad"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Squad
          </button>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Showing {filteredAchievements.length} Milestones
        </div>
      </div>

      {/* Achievements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.map((item) => {
          const progressPercent = Math.min(
            100,
            Math.round((item.currentValue / item.targetValue) * 100)
          );

          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all max-w-full overflow-hidden ${
                item.isClaimed
                  ? "bg-slate-50/80 border-slate-200 opacity-80"
                  : item.isUnlocked
                  ? "bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/10"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.isClaimed
                        ? "bg-slate-200 text-slate-600"
                        : item.isUnlocked
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {item.isUnlocked ? (
                      <Award className="h-5 w-5" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 break-words">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Reward Tag */}
                <div className="self-start sm:self-auto sm:shrink-0 sm:text-right max-w-full">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 max-w-full">
                    <Sparkles className="h-3 w-3 text-amber-600 shrink-0" />
                    <span className="break-words">{item.rewardFormatted}</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar & Numerical Target */}
              <div className="space-y-1.5 pt-1 mb-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-bold text-slate-900">
                    {item.currentValue} / {item.targetValue} {item.unit} ({progressPercent}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.isUnlocked ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  {item.isClaimed
                    ? "Reward successfully transferred"
                    : item.isUnlocked
                    ? "Goal achieved! Ready to claim"
                    : "Complete in ranked tournament matches"}
                </span>

                {item.isClaimed ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 font-mono">
                    <Check className="h-3.5 w-3.5 text-slate-600" />
                    <span>Claimed</span>
                  </span>
                ) : item.isUnlocked ? (
                  <button
                    onClick={() =>
                      handleClaimReward(item.id, item.title, item.rewardFormatted)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Claim Reward</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 font-mono">
                    <Lock className="h-3 w-3" />
                    <span>In Progress</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
