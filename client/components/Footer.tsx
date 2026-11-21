"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Crosshair, Award, CheckCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 mt-24">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="MVP Arena"
                className="h-7 w-auto object-contain shrink-0"
              />
              <span className="text-sm font-bold tracking-wider text-slate-900 font-mono">
                MVP<span className="text-emerald-600">ARENA</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Institutional tournament infrastructure for competitive mobile athletes. Strict anti-cheat governance, certified fixture audit verification, and automated season progression.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Fair Play Standard</span>
            </div>
          </div>

          {/* Tournaments */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-3">
              Tournaments
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tournaments?game=bgmi" className="hover:text-emerald-600 transition-colors">
                  BGMI Tier-1 Scrims
                </Link>
              </li>
              <li>
                <Link href="/tournaments?game=freefire" className="hover:text-rose-600 transition-colors">
                  Free Fire MAX Championship
                </Link>
              </li>
              <li>
                <Link href="/leaderboards" className="hover:text-slate-900 transition-colors">
                  Season Standings
                </Link>
              </li>
              <li>
                <Link href="/tournaments?fee=0" className="hover:text-slate-900 transition-colors">
                  Open Qualifier Cups
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-3">
              Platform &amp; Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/social" className="hover:text-slate-900 transition-colors">
                  My Squad &amp; Invites
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-slate-900 transition-colors">
                  Character IDs Vault
                </Link>
              </li>
              <li>
                <Link href="/organizer/dashboard" className="hover:text-slate-900 transition-colors">
                  Organizer Control Hub
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">
                  Platform Oversight
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-600 transition-colors">
                  Contact Support &amp; Help Desk
                </Link>
              </li>
              <li className="pt-1.5 border-t border-slate-100">
                <a 
                  href="mailto:organizers@mvparena.gg?subject=Tournament%20Organizer%20License%20Inquiry"
                  className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:text-emerald-800 transition-colors"
                >
                  <span>Organizers: Contact &amp; Mail Us &rarr;</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Regulatory & Notice */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-3">
              Fair Play &amp; Trademarks
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              MVP Arena is an independent tournament organizer. Battlegrounds Mobile India is a trademark of KRAFTON, Inc. Garena Free Fire is a trademark of Garena International.
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>Automated Match Notifications Active</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 MVP Arena Competitive League. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/" className="hover:text-slate-800">Rules of Engagement</Link>
            <Link href="/" className="hover:text-slate-800">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-800">Anti-Cheat Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
