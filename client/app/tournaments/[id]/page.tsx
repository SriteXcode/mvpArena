"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Users, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  CreditCard, 
  Share2, 
  AlertCircle,
  Key,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useParams } from "next/navigation";
import { formatINR } from "@/lib/utils";
import ShareInviteModal from "@/components/ShareInviteModal";
import TournamentRegistrationModal from "@/components/TournamentRegistrationModal";
import TournamentCountdownBanner from "@/components/TournamentCountdownBanner";
import { useToast } from "@/lib/context/ToastContext";

export default function TournamentDetailPage() {
  const toast = useToast();
  const params = useParams();
  const tournamentId = (params?.id as string) || "tour_bgmi_01";
  const [tournament, setTournament] = useState<any>({
    id: tournamentId,
    title: "Tournament Fixture",
    slug: "tournament-fixture",
    game: "bgmi",
    format: "squad",
    organizerName: "Nova Esports Hub",
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200",
    entryFee: 100,
    prizePool: 15000,
    maxSlots: 25,
    registeredSlots: 1,
    registrationEnd: "Today, 6:00 PM",
    tournamentDate: "Today, 8:00 PM IST",
    status: "registration_open",
    rules: "Standard esports guidelines. Emulators forbidden.",
    scoringRules: { firstPlacePoints: 15, killPoints: 1 },
  });

  const [showRegModal, setShowRegModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [registration, setRegistration] = useState<any>(null);

  const fetchRegistration = () => {
    fetch(`/api/tournaments/${tournamentId}/register`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setRegistration(res.data);
        }
      })
      .catch(() => {});
  };

  React.useEffect(() => {
    fetch(`/api/tournaments/${tournamentId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const t = res.data;
          setTournament({
            id: t._id || t.id,
            title: t.title,
            slug: t.slug,
            game: t.game,
            format: t.format,
            organizerName: t.organizer?.orgName || "Nova Esports Hub",
            bannerUrl: t.bannerUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200",
            entryFee: t.entryFee,
            prizePool: t.prizePool,
            maxSlots: t.maxSlots,
            registeredSlots: t.registeredSlots || 0,
            registrationEnd: "Today, 6:00 PM",
            tournamentDate: new Date(t.tournamentDate).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: t.status,
            rules: t.rules,
            visibility: t.visibility,
            privateToken: t.privateToken,
            matchRoomCredentials: t.matchRoomCredentials,
            scoringRules: {
              firstPlacePoints: t.scoringRules?.placementPoints?.["1"] || 15,
              killPoints: t.scoringRules?.eliminationPoints || 1,
            },
          });
        }
      })
      .catch(() => {
        toast.error("Could not fetch tournament fixture details.", "Server Notice");
      });

    fetchRegistration();
  }, [tournamentId]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner Hero */}
      <div className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="h-60 sm:h-72 w-full relative">
          <img
            src={tournament.bannerUrl}
            alt={tournament.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-white/95 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold uppercase shadow-xs">
              {tournament.game === "bgmi" ? "BGMI" : "FREE FIRE MAX"}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/95 border border-slate-200 text-xs font-mono font-semibold text-slate-800 uppercase shadow-xs">
              {tournament.format}
            </span>
          </div>

          <div className="absolute bottom-5 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                <span>Organized by {tournament.organizerName}</span>
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                {tournament.title}
              </h1>
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/95 border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-white shadow-xs transition-all self-start md:self-auto"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share Event</span>
            </button>
          </div>
        </div>

        {/* Quick Details Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 border-t border-slate-200 bg-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              Total Prize Pool
            </span>
            <span className="text-lg font-bold text-amber-600 font-mono">
              {formatINR(tournament.prizePool)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              Entry Fee
            </span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {tournament.entryFee === 0 ? "FREE" : `₹${tournament.entryFee}`}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              Enrolled Slots
            </span>
            <span className="text-lg font-bold text-emerald-600 font-mono">
              {tournament.registeredSlots}/{tournament.maxSlots}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              Schedule
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-1">
              {tournament.tournamentDate}
            </span>
          </div>
        </div>
      </div>

      {/* Live Pre-Match Countdown Banner & Roster Manager (Shown when Registered) */}
      {registration && (
        <TournamentCountdownBanner
          tournament={tournament}
          registration={registration}
          onRosterUpdated={fetchRegistration}
        />
      )}

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Rules & Scoring */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scoring Engine Rules */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Trophy className="h-4 w-4 text-amber-500" />
              Official Tournament Scoring Matrix
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center mb-3">
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-[9px] font-mono text-amber-700 block">1st Place</span>
                <span className="text-base font-bold text-amber-700 font-mono">15 Pts</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-mono text-slate-500 block">2nd Place</span>
                <span className="text-base font-bold text-slate-800 font-mono">12 Pts</span>
              </div>
              <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200">
                <span className="text-[9px] font-mono text-orange-700 block">3rd Place</span>
                <span className="text-base font-bold text-orange-700 font-mono">10 Pts</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-[9px] font-mono text-rose-700 block">Elimination</span>
                <span className="text-base font-bold text-rose-700 font-mono">+1 Pt</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Points are calculated automatically by the Scoring Engine upon organizer screenshot verification. Tiebreakers prioritize total placement points followed by total kills.
            </p>
          </div>

          {/* Rules */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 font-mono uppercase tracking-wider">
              Rulebook &amp; Code of Conduct
            </h3>
            <div className="text-xs text-slate-600 space-y-2 whitespace-pre-line leading-relaxed">
              {tournament.rules}
            </div>
          </div>
        </div>

        {/* Right Column: Registration Card */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {registration ? (
              <div className="space-y-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto border border-emerald-200">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Slot Confirmed &amp; Early Locked
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    {registration.teamName}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 font-mono">
                    Squad Token: <strong className="text-slate-900">{registration.squadToken}</strong>
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                  <div>Roster Filled: <strong>{registration.members?.length || 1} / {registration.maxMembers || 4}</strong></div>
                  <div className="text-[11px] text-slate-400">Tokens valid until 10 min before kickoff</div>
                </div>

                <Link
                  href="/matches/match_01"
                  className="block w-full py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider text-center hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20"
                >
                  Enter Match Lobby →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Roster Enrollment
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {tournament.format}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Register solo or search teammates by Game ID. Lock your team slot early — teammates can join using your Squad Token until 10 minutes before kickoff!
                </p>

                <div className="space-y-2 border-t border-slate-200 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Participation Tariff</span>
                    <span className="font-mono font-bold text-slate-900">
                      {tournament.entryFee === 0 ? "FREE ENTRY" : `₹${tournament.entryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Roster Lock Window</span>
                    <span className="text-emerald-700 font-semibold font-mono">
                      10 Min Prior to Start
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRegModal(true)}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Register &amp; Lock Slot</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRegModal(true)}
                  className="w-full py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key className="h-3.5 w-3.5 text-slate-500" />
                  <span>Search Team / Invite with Token</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ShareInviteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        tournamentTitle={tournament.title}
      />

      <TournamentRegistrationModal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        tournament={tournament}
        onRegistrationSuccess={(data) => {
          setRegistration(data);
        }}
      />
    </div>
  );
}
