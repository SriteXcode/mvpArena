"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Users, 
  Plus, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  FileCheck,
  Key,
  CreditCard,
  Percent,
  Settings,
  History,
  Lock,
  Globe,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  DollarSign,
  Calendar,
  Gamepad2,
  Send,
  Eye,
  Calculator,
  Inbox
} from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";
import { formatINR } from "@/lib/utils";

type TabKey = 
  | "create" 
  | "previous_results" 
  | "payouts_schedule" 
  | "commission" 
  | "add_result" 
  | "room_credentials" 
  | "profile_upi";

interface OrganizerProfile {
  _id?: string;
  orgName: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
  commissionRate: number;
  upiId: string;
  walletBalance: number;
  totalSettledPayouts: number;
}

interface TournamentItem {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  game: "bgmi" | "freefire";
  format: "solo" | "duo" | "squad";
  entryFee: number;
  prizePool: number;
  maxSlots: number;
  registeredSlots: number;
  status: string;
  visibility?: "public" | "private";
  privateToken?: string;
  matchRoomCredentials?: {
    roomId: string;
    roomPassword: string;
    announcedAt?: string;
  };
  tournamentDate: string;
}

interface ResultArchiveItem {
  id: string;
  tournamentTitle: string;
  teamName: string;
  placement: number;
  eliminations: number;
  points: number;
  evidenceUrl: string;
  status: string;
  date: string;
}

export default function OrganizerDashboardPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("payouts_schedule");
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState(false);

  // Profile & Data State (Real state initialized empty)
  const [profile, setProfile] = useState<OrganizerProfile>({
    orgName: "Nova Esports Hub",
    contactEmail: "nova.esports@arena.gg",
    contactPhone: "+91 98765 43210",
    status: "approved",
    commissionRate: 10.0,
    upiId: "nova.esports@okhdfcbank",
    walletBalance: 0,
    totalSettledPayouts: 0,
  });

  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [resultsArchive, setResultsArchive] = useState<ResultArchiveItem[]>([]);

  // Tab 1 Form State: Create Tournament
  const [createForm, setCreateForm] = useState({
    title: "",
    game: "bgmi" as "bgmi" | "freefire",
    format: "squad" as "solo" | "duo" | "squad",
    visibility: "public" as "public" | "private",
    entryFee: 100,
    prizePool: 15000,
    maxSlots: 25,
    eventDate: "2026-11-26T20:00",
    firstPlacePoints: 15,
    killPoints: 1,
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    description: "Official competitive tournament with automated standings and instant prize pool.",
    rules: "Standard esports tournament rules. Mobile devices only. Emulators strictly forbidden.",
  });
  const [newPrivateToken, setNewPrivateToken] = useState<string | null>(null);

  // Tab 5 Form State: Add Result of Match
  const [resultForm, setResultForm] = useState({
    tournamentId: "",
    teamName: "",
    placement: 1,
    eliminations: 8,
    evidenceUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200",
    notes: "Official end-game leaderboard screenshot verified.",
  });

  // Tab 6 Form State: Room ID & Password
  const [credentialForm, setCredentialForm] = useState({
    tournamentId: "",
    roomId: "",
    roomPassword: "",
  });

  // Tab 7 Form State: Edit Profile & UPI ID
  const [profileForm, setProfileForm] = useState({
    orgName: "",
    contactEmail: "",
    contactPhone: "",
    upiId: "",
  });

  // Tab 4 Calculator State
  const [calcFee, setCalcFee] = useState(100);
  const [calcSlots, setCalcSlots] = useState(25);

  // Load from API on mount
  useEffect(() => {
    fetch("/api/organizer/dashboard")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          if (res.data.organizer) {
            setProfile(res.data.organizer);
            setProfileForm({
              orgName: res.data.organizer.orgName || "",
              contactEmail: res.data.organizer.contactEmail || "",
              contactPhone: res.data.organizer.contactPhone || "",
              upiId: res.data.organizer.upiId || "",
            });
          }
          if (res.data.tournaments) {
            setTournaments(res.data.tournaments);
            if (res.data.tournaments.length > 0) {
              setCredentialForm((prev) => ({
                ...prev,
                tournamentId: res.data.tournaments[0]._id,
                roomId: res.data.tournaments[0].matchRoomCredentials?.roomId || "",
                roomPassword: res.data.tournaments[0].matchRoomCredentials?.roomPassword || "",
              }));
              setResultForm((prev) => ({
                ...prev,
                tournamentId: res.data.tournaments[0]._id,
              }));
            }
          }
          if (res.data.results && res.data.results.length > 0) {
            const mappedResults: ResultArchiveItem[] = res.data.results.map((r: any) => ({
              id: r._id,
              tournamentTitle: r.tournament?.title || "Match Fixture",
              teamName: r.teamName,
              placement: r.placement,
              eliminations: r.eliminations,
              points: (r.placement === 1 ? 15 : 10) + (r.eliminations || 0),
              evidenceUrl: r.evidenceUrl,
              status: r.status,
              date: new Date(r.createdAt).toLocaleDateString("en-IN"),
            }));
            setResultsArchive(mappedResults);
          }
        }
      })
      .catch((err) => {
        toast.error("Could not fetch organizer dashboard telemetry from server.", "Connection Warning");
      })
      .finally(() => setLoading(false));
  }, []);

  // 1. Handle Create Tournament
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      toast.warning("Please provide a tournament title before publishing.", "Title Required");
      return;
    }

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTournaments([data.data, ...tournaments]);
        if (data.data.visibility === "private" && data.data.privateToken) {
          setNewPrivateToken(data.data.privateToken);
          toast.success(`Private tournament created with access token ${data.data.privateToken}`, "Private Event Live");
          toast.info("Direct registration invite link generated below.", "Access Control");
        } else {
          toast.success("Tournament published and live on PlayArena public marketplace!", "Event Created");
        }
        setCreateForm({
          ...createForm,
          title: "",
        });
      } else {
        toast.error(data.error || "Failed to create tournament.", "Creation Error");
      }
    } catch {
      toast.error("Network error while connecting to server. Please retry.", "Server Error");
    }
  };

  // 2. Handle Submit Result
  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultForm.teamName.trim()) {
      toast.warning("Please enter the winning team or squad name.", "Validation Warning");
      return;
    }

    try {
      const res = await fetch("/api/organizer/matches/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Match result verified and committed to official standings!", "Result Certified");
        const chosenTour = tournaments.find((t) => t._id === resultForm.tournamentId);
        setResultsArchive([
          {
            id: `res_${Date.now()}`,
            tournamentTitle: chosenTour?.title || "BGMI Match",
            teamName: resultForm.teamName,
            placement: Number(resultForm.placement),
            eliminations: Number(resultForm.eliminations),
            points: Number(resultForm.placement) === 1 ? 15 + Number(resultForm.eliminations) : 10 + Number(resultForm.eliminations),
            evidenceUrl: resultForm.evidenceUrl,
            status: "approved",
            date: "Just Now",
          },
          ...resultsArchive,
        ]);
        setResultForm({
          ...resultForm,
          teamName: "",
          placement: 1,
          eliminations: 0,
        });
      } else {
        toast.error(data.error || "Failed to submit result.", "Submission Error");
      }
    } catch {
      toast.error("Network error saving match result.", "Network Failure");
    }
  };

  // 3. Handle Update Credentials
  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialForm.roomId.trim() || !credentialForm.roomPassword.trim()) {
      toast.warning("Both Room ID and Room Password are required.", "Missing Credentials");
      return;
    }

    try {
      const res = await fetch("/api/organizer/matches/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentialForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Room ID & Password saved successfully!", "Credentials Stored");
        toast.info("Lobby credentials will unlock for players exactly 10 min before match time.", "Automated Release");
        setTournaments(
          tournaments.map((t) =>
            t._id === credentialForm.tournamentId
              ? {
                  ...t,
                  matchRoomCredentials: {
                    roomId: credentialForm.roomId,
                    roomPassword: credentialForm.roomPassword,
                  },
                }
              : t
          )
        );
      } else {
        toast.error(data.error || "Failed to update room credentials.", "Update Failed");
      }
    } catch {
      toast.error("Network error while updating credentials.", "Connection Error");
    }
  };

  // 4. Handle Update Profile & UPI ID
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.upiId.includes("@")) {
      toast.warning("Please specify a valid UPI ID (e.g. nova.esports@okhdfcbank).", "UPI Validation");
      return;
    }

    try {
      const res = await fetch("/api/organizer/dashboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (data.success) {
        setProfile({
          ...profile,
          ...profileForm,
        });
        toast.success("Organizer Profile and UPI ID saved successfully!", "Profile Updated");
      } else {
        toast.error(data.error || "Update failed.", "Profile Error");
      }
    } catch {
      toast.error("Network error updating profile.", "Update Error");
    }
  };

  // Financial aggregates
  const totalTournamentsCount = tournaments.length;
  const ticketGrossVolume = tournaments.reduce((acc, t) => acc + (t.registeredSlots * t.entryFee), 0);
  const platformFee = Math.round((ticketGrossVolume * (profile.commissionRate || 10)) / 100);
  const netEarnings = ticketGrossVolume - platformFee;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-medium text-emerald-800 mb-2 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            ORGANIZER COMMAND CENTER
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {profile.orgName}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-2">
            <span>Commission Tier: <strong className="text-emerald-700 font-mono">{profile.commissionRate}% Standard</strong></span>
            <span>•</span>
            <span>Settlement UPI: <strong className="font-mono text-slate-800">{profile.upiId || "Not Configured"}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("create")}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create Tournament</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Total Tournaments
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {totalTournamentsCount} Events
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Public &amp; Private active</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Ticket Gross Volume
          </span>
          <div className="text-xl font-bold text-amber-600 mt-1 font-mono">
            ₹{ticketGrossVolume.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-slate-500">Player registrations total</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Net Earnings ({100 - profile.commissionRate}%)
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1 font-mono">
            ₹{netEarnings.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">After {profile.commissionRate}% platform fee</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Settled to UPI
          </span>
          <div className="text-xl font-bold text-indigo-600 mt-1 font-mono">
            ₹{profile.totalSettledPayouts.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-indigo-700 font-medium">100% verified bank transfers</span>
        </div>
      </div>

      {/* 7 Tabs Navigation Bar */}
      <div className="border-b border-slate-200 bg-white rounded-xl shadow-xs overflow-x-auto">
        <div className="flex items-center min-w-max p-1.5 gap-1">
          {[
            { key: "create" as TabKey, label: "Create Tournament", icon: Plus },
            { key: "previous_results" as TabKey, label: "Previous Match Results", icon: History },
            { key: "payouts_schedule" as TabKey, label: "Payouts & Schedule", icon: DollarSign },
            { key: "commission" as TabKey, label: "Default Commission", icon: Percent },
            { key: "add_result" as TabKey, label: "Add Match Result", icon: FileCheck },
            { key: "room_credentials" as TabKey, label: "Room ID & Password", icon: Key },
            { key: "profile_upi" as TabKey, label: "Edit Profile & UPI", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: CREATE TOURNAMENT */}
      {activeTab === "create" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Host New Tournament</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Launch public tournaments on the website discovery or generate private invited-only scrim tokens.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateTournament} className="space-y-6">
            {/* Visibility Mode Switcher */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold mb-2">
                Tournament Visibility Mode *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setCreateForm({ ...createForm, visibility: "public" })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    createForm.visibility === "public"
                      ? "border-emerald-600 bg-emerald-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className={`h-5 w-5 ${createForm.visibility === "public" ? "text-emerald-600" : "text-slate-400"}`} />
                    <span className="font-bold text-xs text-slate-900">Public Tournament</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Available to everyone on website discovery. Anyone can search, explore, and register.
                  </p>
                </div>

                <div
                  onClick={() => setCreateForm({ ...createForm, visibility: "private" })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    createForm.visibility === "private"
                      ? "border-purple-600 bg-purple-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className={`h-5 w-5 ${createForm.visibility === "private" ? "text-purple-600" : "text-slate-400"}`} />
                    <span className="font-bold text-xs text-slate-900">Private (Invite Only)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Unlisted from public marketplace. Generates a private invite link &amp; secret access token.
                  </p>
                </div>
              </div>
            </div>

            {/* Title & Game */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tournament Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BGMI Pro Championship Cup Season 5"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Game *
                </label>
                <select
                  value={createForm.game}
                  onChange={(e) => setCreateForm({ ...createForm, game: e.target.value as "bgmi" | "freefire" })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  <option value="bgmi">BGMI (Battlegrounds India)</option>
                  <option value="freefire">Free Fire MAX</option>
                </select>
              </div>
            </div>

            {/* Format, Slots, Entry Fee & Prize Pool */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Format
                </label>
                <select
                  value={createForm.format}
                  onChange={(e) => setCreateForm({ ...createForm, format: e.target.value as "solo" | "duo" | "squad" })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  <option value="squad">Squad (4 Players)</option>
                  <option value="duo">Duo (2 Players)</option>
                  <option value="solo">Solo (1 Player)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Max Slots
                </label>
                <input
                  type="number"
                  min={2}
                  max={100}
                  value={createForm.maxSlots}
                  onChange={(e) => setCreateForm({ ...createForm, maxSlots: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Entry Fee (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={createForm.entryFee}
                  onChange={(e) => setCreateForm({ ...createForm, entryFee: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Prize Pool (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={createForm.prizePool}
                  onChange={(e) => setCreateForm({ ...createForm, prizePool: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            {/* Event Date & Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Event Schedule (Date &amp; Time)
                </label>
                <input
                  type="datetime-local"
                  value={createForm.eventDate}
                  onChange={(e) => setCreateForm({ ...createForm, eventDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Banner Artwork Image URL
                </label>
                <input
                  type="url"
                  value={createForm.bannerUrl}
                  onChange={(e) => setCreateForm({ ...createForm, bannerUrl: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <Plus className="h-4 w-4" />
              <span>Publish {createForm.visibility === "private" ? "Private" : "Public"} Tournament</span>
            </button>
          </form>

          {/* New Private Token Result */}
          {newPrivateToken && (
            <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-900 uppercase">
                  Private Registration Link Created
                </span>
                <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  Secret Invite
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={`http://localhost:3000/tournaments/join-token?token=${newPrivateToken}`}
                  className="w-full bg-white border border-purple-300 px-3 py-2 rounded-lg text-xs font-mono text-purple-900"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`http://localhost:3000/tournaments/join-token?token=${newPrivateToken}`);
                    setCopiedToken(true);
                    toast.info("Private invite link copied to clipboard!", "Link Copied");
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                  className="px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  {copiedToken ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedToken ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PREVIOUS MATCH RESULTS */}
      {activeTab === "previous_results" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Historical Match Results Archive</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review verified team standings, placement ranks, eliminations, and screenshot evidence.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("add_result")}
              className="px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record New Result</span>
            </button>
          </div>

          {resultsArchive.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Match Results Logged Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                When you or your tournament arbiters submit placement ranks and kill feeds, they will appear in this audited ledger.
              </p>
              <button
                onClick={() => setActiveTab("add_result")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Submit First Result →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Tournament Title</th>
                    <th className="py-3 px-4">Squad / Team</th>
                    <th className="py-3 px-4 text-center">Placement</th>
                    <th className="py-3 px-4 text-center">Kills</th>
                    <th className="py-3 px-4 text-center">Score Pts</th>
                    <th className="py-3 px-4 text-center">Proof Screenshot</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultsArchive.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {r.tournamentTitle}
                        <span className="block text-[10px] font-mono text-slate-400 font-normal">{r.date}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{r.teamName}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] ${
                          r.placement === 1 ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-slate-100 text-slate-700"
                        }`}>
                          #{r.placement}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-rose-600">{r.eliminations} Kills</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">{r.points} Pts</td>
                      <td className="py-3 px-4 text-center">
                        <a
                          href={r.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 underline font-mono"
                        >
                          <Eye className="h-3 w-3" /> View Proof
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          <Check className="h-3 w-3 text-emerald-600" /> Audit Approved
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PAYOUTS & SCHEDULE */}
      {activeTab === "payouts_schedule" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Active &amp; Upcoming Tournament Schedule
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time slots filled and room credential readiness status.
                </p>
              </div>
            </div>

            {tournaments.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Calendar className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">No Tournaments Scheduled</h4>
                <p className="text-[11px] text-slate-500">Create your first public or private event to begin registration.</p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Tournament
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Event Title</th>
                      <th className="py-3 px-4">Game &amp; Visibility</th>
                      <th className="py-3 px-4 text-center">Format</th>
                      <th className="py-3 px-4 text-center">Slots</th>
                      <th className="py-3 px-4 text-center">Ticket Gross</th>
                      <th className="py-3 px-4 text-center">Room Credentials</th>
                      <th className="py-3 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tournaments.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {t.title}
                          <span className="block text-[10px] font-mono text-slate-500 font-normal">
                            {t.tournamentDate ? new Date(t.tournamentDate).toLocaleDateString("en-IN") : "Today"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {t.game}
                          </span>
                          {t.visibility === "private" ? (
                            <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-purple-100 text-purple-800 font-bold">
                              Private
                            </span>
                          ) : (
                            <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-100 text-slate-600">
                              Public
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono uppercase text-slate-600">{t.format}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium">
                          {t.registeredSlots}/{t.maxSlots}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-amber-700 font-bold">
                          ₹{(t.registeredSlots * t.entryFee).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {t.matchRoomCredentials?.roomId ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 font-medium">
                              <Key className="h-3 w-3 text-emerald-600" />
                              {t.matchRoomCredentials.roomId}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-rose-500 font-medium">
                              Not Set Yet
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setCredentialForm({
                                tournamentId: t._id,
                                roomId: t.matchRoomCredentials?.roomId || "",
                                roomPassword: t.matchRoomCredentials?.roomPassword || "",
                              });
                              setActiveTab("room_credentials");
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium transition-colors"
                          >
                            Set Room ID →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Settlement History &amp; UPI Dispatches
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Platform disbursements wired to organizer bank UPI ID ({profile.upiId || "Pending Setup"}).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-slate-500">Gross Ticket Collection</span>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  ₹{ticketGrossVolume.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-slate-500">Platform Retainer (10%)</span>
                <div className="text-lg font-bold font-mono text-rose-600 mt-0.5">
                  - ₹{platformFee.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-mono uppercase text-emerald-800">Net Organizer Entitlement</span>
                <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                  ₹{netEarnings.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEFAULT COMMISSION & CALCULATOR */}
      {activeTab === "commission" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Platform Commission Agreement</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Super-admin assigned rate, revenue breakdown policy, and interactive tournament earnings calculator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rate Overview Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-emerald-800">Current Rate Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold font-mono">
                  ACTIVE
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono text-slate-900">{profile.commissionRate}%</span>
                <span className="text-xs text-slate-600 font-medium">Standard Ecosystem Cut</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                As a verified tournament partner, you retain <strong className="text-emerald-700 font-bold">{100 - profile.commissionRate}% of gross ticket sales</strong>. The platform cut covers:
              </p>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Escrow banking and 0% payment gateway processing fees</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Automated WhatsApp &amp; push notification SMS dispatches</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>24/7 arbitrator dispute resolution and anti-cheat compliance</span>
                </li>
              </ul>
            </div>

            {/* Interactive Calculator */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 uppercase">
                <Calculator className="h-4 w-4 text-emerald-600" />
                <span>Live Tournament Earnings Simulator</span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span>Entry Fee per Squad:</span>
                  <span className="font-bold font-mono">₹{calcFee}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={calcFee}
                  onChange={(e) => setCalcFee(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span>Registered Squads:</span>
                  <span className="font-bold font-mono">{calcSlots} Squads</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={calcSlots}
                  onChange={(e) => setCalcSlots(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Ticket Volume:</span>
                  <span className="font-semibold text-slate-900">₹{(calcFee * calcSlots).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Platform Fee ({profile.commissionRate}%):</span>
                  <span>- ₹{Math.round(((calcFee * calcSlots) * profile.commissionRate) / 100).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-700 pt-1 border-t border-slate-200">
                  <span>Your Net Payout:</span>
                  <span>₹{((calcFee * calcSlots) - Math.round(((calcFee * calcSlots) * profile.commissionRate) / 100)).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ADD RESULT OF MATCH */}
      {activeTab === "add_result" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Submit Match Result</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter official placement ranks, total kills, and proof screenshot URL to finalize scores.
            </p>
          </div>

          {tournaments.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-xs text-slate-600">You must create a tournament first before submitting results.</p>
              <button
                onClick={() => setActiveTab("create")}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Create Tournament Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitResult} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Tournament *
                </label>
                <select
                  value={resultForm.tournamentId}
                  onChange={(e) => setResultForm({ ...resultForm, tournamentId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  {tournaments.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title} ({t.game.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Winning Squad / Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Soul Gaming / Team Total"
                    value={resultForm.teamName}
                    onChange={(e) => setResultForm({ ...resultForm, teamName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Rank Placement *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    required
                    value={resultForm.placement}
                    onChange={(e) => setResultForm({ ...resultForm, placement: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Eliminations (Kills) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={resultForm.eliminations}
                    onChange={(e) => setResultForm({ ...resultForm, eliminations: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    End Game Screenshot Evidence URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={resultForm.evidenceUrl}
                    onChange={(e) => setResultForm({ ...resultForm, evidenceUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Arbitrator Notes
                </label>
                <textarea
                  rows={2}
                  value={resultForm.notes}
                  onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
              >
                <FileCheck className="h-4 w-4" />
                <span>Submit &amp; Certify Result</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 6: ADD ROOM ID AND PASSWORD */}
      {activeTab === "room_credentials" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Match Lobby Credentials Dispatch</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely set the in-game Room ID &amp; Password. Automated countdown reveals them to players 10 minutes prior to match.
            </p>
          </div>

          {tournaments.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-xs text-slate-600">Please host a tournament event before adding room credentials.</p>
              <button
                onClick={() => setActiveTab("create")}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Create Tournament
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateCredentials} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Active Tournament *
                </label>
                <select
                  value={credentialForm.tournamentId}
                  onChange={(e) => {
                    const selTour = tournaments.find((t) => t._id === e.target.value);
                    setCredentialForm({
                      tournamentId: e.target.value,
                      roomId: selTour?.matchRoomCredentials?.roomId || "",
                      roomPassword: selTour?.matchRoomCredentials?.roomPassword || "",
                    });
                  }}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  {tournaments.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title} ({t.game.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Custom In-Game Room ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5928192"
                    value={credentialForm.roomId}
                    onChange={(e) => setCredentialForm({ ...credentialForm, roomId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Room Password *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. playarena77"
                    value={credentialForm.roomPassword}
                    onChange={(e) => setCredentialForm({ ...credentialForm, roomPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Automated Security Rule:</strong> These credentials remain encrypted on the server until exactly <strong>10 minutes before the scheduled match start</strong>. At that moment, registered team players receive push &amp; WhatsApp alerts with room details.
                </p>
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
              >
                <Key className="h-4 w-4 text-emerald-400" />
                <span>Save &amp; Schedule Room Credentials</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 7: EDIT PROFILE & UPI ID */}
      {activeTab === "profile_upi" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Organizer Profile &amp; Payout Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your organization identity and verified settlement UPI ID for automated prize &amp; ticket disbursements.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Organization / Brand Name *
              </label>
              <input
                type="text"
                required
                value={profileForm.orgName}
                onChange={(e) => setProfileForm({ ...profileForm, orgName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.contactEmail}
                  onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  WhatsApp Contact Phone *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.contactPhone}
                  onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payout Settlement UPI ID (GPay / PhonePe / Paytm / BHIM) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. nova.esports@okhdfcbank"
                value={profileForm.upiId}
                onChange={(e) => setProfileForm({ ...profileForm, upiId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono font-bold text-emerald-800"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Platform ticket revenues are automatically credited to this VPA address.
              </span>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>Save Profile &amp; UPI ID</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
