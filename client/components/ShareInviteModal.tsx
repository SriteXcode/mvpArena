"use client";

import React, { useState } from "react";
import { Share2, Copy, Check, MessageSquare, X, Users } from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";

interface ShareInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentTitle?: string;
  referralCode?: string;
}

export default function ShareInviteModal({
  isOpen,
  onClose,
  tournamentTitle,
  referralCode = "ARENA2026",
}: ShareInviteModalProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const inviteUrl = `https://playarena.gg/join?ref=${referralCode}${
    tournamentTitle ? `&event=${encodeURIComponent(tournamentTitle)}` : ""
  }`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.info("Invite link copied to clipboard!", "Share Link");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join squad on MVP Arena",
          text: `Join our tournament squad on MVP Arena! Register using code ${referralCode} to compete in upcoming scrims.`,
          url: inviteUrl,
        });
      } catch {
        // Fallback
      }
    } else {
      handleCopy();
    }
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Join our squad on MVP Arena for official BGMI & Free Fire tournaments! Roster link: ${inviteUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-1.5">
          <Users className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
            Invite Teammates
          </h3>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          Invite teammates to your roster. Squad members get instant match lobby credentials once registered.
        </p>

        {/* Code */}
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
          <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">
            Squad Invite Code
          </span>
          <div className="text-xl font-bold font-mono tracking-widest text-emerald-600 mt-0.5">
            {referralCode}
          </div>
        </div>

        {/* Link */}
        <div className="space-y-1.5 mb-5">
          <span className="text-xs font-semibold text-slate-700">
            Direct Roster Link
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-mono text-slate-800 truncate focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-all shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-xs"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold transition-all shadow-xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Link</span>
          </button>
        </div>
      </div>
    </div>
  );
}
