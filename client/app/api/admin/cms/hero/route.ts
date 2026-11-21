import { NextResponse } from "next/server";

// In-memory / persistent CMS store for hero banner slides
let heroSlides = [
  {
    id: "slide_01",
    tag: "INDIA'S PREMIER ESPORTS ARENA",
    title: "Compete in BGMI & Free Fire MAX Daily Scrims",
    subtitle:
      "Automated verification, real-time live standings, and instant UPI prize pool settlements directly into your account.",
    ctaPrimaryText: "Browse Tournaments",
    ctaPrimaryLink: "/tournaments",
    ctaSecondaryText: "View Standings",
    ctaSecondaryLink: "/leaderboards",
    bannerUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80",
    badgeColor: "emerald",
    active: true,
  },
  {
    id: "slide_02",
    tag: "WEEKEND MEGA CONTEST",
    title: "₹2,50,000 Weekend All-Day Showdown",
    subtitle:
      "Massive multi-stage knockout bracket with national streaming, official casters, and cash bounty on every elimination.",
    ctaPrimaryText: "Register Weekend Squad",
    ctaPrimaryLink: "/tournaments?type=weekend_mega",
    ctaSecondaryText: "Watch Live Streams",
    ctaSecondaryLink: "/streams",
    bannerUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80",
    badgeColor: "amber",
    active: true,
  },
  {
    id: "slide_03",
    tag: "INSTANT UPI SETTLEMENTS",
    title: "100% Guaranteed Payouts directly to GPay & PhonePe",
    subtitle:
      "Never wait for prize distributions. Verified match standings trigger automated UPI transfers straight to your bank.",
    ctaPrimaryText: "View Milestone Rewards",
    ctaPrimaryLink: "/profile",
    ctaSecondaryText: "Host Your Tournament",
    ctaSecondaryLink: "/organizer/dashboard",
    bannerUrl:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&auto=format&fit=crop&q=80",
    badgeColor: "indigo",
    active: true,
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: heroSlides });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body.slides)) {
      heroSlides = body.slides;
    } else if (body.slide) {
      const idx = heroSlides.findIndex((s) => s.id === body.slide.id);
      if (idx !== -1) {
        heroSlides[idx] = { ...heroSlides[idx], ...body.slide };
      } else {
        heroSlides.push({
          ...body.slide,
          id: `slide_${Date.now()}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Hero carousel banners updated successfully.",
      data: heroSlides,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
