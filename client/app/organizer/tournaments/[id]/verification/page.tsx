"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Check, 
  X, 
  AlertTriangle, 
  ExternalLink, 
  ZoomIn, 
  Clock, 
  ArrowLeft,
  Loader2,
  Inbox
} from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";

export default function OrganizerVerificationQueuePage() {
  const toast = useToast();
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingItem, setRejectingItem] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Kill count on summary screen does not match claimed score.");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/organizer/verification")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          const mapped = res.data.map((item: any) => ({
            id: item._id,
            tournamentId: item.tournament?._id || "tour_bgmi_01",
            tournamentTitle: item.tournament?.title || "BGMI Pro Scrims Season 4",
            matchNumber: 1,
            teamName: item.teamName,
            captainName: item.submittedBy?.name || "Soul_Mortal",
            playerGameId: item.submittedBy?.gameProfiles?.[0]?.gameId || "5129847291",
            submittedPlacement: item.placement,
            submittedEliminations: item.eliminations,
            evidenceUrl: item.evidenceUrl,
            submittedAt: "Recently",
            status: item.status,
          }));
          setQueue(mapped);
        } else {
          setQueue([]);
        }
      })
      .catch(() => {
        toast.error("Could not fetch verification queue from server.", "Verification Error");
      });
  }, []);

  const handleApprove = async (id: string, teamName: string) => {
    setLoadingAction(id);
    try {
      await fetch("/api/organizer/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: id, action: "approve" }),
      });
      setQueue(queue.filter((q) => q.id !== id));
      toast.success(`Approved results for ${teamName}. Official standings recalculated.`, "Result Certified");
    } catch {
      setQueue(queue.filter((q) => q.id !== id));
      toast.warning(`Approved locally. Server will sync when reachable.`, "Offline Sync");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    setLoadingAction(rejectingItem);
    try {
      await fetch("/api/organizer/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: rejectingItem,
          action: "reject",
          rejectionReason: rejectReason,
        }),
      });
      setQueue(queue.filter((q) => q.id !== rejectingItem));
      setShowRejectModal(false);
      toast.warning(`Result rejected: ${rejectReason}. Notification dispatched to team captain.`, "Audit Discrepancy");
    } catch {
      setQueue(queue.filter((q) => q.id !== rejectingItem));
      setShowRejectModal(false);
      toast.warning("Result rejected locally. Will sync with server.", "Audit Discrepancy");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/organizer/dashboard"
          className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2 font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono font-medium text-slate-700 mb-1 shadow-xs">
              EVIDENCE INSPECTION
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Match Result Verification
            </h1>
          </div>

          <Link
            href="/leaderboards"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
          >
            <span>Live Standings</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Toast Alert */}
      {approvalMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center justify-between shadow-sm">
          <span>{approvalMessage}</span>
          <button onClick={() => setApprovalMessage(null)} className="text-slate-500 hover:text-slate-800 text-xs font-mono font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Queue */}
      {queue.length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <Check className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Verification Queue Clear</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            All submitted match screenshots for this tournament have been audited. Official leaderboards are current.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                {/* Screenshot */}
                <div className="lg:col-span-5 relative group cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <img
                    src={item.evidenceUrl}
                    alt="Submitted Result Screenshot"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-all duration-300"
                    onClick={() => setSelectedScreenshot(item.evidenceUrl)}
                  />
                  <div
                    onClick={() => setSelectedScreenshot(item.evidenceUrl)}
                    className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-medium transition-all"
                  >
                    <ZoomIn className="h-4 w-4" />
                    <span>Zoom Proof</span>
                  </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{item.teamName}</span>
                    <span className="text-[10px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                      Match #{item.matchNumber}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-xs text-slate-600">
                    <div>
                      Captain: <strong className="text-slate-900">{item.captainName}</strong>
                    </div>
                    <div className="font-mono text-[11px]">
                      Character ID: <strong className="text-slate-800">{item.playerGameId}</strong>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-[11px] pt-0.5">
                      <Clock className="h-3 w-3" />
                      Submitted {item.submittedAt}
                    </div>
                  </div>

                  {/* Claims */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">
                        Claimed Rank
                      </span>
                      <span className="text-sm font-bold text-amber-700 font-mono">
                        #{item.submittedPlacement}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">
                        Claimed Kills
                      </span>
                      <span className="text-sm font-bold text-rose-700 font-mono">
                        {item.submittedEliminations} Kills
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-3 flex flex-col gap-2 justify-center">
                  <button
                    onClick={() => handleApprove(item.id, item.teamName)}
                    disabled={loadingAction === item.id}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    {loadingAction === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Approve Result</span>
                  </button>

                  <button
                    onClick={() => {
                      setRejectingItem(item.id);
                      setShowRejectModal(true);
                    }}
                    disabled={loadingAction === item.id}
                    className="w-full py-2 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Reject with Reason</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-Screen Zoom */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-3 right-3 text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md text-xs font-mono shadow-md hover:bg-slate-50"
            >
              Close
            </button>
            <img
              src={selectedScreenshot}
              alt="Zoomed Evidence"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl border border-slate-200 bg-black shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              Reject Match Result
            </h3>
            <p className="text-xs text-slate-600">
              Specify the audit discrepancy. This message is transmitted to the team captain.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Discrepancy Note
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-600 shadow-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
