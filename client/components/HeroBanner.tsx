"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Trophy, 
  Eye, 
  Users, 
  Star, 
  Bookmark, 
  ChevronRight, 
  ChevronLeft,
  Share2,
  ShieldCheck,
  FileText
} from "lucide-react";

export interface HeroSlide {
  id: string;
  gameTitle: string;
  subtitle: string;
  eyebrow: string;
  tags: string[];
  viewsCount: string;
  playersCount: string;
  rating: string;
  reviewsCount: string;
  imageUrl: string;
  primaryLink: string;
  primaryCtaText: string;
  rulesLink: string;
  isSanctioned: boolean;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide_bgmi",
    gameTitle: "BATTLEGROUNDS MOBILE INDIA",
    subtitle: "PRO SCRIMS CHAMPIONSHIP • S4",
    eyebrow: "FREE TO PLAY • BATTLE ROYALE",
    tags: ["Battle Royale", "Squads 4v4", "Erangel & Miramar", "₹1,50,000 Prize Pool"],
    viewsCount: "95,560",
    playersCount: "5,530,720",
    rating: "5.0",
    reviewsCount: "2.5K",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80",
    primaryLink: "/tournaments/tour_bgmi_01",
    primaryCtaText: "Enroll In Scrims",
    rulesLink: "/tournaments/tour_bgmi_01",
    isSanctioned: true,
  },
  {
    id: "slide_warzone",
    gameTitle: "CALL OF DUTY: WARZONE",
    subtitle: "RESURGENCE ALL-STAR SHOWDOWN",
    eyebrow: "FREE TO PLAY • TACTICAL SHOOTER",
    tags: ["Resurgence", "Squads / Trios", "Verdansk Grid", "₹1,00,000 Prize Pool"],
    viewsCount: "84,320",
    playersCount: "3,840,150",
    rating: "4.9",
    reviewsCount: "1.8K",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&auto=format&fit=crop&q=80",
    primaryLink: "/tournaments",
    primaryCtaText: "Join Tournament",
    rulesLink: "/tournaments",
    isSanctioned: true,
  },
  {
    id: "slide_freefire",
    gameTitle: "FREE FIRE MAX",
    subtitle: "ALL-STAR CLASH SQUAD CUP",
    eyebrow: "COMMUNITY CUP • FAST PACED",
    tags: ["Clash Squad", "Bermuda Remastered", "Fast Pace", "₹50,000 Prize Pool"],
    viewsCount: "118,240",
    playersCount: "6,120,400",
    rating: "4.9",
    reviewsCount: "3.2K",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80",
    primaryLink: "/tournaments/tour_ff_01",
    primaryCtaText: "Enter Qualifier",
    rulesLink: "/tournaments/tour_ff_01",
    isSanctioned: true,
  },
  {
    id: "slide_valorant",
    gameTitle: "VALORANT PROTOCOL",
    subtitle: "TACTICAL PRE-SEASON SCRIMS",
    eyebrow: "SANCTIONED LEAGUE • 5v5 SEARCH & DESTROY",
    tags: ["5v5 Tactical", "Ascent & Haven", "Anti-Cheat Certified", "₹80,000 Prize Pool"],
    viewsCount: "76,900",
    playersCount: "2,190,000",
    rating: "4.8",
    reviewsCount: "1.4K",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80",
    primaryLink: "/tournaments",
    primaryCtaText: "View Bracket",
    rulesLink: "/tournaments",
    isSanctioned: true,
  },
];

interface HeroBannerProps {
  onOpenShareModal?: () => void;
}

export default function HeroBanner({ onOpenShareModal }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideCount = HERO_SLIDES.length;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance slides every 6 seconds unless user is hovering
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slideCount);
      }, 6000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slideCount]);

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const active = HERO_SLIDES[currentSlide];

  return (
    <section 
      className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex flex-col justify-between select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Featured Esports Tournaments Showcase"
    >
      {/* Background Slides with Cross-Fade & Subtle Zoom */}
      {HERO_SLIDES.map((slide, idx) => {
        const isActive = idx === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              isActive 
                ? "opacity-100 scale-100 z-0" 
                : "opacity-0 scale-105 pointer-events-none z-0"
            }`}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.gameTitle}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        );
      })}

      {/* Cinematic Vignette Overlays for Maximum Text Legibility */}
      {/* 1. Left dark gradient vignette for text prominence */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20 z-1 pointer-events-none" />

      {/* 2. Top header blend */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-transparent z-1 pointer-events-none" />

      {/* 3. Radial focus overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,transparent_0%,rgba(2,6,23,0.5)_100%)] z-1 pointer-events-none" />

      {/* 4. Seamless transition gradient at the bottom fading softly into page canvas */}
      <div 
        className="absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/70 via-30% to-transparent z-10 pointer-events-none" 
      /> 
 
      {/* Top/Upper Showcase Content (Elevated to Upper-Middle) */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 lg:pt-22 z-20 w-full">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Left Column: Game Info & CTAs */}
          <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-5">
            {/* Eyebrow Category Badge */}
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-[11px] font-mono font-bold tracking-widest uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {active.eyebrow}
              </span>

              {active.isSanctioned && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Sanctioned League Fixture</span>
                </span>
              )}
            </div>

            {/* Hero Main Game Title */}
            <div className="space-y-1">
              <h1 
                key={`title-${active.id}`}
                className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-mono leading-none drop-shadow-md animate-in fade-in slide-in-from-left-4 duration-300"
              >
                {active.gameTitle}
              </h1>
              <p 
                key={`sub-${active.id}`}
                className="text-sm sm:text-base font-semibold text-emerald-400 font-mono tracking-wide uppercase pt-1 animate-in fade-in slide-in-from-left-4 duration-300 delay-75"
              >
                {active.subtitle}
              </p>
            </div>

            {/* Tag Pills Row (Matching Reference) */}
            <div 
              key={`tags-${active.id}`}
              className="flex flex-wrap items-center gap-2 pt-1 animate-in fade-in duration-300 delay-100"
            >
              {active.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-xs font-medium text-slate-100 transition-colors cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Meta Stats Row (Eye Views, Athletes Count, Star Rating) */}
            <div 
              key={`stats-${active.id}`}
              className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs font-mono text-slate-200 animate-in fade-in duration-300 delay-150"
            >
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-slate-400" />
                <span className="font-bold text-white">{active.viewsCount}</span>
                <span className="text-slate-400 font-sans text-[11px] hidden sm:inline">Active</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white">{active.playersCount}</span>
                <span className="text-slate-400 font-sans text-[11px] hidden sm:inline">Pool</span>
              </div>

              <div className="flex items-center gap-1 text-amber-400">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-white ml-1">{active.rating}</span>
                <span className="text-slate-400 font-sans text-[11px]">({active.reviewsCount})</span>
              </div>
            </div>

            {/* Action Buttons Row (Matching Reference Layout) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/leaderboards"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold transition-all hover:border-white/30"
              >
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>Standings</span>
              </Link>

              <Link
                href={active.rulesLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold transition-all hover:border-white/30"
              >
                <FileText className="h-3.5 w-3.5 text-slate-300" />
                <span>Rules &amp; Scoring</span>
              </Link>

              <Link
                href={active.primaryLink}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 group"
              >
                <Bookmark className="h-3.5 w-3.5 fill-slate-950 text-slate-950" />
                <span>{active.primaryCtaText}</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>

              {onOpenShareModal && (
                <button
                  type="button"
                  onClick={onOpenShareModal}
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-medium transition-all border border-white/10"
                >
                  <Share2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>Invite Squad</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Carousel Pagination Indicator (Matching Reference Image) */}
          <div className="flex items-center justify-end gap-3 pb-2">
            <button
              onClick={prevSlide}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors focus:outline-none"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((slide, idx) => {
                const isCurrent = idx === currentSlide;
                return (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(idx)}
                    className="group relative flex items-center justify-center p-1 focus:outline-none"
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    {isCurrent ? (
                      <span className="relative flex items-center justify-center h-5 w-5">
                        <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-pulse" />
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-white/40 group-hover:bg-white/80 transition-all" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={nextSlide}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors focus:outline-none"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: Live Telemetry Ticker Strip (Blended Seamlessly Inside Hero) */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-20 pb-5 sm:pb-6 pt-6 sm:pt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-slate-950/60 backdrop-blur-xl border border-white/10 shadow-lg">
          <div className="flex flex-col items-center sm:items-start px-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
              ₹15,00,000+
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-300 tracking-wider mt-0.5">
              Cumulative Prize Pool
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-start px-2 lg:border-l lg:border-white/10">
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
              48,500+
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-300 tracking-wider mt-0.5">
              Registered Athletes
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-start px-2 lg:border-l lg:border-white/10">
            <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
              1,840+
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-300 tracking-wider mt-0.5">
              Sanctioned Matches Held
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-start px-2 lg:border-l lg:border-white/10">
            <span className="text-xl sm:text-2xl font-bold font-mono text-white">
              99.8%
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-300 tracking-wider mt-0.5">
              Anti-Cheat Certified
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
