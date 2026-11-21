"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Trophy, 
  Percent, 
  CheckCircle, 
  XCircle, 
  Check, 
  Sliders,
  DollarSign,
  CreditCard,
  FileCheck,
  Eye,
  SlidersHorizontal,
  Mail,
  HelpCircle,
  Clock,
  Sparkles,
  Tv,
  Zap,
  ArrowRight,
  Plus,
  Send,
  AlertCircle,
  Inbox,
  Loader2
} from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";
import { formatINR } from "@/lib/utils";

type AdminTabKey = 
  | "users" 
  | "organizers" 
  | "approvals" 
  | "carousel_cms" 
  | "support_desk" 
  | "features"
  | "campaigns";

interface UserItem {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  upiId?: string;
  walletBalance: number;
  gameProfiles?: {
    game: string;
    gameId: string;
    inGameName: string;
    verified: boolean;
  }[];
  whatsappNumber?: string;
}

interface OrganizerItem {
  _id: string;
  orgName: string;
  contactEmail: string;
  contactPhone?: string;
  commissionRate: number;
  status: string;
  upiId?: string;
  gmvGenerated?: number;
  totalSettledPayouts?: number;
}

interface SupportTicket {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  subject: string;
  message: string;
  status: "unread" | "in_progress" | "resolved";
  adminNotes?: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<AdminTabKey>("users");
  const [loading, setLoading] = useState(true);

  // Users State (Clean real state)
  const [users, setUsers] = useState<UserItem[]>([]);
  const [userSearch, setUserSearch] = useState("");

  // Organizers State
  const [organizers, setOrganizers] = useState<OrganizerItem[]>([]);

  // Approvals Queue State
  interface ApprovalQueueItem {
    id: string;
    tournamentTitle: string;
    submitterRole: string;
    teamName: string;
    placement: number | string;
    eliminations: number | string;
    notes?: string;
    evidenceUrl?: string;
  }
  const [approvalQueue, setApprovalQueue] = useState<ApprovalQueueItem[]>([]);

  // Carousel CMS State
  interface HeroSlideItem {
    id?: string;
    tag?: string;
    title: string;
    bannerUrl: string;
    subtitle: string;
  }
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>([]);

  // Support Desk State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [ticketFilter, setTicketFilter] = useState("all");

  // Platform Feature Flags State
  const [featureFlags, setFeatureFlags] = useState({
    dailyTournaments: true,
    weekendMegaContests: true,
    liveStreamsHub: true,
    instantUpiPayouts: true,
    privateTokenRegistration: true,
    strictAntiCheatAuditing: true,
  });

  // Modal State for User Payout
  const [selectedUserForPayout, setSelectedUserForPayout] = useState<UserItem | null>(null);
  const [userPayoutAmount, setUserPayoutAmount] = useState(500);
  const [userPayoutType, setUserPayoutType] = useState("prize_winning");
  const [userPayoutNotes, setUserPayoutNotes] = useState("");

  // Modal State for Organizer Settlement
  const [selectedOrgForPayout, setSelectedOrgForPayout] = useState<OrganizerItem | null>(null);
  const [orgPayoutAmount, setOrgPayoutAmount] = useState(15000);
  const [orgPayoutNotes, setOrgPayoutNotes] = useState("");

  // Email Campaigns State
  interface PastCampaignItem {
    _id: string;
    title: string;
    subject: string;
    targetAudience: string;
    recipientCount: number;
    status: string;
    sentAt: string;
  }
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignContent, setCampaignContent] = useState("");
  const [campaignAudience, setCampaignAudience] = useState<"all" | "players" | "organizers">("all");
  const [campaignCtaText, setCampaignCtaText] = useState("Explore Tournaments");
  const [campaignCtaUrl, setCampaignCtaUrl] = useState("https://mvparena.gg/tournaments");
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [pastCampaigns, setPastCampaigns] = useState<PastCampaignItem[]>([]);
  const [audienceMetrics, setAudienceMetrics] = useState({ total: 0, players: 0, organizers: 0 });

  // Initial Fetch from real APIs
  useEffect(() => {
    // 1. Fetch Users
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setUsers(res.data);
      })
      .catch(() => {
        toast.error("Failed to load user records from database.", "Users Query Error");
      });

    // 2. Fetch Organizers
    fetch("/api/admin/organizers")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setOrganizers(res.data);
        }
      })
      .catch(() => {
        toast.error("Failed to load tournament organizers.", "Organizers Error");
      });

    // 3. Fetch CMS Slides
    fetch("/api/admin/cms/hero")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setHeroSlides(res.data);
      })
      .catch(() => {});

    // 4. Fetch Support Tickets
    fetch("/api/admin/support")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setSupportTickets(res.data);
      })
      .catch(() => {
        toast.error("Failed to fetch support desk inquiries.", "Support Error");
      })
      .finally(() => setLoading(false));

    // 5. Fetch Campaigns
    fetch("/api/admin/campaigns")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setPastCampaigns(res.data.campaigns || []);
          if (res.data.audienceMetrics) setAudienceMetrics(res.data.audienceMetrics);
        }
      })
      .catch(() => {});
  }, []);

  // Broadcast Email Campaign
  const handleBroadcastCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim() || !campaignSubject.trim() || !campaignContent.trim()) {
      toast.warning("Title, subject, and message content are required.", "Missing Fields");
      return;
    }

    setSendingCampaign(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: campaignTitle.trim(),
          subject: campaignSubject.trim(),
          content: campaignContent.trim(),
          targetAudience: campaignAudience,
          ctaText: campaignCtaText.trim(),
          ctaUrl: campaignCtaUrl.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, "Campaign Broadcast Dispatched!");
        setPastCampaigns([data.data, ...pastCampaigns]);
        setCampaignTitle("");
        setCampaignSubject("");
        setCampaignContent("");
      } else {
        toast.error(data.error || "Failed to broadcast campaign.", "Broadcast Error");
      }
    } catch {
      toast.error("Network error during broadcast.", "Error");
    } finally {
      setSendingCampaign(false);
    }
  };

  // Update Organizer Commission
  const handleUpdateCommission = async (id: string, newRate: number) => {
    try {
      await fetch("/api/admin/organizers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizerId: id, commissionRate: newRate }),
      });
      setOrganizers(
        organizers.map((org) => (org._id === id ? { ...org, commissionRate: newRate } : org))
      );
      toast.success(`Platform commission rate updated to ${newRate}%`, "Commission Adjusted");
    } catch {
      toast.error("Failed to update organizer commission rate.", "Update Error");
    }
  };

  // Toggle Organizer Status
  const handleToggleOrganizerStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "approved" ? "suspended" : "approved";
    try {
      await fetch("/api/admin/organizers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizerId: id, status: nextStatus }),
      });
      setOrganizers(
        organizers.map((org) => (org._id === id ? { ...org, status: nextStatus } : org))
      );
      if (nextStatus === "suspended") {
        toast.warning(`Organizer status suspended. Tournament creation locked.`, "Organizer Suspended");
      } else {
        toast.success(`Organizer approved for competitive tournaments.`, "Organizer Approved");
      }
    } catch {
      toast.error("Failed to change organizer status.", "Action Failed");
    }
  };

  // Process User Payout
  const handleProcessUserPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPayout) return;
    if (userPayoutAmount <= 0) {
      toast.warning("Payout amount must be greater than zero.", "Invalid Amount");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserForPayout._id,
          recipientName: selectedUserForPayout.name,
          upiId: selectedUserForPayout.upiId || "player@upi",
          amount: userPayoutAmount,
          transactionType: userPayoutType,
          notes: userPayoutNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`₹${userPayoutAmount} disbursed to ${selectedUserForPayout.name} via UPI!`, "Payout Successful");
        setUsers(
          users.map((u) =>
            u._id === selectedUserForPayout._id
              ? { ...u, walletBalance: (u.walletBalance || 0) + Number(userPayoutAmount) }
              : u
          )
        );
        setSelectedUserForPayout(null);
      } else {
        toast.error(data.error || "Payout dispatch failed.", "Transfer Error");
      }
    } catch {
      toast.error("Network error executing payout to UPI.", "Network Error");
    }
  };

  // Process Organizer Settlement Payout
  const handleProcessOrgPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgForPayout) return;
    if (orgPayoutAmount <= 0) {
      toast.warning("Settlement amount must be greater than zero.", "Invalid Amount");
      return;
    }

    try {
      const res = await fetch("/api/admin/organizers/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizerId: selectedOrgForPayout._id,
          orgName: selectedOrgForPayout.orgName,
          upiId: selectedOrgForPayout.upiId || "org@upi",
          amount: orgPayoutAmount,
          notes: orgPayoutNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Settled ₹${orgPayoutAmount.toLocaleString("en-IN")} to ${selectedOrgForPayout.orgName}!`, "Settlement Completed");
        setOrganizers(
          organizers.map((o) =>
            o._id === selectedOrgForPayout._id
              ? {
                  ...o,
                  totalSettledPayouts: (o.totalSettledPayouts || 0) + Number(orgPayoutAmount),
                }
              : o
          )
        );
        setSelectedOrgForPayout(null);
      } else {
        toast.error(data.error || "Settlement failed.", "Disbursement Error");
      }
    } catch {
      toast.error("Network error executing settlement.", "Connection Error");
    }
  };

  // Handle Approve/Reject Result
  const handleApproveResult = (id: string, action: "approved" | "rejected") => {
    setApprovalQueue(approvalQueue.filter((item) => item.id !== id));
    if (action === "approved") {
      toast.success("Result submission verified and points credited to team.", "Result Approved");
    } else {
      toast.warning("Submission rejected. Submitter requested for revised screenshot proof.", "Result Rejected");
    }
  };

  // Update Support Ticket Status
  const handleUpdateTicketStatus = async (ticketId: string, status: "unread" | "in_progress" | "resolved") => {
    try {
      await fetch("/api/admin/support", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ticketId, status }),
      });
      setSupportTickets(
        supportTickets.map((t) => (t._id === ticketId ? { ...t, status } : t))
      );
      toast.info(`Support ticket marked as ${status.replace("_", " ").toUpperCase()}`, "Ticket Status Updated");
    } catch {
      toast.error("Failed to update ticket status.", "Update Error");
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.upiId?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  // Filtered tickets
  const filteredTickets = supportTickets.filter((t) => {
    if (ticketFilter === "all") return true;
    return t.category === ticketFilter || t.status === ticketFilter;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-mono font-medium mb-2 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            SUPER-ADMIN EXECUTIVE CONTROL CONSOLE
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            PlayArena Super-Admin Portal
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Full platform governance: UPI payouts, commission contracts, approval queues, CMS &amp; support desk.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Settlement Engine Online</span>
        </div>
      </div>

      {/* Top KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Total Athletes &amp; Users
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {users.length} Registered
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Verified accounts</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Verified Organizers
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {organizers.length} Hubs
          </div>
          <span className="text-[10px] text-slate-500">8% - 15% commission tier</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Pending Result Reviews
          </span>
          <div className="text-xl font-bold text-rose-600 mt-1 font-mono">
            {approvalQueue.length} Queue
          </div>
          <span className="text-[10px] text-rose-700 font-medium">Requires arbitrator sign-off</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            Support Inquiries
          </span>
          <div className="text-xl font-bold text-amber-600 mt-1 font-mono">
            {supportTickets.length} Tickets
          </div>
          <span className="text-[10px] text-amber-700 font-medium">Disputes &amp; Payout questions</span>
        </div>
      </div>

      {/* 6 Tabs Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-xl shadow-xs overflow-x-auto">
        <div className="flex items-center min-w-max p-1.5 gap-1">
          {[
            { key: "users" as AdminTabKey, label: "Manage All Users & UPI", icon: Users },
            { key: "organizers" as AdminTabKey, label: "Organizers & Commission", icon: Percent },
            { key: "approvals" as AdminTabKey, label: "Match Approvals Queue", icon: FileCheck },
            { key: "carousel_cms" as AdminTabKey, label: "Hero Page Carousel CMS", icon: Sparkles },
            { key: "support_desk" as AdminTabKey, label: "Support & Contact Desk", icon: Mail },
            { key: "features" as AdminTabKey, label: "Platform Features & Settings", icon: Sliders },
            { key: "campaigns" as AdminTabKey, label: "Email Campaigns & Marketing", icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: MANAGE ALL USERS & UPI IDS */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">User Directory &amp; UPI Accounts</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect athlete profiles, in-game BGMI/FF IDs, payout UPI addresses, and credit instant prize winnings.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search user, IGN, or UPI ID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Inbox className="h-8 w-8 text-slate-300 mx-auto" />
              <h4 className="text-xs font-bold text-slate-800">No Users Found</h4>
              <p className="text-[11px] text-slate-500">
                {userSearch ? "No users match your search criteria." : "No registered player accounts found in database."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">User Athlete</th>
                    <th className="py-3 px-4">In-Game IDs</th>
                    <th className="py-3 px-4">Verified UPI ID</th>
                    <th className="py-3 px-4 text-center">Wallet Balance</th>
                    <th className="py-3 px-4 text-center">Role Tier</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[10px] font-mono text-emerald-700">@{u.username}</div>
                      </td>
                      <td className="py-3 px-4">
                        {u.gameProfiles && u.gameProfiles.length > 0 ? (
                          u.gameProfiles.map((gp, i) => (
                            <div key={i} className="text-[11px] font-mono">
                              <span className="uppercase font-bold text-slate-600">{gp.game}:</span>{" "}
                              <span className="text-slate-900">{gp.inGameName}</span>{" "}
                              <span className="text-slate-400">({gp.gameId})</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">None linked</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {u.upiId || "Not Configured"}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                        ₹{(u.walletBalance || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-100 text-slate-700 font-semibold">
                          {u.role || "player"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUserForPayout(u);
                            setUserPayoutAmount(500);
                            setUserPayoutNotes(`Prize winning payout for ${u.name}`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-500 transition-colors shadow-xs"
                        >
                          Add Payout →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* USER PAYOUT MODAL */}
      {selectedUserForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Add Payout to User ({selectedUserForPayout.name})
              </h3>
              <button
                onClick={() => setSelectedUserForPayout(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessUserPayout} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Recipient UPI Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. player@okhdfcbank"
                  value={selectedUserForPayout.upiId || ""}
                  onChange={(e) =>
                    setSelectedUserForPayout({
                      ...selectedUserForPayout,
                      upiId: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-slate-300 px-3 py-2 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Payout Amount (₹) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={userPayoutAmount}
                  onChange={(e) => setUserPayoutAmount(Number(e.target.value))}
                  className="w-full border border-slate-300 px-3 py-2 rounded-lg font-mono font-bold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Transaction Classification
                </label>
                <select
                  value={userPayoutType}
                  onChange={(e) => setUserPayoutType(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 rounded-lg bg-white"
                >
                  <option value="prize_winning">Tournament Prize Pool Winnings</option>
                  <option value="wallet_credit">Milestone Achievement Bonus</option>
                  <option value="compensation">Dispute Settlement Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Admin Audit Notes
                </label>
                <input
                  type="text"
                  value={userPayoutNotes}
                  onChange={(e) => setUserPayoutNotes(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPayout(null)}
                  className="w-1/2 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE ORGANIZERS */}
      {activeTab === "organizers" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tournament Organizers &amp; Revenue Agreements</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust platform commission rate (8% - 15%), review bank UPI IDs, and disburse ticket volume settlements.
              </p>
            </div>
          </div>

          {organizers.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Inbox className="h-8 w-8 text-slate-300 mx-auto" />
              <h4 className="text-xs font-bold text-slate-800">No Organizers Registered</h4>
              <p className="text-[11px] text-slate-500">No organizers currently exist in the database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Organizer Hub</th>
                    <th className="py-3 px-4">Settlement UPI ID</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Platform Cut</th>
                    <th className="py-3 px-4 text-center">Lifetime GMV</th>
                    <th className="py-3 px-4 text-center">Total Settled</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {organizers.map((org) => (
                    <tr key={org._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {org.orgName}
                        <span className="block text-[10px] font-mono text-slate-500 font-normal">
                          {org.contactEmail} • {org.contactPhone || "No Phone"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {org.upiId || "Pending Setup"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleOrganizerStatus(org._id, org.status)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold transition-all ${
                            org.status === "approved"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {org.status}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                          {[8, 10, 12, 15].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => handleUpdateCommission(org._id, rate)}
                              className={`px-1.5 py-0.5 text-[10px] font-mono rounded font-bold transition-colors ${
                                org.commissionRate === rate
                                  ? "bg-slate-900 text-white"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              {rate}%
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-700">
                        ₹{(org.gmvGenerated || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">
                        ₹{(org.totalSettledPayouts || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrgForPayout(org);
                            setOrgPayoutAmount(15000);
                            setOrgPayoutNotes(`Bi-weekly net ticket settlement for ${org.orgName}`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-colors shadow-xs"
                        >
                          Settle Payout →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ORGANIZER SETTLEMENT MODAL */}
      {selectedOrgForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Settle Payout to {selectedOrgForPayout.orgName}
              </h3>
              <button
                onClick={() => setSelectedOrgForPayout(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessOrgPayout} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Organizer Settlement UPI
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. org@okhdfcbank"
                  value={selectedOrgForPayout.upiId || ""}
                  onChange={(e) =>
                    setSelectedOrgForPayout({
                      ...selectedOrgForPayout,
                      upiId: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-slate-300 px-3 py-2 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Net Settlement Amount (₹) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={orgPayoutAmount}
                  onChange={(e) => setOrgPayoutAmount(Number(e.target.value))}
                  className="w-full border border-slate-300 px-3 py-2 rounded-lg font-mono font-bold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Settlement Classification / Ledger Notes
                </label>
                <input
                  type="text"
                  value={orgPayoutNotes}
                  onChange={(e) => setOrgPayoutNotes(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrgForPayout(null)}
                  className="w-1/2 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Disburse Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: MATCHES & RESULTS APPROVAL QUEUE */}
      {activeTab === "approvals" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Matches &amp; Standings Approval Desk</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Arbitrators review screenshot proofs, kill feeds, and placements before points &amp; prizes are released.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-bold">
              {approvalQueue.length} Pending
            </span>
          </div>

          {approvalQueue.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto" />
              <div className="font-bold text-slate-800">Queue is Clear</div>
              <p className="text-[11px]">All player and organizer result submissions have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approvalQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{item.tournamentTitle}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 uppercase">
                        {item.submitterRole} submit
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Team: <strong className="text-slate-900 font-mono">{item.teamName}</strong> • Rank: <strong className="text-emerald-700 font-mono">#{item.placement}</strong> • Kills: <strong className="text-rose-600 font-mono">{item.eliminations}</strong>
                    </div>
                    <p className="text-[11px] text-slate-500">{item.notes}</p>
                    <a
                      href={item.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 underline font-mono"
                    >
                      <Eye className="h-3 w-3" /> Inspect Result Screenshot
                    </a>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveResult(item.id, "rejected")}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveResult(item.id, "approved")}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-bold transition-colors shadow-xs"
                    >
                      Approve &amp; Release Points
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HERO PAGE CAROUSEL CMS */}
      {activeTab === "carousel_cms" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hero Carousel Banners CMS</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize homepage banners, seasonal promotions, titles, and call-to-action buttons.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {heroSlides.map((slide, idx) => (
              <div key={slide.id || idx} className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-700">
                    Slide 0{idx + 1}: {slide.tag}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                      Banner Headline
                    </label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[idx].title = e.target.value;
                        setHeroSlides(updated);
                      }}
                      className="w-full bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                      Banner Artwork URL
                    </label>
                    <input
                      type="url"
                      value={slide.bannerUrl}
                      onChange={(e) => {
                        const updated = [...heroSlides];
                        updated[idx].bannerUrl = e.target.value;
                        setHeroSlides(updated);
                      }}
                      className="w-full bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                    Subtitle Description
                  </label>
                  <input
                    type="text"
                    value={slide.subtitle}
                    onChange={(e) => {
                      const updated = [...heroSlides];
                      updated[idx].subtitle = e.target.value;
                      setHeroSlides(updated);
                    }}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs text-slate-600"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={async () => {
                await fetch("/api/admin/cms/hero", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ slides: heroSlides }),
                });
                toast.success("Hero Carousel banners saved and live on homepage!", "CMS Published");
              }}
              className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            >
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Save &amp; Publish Hero Banners</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: CONTACT US & SUPPORT INQUIRIES DESK */}
      {activeTab === "support_desk" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Player Dispute &amp; Concierge Desk</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Support tickets submitted from the public /contact page. Review disputes, prize inquiries, and partnerships.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={ticketFilter}
                onChange={(e) => setTicketFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
              >
                <option value="all">All Inquiries</option>
                <option value="dispute">Match Disputes</option>
                <option value="payout">Prize Payouts</option>
                <option value="partnership">Partnerships</option>
                <option value="unread">Unread Only</option>
              </select>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Mail className="h-8 w-8 text-slate-300 mx-auto" />
              <h4 className="text-xs font-bold text-slate-800">No Support Tickets</h4>
              <p className="text-[11px] text-slate-500">
                {ticketFilter === "all" ? "No support or dispute inquiries recorded." : "No inquiries match this filter."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{ticket.subject}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-200 text-slate-700 font-semibold">
                        {ticket.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          handleUpdateTicketStatus(
                            ticket._id,
                            e.target.value as "unread" | "in_progress" | "resolved"
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                          ticket.status === "resolved"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : ticket.status === "in_progress"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        <option value="unread">Unread</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{ticket.message}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                    <span>Submitter: <strong className="text-slate-800 font-sans">{ticket.name}</strong></span>
                    <span>•</span>
                    <span>Email: <strong className="text-slate-800">{ticket.email}</strong></span>
                    {ticket.phone && (
                      <>
                        <span>•</span>
                        <span>Phone: <strong className="text-slate-800">{ticket.phone}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PLATFORM FEATURES & SETTINGS */}
      {activeTab === "features" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Platform Features &amp; System Toggles</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Activate and govern live esports features, daily tournaments, live broadcast hubs, and anti-cheat modules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "dailyTournaments" as const,
                title: "Daily Tournaments (8 PM & 10 PM Scrims)",
                desc: "Automated daily scrim brackets for BGMI and Free Fire MAX with instant slot booking.",
                icon: Trophy,
              },
              {
                id: "weekendMegaContests" as const,
                title: "Weekend All-Day Mega Contest",
                desc: "High-roller ₹2,50,000 multi-stage championship brackets running every Saturday & Sunday.",
                icon: Zap,
              },
              {
                id: "liveStreamsHub" as const,
                title: "Official Live Streaming Hub",
                desc: "YouTube and Twitch embedded player with dual casters and spectator lobby feed.",
                icon: Tv,
              },
              {
                id: "instantUpiPayouts" as const,
                title: "Automated Instant UPI Payout Engine",
                desc: "Instant banking payouts directly to winner UPI IDs upon match result certification.",
                icon: CreditCard,
              },
              {
                id: "privateTokenRegistration" as const,
                title: "Private Invite Token Registration",
                desc: "Allows verified organizers to generate unlisted private tournament access tokens.",
                icon: ShieldCheck,
              },
              {
                id: "strictAntiCheatAuditing" as const,
                title: "Strict Anti-Cheat Screenshot Auditing",
                desc: "Requires double-blind verification of placement standings and kill feeds before payout release.",
                icon: FileCheck,
              },
            ].map((f) => {
              const Icon = f.icon;
              const isEnabled = featureFlags[f.id];
              return (
                <div
                  key={f.id}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                    isEnabled ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50/80 opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-800 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{f.title}</div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const updated = !isEnabled;
                      setFeatureFlags({ ...featureFlags, [f.id]: updated });
                      if (updated) {
                        toast.success(`${f.title} enabled globally.`, "Feature Activated");
                      } else {
                        toast.warning(`${f.title} disabled globally.`, "Feature Deactivated");
                      }
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: EMAIL CAMPAIGNS & MARKETING STUDIO */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          {/* Audience Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                Total Email Reach
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
                {audienceMetrics.total || users.length} Athletes
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">All registered accounts</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                Competitive Players
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
                {audienceMetrics.players || users.filter((u) => u.role === "player").length} Athletes
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Active tournament competitors</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                Tournament Organizers
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
                {audienceMetrics.organizers || organizers.length} Hubs
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Verified league licensors</span>
            </div>
          </div>

          {/* Campaign Composer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="h-4 w-4 text-emerald-600" />
                  <span>Institutional Email Broadcast Studio</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compose high-impact responsive esports announcements, season kickoff alerts, and prize pool updates.
                </p>
              </div>
            </div>

            <form onSubmit={handleBroadcastCampaign} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Announcement Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BGMI Tier-1 Pro Scrims Season 05 Registration Open!"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🏆 Registration is LIVE: ₹50,000 Prize Pool Awaits Your Squad"
                    value={campaignSubject}
                    onChange={(e) => setCampaignSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Audience *
                  </label>
                  <select
                    value={campaignAudience}
                    onChange={(e) => setCampaignAudience(e.target.value as "all" | "players" | "organizers")}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                  >
                    <option value="all">All Athletes &amp; Organizers ({audienceMetrics.total || users.length})</option>
                    <option value="players">Competitive Players Only ({audienceMetrics.players || users.filter(u => u.role === "player").length})</option>
                    <option value="organizers">Tournament Organizers Only ({audienceMetrics.organizers || organizers.length})</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Register Squad Now"
                    value={campaignCtaText}
                    onChange={(e) => setCampaignCtaText(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    CTA Target Destination URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://mvparena.gg/tournaments"
                    value={campaignCtaUrl}
                    onChange={(e) => setCampaignCtaUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Campaign Message Body *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Enter your announcement copy, schedule details, prize breakdowns, and special instructions..."
                  value={campaignContent}
                  onChange={(e) => setCampaignContent(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={sendingCampaign}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {sendingCampaign ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Broadcasting Campaign...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Broadcast Email Campaign</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Past Dispatched Campaigns History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Campaign Broadcast History ({pastCampaigns.length})
            </h3>

            {pastCampaigns.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-slate-50 border border-slate-200">
                <Inbox className="h-6 w-6 mx-auto text-slate-400 mb-1" />
                No campaigns dispatched yet. Use the composer above to broadcast your first announcement.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                      <th className="py-2.5 px-3">Headline</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Audience</th>
                      <th className="py-2.5 px-3 text-center">Recipients</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Dispatched</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pastCampaigns.map((c, i) => (
                      <tr key={c._id || i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{c.title}</td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{c.subject}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {c.targetAudience}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                          {c.recipientCount || 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                            Delivered
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[10px] text-slate-500">
                          {c.sentAt ? new Date(c.sentAt).toLocaleDateString() : "Just now"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
