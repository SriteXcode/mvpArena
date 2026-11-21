"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Users, 
  CheckCircle2, 
  Key, 
  Camera, 
  Award, 
  Zap, 
  ArrowRight, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ChevronRight
} from "lucide-react";

export interface WorkflowStep {
  number: number;
  stepLabel: string;
  title: string;
  timingBadge?: string;
  timingColor?: "emerald" | "amber" | "indigo" | "rose" | "cyan";
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  details: string[];
  phase: "Pre-Match" | "Match Time" | "Rewards";
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    number: 1,
    stepLabel: "Step 01",
    title: "Tournament Registration",
    timingBadge: "Instant",
    timingColor: "emerald",
    description: "Browse curated BGMI and Free Fire MAX tournaments. Filter by game, entry fee, schedule, or time slot, and pick your competition.",
    icon: Trophy,
    details: ["Select game & slot format (Solo, Duo, Squad)", "Free Entry & Cash Prize pools", "Transparent organizer rules & points system"],
    phase: "Pre-Match",
  },
  {
    number: 2,
    stepLabel: "Step 02",
    title: "Invite Your Team",
    timingBadge: "Co-op Link / In-Game ID",
    timingColor: "cyan",
    description: "Create your team roster and invite squad mates using their unique in-game IDs or by sharing an instant invite link via WhatsApp.",
    icon: Users,
    details: ["Auto-validates teammate BGMI / Free Fire IDs", "One-click squad invite via WhatsApp link", "Captain manages lineup and substitutes"],
    phase: "Pre-Match",
  },
  {
    number: 3,
    stepLabel: "Step 03",
    title: "Complete Registration",
    timingBadge: "Slot Confirmed",
    timingColor: "indigo",
    description: "Confirm player roster, accept competition rules, and finalize your team entry before the registration window closes.",
    icon: CheckCircle2,
    details: ["Real-time slot reservation counter", "Instant confirmation receipt on dashboard", "Automated roster lock for tournament integrity"],
    phase: "Pre-Match",
  },
  {
    number: 4,
    stepLabel: "Step 04",
    title: "Password on WhatsApp & Profile",
    timingBadge: "10 Min Before Start",
    timingColor: "amber",
    description: "Custom Room ID and secure Password are delivered directly to your registered WhatsApp number and unlocked in your Player Profile 10 minutes prior to match kickoff.",
    icon: Key,
    details: ["Sent via official WhatsApp API to captain", "Live countdown unlock on Match Page", "Anti-leak encrypted access for registered squads"],
    phase: "Match Time",
  },
  {
    number: 5,
    stepLabel: "Step 05",
    title: "Winner Share Result on Website",
    timingBadge: "Upload Screenshot",
    timingColor: "rose",
    description: "Once the match concludes, the winning team and squad captains submit their end-game victory screenshot with visible rank and kill count on the PlayArena portal.",
    icon: Camera,
    details: ["High-res screenshot evidence upload", "Input placement rank & total squad eliminations", "Permanent tamper-proof submission log"],
    phase: "Match Time",
  },
  {
    number: 6,
    stepLabel: "Step 06",
    title: "Result Announced within 30 Min",
    timingBadge: "Within 30 Minutes",
    timingColor: "indigo",
    description: "The tournament organizer reviews submitted match evidence, cross-checks scorecards, and calculates official points within 30 minutes.",
    icon: Award,
    details: ["Organizer manual verification of screenshots", "Automated leaderboard & points calculation", "Dispute resolution window for fair play"],
    phase: "Match Time",
  },
  {
    number: 7,
    stepLabel: "Step 07",
    title: "Prize Sent to Team Leader UPI",
    timingBadge: "Within 3 Hours (Max 24h)",
    timingColor: "emerald",
    description: "Verified prize pool winnings are disbursed directly to the team leader's registered UPI ID within 3 hours, with a maximum guaranteed delay of 24 hours.",
    icon: Zap,
    details: ["Direct UPI bank transfer (GPay, PhonePe, Paytm)", "SMS & WhatsApp payment confirmation receipt", "Zero commission deducted from prize pool"],
    phase: "Rewards",
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const currentStep = WORKFLOW_STEPS.find((s) => s.number === activeStep) || WORKFLOW_STEPS[0];
  const StepIcon = currentStep.icon;

  return (
    <section 
      id="how-it-works" 
      aria-labelledby="how-it-works-heading"
      className="w-full py-12 sm:py-16 bg-slate-50/70 border-y border-slate-200/80"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Official Tournament Workflow</span>
          </div>
          <h2 
            id="how-it-works-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            How It Works
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            From squad assembly to instant prize disbursement — here is how every PlayArena competition runs with zero friction and guaranteed fairness.
          </p>
        </div>

        {/* 7-Step Interactive Roadmap & Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Step Selector List (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-3">

            <div className="space-y-2.5">
              {WORKFLOW_STEPS.map((step) => {
                const isSelected = activeStep === step.number;
                const IconComponent = step.icon;

                return (
                  <button
                    key={step.number}
                    onClick={() => setActiveStep(step.number)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 group cursor-pointer ${
                      isSelected
                        ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10"
                        : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    {/* Number Badge */}
                    <div
                      className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center font-mono font-extrabold text-sm transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900"
                      }`}
                    >
                      {step.number}
                    </div>

                    {/* Step Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          {step.stepLabel}
                        </span>
                        {step.timingBadge && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              step.timingColor === "emerald"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : step.timingColor === "amber"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : step.timingColor === "rose"
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : step.timingColor === "cyan"
                                ? "bg-cyan-50 text-cyan-800 border border-cyan-200"
                                : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                            }`}
                          >
                            {step.timingBadge}
                          </span>
                        )}
                      </div>
                      
                      <h3
                        className={`text-sm sm:text-base font-bold transition-colors ${
                          isSelected ? "text-emerald-700" : "text-slate-900 group-hover:text-emerald-700"
                        }`}
                      >
                        {step.title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Arrow Indicator */}
                    <ChevronRight
                      className={`h-5 w-5 shrink-0 transition-transform ${
                        isSelected
                          ? "text-emerald-600 translate-x-1"
                          : "text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Deep-Dive Card (Right 5 Cols - Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm relative overflow-hidden">
              {/* Decorative top gradient */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

              {/* Icon & Big Title */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <StepIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                    Step {currentStep.number} of 7
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                    {currentStep.title}
                  </h3>
                </div>
              </div>

              {/* Main Description */}
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-5">
                {currentStep.description}
              </p>

              {/* Timing Guarantee Box */}
              {currentStep.timingBadge && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-5 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Execution Window
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      {currentStep.timingBadge}
                    </div>
                  </div>
                </div>
              )}

              {/* Bullet Checklist */}
              <div className="space-y-2.5 mb-6">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Key Requirements & Standards
                </div>
                {currentStep.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{detail}</span>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() =>
                    setActiveStep((prev) => (prev > 1 ? prev - 1 : WORKFLOW_STEPS.length))
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>
                <div className="text-xs font-mono text-slate-400">
                  {currentStep.number} / {WORKFLOW_STEPS.length}
                </div>
                <button
                  onClick={() =>
                    setActiveStep((prev) => (prev < WORKFLOW_STEPS.length ? prev + 1 : 1))
                  }
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
                >
                  <span>Next Step</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* 3 Core Guarantees Banner */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3 shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                10-Min Room Credentials
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Room ID and Password sent to WhatsApp and unlocked on your dashboard 10 min before start.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3 shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center shrink-0">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                30-Min Result Announcement
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                All uploaded match screenshots and kill proofs reviewed and official standings posted within 30 min.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3 shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Direct UPI Payout (3h - Max 24h)
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Prize pool credited to winning team leader UPI within 3 hours, with guaranteed max 24 hours.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
