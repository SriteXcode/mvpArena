"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Flame, 
  Tv, 
  Trophy, 
  Award, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  Users,
  Clock,
  ShieldCheck,
  TrendingUp,
  Gift
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface FeatureDetail {
  id: string;
  tag: string;
  badge: string;
  badgeColor: "emerald" | "amber" | "rose" | "indigo" | "purple";
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keyPoints: string[];
  metrics: { label: string; value: string }[];
  ctaText: string;
  ctaLink: string;
}

const PLATFORM_FEATURES: FeatureDetail[] = [
  {
    id: "daily_tournaments",
    tag: "FEATURE 01",
    badge: "Every Day • 4 Slots",
    badgeColor: "emerald",
    title: "Daily Tournaments & Scrims",
    subtitle: "Continuous competitive practice with instant cash payouts every evening",
    description: "Never wait days for the next tournament. PlayArena hosts structured daily scrims at 11:00 AM, 2:30 PM, 8:00 PM, and 10:30 PM for BGMI and Free Fire MAX squads. Refine tier-1 rotation strategies and earn daily cash prizes.",
    icon: Calendar,
    keyPoints: [
      "Scheduled daily slots: Morning, Afternoon, Prime (8 PM), and Midnight",
      "Low entry fees from ₹0 (Free Entry) to ₹50 with guaranteed payouts",
      "Official room credentials delivered to WhatsApp 10 min prior to start"
    ],
    metrics: [
      { label: "Daily Matches", value: "16+ Lobbies" },
      { label: "Daily Winners", value: "64+ Squads" },
      { label: "Avg. Turnaround", value: "30 Mins" }
    ],
    ctaText: "Browse Daily Tournaments",
    ctaLink: "#featured-tournaments"
  },
  {
    id: "weekend_mega",
    tag: "FEATURE 02",
    badge: "Saturday & Sunday Marathon",
    badgeColor: "amber",
    title: "Weekend All-Day Mega Contests",
    subtitle: "100+ squad brackets, 4-stage qualifiers, and massive grand finales",
    description: "Saturdays and Sundays turn into high-octane esports festivals on PlayArena. Compete in all-day marathon brackets starting with morning open qualifiers, progressing through afternoon quarter/semi-finals, and culminating in the primetime Grand Finale.",
    icon: Flame,
    keyPoints: [
      "100 to 128 Squad massive capacity with multi-stage playoffs",
      "Official live commentary & caster broadcasts during Semis and Finals",
      "Double point multipliers and season leaderboard ranking boosts"
    ],
    metrics: [
      { label: "Bracket Capacity", value: "100 Squads" },
      { label: "Tournament Duration", value: "10 Hours" },
      { label: "Contest Slots", value: "Sat & Sun" }
    ],
    ctaText: "Explore Weekend Contests",
    ctaLink: "#featured-tournaments"
  },
  {
    id: "live_stream",
    tag: "FEATURE 03",
    badge: "🔴 Live Commentary",
    badgeColor: "rose",
    title: "Official Esports Live Streams",
    subtitle: "High-definition broadcasts, pro casters, and real-time hype reactions",
    description: "Experience tournament matches like never before. PlayArena broadcasts sanctioned tournaments with professional esports casters, multi-POV spectator feeds, live leaderboard overlays, and interactive community hype chat.",
    icon: Tv,
    keyPoints: [
      "Professional caster duos streaming in English, Hindi, and regional languages",
      "Real-time kill tickers and live spectator point recalculations",
      "Interactive fan reactions (🔥 🏆 ⚡ 🎯) and match highlight clips"
    ],
    metrics: [
      { label: "Peak Viewers", value: "54K+ Live" },
      { label: "Broadcast Quality", value: "1080p 60FPS" },
      { label: "Caster Roster", value: "Top Tier-1" }
    ],
    ctaText: "Watch Live Streams",
    ctaLink: "/streams"
  },
  {
    id: "mega_prize_pools",
    tag: "FEATURE 04",
    badge: "Up to ₹5,00,000",
    badgeColor: "indigo",
    title: "Larger Mega Prize Pools",
    subtitle: "Life-changing cash prizes with direct, guaranteed UPI settlements",
    description: "Step onto the big stage with PlayArena's flagship Mega Prize Pool tournaments. Compete for guaranteed prize pools ranging from ₹1,00,000 to ₹5,00,000+ with 100% transparent distribution across top rankings and MVP Top Fraggers.",
    icon: Trophy,
    keyPoints: [
      "Transparent distribution: 50% 1st, 25% 2nd, 15% 3rd, 10% MVP Fragger",
      "Instant wire transfers to team captain's UPI ID within 3 hours",
      "Zero hidden platform commission deducted from the advertised prize pool"
    ],
    metrics: [
      { label: "Largest Pool", value: "₹5,00,000" },
      { label: "Payout Time", value: "Under 3 Hrs" },
      { label: "Commission Fee", value: "0% on Prizes" }
    ],
    ctaText: "View High-Stakes Cups",
    ctaLink: "#featured-tournaments"
  },
  {
    id: "achievement_rewards",
    tag: "FEATURE 05",
    badge: "Cash Bonuses & Badges",
    badgeColor: "purple",
    title: "Achievement & Milestone Rewards",
    subtitle: "Get rewarded for every kill, tournament win, and team milestone",
    description: "Your competitive grind deserves tangible rewards. Unlock automated UPI cash credits, exclusive animated profile badges, and VIP leaderboard status when hitting milestones like 100 eliminations, 5 podium finishes, or recruiting squad mates.",
    icon: Award,
    keyPoints: [
      "Instant UPI Cash Rewards credited straight to your bank account",
      "Tiered milestone paths: Combat, Tournament Podiums, and Squad Leadership",
      "Claimable anytime directly from your Player Profile dashboard"
    ],
    metrics: [
      { label: "Cash Unlocks", value: "Up to ₹5,000" },
      { label: "Active Milestones", value: "24 Tiers" },
      { label: "Instant Claim", value: "1-Click UPI" }
    ],
    ctaText: "View Your Milestones",
    ctaLink: "/profile#achievements"
  }
];

export default function PlatformFeaturesShowcase() {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>("daily_tournaments");

  const currentFeature =
    PLATFORM_FEATURES.find((f) => f.id === selectedFeatureId) || PLATFORM_FEATURES[0];
  const FeatureIcon = currentFeature.icon;

  return (
    <section 
      id="platform-features"
      aria-labelledby="features-heading"
      className="w-full py-12 sm:py-16 bg-white border-b border-slate-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-mono font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Built For Elite Competitors</span>
          </div>
          <h2 
            id="features-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Arena Features & Competitive Perks
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            Everything serious mobile esports athletes need — from round-the-clock daily lobbies and all-day weekend marathons to pro live streams and cash milestone rewards.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-8">
          {PLATFORM_FEATURES.map((feature, idx) => {
            const isSelected = selectedFeatureId === feature.id;
            const Icon = feature.icon;

            return (
              <button
                key={feature.id}
                onClick={() => setSelectedFeatureId(feature.id)}
                className={`flex flex-col items-center text-center p-3 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/20"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300"
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center mb-2.5 transition-colors ${
                    isSelected
                      ? "bg-emerald-500 text-slate-900 font-bold"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-70 mb-0.5">
                  0{idx + 1}
                </span>
                <span className="text-xs sm:text-sm font-bold line-clamp-1">
                  {feature.title.split("&")[0].trim()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Deep Dive Showcase Banner */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
          {/* Decorative Background Accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/40 via-teal-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                  {currentFeature.tag}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                    currentFeature.badgeColor === "emerald"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : currentFeature.badgeColor === "amber"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : currentFeature.badgeColor === "rose"
                      ? "bg-rose-100 text-rose-900 border border-rose-300"
                      : currentFeature.badgeColor === "indigo"
                      ? "bg-indigo-100 text-indigo-900 border border-indigo-300"
                      : "bg-purple-100 text-purple-900 border border-purple-300"
                  }`}
                >
                  {currentFeature.badge}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {currentFeature.title}
                </h3>
                <p className="mt-1.5 text-sm sm:text-base font-semibold text-emerald-700">
                  {currentFeature.subtitle}
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                {currentFeature.description}
              </p>

              {/* Key Bullet Checklist */}
              <div className="space-y-2.5 pt-1">
                {currentFeature.keyPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <Link
                  href={currentFeature.ctaLink}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-600 transition-all shadow-sm"
                >
                  <span>{currentFeature.ctaText}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Metrics & Highlights Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FeatureIcon className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Feature Highlights
                    </span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  {currentFeature.metrics.map((metric, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-center">
                      <div className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                        {metric.value}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trust Seal Banner */}
                <div className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-700 shrink-0" />
                  <div className="text-xs text-emerald-950 leading-relaxed">
                    <strong>100% Verified Play:</strong> Screenshot audit on every match result and automated UPI disbursement within 3 to 24 hours.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
