"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Gamepad2, 
  CreditCard, 
  ArrowRight, 
  X, 
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function ProfileProgressBanner() {
  const { user, completionStats, openCompletionModal } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // If user is not logged in or profile is 100% complete, do not show
  if (!user || completionStats.percent >= 100 || dismissed) {
    return null;
  }

  const missingItems: string[] = [];
  if (!completionStats.hasGameId) missingItems.push("Game Character UID");
  if (!completionStats.hasUpiId) missingItems.push("UPI ID for Payouts");

  return (
    <aside 
      aria-label="Profile setup reminder"
      className="w-full bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white border-b border-emerald-500/20 px-3 sm:px-6 py-2.5 transition-all shadow-sm"
    >
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        
        {/* Left: Progress Indicator & Missing Checklist */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-center sm:text-left justify-center sm:justify-start">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono text-[11px] font-bold shrink-0">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span>Profile {completionStats.percent}%</span>
          </div>

          <div className="w-20 sm:w-28 h-1.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700 shrink-0 hidden sm:block">
            <div 
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${completionStats.percent}%` }}
            />
          </div>

          <p className="text-slate-200 text-[11px] sm:text-xs">
            <strong className="text-white font-semibold">Finish profile setup:</strong>{" "}
            Add {missingItems.join(" and ")} to participate in scrims and claim cash prizes.
          </p>
        </div>

        {/* Right: Action & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openCompletionModal}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>Complete Profile</span>
            <ChevronRight className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Dismiss reminder for now"
            aria-label="Dismiss reminder"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
}
