"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Gamepad2, 
  CreditCard, 
  ShieldCheck, 
  Check, 
  Loader2, 
  Sparkles, 
  ArrowRight,
  Info
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";

export default function ProfileCompletionModal() {
  const { 
    completionModalOpen, 
    closeCompletionModal, 
    user, 
    refreshUser, 
    completionStats 
  } = useAuth();
  const toast = useToast();

  const [game, setGame] = useState<"bgmi" | "freefire">("bgmi");
  const [gameId, setGameId] = useState("");
  const [inGameName, setInGameName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill existing data if user already has partial values
  useEffect(() => {
    if (user) {
      if (user.upiId) {
        setUpiId(user.upiId);
      }
      if (user.gameProfiles && user.gameProfiles.length > 0) {
        const primary = user.gameProfiles[0];
        setGame(primary.game as "bgmi" | "freefire");
        setGameId(primary.gameId);
        setInGameName(primary.inGameName);
      } else if (user.username) {
        setInGameName(user.username);
      }
    }
  }, [user, completionModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && completionModalOpen) {
        closeCompletionModal();
      }
    };
    if (completionModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [completionModalOpen, closeCompletionModal]);

  if (!completionModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!gameId.trim() && !upiId.trim()) {
      setError("Please provide at least a Game ID or UPI ID to update your profile.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {};

      if (gameId.trim()) {
        payload.gameProfile = {
          game,
          gameId: gameId.trim(),
          inGameName: inGameName.trim() || user?.username || "Athlete",
          verified: true,
        };
      }

      if (upiId.trim()) {
        payload.upiId = upiId.trim();
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        await refreshUser();
        toast.success(
          "Athlete profile updated! You are now set up for tournaments and payouts.",
          "Profile Complete"
        );
        closeCompletionModal();
      } else {
        setError(data.error || "Failed to update profile. Please try again.");
      }
    } catch {
      setError("Network error while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    closeCompletionModal();
    toast.info(
      "Profile setup skipped for now. You can complete it anytime from the top banner or profile page.",
      "Setup Pending"
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeCompletionModal();
        }
      }}
    >
      <div 
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 sm:p-7 shadow-2xl space-y-5 relative my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Skip dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-mono font-bold border border-emerald-200">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Profile Readiness: {completionStats.percent}%</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Complete Your Athlete Profile
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Link your Game Character ID (UID) and UPI VPA to enter official scrim lobbies and receive instant cash tournament prize transfers.
          </p>
        </div>

        {/* Progress Bar Visualizer */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 font-medium">Completion Progress</span>
            <span className="font-bold text-slate-900">{completionStats.percent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                completionStats.percent >= 100 
                  ? "bg-emerald-500" 
                  : completionStats.percent >= 70 
                  ? "bg-emerald-600" 
                  : "bg-amber-500"
              }`}
              style={{ width: `${Math.max(10, completionStats.percent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
            <span className={completionStats.hasBasic ? "text-emerald-700 font-bold" : ""}>
              {completionStats.hasBasic ? "✓" : "○"} Account (40%)
            </span>
            <span className={completionStats.hasGameId ? "text-emerald-700 font-bold" : ""}>
              {completionStats.hasGameId ? "✓" : "○"} Game UID (+30%)
            </span>
            <span className={completionStats.hasUpiId ? "text-emerald-700 font-bold" : ""}>
              {completionStats.hasUpiId ? "✓" : "○"} UPI Payouts (+30%)
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Game Character UID */}
          <div className="space-y-2.5 p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Gamepad2 className="h-4 w-4 text-emerald-600" />
                <span>Primary Game Character ID (+30%)</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {completionStats.hasGameId ? "Linked" : "Required for Scrims"}
              </span>
            </div>

            {/* Game Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGame("bgmi")}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  game === "bgmi"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-500 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                BGMI (Battlegrounds)
              </button>
              <button
                type="button"
                onClick={() => setGame("freefire")}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  game === "freefire"
                    ? "bg-amber-50 text-amber-900 border-amber-500 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Free Fire MAX
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Character UID (Numeric)
                </label>
                <input
                  type="text"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="e.g. 5129384729"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  In-Game Name (IGN)
                </label>
                <input
                  type="text"
                  value={inGameName}
                  onChange={(e) => setInGameName(e.target.value)}
                  placeholder="e.g. Mortal_Sniper"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: UPI ID */}
          <div className="space-y-2 p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span>UPI ID for Prize Money (+30%)</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {completionStats.hasUpiId ? "Linked" : "Instant Bank Credit"}
              </span>
            </div>

            <div>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value.trim().toLowerCase())}
                placeholder="e.g. username@oksbi or 9876543210@paytm"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Official prize money winnings are transferred directly to this VPA upon match certification.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              Skip for now
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Save &amp; Complete Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
