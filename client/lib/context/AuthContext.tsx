"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  userId: string;
  email: string;
  username: string;
  name: string;
  role: "player" | "organizer" | "super_admin";
  avatarUrl?: string;
  whatsappNumber?: string;
  upiId?: string;
  gameProfiles?: Array<{ game: string; gameId: string; inGameName: string; verified?: boolean }>;
  hasGameId?: boolean;
}

export interface ProfileCompletionStats {
  percent: number;
  hasBasic: boolean;
  hasGameId: boolean;
  hasUpiId: boolean;
}

export function computeProfileCompletion(user: AuthUser | null): ProfileCompletionStats {
  if (!user) {
    return { percent: 0, hasBasic: false, hasGameId: false, hasUpiId: false };
  }
  const hasBasic = Boolean(user.name && user.username && user.email);
  const hasGameId = Boolean(
    user.hasGameId || (user.gameProfiles && user.gameProfiles.length > 0)
  );
  const hasUpiId = Boolean(user.upiId && user.upiId.trim().length > 0);

  let percent = 0;
  if (hasBasic) percent += 40;
  if (hasGameId) percent += 30;
  if (hasUpiId) percent += 30;

  return { percent, hasBasic, hasGameId, hasUpiId };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    whatsappNumber?: string;
    role?: "player" | "organizer";
  }) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  refreshUser: () => Promise<void>;
  authModalOpen: boolean;
  authModalMode: "login" | "register";
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  completionModalOpen: boolean;
  openCompletionModal: () => void;
  closeCompletionModal: () => void;
  completionStats: ProfileCompletionStats;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  setUser: () => {},
  refreshUser: async () => {},
  authModalOpen: false,
  authModalMode: "login",
  openAuthModal: () => {},
  closeAuthModal: () => {},
  completionModalOpen: false,
  openCompletionModal: () => {},
  closeCompletionModal: () => {},
  completionStats: { percent: 0, hasBasic: false, hasGameId: false, hasUpiId: false },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const router = useRouter();

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    // Remove ?auth= query param if present
    if (typeof window !== "undefined" && window.location.search.includes("auth=")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  };

  const openCompletionModal = () => {
    setCompletionModalOpen(true);
  };

  const closeCompletionModal = () => {
    setCompletionModalOpen(false);
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch {
      // Ignore
    }
  };

  // Check URL query param for ?auth=login or ?auth=register
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const authParam = params.get("auth");
      if (authParam === "login" || authParam === "register") {
        setTimeout(() => {
          setAuthModalMode(authParam);
          setAuthModalOpen(true);
        }, 0);
      }
    }
  }, []);

  // Load session from cookie / API on mount
  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return { success: false, user: null };
      })
      .then((data) => {
        if (mounted) {
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
            localStorage.removeItem("mvp_demo_auth");
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Invalid credentials" };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || "Network error" };
    }
  };

  const register = async (formData: {
    name: string;
    username: string;
    email: string;
    password: string;
    whatsappNumber?: string;
    role?: "player" | "organizer";
  }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Registration failed" };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    localStorage.removeItem("mvp_demo_auth");
    openAuthModal("login");
  };

  const completionStats = computeProfileCompletion(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        setUser,
        refreshUser,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        completionModalOpen,
        openCompletionModal,
        closeCompletionModal,
        completionStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
