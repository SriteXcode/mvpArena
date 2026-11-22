"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Flame, 
  SlidersHorizontal, 
  RotateCcw, 
  Calendar, 
  Clock, 
  Activity, 
  X, 
  Trophy,
  Tv,
  Zap,
  Filter
} from "lucide-react";
import TournamentCard from "@/components/TournamentCard";
import TournamentCardSkeleton from "@/components/skeletons/TournamentCardSkeleton";
import { MockTournament } from "@/lib/mockData";
import { useToast } from "@/lib/context/ToastContext";

export type GameFilter = "all" | "bgmi" | "freefire";
export type DateFilter = "all" | "today" | "tomorrow" | "upcoming";
export type StatusFilter = "all" | "registration_open" | "live" | "completed";
export type TimeFilter = "all" | "morning" | "afternoon" | "evening" | "night";
export type FeeFilter = "all" | "free" | "paid";
export type ContestTypeFilter = "all" | "daily" | "weekend_mega" | "mega_prize" | "live_stream";

interface TournamentApiItem {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  game: "bgmi" | "freefire";
  format: "solo" | "duo" | "squad";
  organizer?: { orgName?: string };
  bannerUrl?: string;
  streamUrl?: string;
  youtubeStreamUrl?: string;
  entryFee: number;
  prizePool: number;
  maxSlots: number;
  registeredSlots: number;
  tournamentDate: string;
  status: "registration_open" | "live" | "completed";
  rules: string;
  tag?: "daily" | "weekend_mega" | "mega_prize" | "regular";
  isLiveStreamed?: boolean;
}

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

export default function TournamentsPage() {
  const toast = useToast();
  const [tournaments, setTournaments] = useState<MockTournament[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter States
  const [selectedGame, setSelectedGame] = useState<GameFilter>("all");
  const [selectedDate, setSelectedDate] = useState<DateFilter>("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [selectedTime, setSelectedTime] = useState<TimeFilter>("all");
  const [selectedFee, setSelectedFee] = useState<FeeFilter>("all");
  const [selectedType, setSelectedType] = useState<ContestTypeFilter>("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/tournaments")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const mapped = res.data.map((t: TournamentApiItem) => ({
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
            tournamentDate: new Date(t.tournamentDate).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            rawDate: t.tournamentDate,
            status: t.status,
            rules: t.rules,
            tag: t.tag,
            isLiveStreamed: Boolean(t.isLiveStreamed || t.streamUrl || t.youtubeStreamUrl),
            streamUrl: t.streamUrl || t.youtubeStreamUrl || "",
            youtubeStreamUrl: t.youtubeStreamUrl || t.streamUrl || "",
            scoringRules: {
              firstPlacePoints: 15,
              killPoints: 1,
            },
          }));
          setTournaments(mapped);
        } else {
          setTournaments([]);
        }
      })
      .catch(() => {
        toast.error("Could not fetch tournaments from the database.", "Data Notice");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Multi-Filter Calculation
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // 1. Game Title
      if (selectedGame !== "all" && t.game !== selectedGame) {
        return false;
      }

      // 2. Status
      if (selectedStatus !== "all" && t.status !== selectedStatus) {
        return false;
      }

      // 3. Entry Fee
      if (selectedFee !== "all") {
        if (selectedFee === "free" && t.entryFee !== 0) return false;
        if (selectedFee === "paid" && t.entryFee === 0) return false;
      }

      // 4. Date Category
      if (selectedDate !== "all") {
        const cat = getDateCategory(t.tournamentDate);
        if (cat !== selectedDate) return false;
      }

      // 5. Time of Day
      if (selectedTime !== "all") {
        const slot = getTimeOfDay(t.tournamentDate);
        if (slot !== selectedTime) return false;
      }

      // 6. Contest Type / Feature
      if (selectedType !== "all") {
        if (selectedType === "daily" && t.tag !== "daily") return false;
        if (selectedType === "weekend_mega" && t.tag !== "weekend_mega") return false;
        if (selectedType === "mega_prize" && t.tag !== "mega_prize" && t.prizePool < 100000) return false;
        if (selectedType === "live_stream" && !t.isLiveStreamed) return false;
      }

      // 7. Text Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesOrg = t.organizerName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesOrg) return false;
      }

      return true;
    });
  }, [
    tournaments,
    selectedGame,
    selectedStatus,
    selectedFee,
    selectedDate,
    selectedTime,
    selectedType,
    search,
  ]);

  const activeSecondaryFilterCount =
    (selectedFee !== "all" ? 1 : 0) +
    (selectedDate !== "all" ? 1 : 0) +
    (selectedStatus !== "all" ? 1 : 0) +
    (selectedTime !== "all" ? 1 : 0) +
    (selectedType !== "all" ? 1 : 0) +
    (search.trim() !== "" ? 1 : 0);

  const hasActiveFilters =
    selectedGame !== "all" || activeSecondaryFilterCount > 0;

  const handleReset = () => {
    setSelectedGame("all");
    setSelectedFee("all");
    setSelectedDate("all");
    setSelectedStatus("all");
    setSelectedTime("all");
    setSelectedType("all");
    setSearch("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-semibold mb-2">
            <Flame className="h-3.5 w-3.5 text-emerald-600" />
            <span>SANCTIONED COMPETITIVE DIRECTORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tournaments &amp; Scrims
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
            Discover verified tournaments for BGMI and Free Fire MAX. Join daily scrims, all-day weekend mega contests, or high-stakes mega prize pool championships.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500 whitespace-nowrap">
          Showing <span className="font-bold text-slate-900">{filteredTournaments.length}</span> of {tournaments.length} fixtures
        </div>
      </div>

      {/* Toolbar: Primary Game Tabs + Search + Compact Filter Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Left: Primary Game Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 shadow-xs self-start">
          <button
            type="button"
            onClick={() => setSelectedGame("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedGame === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Titles
          </button>
          <button
            type="button"
            onClick={() => setSelectedGame("bgmi")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedGame === "bgmi"
                ? "bg-white text-emerald-700 border border-emerald-300 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            BGMI
          </button>
          <button
            type="button"
            onClick={() => setSelectedGame("freefire")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedGame === "freefire"
                ? "bg-white text-rose-700 border border-rose-300 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            Free Fire MAX
          </button>
        </div>

        {/* Right: Search Input + Compact Filter Toggle Icon */}
        <div className="flex items-center gap-2">
          {/* Quick Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tournament title or organizer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Compact Filter Toggle Icon Button */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
            className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              showFilters || activeSecondaryFilterCount > 0
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
            title="Toggle advanced filters"
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
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4 transition-all">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Filter Tournaments By Category &amp; Schedule
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
                  type="button"
                  onClick={handleReset}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
                title="Close filter panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 5-Column Filter Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Contest Type Filter */}
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
                <option value="all">All Formats</option>
                <option value="daily">📅 Daily Tournaments</option>
                <option value="weekend_mega">🔥 Weekend Mega Contest</option>
                <option value="mega_prize">💎 Mega Prize Pools (₹1L+)</option>
                <option value="live_stream">🔴 Live Streamed</option>
              </select>
            </div>

            {/* 2. Entry Fee Filter */}
            <div className="relative">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                <Trophy className="h-3 w-3 text-slate-400" />
                <span>Entry Fee</span>
              </label>
              <select
                value={selectedFee}
                onChange={(e) => setSelectedFee(e.target.value as FeeFilter)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="all">All Entry Fees</option>
                <option value="free">Free Entry (₹0)</option>
                <option value="paid">Cash Prize Pools</option>
              </select>
            </div>

            {/* 3. Date Filter */}
            <div className="relative">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span>Schedule Date</span>
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value as DateFilter)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="upcoming">Upcoming Days</option>
              </select>
            </div>

            {/* 4. Match Status Filter */}
            <div className="relative">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                <Activity className="h-3 w-3 text-slate-400" />
                <span>Match Status</span>
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

            {/* 5. Time of Day Filter */}
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
        </div>
      )}

      {/* Active Filters Summary Strip (Shown when any filters are active) */}
      {activeSecondaryFilterCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-mono text-slate-700">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Active:</span>

            {selectedType !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold capitalize">
                Type: {selectedType === "daily" ? "Daily" : selectedType === "weekend_mega" ? "Weekend Mega" : selectedType === "mega_prize" ? "Mega Prize" : "Live Stream"}
                <button type="button" onClick={() => setSelectedType("all")} className="hover:text-purple-950">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {selectedFee !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold capitalize">
                Fee: {selectedFee === "free" ? "Free Entry" : "Cash Prize"}
                <button type="button" onClick={() => setSelectedFee("all")} className="hover:text-emerald-950">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {selectedDate !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-semibold capitalize">
                Date: {selectedDate}
                <button type="button" onClick={() => setSelectedDate("all")} className="hover:text-indigo-950">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {selectedStatus !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold capitalize">
                Status: {selectedStatus.replace("_", " ")}
                <button type="button" onClick={() => setSelectedStatus("all")} className="hover:text-amber-950">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {selectedTime !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-semibold capitalize">
                Time: {selectedTime}
                <button type="button" onClick={() => setSelectedTime("all")} className="hover:text-cyan-950">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {search.trim() !== "" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-semibold">
                &ldquo;{search}&rdquo;
                <button type="button" onClick={() => setSearch("")} className="hover:text-slate-950">
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
              type="button"
              onClick={handleReset}
              className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Tournament Cards Grid, Skeleton Loading, or Empty State */}
      {isLoading ? (
        <TournamentCardSkeleton count={8} />
      ) : filteredTournaments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white space-y-3 shadow-xs">
          <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200">
            <Filter className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No matching fixtures found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try selecting different game titles, resetting your filters, or clearing the search keyword.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold transition-all shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </div>
  );
}
