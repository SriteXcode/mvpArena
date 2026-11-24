"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";

export interface HeroSlide {
  id: string;
  gameTitle: string;
  subtitle: string;
  imageUrl: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide_bgmi",
    gameTitle: "BATTLEGROUNDS MOBILE INDIA",
    subtitle: "PRO SCRIMS CHAMPIONSHIP • S4",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80",
  },
  {
    id: "slide_warzone",
    gameTitle: "CALL OF DUTY: WARZONE",
    subtitle: "RESURGENCE ALL-STAR SHOWDOWN",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&auto=format&fit=crop&q=80",
  },
  {
    id: "slide_freefire",
    gameTitle: "FREE FIRE MAX",
    subtitle: "ALL-STAR CLASH SQUAD CUP",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80",
  },
  {
    id: "slide_valorant",
    gameTitle: "VALORANT PROTOCOL",
    subtitle: "TACTICAL PRE-SEASON SCRIMS",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80",
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

  const scrollToTournaments = () => {
    const el = document.getElementById("tournaments");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const active = HERO_SLIDES[currentSlide];

  return (
    <section 
      className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex flex-col justify-center select-none"
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
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/30 z-1 pointer-events-none" />

      {/* 2. Top header blend */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-transparent z-1 pointer-events-none" />

      {/* 3. Radial focus overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,transparent_0%,rgba(2,6,23,0.6)_100%)] z-1 pointer-events-none" />

      {/* 4. Seamless transition gradient at the bottom fading softly into page canvas */}
      <div 
        className="absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/70 via-30% to-transparent z-10 pointer-events-none" 
      /> 

      {/* Clean Hero Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 z-20 w-full">
        <div className="max-w-2xl lg:max-w-3xl space-y-5 sm:space-y-6">
          {/* Hero Main Game Title & Subtitle */}
          <div className="space-y-2">
            <h1 
              key={`title-${active.id}`}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase font-mono leading-tight drop-shadow-md animate-in fade-in slide-in-from-left-4 duration-300 break-words"
            >
              {active.gameTitle}
            </h1>
            <p 
              key={`sub-${active.id}`}
              className="text-sm sm:text-base md:text-lg font-semibold text-emerald-400 font-mono tracking-wider uppercase pt-1 animate-in fade-in slide-in-from-left-4 duration-300 delay-75 break-words"
            >
              {active.subtitle}
            </p>
          </div>

          {/* Action Button & Subtle Carousel Indicators */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a
              href="#tournaments"
              onClick={(e) => {
                e.preventDefault();
                scrollToTournaments();
              }}
              className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Tournaments</span>
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>

            {/* Subtle Slide Indicators */}
            <div className="flex items-center gap-2 sm:ml-4">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlide ? "w-8 bg-emerald-400" : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
