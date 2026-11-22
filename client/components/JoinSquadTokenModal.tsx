"use client";

import React, { useState, useEffect } from "react";
import { 
  Key, 
  X, 
  ShieldCheck, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Gamepad2,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";

interface JoinSquadTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentTitle?: string;
  game?: string;
  defaultToken?: string;
  onSuccess: (data: any) => void;
}

export default function JoinSquadTokenModal({
  isOpen,
  onClose,
  tournamentId,
  tournamentTitle = "Tournament",
  game = "bgmi",
  defaultToken = "",
  onSuccess,
}: JoinSquadTokenModalProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [squadToken, setSquadToken] = useState(defaultToken);
  const [characterUid, setCharacterUid] = useState("");
  const [inGameName, setInGameName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-fill from user game profiles if available
  useEffect(() => {
    if (defaultToken) {
      setSquadToken(defaultToken.toUpperCase());
    }
    if (user?.gameProfiles && user.gameProfiles.length > 0) {
      const match = user.gameProfiles.find((gp: any) => gp.game === game);
      if (match) {
        setCharacterUid(match.gameId || "");
        setInGameName(match.inGameName || "");
      } else {
        setCharacterUid(user.gameProfiles[0].gameId || "");
        setInGameName(user.gameProfiles[0].inGameName || "");
      }
    }
  }, [user, game, defaultToken, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadToken.trim()) {
      setErrorMsg("Please enter your Squad Invitation Token.");
      return;
    }
    if (!characterUid.trim()) {
      setErrorMsg("Please enter your In-Game Character UID.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/tournaments/join-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: squadToken.trim(),
          gameId: characterUid.trim(),
          inGameName: inGameName.trim() || user?.name || user?.username || "Teammate",
          username: user?.username,
          tournamentId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Successfully joined squad!", "Squad Joined");
        onSuccess(data.data);
        onClose();
      } else {
        setErrorMsg(data.message || "Failed to join squad.");
        toast.error(data.message || "Failed to join squad.", "Join Error");
      }
    } catch {
      setErrorMsg("Connection error while joining squad roster.");
      toast.error("Failed to connect to the server.", "Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Join via Squad Token</h3>
              <p className="text-xs text-slate-500 font-mono">
                {tournamentTitle} • {game.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Squad Token Field */}
          <div>
            <label className="block text-xs font-bold uppercase font-mono text-slate-700 mb-1">
              Squad Invitation Token *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={squadToken}
                onChange={(e) => setSquadToken(e.target.value.toUpperCase())}
                placeholder="e.g. SQ-8F29A"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 uppercase"
              />
              <Key className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Obtain this token directly from your team captain.
            </p>
          </div>

          {/* In-Game Character UID */}
          <div>
            <label className="block text-xs font-bold uppercase font-mono text-slate-700 mb-1">
              Your {game.toUpperCase()} Character UID *
            </label>
            <input
              type="text"
              required
              value={characterUid}
              onChange={(e) => setCharacterUid(e.target.value)}
              placeholder="e.g. 5129846809"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Your game UID will be verified in the official custom match room.
            </p>
          </div>

          {/* In-Game Name (IGN) */}
          <div>
            <label className="block text-xs font-bold uppercase font-mono text-slate-700 mb-1">
              In-Game Character Name (IGN)
            </label>
            <input
              type="text"
              value={inGameName}
              onChange={(e) => setInGameName(e.target.value)}
              placeholder="e.g. Sniper_99"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>

          {/* User Account Info Pill */}
          {user && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Signing in as:</span>
              <span className="font-mono font-bold text-slate-900">@{user.username}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Token...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verify &amp; Join Squad</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
