"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Search, 
  ShieldCheck, 
  Crosshair, 
  ArrowUpDown, 
  Inbox, 
  Flame, 
  Calendar, 
  Filter, 
  Clock, 
  Users,
  Sparkles
} from "lucide-react";
import LeaderboardPodium from "@/components/LeaderboardPodium";
import MvpPodium, { MvpPlayer } from "@/components/MvpPodium";
import { MockLeaderboardTeam } from "@/lib/mockData";
import { useToast } from "@/lib/context/ToastContext";

export default function LeaderboardsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"squads" | "mvp">("squads");

  // Squad Standings State
  const [selectedTournament, setSelectedTournament] = useState<string>("all");
  const [tournamentsList, setTournamentsList] = useState<Array<{ id: string; title: string; game: string }>>([]);
  const [selectedGame, setSelectedGame] = useState<"all" | "bgmi" | "freefire">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [teams, setTeams] = useState<MockLeaderboardTeam[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  // MVP Top Fraggers State
  const [mvpTimeframe, setMvpTimeframe] = useState<"daily" | "monthly" | "global">("daily");
  const [mvpGame, setMvpGame] = useState<"all" | "bgmi" | "freefire">("all");
  const [mvpSearchQuery, setMvpSearchQuery] = useState("");
  const [mvpTopThree, setMvpTopThree] = useState<MvpPlayer[]>([]);
  const [mvpRankings, setMvpRankings] = useState<MvpPlayer[]>([]);
  const [loadingMvp, setLoadingMvp] = useState(false);

  // Fetch Tournaments List for Dropdown
  useEffect(() => {
    fetch("/api/leaderboards/tournaments")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setTournamentsList(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Squad Standings
  useEffect(() => {
    setLoadingTeams(true);
    const params = new URLSearchParams();
    if (selectedTournament !== "all") params.set("tournamentId", selectedTournament);
    if (selectedGame !== "all") params.set("game", selectedGame);

    fetch(`/api/leaderboards?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const mapped: MockLeaderboardTeam[] = res.data.map((item: any, idx: number) => ({
            rank: item.rank || idx + 1,
            teamName: item.teamName,
            captainTag: item.gameIdTag || "Captain",
            game: item.game || "bgmi",
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(item.teamName)}`,
            matchesPlayed: item.matchesPlayed || 1,
            eliminations: item.eliminationPoints || item.eliminations || 0,
            placementPoints: item.placementPoints || 0,
            totalPoints: item.totalPoints || 0,
            badge: (idx === 0 ? "gold" : idx === 1 ? "silver" : idx === 2 ? "bronze" : undefined) as "gold" | "silver" | "bronze" | undefined,
          }));
          setTeams(mapped);
        }
      })
      .catch(() => {
        toast.error("Could not fetch leaderboard standings from server.", "Telemetry Error");
      })
      .finally(() => setLoadingTeams(false));
  }, [selectedTournament, selectedGame]);

  // Fetch MVP Leaderboard
  useEffect(() => {
    setLoadingMvp(true);
    const params = new URLSearchParams();
    params.set("timeframe", mvpTimeframe);
    if (mvpGame !== "all") params.set("game", mvpGame);

    fetch(`/api/leaderboards/mvp?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setMvpTopThree(res.data.topThree || []);
          setMvpRankings(res.data.rankings || []);
        }
      })
      .catch(() => {
        toast.error("Could not fetch MVP top fraggers telemetry.", "Telemetry Error");
      })
      .finally(() => setLoadingMvp(false));
  }, [mvpTimeframe, mvpGame]);

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.captainTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredMvpRankings = mvpRankings.filter((player) => {
    const matchesSearch =
      player.inGameName.toLowerCase().includes(mvpSearchQuery.toLowerCase()) ||
      player.gameId.toLowerCase().includes(mvpSearchQuery.toLowerCase()) ||
      player.teamName.toLowerCase().includes(mvpSearchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-xs font-mono text-amber-800 mb-3 shadow-xs">
          <Trophy className="h-3.5 w-3.5 text-amber-600" />
          <span>OFFICIAL COMPETITIVE LEADERBOARDS</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Tournament Standings &amp; MVP Apex Fraggers
        </h1>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed font-normal">
          Certified institutional classification. Toggle between official Squad Standings and Individual Daily/Monthly/Global Top Fraggers with verified Character UIDs.
        </p>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex items-center p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold gap-1 shadow-xs">
          <button
            onClick={() => setActiveTab("squads")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all ${
              activeTab === "squads"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-600" />
            <span>Squad Standings</span>
          </button>
          <button
            onClick={() => setActiveTab("mvp")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all ${
              activeTab === "mvp"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-rose-600" />
            <span>Top Fraggers / MVP</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-mono">
              Live
            </span>
          </button>
        </div>
      </div>

      {/* ================= SQUAD STANDINGS TAB ================= */}
      {activeTab === "squads" && (
        <div className="space-y-6">
          {/* Controls: Tournament Dropdown + Game Filter + Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            {/* Tournament Selector Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-700 font-mono flex items-center gap-1 shrink-0">
                <Filter className="h-3.5 w-3.5 text-slate-500" />
                Event:
              </span>
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="w-full md:w-72 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-600 shadow-xs"
              >
                <option value="all">All Tournaments • Season 04 Global</option>
                {tournamentsList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.game.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Game Filter */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
              <button
                onClick={() => setSelectedGame("all")}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  selectedGame === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Titles
              </button>
              <button
                onClick={() => setSelectedGame("bgmi")}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedGame === "bgmi"
                    ? "bg-white text-emerald-700 border border-emerald-300 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                BGMI
              </button>
              <button
                onClick={() => setSelectedGame("freefire")}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedGame === "freefire"
                    ? "bg-white text-rose-700 border border-rose-300 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                Free Fire
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search squad or captain tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
              />
            </div>
          </div>

          {/* Squad Podium */}
          {filteredTeams.length >= 3 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <LeaderboardPodium teams={filteredTeams.slice(0, 3)} />
            </div>
          )}

          {/* Squad Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Squad &amp; Leader Tag</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4 text-center">Matches</th>
                    <th className="py-3 px-4 text-center">Placement Pts</th>
                    <th className="py-3 px-4 text-center">Elims</th>
                    <th className="py-3 px-4 text-right">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loadingTeams ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        Loading tournament standings...
                      </td>
                    </tr>
                  ) : filteredTeams.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <Inbox className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        No match standings recorded for this selection yet.
                      </td>
                    </tr>
                  ) : (
                    filteredTeams.map((team) => (
                      <tr key={`${team.rank}-${team.teamName}`} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          <span
                            className={`inline-flex items-center justify-center h-6 w-6 rounded-md text-[11px] ${
                              team.rank === 1
                                ? "bg-amber-100 text-amber-800 border border-amber-300 font-bold"
                                : team.rank === 2
                                ? "bg-slate-200 text-slate-800 border border-slate-300"
                                : team.rank === 3
                                ? "bg-amber-50 text-amber-900 border border-amber-200"
                                : "text-slate-600"
                            }`}
                          >
                            #{team.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={team.avatar}
                              alt={team.teamName}
                              className="h-8 w-8 rounded-lg object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{team.teamName}</div>
                              <div className="text-[10px] font-mono text-slate-500">{team.captainTag}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                            {team.game.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600">{team.matchesPlayed}</td>
                        <td className="py-3 px-4 text-center font-mono text-slate-700">{team.placementPoints}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-rose-600">{team.eliminations}</td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm">
                          {team.totalPoints}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MVP TOP FRAGGERS TAB ================= */}
      {activeTab === "mvp" && (
        <div className="space-y-6">
          {/* MVP Controls: Timeframe (Daily/Monthly/Global) + Game Filter + Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            {/* Timeframe Selector (Daily / Monthly / Globally) */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
              <button
                onClick={() => setMvpTimeframe("daily")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
                  mvpTimeframe === "daily"
                    ? "bg-white text-rose-700 shadow-xs border border-rose-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>Daily Matches</span>
              </button>
              <button
                onClick={() => setMvpTimeframe("monthly")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
                  mvpTimeframe === "monthly"
                    ? "bg-white text-indigo-700 shadow-xs border border-indigo-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calendar className="h-3 w-3" />
                <span>Monthly Apex</span>
              </button>
              <button
                onClick={() => setMvpTimeframe("global")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
                  mvpTimeframe === "global"
                    ? "bg-white text-amber-700 shadow-xs border border-amber-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                <span>Globally (All-Time)</span>
              </button>
            </div>

            {/* Game Selector */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
              <button
                onClick={() => setMvpGame("all")}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  mvpGame === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Games
              </button>
              <button
                onClick={() => setMvpGame("bgmi")}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  mvpGame === "bgmi"
                    ? "bg-white text-emerald-700 border border-emerald-300 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                BGMI
              </button>
              <button
                onClick={() => setMvpGame("freefire")}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  mvpGame === "freefire"
                    ? "bg-white text-rose-700 border border-rose-300 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                Free Fire
              </button>
            </div>

            {/* Search by Player IGN or Character UID */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search athlete IGN or UID..."
                value={mvpSearchQuery}
                onChange={(e) => setMvpSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-600 shadow-xs font-mono"
              />
            </div>
          </div>

          {/* Top 3 MVP Fraggers Podium */}
          {mvpTopThree.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <MvpPodium
                players={mvpTopThree}
                timeframeLabel={
                  mvpTimeframe === "daily"
                    ? "Daily Match"
                    : mvpTimeframe === "monthly"
                    ? "Monthly"
                    : "Global All-Time"
                }
              />
            </div>
          )}

          {/* Individual Fraggers Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  Apex Fraggers Classification ({filteredMvpRankings.length} Athletes)
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Sorted by Total Eliminations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Athlete &amp; Character UID</th>
                    <th className="py-3 px-4">Squad Affiliation</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4 text-center">Matches</th>
                    <th className="py-3 px-4 text-center">Avg / Match</th>
                    <th className="py-3 px-4 text-right">Most Kills</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loadingMvp ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        Aggregating player elimination telemetry...
                      </td>
                    </tr>
                  ) : filteredMvpRankings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <Inbox className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        No player kill records logged for this timeframe yet.
                      </td>
                    </tr>
                  ) : (
                    filteredMvpRankings.map((player) => (
                      <tr key={`${player.rank}-${player.gameId}`} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          <span
                            className={`inline-flex items-center justify-center h-6 w-6 rounded-md text-[11px] ${
                              player.rank === 1
                                ? "bg-amber-100 text-amber-800 border border-amber-300 font-bold"
                                : player.rank === 2
                                ? "bg-slate-200 text-slate-800 border border-slate-300"
                                : player.rank === 3
                                ? "bg-amber-50 text-amber-900 border border-amber-200"
                                : "text-slate-600"
                            }`}
                          >
                            #{player.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={player.avatar}
                              alt={player.inGameName}
                              className="h-8 w-8 rounded-lg object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{player.inGameName}</span>
                                {player.rank === 1 && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-mono font-bold">
                                    MVP
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded inline-block mt-0.5 border border-emerald-200">
                                UID: <span className="font-bold">{player.gameId}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {player.teamName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                            {player.game.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600">{player.matchesPlayed}</td>
                        <td className="py-3 px-4 text-center font-mono text-slate-700">{player.avgKills}</td>
                        <td className="py-3 px-4 text-right font-mono font-black text-rose-600 text-sm">
                          <span className="inline-flex items-center gap-1 justify-end">
                            <Flame className="h-3.5 w-3.5 text-rose-500" />
                            {player.totalKills}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
