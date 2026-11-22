"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Gamepad2, 
  ExternalLink,
  Users,
  Trophy,
  Loader2,
  Check,
  X,
  Clock,
  Sparkles
} from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";

export interface RegisteredEvent {
  id: string;
  tournamentId: string;
  title: string;
  game: "bgmi" | "freefire";
  format: string;
  teamName: string;
  assignedSlot: number;
  scheduledTime: string;
  startsInText: string;
  isNearest: boolean;
  credentialsAvailable: boolean;
  matchLobbyUrl: string;
  tournamentUrl: string;
  prizePool: string;
  mapName: string;
}

export interface PendingInvitation {
  id: string;
  tournamentId: string;
  tournamentTitle: string;
  game: "bgmi" | "freefire";
  format: string;
  teamName: string;
  squadToken: string;
  captainName: string;
  captainUsername: string;
  scheduledTime: string;
  bannerUrl: string;
  prizePool: string;
}

export default function RegisteredEventsList() {
  const toast = useToast();
  const [fixtures, setFixtures] = useState<RegisteredEvent[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.allSettled([
      fetch("/api/profile/registrations").then((res) => res.json()),
      fetch("/api/profile/invitations").then((res) => res.json()),
    ])
      .then(([regResult, invResult]) => {
        if (regResult.status === "fulfilled" && regResult.value?.success && Array.isArray(regResult.value.data)) {
          setFixtures(regResult.value.data);
        }
        if (invResult.status === "fulfilled" && invResult.value?.success && Array.isArray(invResult.value.data)) {
          setInvitations(invResult.value.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRespond = async (inv: PendingInvitation, action: "accept" | "reject") => {
    setRespondingId(inv.id);
    try {
      const res = await fetch(`/api/tournaments/${inv.tournamentId}/invitations/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: inv.id,
          action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === "accept") {
          toast.success(data.message || `Joined squad "${inv.teamName}"!`, "Squad Confirmed");
        } else {
          toast.info(data.message || "Invitation declined.", "Declined");
        }
        fetchData();
      } else {
        toast.error(data.message || "Failed to respond to invitation.", "Error");
      }
    } catch {
      toast.error("Failed to connect to server.", "Network Error");
    } finally {
      setRespondingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin mx-auto text-emerald-600 mb-2" />
        Loading your registered tournament fixtures...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PENDING SQUAD INVITATIONS BANNER */}
      {invitations.length > 0 && (
        <div className="rounded-xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Pending Squad Invitations ({invitations.length})
              </h4>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
              Action Required
            </span>
          </div>

          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl border border-emerald-200 bg-white/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {inv.tournamentTitle}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-700">
                      {inv.game.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                    <span>Squad: <strong className="text-emerald-700">{inv.teamName}</strong></span>
                    <span>•</span>
                    <span>Captain: {inv.captainName} {inv.captainUsername ? `(@${inv.captainUsername})` : ""}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Token: <strong className="text-slate-700">{inv.squadToken}</strong> • {inv.scheduledTime}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRespond(inv, "accept")}
                    disabled={respondingId === inv.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{respondingId === inv.id ? "Joining..." : "Accept & Join"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespond(inv, "reject")}
                    disabled={respondingId === inv.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONFIRMED REGISTERED TOURNAMENTS */}
      {fixtures.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No Enrolled Tournaments Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You have not registered for any upcoming esports scrims. Browse open qualifiers and claim your squad slot.
            </p>
          </div>
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-sm"
          >
            <span>Explore Tournaments &rarr;</span>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-emerald-600 font-bold tracking-wider mb-0.5">
                <Gamepad2 className="h-3.5 w-3.5" />
                <span>Enrolled Scrims &amp; Match Lobbies</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Registered Tournaments ({fixtures.length})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fixtures.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                      {item.game.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-600">
                      Slot #{item.assignedSlot}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <Users className="h-3 w-3" />
                    <span>Squad: <strong className="text-slate-800 font-semibold">{item.teamName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <Calendar className="h-3 w-3" />
                    <span>{item.scheduledTime}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 font-mono">{item.prizePool}</span>
                  <Link
                    href={item.credentialsAvailable ? item.matchLobbyUrl : item.tournamentUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>{item.credentialsAvailable ? "Match Lobby" : "Details"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
