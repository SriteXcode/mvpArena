"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Flame, 
  ArrowRight,
  Calendar,
  Clock,
  Activity,
  RotateCcw,
  SlidersHorizontal,
  X,
  Search,
  Check
} from "lucide-react";
import TournamentCard from "@/components/TournamentCard";
import HeroBanner from "@/components/HeroBanner";
import { TournamentCardSkeletonSingle } from "@/components/skeletons/TournamentCardSkeleton";
import StreamHubSkeleton from "@/components/skeletons/StreamHubSkeleton";
import LeaderboardSkeleton from "@/components/skeletons/LeaderboardSkeleton";
import Skeleton from "@/components/ui/Skeleton";
import { MockTournament, MockLeaderboardTeam } from "@/lib/mockData";
import { useToast } from "@/lib/context/ToastContext";

// Dynamic Lazy-Loaded Below-The-Fold & Interactive Components
const LiveStreamHub = dynamic(() => import("@/components/LiveStreamHub"), {
  loading: () => <StreamHubSkeleton />,
  ssr: false,
});

const LeaderboardPodium = dynamic(() => import("@/components/LeaderboardPodium"), {
  loading: () => <LeaderboardSkeleton />,
  ssr: false,
});

const PlatformFeaturesShowcase = dynamic(() => import("@/components/PlatformFeaturesShowcase"), {
  loading: () => <div className="mx-auto max-w-7xl px-4 py-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>,
  ssr: true,
});

const HowItWorks = dynamic(() => import("@/components/HowItWorks"), {
  loading: () => <div className="mx-auto max-w-7xl px-4 py-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>,
  ssr: true,
});

const ShareInviteModal = dynamic(() => import("@/components/ShareInviteModal"), {
  ssr: false,
});

interface TournamentApiItem {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  game: "bgmi" | "freefire";
  format: "solo" | "duo" | "squad";
  organizer?: { orgName?: string };
  bannerUrl?: string;
  entryFee: number;
  prizePool: number;
  maxSlots: number;
  registeredSlots: number;
  tournamentDate: string;
  status: "registration_open" | "live" | "completed";
  rules: string;
  tag?: "daily" | "weekend_mega" | "mega_prize" | "regular";
  isLiveStreamed?: boolean;
  streamUrl?: string;
  youtubeStreamUrl?: string;
}

interface LeaderboardApiItem {
  rank?: number;
  teamName: string;
  gameIdTag?: string;
  eliminationPoints?: number;
  placementPoints?: number;
  totalPoints?: number;
}

export type GameFilter = "all" | "bgmi" | "freefire";
export type DateFilter = "all" | "today" | "tomorrow" | "upcoming";
export type StatusFilter = "all" | "registration_open" | "live" | "completed";
export type TimeFilter = "all" | "morning" | "afternoon" | "evening" | "night";
export type ContestTypeFilter = "all" | "daily" | "weekend_mega" | "mega_prize" | "live_stream";

function getTimeOfDay(dateStr: string): "morning" | "afternoon" | "evening" | "night" {
  const timeMatch = dateStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const period = timeMatch[3].toLowerCase();
    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;

    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const hour = parsed.getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  return "evening";
}

function getDateCategory(dateStr: string): "today" | "tomorrow" | "upcoming" {
  const lower = dateStr.toLowerCase();
  if (lower.includes("today")) return "today";
  if (lower.includes("tomorrow")) return "tomorrow";

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const target = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());

    if (target.getTime() === today.getTime()) return "today";
    if (target.getTime() === tomorrow.getTime()) return "tomorrow";
  }

  return "upcoming";
}

export default function HomePage() {
  const toast = useToast();
  const [selectedGame, setSelectedGame] = useState<GameFilter>("all");
  const [selectedDate, setSelectedDate] = useState<DateFilter>("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [selectedTime, setSelectedTime] = useState<TimeFilter>("all");
  const [selectedType, setSelectedType] = useState<ContestTypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [tournaments, setTournaments] = useState<MockTournament[]>([]);
  const [leaderboards, setLeaderboards] = useState<MockLeaderboardTeam[]>([]);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true);
  const [isLoadingLeaderboards, setIsLoadingLeaderboards] = useState(true);

  useEffect(() => {
    fetch("/api/tournaments")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          const mapped = res.data.map((t: TournamentApiItem) => {
            const parsedDate = t.tournamentDate ? new Date(t.tournamentDate) : new Date();
            const formattedDate = !isNaN(parsedDate.getTime())
              ? parsedDate.toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : t.tournamentDate || "Upcoming";

            return {
              id: t._id || t.id,
              title: t.title,
              slug: t.slug,
              game: t.game,
              format: t.format,
              organizerName: t.organizer?.orgName || "Nova Esports Hub",
              organizerVerified: true,
              bannerUrl: t.bannerUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
              entryFee: t.entryFee,
              prizePool: t.prizePool,
              maxSlots: t.maxSlots,
              registeredSlots: t.registeredSlots,
              registrationEnd: "Today, 6:00 PM",
              tournamentDate: formattedDate,
              rawDate: t.tournamentDate,
              status: t.status,
              rules: t.rules,
              tag: t.tag || "daily",
              isLiveStreamed: Boolean(t.isLiveStreamed || t.streamUrl || t.youtubeStreamUrl),
              streamUrl: t.streamUrl || t.youtubeStreamUrl || "",
              youtubeStreamUrl: t.youtubeStreamUrl || t.streamUrl || "",
              scoringRules: {
                firstPlacePoints: 15,
                killPoints: 1,
              },
            };
          });
          setTournaments(mapped);
        } else {
          setTournaments([]);
        }
      })
      .catch(() => {
        toast.error("Could not fetch tournaments from server.", "Notice");
      })
      .finally(() => {
        setIsLoadingTournaments(false);
      });

    fetch("/api/leaderboards")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          const mapped = res.data.map((entry: LeaderboardApiItem, idx: number) => ({
            rank: entry.rank || idx + 1,
            teamName: entry.teamName,
            captainTag: entry.gameIdTag || "Captain",
            game: "bgmi" as const,
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(entry.teamName)}`,
            matchesPlayed: 6,
            eliminations: entry.eliminationPoints || 0,
            placementPoints: entry.placementPoints || 0,
            totalPoints: entry.totalPoints || 0,
            badge: (idx === 0 ? "gold" : idx === 1 ? "silver" : idx === 2 ? "bronze" : undefined) as "gold" | "silver" | "bronze" | undefined,
          }));
          setLeaderboards(mapped);
        } else {
          setLeaderboards([]);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingLeaderboards(false);
      });
  }, []);

  // Multi-Filter Logic
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // 1. Game Filter
      if (selectedGame !== "all" && t.game !== selectedGame) {
        return false;
      }

      // 2. Status Filter
      if (selectedStatus !== "all" && t.status !== selectedStatus) {
        return false;
      }

      // 3. Date Filter
      if (selectedDate !== "all") {
        const cat = getDateCategory(t.rawDate || t.tournamentDate);
        if (cat !== selectedDate) {
          return false;
        }
      }

      // 4. Time Filter
      if (selectedTime !== "all") {
        const timeSlot = getTimeOfDay(t.rawDate || t.tournamentDate);
        if (timeSlot !== selectedTime) {
          return false;
        }
      }

      // 5. Contest Type Filter (Daily, Weekend Mega, Mega Prize, Live Stream)
      if (selectedType !== "all") {
        if (selectedType === "daily" && t.tag !== "daily") return false;
        if (selectedType === "weekend_mega" && t.tag !== "weekend_mega") return false;
        if (selectedType === "mega_prize" && t.tag !== "mega_prize" && t.prizePool < 100000) return false;
        if (selectedType === "live_stream" && !t.isLiveStreamed) return false;
      }

      // 6. Search Filter (if typed)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesOrg = t.organizerName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesOrg) return false;
      }

      return true;
    });
  }, [tournaments, selectedGame, selectedStatus, selectedDate, selectedTime, selectedType, searchQuery]);

  const activeSecondaryFilterCount =
    (selectedDate !== "all" ? 1 : 0) +
    (selectedStatus !== "all" ? 1 : 0) +
    (selectedTime !== "all" ? 1 : 0) +
    (selectedType !== "all" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0);

  const hasActiveFilters =
    selectedGame !== "all" ||
    activeSecondaryFilterCount > 0;

  const resetFilters = () => {
    setSelectedGame("all");
    setSelectedDate("all");
    setSelectedStatus("all");
    setSelectedTime("all");
    setSelectedType("all");
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-20">
      {/* Hero Banner */}
      <HeroBanner onOpenShareModal={() => setShowShareModal(true)} />

      {/* Featured Tournaments Section with Multi-Filter Suite */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-emerald-600 font-bold tracking-wider mb-1">
              <Flame className="h-3.5 w-3.5" />
              <span>Active Competitions</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Featured Tournaments
            </h2>
          </div>

          {/* Header Controls: Primary Game Filter Pills + Compact Toggle Icon */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setSelectedGame("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedGame === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Titles
              </button>
              <button
                onClick={() => setSelectedGame("bgmi")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedGame === "bgmi"
                    ? "bg-white text-emerald-700 border border-emerald-300 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                BGMI
              </button>
              <button
                onClick={() => setSelectedGame("freefire")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedGame === "freefire"
                    ? "bg-white text-rose-700 border border-rose-300 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                Free Fire MAX
              </button>
            </div>

            {/* Compact Filter Toggle Icon Button */}
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              aria-expanded={showFilters}
              aria-label="Toggle filters"
              className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                showFilters || activeSecondaryFilterCount > 0
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
              title="Toggle filters (Date, Status, Time, Search)"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeSecondaryFilterCount > 0 && (
                <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                  {activeSecondaryFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Secondary Filter Drawer - Only visible when toggled */}
        {showFilters && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-5 transition-all">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Filter Tournaments
                </span>
                {activeSecondaryFilterCount > 0 && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {activeSecondaryFilterCount} Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeSecondaryFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
                  title="Close filter panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Filter Selectors: Contest Type, Date, Status, Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 flex-1">
                {/* Contest Type / Feature Filter */}
                <div className="relative">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                    <Flame className="h-3 w-3 text-slate-400" />
                    <span>Contest Type</span>
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as ContestTypeFilter)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="all">All Contests & Formats</option>
                    <option value="daily">📅 Daily Tournaments</option>
                    <option value="weekend_mega">🔥 Weekend All-Day Mega</option>
                    <option value="mega_prize">💎 Mega Prize Pools (₹1L+)</option>
                    <option value="live_stream">🔴 Live Streamed</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div className="relative">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>Date</span>
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value as DateFilter)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                    <Activity className="h-3 w-3 text-slate-400" />
                    <span>Status</span>
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="registration_open">Registration Open</option>
                    <option value="live">Live Now</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Time Filter */}
                <div className="relative">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>Time of Day</span>
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value as TimeFilter)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="all">All Times</option>
                    <option value="morning">Morning (6 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 9 PM)</option>
                    <option value="night">Night (9 PM+)</option>
                  </select>
                </div>
              </div>

              {/* Search Control */}
              <div className="relative sm:w-64 pt-1 lg:pt-0">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                  <Search className="h-3 w-3 text-slate-400" />
                  <span>Search</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title or organizer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-3 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary Strip (Shown whenever secondary filters are active) */}
        {activeSecondaryFilterCount > 0 && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-mono text-slate-700">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Active:</span>
              {selectedDate !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-semibold capitalize">
                  Date: {selectedDate}
                  <button onClick={() => setSelectedDate("all")} className="hover:text-indigo-950">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {selectedStatus !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold capitalize">
                  Status: {selectedStatus.replace("_", " ")}
                  <button onClick={() => setSelectedStatus("all")} className="hover:text-amber-950">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {selectedTime !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-semibold capitalize">
                  Time: {selectedTime}
                  <button onClick={() => setSelectedTime("all")} className="hover:text-cyan-950">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {selectedType !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold capitalize">
                  Contest: {selectedType === "daily" ? "Daily Scrims" : selectedType === "weekend_mega" ? "Weekend Mega" : selectedType === "mega_prize" ? "Mega Prize Pool" : "Live Stream"}
                  <button onClick={() => setSelectedType("all")} className="hover:text-purple-950">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {searchQuery.trim() !== "" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-semibold">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery("")} className="hover:text-slate-950">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-slate-500 font-medium">
                Showing <strong className="text-slate-900">{filteredTournaments.length}</strong> of {tournaments.length}
              </span>
              <button
                onClick={resetFilters}
                className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Tournaments Grid or Skeleton Loading or Empty State */}
        {isLoadingTournaments ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <TournamentCardSkeletonSingle key={i} />
            ))}
          </div>
        ) : filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredTournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-2xl border border-dashed border-slate-300 bg-white text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No tournaments match these filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn&apos;t find any competitions matching your selected game, date, status, or time of day.
            </p>
            <div className="pt-2">
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-emerald-600 transition-all shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 5 Core Arena Features Showcase: Daily, Weekend Mega, Live Stream, Mega Prizes, Milestones */}
      <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>}>
        <PlatformFeaturesShowcase />
      </Suspense>

      {/* 7-Step Tournament Workflow Showcase */}
      <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>}>
        <HowItWorks />
      </Suspense>

      {/* Official Live Esports Stadium Broadcast */}
      <Suspense fallback={<StreamHubSkeleton />}>
        <LiveStreamHub />
      </Suspense>

      {/* Podium & Weekly Standings */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-4">
            <span className="text-[10px] font-mono uppercase text-amber-600 font-bold tracking-widest">
              Season 04 Hall of Fame
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Top Ranked Squads
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Standings calculated through official scoring: Placement Points + (Kills × 1.0).
            </p>
          </div>

          {isLoadingLeaderboards ? (
            <LeaderboardSkeleton />
          ) : leaderboards.length >= 3 ? (
            <Suspense fallback={<LeaderboardSkeleton />}>
              <LeaderboardPodium teams={leaderboards} />
            </Suspense>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-slate-50 border border-slate-200 max-w-lg mx-auto">
              Season 04 rankings will update live as soon as match results are certified.
            </div>
          )}

          <div className="text-center mt-4">
            <Link
              href="/leaderboards"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-xs"
            >
              <span>View Complete Leaderboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {showShareModal && (
        <Suspense fallback={null}>
          <ShareInviteModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
