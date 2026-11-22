"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Flame, 
  Crosshair, 
  Share2, 
  ShieldCheck, 
  Trophy,
  Award,
  Edit3,
  Loader2,
  X,
  Check,
  Smartphone,
  Wallet,
  Sparkles,
  Gamepad2,
  CreditCard,
  ChevronRight
} from "lucide-react";
import GameIdsVault from "@/components/GameIdsVault";
import RegisteredEventsList from "@/components/RegisteredEventsList";
import ShareInviteModal from "@/components/ShareInviteModal";
import AchievementsHub from "@/components/AchievementsHub";
import ImageDropzone from "@/components/ImageDropzone";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";

interface UserProfileData {
  name: string;
  username: string;
  bio?: string;
  whatsappNumber?: string;
  upiId?: string;
  whatsappAlertsEnabled?: boolean;
  gameProfiles: Array<{ game: string; gameId: string; inGameName: string; verified?: boolean }>;
  walletBalance: number;
  avatarUrl: string;
  role: string;
  stats: {
    tournamentsPlayed: number;
    matchesPlayed: number;
    totalEliminations: number;
    winCount: number;
    bestRank: number;
    squadMembersCount?: number;
  };
}

export default function ProfilePage() {
  const { user: authUser, openCompletionModal } = useAuth();
  const toast = useToast();

  const [user, setUser] = useState<UserProfileData>({
    name: authUser?.name || "Athlete",
    username: authUser?.username || "player",
    bio: "",
    whatsappNumber: "",
    upiId: "",
    whatsappAlertsEnabled: true,
    gameProfiles: [],
    walletBalance: 0,
    avatarUrl: authUser?.avatarUrl || "/avatar.png",
    role: authUser?.role || "player",
    stats: {
      tournamentsPlayed: 0,
      matchesPlayed: 0,
      totalEliminations: 0,
      winCount: 0,
      bestRank: 0,
      squadMembersCount: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editUpi, setEditUpi] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchProfile = () => {
    setLoading(true);
    fetch("/api/profile")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setUser({
            name: res.data.name || authUser?.name || "Athlete",
            username: res.data.username || authUser?.username || "player",
            bio: res.data.bio || "",
            whatsappNumber: res.data.whatsappNumber || "",
            upiId: res.data.upiId || "",
            whatsappAlertsEnabled: res.data.whatsappAlertsEnabled ?? true,
            gameProfiles: res.data.gameProfiles || [],
            walletBalance: res.data.walletBalance || 0,
            avatarUrl: res.data.avatarUrl || authUser?.avatarUrl || "/avatar.png",
            role: res.data.role || "player",
            stats: res.data.stats || {
              tournamentsPlayed: 0,
              matchesPlayed: 0,
              totalEliminations: 0,
              winCount: 0,
              bestRank: 0,
            },
          });
        }
      })
      .catch(() => {
        toast.error("Failed to load profile details.", "Connection Error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [authUser]);

  const handleOpenEditModal = () => {
    setEditName(user.name);
    setEditUsername(user.username);
    setEditBio(user.bio || "");
    setEditWhatsapp(user.whatsappNumber || "");
    setEditUpi(user.upiId || "");
    setEditAvatar(user.avatarUrl || "");
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || editName.trim().length < 2) {
      toast.warning("Full name must be at least 2 characters.", "Validation");
      return;
    }
    if (!editUsername.trim() || editUsername.trim().length < 3) {
      toast.warning("Username must be at least 3 characters.", "Validation");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          username: editUsername.trim(),
          bio: editBio.trim(),
          whatsappNumber: editWhatsapp.trim(),
          upiId: editUpi.trim(),
          avatarUrl: editAvatar.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Your athlete profile has been updated!", "Saved");
        setShowEditModal(false);
        fetchProfile();
      } else {
        toast.error(data.error || "Failed to update profile.", "Error");
      }
    } catch {
      toast.error("Network error while saving profile.", "Connection Error");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Profile Header */}
      <div className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-slate-100 via-emerald-50 to-slate-100 border-b border-slate-200"></div>

        <div className="relative px-5 pb-5 pt-0 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 sm:-mt-14 gap-3 mb-5">
            <div className="flex items-end gap-3.5 min-w-0 max-w-full flex-1">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-white shrink-0">
                <Image
                  src={user.avatarUrl || "/avatar.png"}
                  alt={user.name}
                  fill
                  sizes="96px"
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col mb-0.5 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    {user.name}
                  </h1>
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-bold">
                    {user.role} tier
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-700 font-bold">
                  @{user.username}
                </span>
                {user.bio ? (
                  <p className="text-xs text-slate-600 mt-1 max-w-lg line-clamp-2">{user.bio}</p>
                ) : (
                  <span className="text-[11px] text-slate-400 mt-0.5 italic">
                    No athlete bio set. Tap Edit Profile to add your gaming tagline.
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs transition-all cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 shadow-xs transition-all cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Profile</span>
              </button>
            </div>
          </div>

          {/* Real Career Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                Tournaments Contested
              </span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {user.stats.tournamentsPlayed} Events
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                Matches Played
              </span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {user.stats.matchesPlayed} Matches
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                Championship Titles
              </span>
              <span className="text-base font-bold text-amber-600 font-mono">
                {user.stats.winCount} Titles
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                Total Eliminations
              </span>
              <span className="text-base font-bold text-rose-600 font-mono">
                {user.stats.totalEliminations} Kills
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Readiness & Completion Progress Card */}
      {(() => {
        const hasGameId = Boolean(user.gameProfiles && user.gameProfiles.length > 0 && user.gameProfiles[0]?.gameId);
        const hasUpiId = Boolean(user.upiId && user.upiId.trim().length > 0);
        let profilePercent = 40;
        if (hasGameId) profilePercent += 30;
        if (hasUpiId) profilePercent += 30;

        return (
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            profilePercent >= 100 
              ? "bg-emerald-50/60 border-emerald-200" 
              : "bg-white border-amber-300 shadow-sm ring-2 ring-amber-500/10"
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                  profilePercent >= 100 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {profilePercent >= 100 ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {profilePercent >= 100 
                        ? "Athlete Profile 100% Complete & Verified" 
                        : `Profile Setup: ${profilePercent}% Complete`}
                    </h3>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      profilePercent >= 100 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {profilePercent >= 100 ? "Ready to Compete" : "Action Required"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {profilePercent >= 100 
                      ? "Your Character UID and UPI VPA are verified. You can enter all match lobbies and receive instant cash prizes."
                      : "Link your Game Character UID and UPI ID to unlock tournament registrations and automatic prize money payouts."}
                  </p>
                </div>
              </div>

              {profilePercent < 100 && (
                <button
                  type="button"
                  onClick={openCompletionModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Complete Profile (+{100 - profilePercent}%)</span>
                </button>
              )}
            </div>

            {/* Progress Bar & 3-Step Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    profilePercent >= 100 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${profilePercent}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>1. Account Created (40%)</span>
                </div>

                <div className={`flex items-center gap-1.5 font-semibold ${
                  hasGameId ? "text-emerald-700" : "text-slate-500"
                }`}>
                  {hasGameId ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-slate-400 inline-block shrink-0 text-[10px] text-center leading-3">2</span>
                  )}
                  <span>2. Game Character UID (+30%)</span>
                </div>

                <div className={`flex items-center gap-1.5 font-semibold ${
                  hasUpiId ? "text-emerald-700" : "text-slate-500"
                }`}>
                  {hasUpiId ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-slate-400 inline-block shrink-0 text-[10px] text-center leading-3">3</span>
                  )}
                  <span>3. UPI ID for Cashouts (+30%)</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Enrolled Events & Game IDs Vault */}
        <div className="lg:col-span-2 space-y-6">
          <RegisteredEventsList />
          <GameIdsVault />
        </div>

        {/* Right Column: Career Performance */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Career Standings
              </h4>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Production Verified
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Trophy className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">Tournaments</span>
                </div>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {user.stats.tournamentsPlayed}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Flame className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">Matches Played</span>
                </div>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {user.stats.matchesPlayed}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <Crosshair className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">Total Kills</span>
                </div>
                <span className="font-mono font-bold text-rose-700 text-xs">
                  {user.stats.totalEliminations}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">Peak Placement</span>
                </div>
                <span className="font-mono font-bold text-emerald-700 text-xs">
                  {user.stats.bestRank > 0 ? `#0${user.stats.bestRank}` : "Unranked"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements & Milestone Rewards Section */}
      <div id="achievements" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-5 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-emerald-600 font-bold tracking-wider mb-0.5">
              <Award className="h-4 w-4" />
              <span>Player Milestones &amp; Bounties</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Rewards on Achievements &amp; Milestones
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            Instant UPI Cash Credits
          </span>
        </div>

        <AchievementsHub userStats={user.stats} />
      </div>

      {/* ================= EDIT PROFILE MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Athlete Profile</h3>
                <p className="text-xs text-slate-500">Update your public display name, handle, and contact info.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              {/* Profile Avatar Drag-and-Drop */}
              <ImageDropzone
                value={editAvatar}
                onChange={setEditAvatar}
                aspectRatio="square"
                label="Athlete Avatar (Profile Photo)"
                hint="Drag & drop your picture, click to browse, or paste (Ctrl+V)"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Athlete Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Arjun Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Username (@handle) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">@</span>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="viper_esports"
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Alphanumeric &amp; underscores only. Must be unique.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Athlete Bio / Motto
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="e.g. Competitive BGMI Assaulter • 4x Scrims Champion"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Smartphone className="h-3 w-3 text-emerald-600" />
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Wallet className="h-3 w-3 text-amber-600" />
                    Payout UPI ID
                  </label>
                  <input
                    type="text"
                    value={editUpi}
                    onChange={(e) => setEditUpi(e.target.value)}
                    placeholder="athlete@okhdfcbank"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ShareInviteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}
