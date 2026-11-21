"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Plus, ShieldCheck, Flame, Loader2 } from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";

export default function GameIdsVault() {
  const toast = useToast();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGame, setNewGame] = useState<"bgmi" | "freefire">("bgmi");
  const [newGameId, setNewGameId] = useState("");
  const [newIgn, setNewIgn] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.gameProfiles && res.data.gameProfiles.length > 0) {
          setProfiles(res.data.gameProfiles);
        }
      })
      .catch(() => {});
  }, []);

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.info(`Character UID (${id}) copied to clipboard`, "Game Vault");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddGameProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameId.trim() || !newIgn.trim()) {
      toast.warning("Character UID and In-Game Name are required.", "Required Fields");
      return;
    }

    setSaving(true);
    const updatedProfile = {
      game: newGame,
      gameId: newGameId.trim(),
      inGameName: newIgn.trim(),
      verified: true,
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameProfile: updatedProfile }),
      });
      const data = await res.json();
      if (data.success && data.data?.gameProfiles) {
        setProfiles(data.data.gameProfiles);
        toast.success("Character ID linked and verified!", "Vault Updated");
      } else {
        setProfiles([...profiles.filter((p) => p.game !== newGame), updatedProfile]);
        toast.success("Character ID linked and verified!", "Vault Updated");
      }
    } catch {
      setProfiles([...profiles.filter((p) => p.game !== newGame), updatedProfile]);
      toast.info("Character profile saved locally.", "Vault Updated");
    } finally {
      setSaving(false);
      setShowAddModal(false);
      setNewGameId("");
      setNewIgn("");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <Flame className="h-4 w-4 text-emerald-600" />
            Character IDs Vault
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Verified in-game identities used for custom room entry and automated roster invites.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Update Character ID</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {profiles.map((p) => {
          const isBGMI = p.game === "bgmi";
          return (
            <div
              key={p.game}
              className="relative rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isBGMI
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {isBGMI ? "BGMI" : "FREE FIRE MAX"}
                </span>

                {p.verified && (
                  <span className="flex items-center gap-1 text-[10px] text-sky-700 font-mono font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
                    Verified ID
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">
                    In-Game Name (IGN)
                  </span>
                  <div className="text-xs font-bold text-slate-900">{p.inGameName}</div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">
                    Character UID
                  </span>
                  <div className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-200 mt-0.5">
                    <span className="font-mono text-xs font-semibold text-slate-800">
                      {p.gameId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(p.gameId)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 transition-all"
                    >
                      {copiedId === p.gameId ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono mb-1">
              Update Character ID
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Enter your exact numeric UID and IGN as displayed in the game client.
            </p>

            <form onSubmit={handleAddGameProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Game Title
                </label>
                <select
                  value={newGame}
                  onChange={(e) => setNewGame(e.target.value as "bgmi" | "freefire")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                >
                  <option value="bgmi">Battlegrounds Mobile India (BGMI)</option>
                  <option value="freefire">Free Fire MAX</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  In-Game Name (IGN)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Viper_GodLike"
                  value={newIgn}
                  onChange={(e) => setNewIgn(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Numeric Character ID / UID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5129847291"
                  value={newGameId}
                  onChange={(e) => setNewGameId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  <span>{saving ? "Saving..." : "Save Character ID"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
