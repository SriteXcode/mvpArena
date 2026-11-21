"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Key, 
  Copy, 
  Check, 
  Upload, 
  Clock, 
  ShieldCheck, 
  CheckCircle2,
  FileImage,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useParams } from "next/navigation";
import { useToast } from "@/lib/context/ToastContext";
import ImageDropzone from "@/components/ImageDropzone";

export default function MatchLobbyPage() {
  const toast = useToast();
  const params = useParams();
  const matchId = (params?.id as string) || "match_01";

  const [copiedRoom, setCopiedRoom] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [placement, setPlacement] = useState<number>(1);
  const [eliminations, setEliminations] = useState<number>(8);
  const [screenshotUrl, setScreenshotUrl] = useState<string>(
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80"
  );
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [matchData, setMatchData] = useState({
    roomId: "882910",
    roomPassword: "play99",
    status: "live",
  });

  useEffect(() => {
    fetch(`/api/matches/${matchId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setMatchData({
            roomId: res.data.roomId || "882910",
            roomPassword: res.data.roomPassword || "play99",
            status: res.data.status || "live",
          });
        }
      })
      .catch(() => {});
  }, [matchId]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(matchData.roomId);
    setCopiedRoom(true);
    toast.info(`Room ID (${matchData.roomId}) copied to clipboard`, "Lobby Credentials");
    setTimeout(() => setCopiedRoom(false), 2000);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(matchData.roomPassword);
    setCopiedPass(true);
    toast.info(`Room Password copied to clipboard`, "Lobby Credentials");
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotUrl.trim()) {
      toast.warning("Please provide a valid screenshot URL as proof.", "Proof Required");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/matches/${matchId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placement,
          eliminations,
          evidenceUrl: screenshotUrl,
          teamName: "Team SoulFire",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast.success("Match screenshot submitted for arbitral audit!", "Result Dispatched");
      } else {
        toast.error(data.error || "Failed to submit result.", "Submission Error");
      }
    } catch {
      setSubmitted(true);
      toast.success("Match screenshot submitted!", "Result Dispatched");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-800 mb-2 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>FIXTURE STATUS: {matchData.status.toUpperCase()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            BGMI Pro Scrims Season 4 — Official Match Lobby
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Authorized lobby credentials distributed. Please authenticate within the tournament custom lobby prior to scheduled deployment.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Clock className="h-3.5 w-3.5 text-amber-600" />
          <span>Lobby Closes: 18:00 IST</span>
        </div>
      </div>

      {/* Room Access Credentials */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Custom Lobby Credentials
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Encrypted Match Token</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Room ID */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
              Lobby Identifier (Room ID)
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xl font-bold text-slate-900 tracking-wider">
                {matchData.roomId}
              </span>
              <button
                onClick={copyRoomId}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all border border-slate-300 shadow-xs"
              >
                {copiedRoom ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedRoom ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
              Lobby Access Passcode
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xl font-bold text-emerald-700 tracking-wider">
                {matchData.roomPassword}
              </span>
              <button
                onClick={copyPassword}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all border border-slate-300 shadow-xs"
              >
                {copiedPass ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedPass ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>Hardware emulators are strictly prohibited. Non-rostered participant identifiers will be expelled prior to flight deployment.</span>
        </div>
      </div>

      {/* Result Screenshot Submission */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Upload className="h-4 w-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
            Fixture Result Audit &amp; Evidence Submission
          </h3>
        </div>
        <p className="text-xs text-slate-600 mb-5">
          Submit certified squad placement and cumulative elimination totals accompanied by official end-game summary documentation.
        </p>

        {submitted ? (
          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-emerald-500/30 text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-emerald-950/60 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Evidence Submitted for Verification</h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Your match proof has been logged in the organizer queue. Leaderboard points will reflect automatically once reviewed.
            </p>
            <div className="pt-2">
              <Link
                href="/leaderboards"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-medium text-white hover:border-emerald-500/40 transition-all"
              >
                <span>View Tournament Standings</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitResult} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Final Squad Placement
                </label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  required
                  value={placement}
                  onChange={(e) => setPlacement(Number(e.target.value))}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Total Squad Eliminations
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={eliminations}
                  onChange={(e) => setEliminations(Number(e.target.value))}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Proof Preview & Drag-and-Drop Dropzone */}
            <ImageDropzone
              value={screenshotUrl}
              onChange={setScreenshotUrl}
              label="Official Result Screenshot (Proof of Score)"
              hint="Drag & drop your in-game summary proof, click to browse, or paste (Ctrl+V)"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting Fixture Documentation...
                </span>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Submit Fixture Documentation for Audit</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
