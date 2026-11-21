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
  Tv,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, openAuthModal, completionStats, openCompletionModal } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setShowNotifications(false);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
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
        setMobileMenuOpen(false);
      }
    };

    const handlePopState = () => {
      setShowNotifications(false);
      setShowUserMenu(false);
      setMobileMenuOpen(false);
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
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Column: Brand Logo */}
        <div className="flex-1 flex items-center justify-start">
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
              <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1 font-mono">
                MVP<span className="text-emerald-600">ARENA</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center Column: Symmetrical Nav Pill (Desktop lg+) */}
        <nav className="hidden lg:flex flex-none items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100/90 border border-slate-200/90 shadow-2xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/" ? pathname === "/" : !link.href.includes("#") && pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-600" : "text-slate-500"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Column: Actions / Profile / Mobile Toggle */}
        <div className="flex-1 flex items-center justify-end gap-2.5">
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
                  className="relative p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 text-xs">
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
                          className="block p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all"
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
                  className="flex items-center gap-2 pl-2 border-l border-slate-200 group focus:outline-none cursor-pointer"
                >
                  <div className="relative h-8 w-8 rounded-full overflow-hidden border border-slate-300 group-hover:border-emerald-600 transition-colors bg-slate-100 shadow-2xs flex items-center justify-center">
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
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 text-xs">
                    {/* User Info Header */}
                    <div className="px-2 py-2 border-b border-slate-100 mb-2 flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <Image
                          src={user.avatarUrl || "/avatar.png"}
                          alt={user.name || "User Avatar"}
                          width={40}
                          height={40}
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

                    {/* Profile Readiness & Completion Progress */}
                    {completionStats.percent < 100 ? (
                      <div className="mb-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold text-amber-900">Profile Setup</span>
                          <span className="font-extrabold text-amber-700">{completionStats.percent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-amber-200/60 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-600 rounded-full transition-all duration-300"
                            style={{ width: `${completionStats.percent}%` }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            openCompletionModal();
                          }}
                          className="w-full text-center py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          Complete Profile (+{100 - completionStats.percent}%)
                        </button>
                      </div>
                    ) : (
                      <div className="mb-2 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-800 font-bold flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          Profile 100% Complete
                        </span>
                        <span className="text-[9px] font-mono text-emerald-600 font-semibold">Verified</span>
                      </div>
                    )}

                    {/* Links */}
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <User className="h-3.5 w-3.5 text-slate-500" />
                        <span>Athlete Profile</span>
                      </Link>

                      <Link
                        href="/social"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-900 hover:bg-emerald-50/60 font-semibold transition-colors bg-slate-50/60 border border-slate-100"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="h-3.5 w-3.5 text-emerald-600" />
                          <span>My Squad</span>
                        </div>
                        <span className="text-[9px] font-mono uppercase bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                          Hub
                        </span>
                      </Link>

                      {(user.role === "organizer" || user.role === "super_admin") && (
                        <Link
                          href="/organizer/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
                          <span>Organizer Dashboard</span>
                        </Link>
                      )}

                      {user.role === "super_admin" && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                          <span>Super-Admin Console</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-slate-100 mt-2 pt-1.5">
                      <button
                        onClick={async () => {
                          setShowUserMenu(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-semibold transition-colors text-left cursor-pointer"
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
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("register")}
                className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-sm cursor-pointer"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle (Visible on screens < lg) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer ml-1"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4 text-slate-900" />
            ) : (
              <Menu className="h-4 w-4 text-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* Symmetrical Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/90 bg-white px-4 py-4 shadow-xl space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.href === "/" ? pathname === "/" : !link.href.includes("#") && pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-bold"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-slate-500"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Quick Links in Mobile Menu */}
          {user ? (
            <div className="space-y-1.5 pt-1">
              <Link
                href="/social"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span>My Squad Hub</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                  Open Lineup
                </span>
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-800"
                >
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span>Profile</span>
                </Link>

                {(user.role === "organizer" || user.role === "super_admin") && (
                  <Link
                    href="/organizer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-800"
                  >
                    <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
                    <span>Organizer</span>
                  </Link>
                )}
              </div>

              {user.role === "super_admin" && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-purple-600" />
                    <span>Super-Admin Console</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                </Link>
              )}

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("login");
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("register");
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 shadow-sm cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
