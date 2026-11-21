import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "playarena_super_secret_jwt_key_2026_xyz"
);

interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  role: "player" | "organizer" | "super_admin";
  name: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("auth_token")?.value;
  let userPayload: TokenPayload | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userPayload = payload as unknown as TokenPayload;
    } catch {
      userPayload = null;
    }
  }

  // 1. Strict Super-Admin Route Protection (/admin/* and /api/admin/*)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!userPayload) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Access denied: Institutional Administrator authentication required." },
          { status: 401 }
        );
      }
      const url = new URL("/?auth=login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (userPayload.role !== "super_admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Forbidden: Super-Administrator authorization required." },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/?error=unauthorized_admin", request.url));
    }
  }

  // 2. Strict Organizer Route Protection (/organizer/* and /api/organizer/*)
  if (pathname.startsWith("/organizer") || pathname.startsWith("/api/organizer")) {
    if (!userPayload) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Access denied: Tournament Organizer authentication required." },
          { status: 401 }
        );
      }
      const url = new URL("/?auth=login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (userPayload.role !== "organizer" && userPayload.role !== "super_admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Forbidden: Tournament Organizer authorization required." },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/?error=unauthorized_organizer", request.url));
    }
  }

  // 3. Strict Athlete Protected Pages (/profile, /social)
  if (pathname.startsWith("/profile") || pathname.startsWith("/social")) {
    if (!userPayload) {
      const url = new URL("/?auth=login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/organizer/:path*",
    "/api/organizer/:path*",
    "/profile/:path*",
    "/social/:path*",
  ],
};
