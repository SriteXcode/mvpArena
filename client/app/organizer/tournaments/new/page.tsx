"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Trophy, 
  Upload, 
  Calendar, 
  CreditCard, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Flame,
  FileImage
} from "lucide-react";
import ImageDropzone from "@/components/ImageDropzone";

export default function NewTournamentWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [game, setGame] = useState<"bgmi" | "freefire">("bgmi");
  const [format, setFormat] = useState<"solo" | "duo" | "squad">("squad");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState(
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
  );
  const [entryFee, setEntryFee] = useState(100);
  const [prizePool, setPrizePool] = useState(15000);
  const [maxSlots, setMaxSlots] = useState(25);
  const [eventDate, setEventDate] = useState("2026-11-25T20:00");
  const [firstPlacePoints, setFirstPlacePoints] = useState(15);
  const [killPoints, setKillPoints] = useState(1);
  const [published, setPublished] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setPublished(true);
    setTimeout(() => {
      router.push("/organizer/dashboard");
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/organizer/dashboard"
          className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2 font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Create Tournament Event
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Configure title, format, slots, prize distribution, and official scoring matrix.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2 border-b border-slate-200 pb-3">
        {[
          { num: 1, label: "Title & Format" },
          { num: 2, label: "Event Artwork" },
          { num: 3, label: "Fees & Roster" },
          { num: 4, label: "Scoring Model" },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex flex-col border-t-2 pt-2 transition-all ${
              step >= s.num ? "border-emerald-600" : "border-slate-200"
            }`}
          >
            <span
              className={`text-[9px] font-mono uppercase font-bold ${
                step >= s.num ? "text-emerald-700" : "text-slate-400"
              }`}
            >
              Step 0{s.num}
            </span>
            <span className="text-xs font-semibold text-slate-800 truncate">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Wizard Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        {published ? (
          <div className="text-center py-8 space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Tournament Published Successfully</h3>
            <p className="text-xs text-slate-600">
              Your tournament is live on the discovery marketplace. Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handlePublish} className="space-y-5">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                    Select Game Title
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGame("bgmi")}
                      className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                        game === "bgmi"
                          ? "border-emerald-600 bg-emerald-50/50 text-slate-900 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">BGMI</div>
                        <div className="text-[10px] text-slate-500">Battlegrounds Mobile India</div>
                      </div>
                      {game === "bgmi" && <span className="text-emerald-700 font-bold">✓</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => setGame("freefire")}
                      className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                        game === "freefire"
                          ? "border-rose-600 bg-rose-50/50 text-slate-900 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">Free Fire MAX</div>
                        <div className="text-[10px] text-slate-500">Garena Free Fire</div>
                      </div>
                      {game === "freefire" && <span className="text-rose-700 font-bold">✓</span>}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                    Tournament Format
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(["solo", "duo", "squad"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setFormat(fmt)}
                        className={`py-2 rounded-lg border text-xs font-bold uppercase font-mono transition-all ${
                          format === fmt
                            ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tournament Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BGMI Pro Scrims Season 4"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                  />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-3">
                <ImageDropzone
                  value={bannerUrl}
                  onChange={setBannerUrl}
                  aspectRatio="video"
                  label="Event Cover Banner (16:9 Recommended)"
                  hint="Drag & drop custom artwork, click to browse, or paste from clipboard (Ctrl+V)"
                />
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Entry Fee (₹ INR) — Set 0 for Free
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={entryFee}
                    onChange={(e) => setEntryFee(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Total Prize Pool (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={prizePool}
                    onChange={(e) => setPrizePool(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-amber-700 font-bold focus:outline-none focus:border-emerald-600 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Maximum Squad Slots
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={maxSlots}
                    onChange={(e) => setMaxSlots(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Scheduled Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                  />
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-3.5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Scoring Model Configuration
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      1st Place Points
                    </label>
                    <input
                      type="number"
                      value={firstPlacePoints}
                      onChange={(e) => setFirstPlacePoints(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Points Per Elimination
                    </label>
                    <input
                      type="number"
                      value={killPoints}
                      onChange={(e) => setKillPoints(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  Platform Commission: <strong className="text-emerald-700 font-mono">10%</strong>. Applied automatically upon registration collection.
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 flex items-center gap-1 shadow-md shadow-emerald-600/20"
                >
                  Continue <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                >
                  Publish Tournament Event
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
