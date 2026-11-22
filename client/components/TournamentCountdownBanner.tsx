"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Clock, 
  Key, 
  Copy, 
  Check, 
  Share2, 
  ShieldCheck, 
  Users, 
  Lock, 
  ExternalLink,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { MockTournament } from "@/lib/mockData";
import { useToast } from "@/lib/context/ToastContext";

function YoutubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface TournamentCountdownBannerProps {
  tournament: MockTournament;
  registration: any;
  onRosterUpdated?: () => void;
}

export default function TournamentCountdownBanner({
  tournament,
  registration,
  onRosterUpdated,
}: TournamentCountdownBannerProps) {
  const toast = useToast();
  // Target cutoff time: 10 minutes before match kickoff
  const defaultCutoff = new Date(Date.now() + 110 * 60 * 1000); // 1h 50m from now for demo
  const targetTime = registration?.rosterLockedAt
    ? new Date(registration.rosterLockedAt).getTime()
    : defaultCutoff.getTime();

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isLocked: boolean;
  }>({
    hours: 1,
    minutes: 50,
    seconds: 0,
    isLocked: false,
  });

  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Teammate direct join state
  const [joinTokenInput, setJoinTokenInput] = useState("");
  const [joiningTeammate, setJoiningTeammate] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Real-time countdown timer tick
  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isLocked: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isLocked: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const squadToken = registration?.squadToken || "SQ-8F29A";
  const teamName = registration?.teamName || "Team SoulFire";
  const members = registration?.members || [
    { gameId: "5129847291", inGameName: "Team Captain", role: "captain", status: "confirmed" },
  ];
  const maxMembers = registration?.maxMembers || 4;

  const universalLink = typeof window !== "undefined"
    ? `${window.location.origin}/join?token=${squadToken}&tid=${tournament.id}&team=${encodeURIComponent(teamName)}`
    : `https://playarena.gg/join?token=${squadToken}&tid=${tournament.id}`;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(squadToken);
    setCopiedToken(true);
    toast.info(`Squad token (${squadToken}) copied to clipboard`, "Token Copied");
    setTimeout(() => setCopiedToken(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🎮 Join squad "${teamName}" for ${tournament.title} on PlayArena!\n\n` +
      `🔑 Squad Token: *${squadToken}*\n` +
      `⏳ Roster locks 10 mins before match start!\n\n` +
      `Tap this link to claim your slot:\n${universalLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // Direct token claim by a visiting teammate
  const handleDirectJoinWithToken = async () => {
    if (!joinTokenInput.trim()) return;
    setJoiningTeammate(true);
    setJoinMessage(null);

    try {
      const res = await fetch("/api/tournaments/join-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: joinTokenInput.trim(),
          gameId: "5918237462",
          inGameName: "Teammate_Jonathan",
          username: "jonathan_amaral",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setJoinMessage({ type: "success", text: data.message });
        setJoinTokenInput("");
        if (onRosterUpdated) onRosterUpdated();
      } else {
        setJoinMessage({ type: "error", text: data.message });
      }
    } catch {
      setJoinMessage({
        type: "error",
        text: "Could not connect to join endpoint. Please verify token.",
      });
    } finally {
      setJoiningTeammate(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm space-y-0">
      
      {/* Top Banner: Status & Countdown Clock */}
      <div
        className={`p-5 sm:p-6 text-white transition-all ${
          timeLeft.isLocked
            ? "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900"
            : "bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  timeLeft.isLocked
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    timeLeft.isLocked ? "bg-rose-500" : "bg-emerald-400 animate-pulse"
                  }`}
                />
                {timeLeft.isLocked ? "Roster Locked (10-Min Cutoff Reached)" : "Early Slot Secured • Token Active"}
              </span>
              <span className="text-xs text-slate-400 font-mono">Team: {teamName}</span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              {timeLeft.isLocked ? "Match Commencing Soon" : "10-Minute Pre-Match Countdown"}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {timeLeft.isLocked
                ? "Roster has officially locked. Custom Room ID and Password are now available below and on WhatsApp."
                : "Teammates can claim open slots using your Squad Token or Universal Link until the timer hits 00:00:00."}
            </p>
          </div>

          {/* Countdown Clock Display */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 self-start md:self-auto shrink-0 font-mono">
            <Clock className="h-5 w-5 text-emerald-400 shrink-0" />
            <div className="text-center px-1.5">
              <span className="text-xl sm:text-2xl font-bold text-white">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="block text-[9px] uppercase text-slate-400">Hours</span>
            </div>
            <span className="text-xl font-bold text-slate-500">:</span>
            <div className="text-center px-1.5">
              <span className="text-xl sm:text-2xl font-bold text-white">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="block text-[9px] uppercase text-slate-400">Mins</span>
            </div>
            <span className="text-xl font-bold text-slate-500">:</span>
            <div className="text-center px-1.5">
              <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="block text-[9px] uppercase text-slate-400">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-6">
        
        {/* PHASE 1: TOKEN & ROSTER OPEN (< 10 MIN MARK) */}
        {!timeLeft.isLocked ? (
          <div className="space-y-6">
            
            {/* Squad Token & WhatsApp Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <div className="md:col-span-5 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" />
                  <span>Squad Invitation Token</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold font-mono text-slate-900 tracking-wider">
                    {squadToken}
                  </span>
                  <button
                    onClick={handleCopyToken}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                    title="Copy Token"
                  >
                    {copiedToken ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-7 flex flex-wrap items-center justify-end gap-2.5">
                <a
                  href={(tournament as any).youtubeStreamUrl || (tournament as any).streamUrl || "#official-stream"}
                  target={(tournament as any).youtubeStreamUrl || (tournament as any).streamUrl ? "_blank" : undefined}
                  rel={(tournament as any).youtubeStreamUrl || (tournament as any).streamUrl ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
                  <YoutubeIcon className="h-3.5 w-3.5 fill-white" />
                  <span>View Live Match Stream</span>
                  {((tournament as any).youtubeStreamUrl || (tournament as any).streamUrl) && (
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  )}
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(universalLink);
                    alert("Invite link copied to clipboard!");
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 shadow-xs cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy Universal Link</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Live Squad Roster Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-wider">
                <span>Current Roster ({members.length}/{maxMembers} Slots Filled)</span>
                <span className="text-emerald-700 font-semibold">{maxMembers - members.length} Slots Open for Token Claim</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {members.map((member: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                        Slot 0{idx + 1} • {member.role.toUpperCase()}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {member.inGameName}
                    </div>
                    <div className="text-xs font-mono text-slate-500 truncate">
                      UID: {member.gameId}
                    </div>
                  </div>
                ))}

                {/* Open Slots */}
                {Array.from({ length: maxMembers - members.length }).map((_, i) => (
                  <div
                    key={`open_${i}`}
                    className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-1"
                  >
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Slot 0{members.length + i + 1} • OPEN
                    </span>
                    <div className="text-xs font-bold text-slate-600">
                      Pending Token Claim
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Joins via {squadToken}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Token Claim Input (For visiting teammate) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>Teammate Quick Join (Enter Squad Token)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                If you were invited to this team by the captain, enter the Squad Token below to claim your spot in the lineup.
              </p>

              {joinMessage && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    joinMessage.type === "success"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-rose-100 text-rose-900 border border-rose-300"
                  }`}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{joinMessage.text}</span>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinTokenInput}
                  onChange={(e) => setJoinTokenInput(e.target.value.toUpperCase())}
                  placeholder="Enter Squad Token (e.g. SQ-8F29A)..."
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
                />
                <button
                  onClick={handleDirectJoinWithToken}
                  disabled={joiningTeammate || !joinTokenInput.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs font-mono transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  {joiningTeammate ? "Joining..." : "Claim Slot"}
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* PHASE 2: ROSTER LOCKED (10-MIN CUTOFF REACHED) */
          <div className="space-y-6">
            
            {/* Credentials Reveal Box */}
            <div className="p-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-extrabold text-slate-900 uppercase font-mono tracking-wider">
                    Official Custom Match Credentials Unlocked
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Delivered via WhatsApp
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Room ID */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                      Custom Room ID
                    </span>
                    <strong className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
                      882910
                    </strong>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("882910");
                      setCopiedRoomId(true);
                      setTimeout(() => setCopiedRoomId(false), 2000);
                    }}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Copy Room ID"
                  >
                    {copiedRoomId ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* Room Password */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                      Room Password
                    </span>
                    <strong className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">
                      play99
                    </strong>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("play99");
                      setCopiedPassword(true);
                      setTimeout(() => setCopiedPassword(false), 2000);
                    }}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Copy Password"
                  >
                    {copiedPassword ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-600">
                  Open your game, enter <strong>Custom Match</strong>, input Room ID and Password, and sit in your squad&apos;s assigned slot.
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={(tournament as any).youtubeStreamUrl || (tournament as any).streamUrl || "#official-stream"}
                    target={(tournament as any).youtubeStreamUrl || (tournament as any).streamUrl ? "_blank" : undefined}
                    rel={(tournament as any).youtubeStreamUrl || (tournament as any).streamUrl ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 text-center justify-center cursor-pointer"
                  >
                    <YoutubeIcon className="h-4 w-4 fill-white" />
                    <span>View Live Match Stream</span>
                  </a>

                  <Link
                    href="/matches/match_01"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 text-center justify-center"
                  >
                    <span>Enter Match Lobby</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Final Locked Roster Display */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-slate-500">
                Official Locked Roster ({members.length} Confirmed Athletes)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {members.map((m: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5"
                  >
                    <div className="h-7 w-7 rounded-lg bg-slate-200 text-slate-700 font-mono font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {m.inGameName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        UID: {m.gameId}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
