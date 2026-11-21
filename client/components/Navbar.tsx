"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  Home,
  Trophy, 
  Flame, 
  Users, 
  Bell, 
  ChevronDown, 
  LogOut,
  User,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tv
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, openAuthModal } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setShowNotifications(false);
    setShowUserMenu(false);
  }

  // Close popups on click outside, Escape key, or browser back/forward
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    const handlePopState = () => {
      setShowNotifications(false);
      setShowUserMenu(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const notifications = [
    {
      id: "notif_1",
      title: "Lobby Credentials Dispatched",
      body: "BGMI Pro Scrims Match 01 access credentials have been issued to your authorized match lobby.",
      time: "2m ago",
      link: "/matches/match_01",
    },
    {
      id: "notif_2",
      title: "Fixture Audit Certified (+23 Pts)",
      body: "Official result verified: 1st Place placement with 8 confirmed eliminations.",
      time: "18m ago",
      link: "/leaderboards",
    },
    {
      id: "notif_3",
      title: "Official Roster Recruitment Notice",
      body: "Soul_Mortal has issued a formal roster invitation for Team SoulFire.",
      time: "1h ago",
      link: "/social",
    },
  ];

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/tournaments", label: "Tournaments", icon: Trophy },
    { href: "/streams", label: "Live Streams", icon: Tv },
    { href: "/#how-it-works", label: "How It Works", icon: Sparkles },
    { href: "/leaderboards", label: "Standings", icon: Flame },
    { href: "/social", label: "Rosters", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        {/* Left: Brand / Header Name */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <Image
              src="/logo.png"
              alt="MVP Arena"
              width={140}
              height={36}
              priority
              className="h-9 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5 font-mono">
                MVP<span className="text-emerald-600">ARENA</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Menu */}
        <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-100 text-slate-900 border border-slate-300 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-600" : "text-slate-500"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions / Auth / Profile */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              {/* Notification Bell */}
              <div ref={notificationsRef} className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setUnreadCount(0);
                    setShowUserMenu(false);
                  }}
                  className="relative p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 px-1">
                      <span className="font-bold text-slate-900 uppercase tracking-wider font-mono text-[11px]">
                        Notifications
                      </span>
                      <span className="text-[10px] text-emerald-600 font-mono font-medium">Live</span>
                    </div>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.link}
                          onClick={() => setShowNotifications(false)}
                          className="block p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 text-[11px]">
                            <span>{n.title}</span>
                            <span className="text-[10px] font-mono text-slate-500 font-normal">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 font-normal">
                            {n.body}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 pl-2 border-l border-slate-200 group focus:outline-none"
                >
                  <div className="relative h-8 w-8 rounded-full overflow-hidden border border-slate-300 group-hover:border-emerald-600 transition-colors bg-slate-100 shadow-xs flex items-center justify-center">
                    <Image
                      src={user.avatarUrl || "/avatar.png"}
                      alt={user.name || "User Avatar"}
                      width={32}
                      height={32}
                      unoptimized
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/avatar.png";
                      }}
                    />
                  </div>
                  <ChevronDown className="h-3 w-3 text-slate-500 group-hover:text-slate-900 transition-colors" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl z-50 text-xs">
                    {/* User Info Header */}
                    <div className="px-2.5 py-2 border-b border-slate-100 mb-1 flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <Image
                          src={user.avatarUrl || "/avatar.png"}
                          alt={user.name || "User Avatar"}
                          width={36}
                          height={36}
                          unoptimized
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/avatar.png";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 truncate text-xs">{user.name}</div>
                        <div className="text-[10px] font-mono text-emerald-600">@{user.username}</div>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold inline-block mt-0.5">
                          {user.role} tier
                        </span>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <User className="h-3.5 w-3.5 text-slate-500" />
                        <span>Athlete Profile</span>
                      </Link>

                      <Link
                        href="/social"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <Users className="h-3.5 w-3.5 text-slate-500" />
                        <span>Squad Roster &amp; Invites</span>
                      </Link>

                      <Link
                        href="/organizer/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
                        <span>Organizer Dashboard</span>
                      </Link>

                      <Link
                        href="/admin/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                        <span>Super-Admin Console</span>
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-slate-100 mt-1.5 pt-1">
                      <button
                        onClick={async () => {
                          setShowUserMenu(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-semibold transition-colors text-left"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Logged out state */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("register")}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
