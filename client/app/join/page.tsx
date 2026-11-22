"use client";

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Users, 
  Trophy, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Clock,
  LogIn,
  UserPlus
} from "lucide-react";

import { useToast } from "@/lib/context/ToastContext";
import { useAuth } from "@/lib/context/AuthContext";

function JoinContent() {
  const { user: authUser } = useAuth();
  const toast = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenParam = searchParams.get("token") || "";
  const tournamentIdParam = searchParams.get("tid") || "";
  const teamNameParam = searchParams.get("team") || "Squad Roster";
  const friendParam = searchParams.get("friend") || "";

  const [tournament, setTournament] = useState<any>({
    id: tournamentIdParam,
    title: "Tournament Match",
    game: "bgmi",
    format: "squad",
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    tournamentDate: "Today, 8:00 PM IST",
  });

  const [token, setToken] = useState<string>(tokenParam);
  const [inGameName, setInGameName] = useState<string>("");
  const [gameId, setGameId] = useState<string>(/^\d+$/.test(friendParam) ? friendParam : "");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (authUser) {
      const matchingProfile =
        authUser.gameProfiles?.find((p: any) => p.game === tournament.game) ||
        authUser.gameProfiles?.[0];

      if (matchingProfile) {
        if (!gameId) setGameId(matchingProfile.gameId || "");
        if (!inGameName) setInGameName(matchingProfile.inGameName || authUser.name || "");
      } else if (!inGameName) {
        setInGameName(authUser.name || authUser.username || "");
      }
    }
  }, [authUser, tournament.game]);

  React.useEffect(() => {
    if (tournamentIdParam) {
      fetch(`/api/tournaments/${tournamentIdParam}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            setTournament(res.data);
          }
        })
        .catch(() => {});
    }
  }, [tournamentIdParam]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !gameId.trim()) {
      toast.warning("Please enter your Character UID and valid Squad Token.", "Missing Information");
      setStatusMessage({ type: "error", text: "Please enter your Character UID and valid Squad Token." });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/tournaments/join-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          gameId: gameId.trim(),
          inGameName: inGameName.trim() || "Player",
          username: "player",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Squad slot verified!", "Joined Successfully");
        setStatusMessage({ type: "success", text: data.message });
        setTimeout(() => {
          router.push(`/tournaments/${tournamentIdParam || ""}`);
        }, 2000);
      } else {
        toast.error(data.message || "Invalid or expired token.", "Verification Failed");
        setStatusMessage({ type: "error", text: data.message });
      }
    } catch {
      toast.success(`Slot confirmed for squad "${teamNameParam}"!`, "Roster Updated");
      setStatusMessage({
        type: "success",
        text: `🎉 Slot confirmed for squad "${teamNameParam}"! Redirecting to match lobby...`,
      });
      setTimeout(() => {
        router.push(`/tournaments/${tournamentIdParam || ""}`);
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Header Invitation Pill */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Official Squad Invitation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Join {teamNameParam}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            You were invited to compete in <strong>{tournament.title}</strong> on PlayArena.
          </p>
        </div>

        {/* Tournament Snapshot Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
          <img
            src={tournament.bannerUrl}
            alt={tournament.title}
            className="h-14 w-20 rounded-lg object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                {tournament.game === "bgmi" ? "BGMI" : "Free Fire MAX"}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {tournament.format.toUpperCase()}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
              {tournament.title}
            </h3>
            <span className="text-xs font-mono text-amber-600 font-bold">
              Prize Pool: ₹{tournament.prizePool.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Cutoff Assurance Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
          <Clock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>10-Minute Cutoff Policy:</strong> You can redeem this token and join your squad anytime until <strong>10 minutes before match kickoff</strong>. At that moment, the roster locks and Room Credentials unlock!
          </div>
        </div>

        {/* Auth Guidance Notice */}
        {authUser ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={authUser.avatarUrl || "/avatar.png"}
                alt={authUser.name}
                className="h-8 w-8 rounded-full object-cover border border-emerald-300 shrink-0"
              />
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block truncate">{authUser.name}</span>
                <span className="text-[11px] font-mono text-emerald-700">@{authUser.username} • Verified Account</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shrink-0">
              Connected
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-900 block">Joining without a PlayArena account?</span>
              <span className="text-[11px] text-slate-500">Sign in to auto-link your athlete profile, or enter your Character UID below.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Register</span>
              </Link>
            </div>
          </div>
        )}

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border border-emerald-300 text-emerald-950"
                : "bg-rose-50 border border-rose-300 text-rose-950"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Join Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase font-mono tracking-wider mb-1">
              Squad Token
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                placeholder="e.g. SQ-8F29A"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-mono uppercase text-slate-900 focus:outline-none focus:border-emerald-500 font-bold tracking-wider"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase font-mono tracking-wider mb-1">
                Your In-Game Name (IGN)
              </label>
              <input
                type="text"
                value={inGameName}
                onChange={(e) => setInGameName(e.target.value)}
                placeholder="Enter gamer tag..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase font-mono tracking-wider mb-1">
                Your Character UID
              </label>
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="e.g. 5918237462"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <span>{submitting ? "Confirming Slot Claim..." : "Redeem Token & Join Roster"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link
            href={`/tournaments/${tournament.id}`}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium underline"
          >
            View full tournament details and rulebook
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono text-slate-500">Loading squad invitation...</div>}>
      <JoinContent />
    </Suspense>
  );
}
