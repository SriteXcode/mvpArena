"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Lock, 
  Mail, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Check,
  Phone,
  KeyRound,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function AuthModal() {
  const { authModalOpen, authModalMode, openAuthModal, closeAuthModal, login, register, openCompletionModal } = useAuth();
  
  // View mode can be login, register, or forgot_password
  const [viewMode, setViewMode] = useState<"login" | "register" | "forgot_password">("login");
  const [direction, setDirection] = useState<"right" | "left">("right");

  // Synchronize with external authModalMode
  useEffect(() => {
    setViewMode(authModalMode);
  }, [authModalMode]);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register state
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regWhatsapp, setRegWhatsapp] = useState("+91 ");
  const [regOtp, setRegOtp] = useState("");
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpVerified, setRegOtpVerified] = useState(false);
  const [sendingRegOtp, setSendingRegOtp] = useState(false);
  const [verifyingRegOtp, setVerifyingRegOtp] = useState(false);

  // Forgot password state
  const [forgotChannel, setForgotChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [forgotPhone, setForgotPhone] = useState("+91 ");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [sendingForgotOtp, setSendingForgotOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAuthModal();
      }
    };
    if (authModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [authModalOpen, closeAuthModal]);

  // Reset alerts when view mode changes
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
  }, [viewMode]);

  const handleModeChange = (nextMode: "login" | "register" | "forgot_password") => {
    if (nextMode === viewMode) return;
    setDirection(nextMode === "register" ? "right" : "left");
    setViewMode(nextMode);
    if (nextMode !== "forgot_password") {
      openAuthModal(nextMode);
    }
  };

  if (!authModalOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(loginEmail, loginPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Authentication successful. Welcome back!");
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    } else {
      setError(res.error || "Invalid credentials. Please verify your details.");
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = regUsername.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      setError("Username must be 3 to 20 characters and contain only lowercase letters, numbers, and underscores (e.g. viper_god).");
      return;
    }

    setLoading(true);

    const res = await register({
      name: regName.trim(),
      username: cleanUsername,
      email: regEmail.trim(),
      password: regPassword,
      whatsappNumber: regWhatsapp,
      role: "player",
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Account registration confirmed. Welcome to MVP Arena!");
      setTimeout(() => {
        closeAuthModal();
        openCompletionModal();
      }, 700);
    } else {
      setError(res.error || "Registration failed. Please check the entered data.");
    }
  };

  // Send Registration OTP
  const handleSendRegOtp = async () => {
    if (!regWhatsapp.trim() || regWhatsapp.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number for WhatsApp verification.");
      return;
    }
    setError(null);
    setSendingRegOtp(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber: regWhatsapp, purpose: "registration" }),
      });
      const data = await res.json();
      if (data.success) {
        setRegOtpSent(true);
        setSuccessMsg("OTP sent to your WhatsApp number!");
      } else {
        setError(data.error || "Failed to dispatch WhatsApp OTP.");
      }
    } catch {
      setError("Network error sending WhatsApp OTP.");
    } finally {
      setSendingRegOtp(false);
    }
  };

  // Verify Registration OTP
  const handleVerifyRegOtp = async () => {
    if (!regOtp.trim() || regOtp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP received on WhatsApp.");
      return;
    }
    setError(null);
    setVerifyingRegOtp(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappNumber: regWhatsapp,
          otp: regOtp.trim(),
          purpose: "registration",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegOtpVerified(true);
        setSuccessMsg("WhatsApp number verified successfully!");
      } else {
        setError(data.error || "Invalid OTP code.");
      }
    } catch {
      setError("Error verifying OTP.");
    } finally {
      setVerifyingRegOtp(false);
    }
  };

  // Send Password Reset OTP
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone.trim() || forgotPhone.replace(/\D/g, "").length < 10) {
      setError("Please enter your 10-digit registered WhatsApp mobile number.");
      return;
    }
    setError(null);
    setSendingForgotOtp(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber: forgotPhone, purpose: "password_reset" }),
      });
      const data = await res.json();
      if (data.success) {
        setForgotOtpSent(true);
        setSuccessMsg("Password reset OTP sent to your WhatsApp number!");
      } else {
        setError(data.error || "No account found with this WhatsApp number.");
      }
    } catch {
      setError("Network error sending OTP.");
    } finally {
      setSendingForgotOtp(false);
    }
  };

  // Reset Password with OTP
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP received on WhatsApp.");
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    setError(null);
    setResettingPassword(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappNumber: forgotPhone,
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Password reset successfully! Please sign in with your new password.");
        setTimeout(() => {
          handleModeChange("login");
          setForgotOtpSent(false);
          setForgotOtp("");
          setForgotNewPassword("");
        }, 1500);
      } else {
        setError(data.error || "Password reset failed. Invalid or expired OTP.");
      }
    } catch {
      setError("Error resetting password.");
    } finally {
      setResettingPassword(false);
    }
  };

  // Send Email Password Reset
  const handleSendForgotEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      setError("Please enter a valid registered email address.");
      return;
    }
    setError(null);
    setSendingForgotOtp(true);
    try {
      const res = await fetch("/api/auth/forgot-password/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setForgotOtpSent(true);
        setSuccessMsg("Password reset code sent to your email!");
      } else {
        setError(data.error || "No account found with this email address.");
      }
    } catch {
      setError("Network error sending reset email.");
    } finally {
      setSendingForgotOtp(false);
    }
  };

  // Reset Password via Email Code
  const handleResetPasswordEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setError("Please enter the 6-digit code sent to your email.");
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    setError(null);
    setResettingPassword(true);
    try {
      const res = await fetch("/api/auth/reset-password/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Password updated successfully! Please sign in with your new password.");
        setTimeout(() => {
          handleModeChange("login");
          setForgotOtpSent(false);
          setForgotOtp("");
          setForgotNewPassword("");
        }, 1500);
      } else {
        setError(data.error || "Password reset failed. Invalid or expired code.");
      }
    } catch {
      setError("Error resetting password.");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeAuthModal();
        }
      }}
    >
      <div 
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-4 relative my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <img
            src="/logo.png"
            alt="MVP Arena"
            className="h-10 w-auto object-contain mx-auto"
          />
          <h2 className="text-base font-bold text-slate-900 tracking-wide font-mono">
            MVP<span className="text-emerald-600">ARENA</span>
          </h2>
          <p className="text-xs text-slate-600">
            {viewMode === "forgot_password"
              ? "Reset account access via WhatsApp OTP verification."
              : viewMode === "login"
              ? "Access sanctioned lobbies, active brackets, and tournament payouts."
              : "Register your athlete credentials and enter competitive tournaments."}
          </p>
        </div>

        {/* Sliding Tabs (Only shown in login / register modes) */}
        {viewMode !== "forgot_password" && (
          <div className="relative grid grid-cols-2 p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold select-none">
            <div
              className="absolute top-1 bottom-1 rounded-md bg-white shadow-xs transition-transform duration-250 ease-out"
              style={{
                width: "calc(50% - 4px)",
                left: "4px",
                transform: viewMode === "login" ? "translateX(0%)" : "translateX(calc(100% + 0px))",
              }}
            />
            <button
              type="button"
              onClick={() => handleModeChange("login")}
              className={`relative z-10 py-1.5 rounded-md transition-colors duration-200 text-center ${
                viewMode === "login"
                  ? "text-slate-900 font-bold"
                  : "text-slate-600 hover:text-slate-900 font-medium"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("register")}
              className={`relative z-10 py-1.5 rounded-md transition-colors duration-200 text-center ${
                viewMode === "register"
                  ? "text-slate-900 font-bold"
                  : "text-slate-600 hover:text-slate-900 font-medium"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Animated Form Wrapper */}
        <div 
          key={viewMode}
          className={direction === "right" ? "auth-form-enter-right" : "auth-form-enter-left"}
        >
          {/* ================= FORGOT PASSWORD MODE ================= */}
          {viewMode === "forgot_password" ? (
            <div className="space-y-3 pt-1 text-xs">
              {/* Channel Selector: WhatsApp vs Email */}
              {!forgotOtpSent && (
                <div className="grid grid-cols-2 p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setForgotChannel("whatsapp")}
                    className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      forgotChannel === "whatsapp"
                        ? "bg-white text-emerald-700 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900 font-medium"
                    }`}
                  >
                    <Phone className="h-3 w-3" />
                    <span>WhatsApp OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotChannel("email")}
                    className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      forgotChannel === "email"
                        ? "bg-white text-emerald-700 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900 font-medium"
                    }`}
                  >
                    <Mail className="h-3 w-3" />
                    <span>Email Code</span>
                  </button>
                </div>
              )}

              {!forgotOtpSent ? (
                /* Step 1: Send Code */
                forgotChannel === "whatsapp" ? (
                  <form onSubmit={handleSendForgotOtp} className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Registered WhatsApp Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={forgotPhone}
                          onChange={(e) => setForgotPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        A 6-digit verification code will be dispatched directly to WhatsApp.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={sendingForgotOtp}
                      className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                    >
                      {sendingForgotOtp ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Sending WhatsApp OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Send WhatsApp OTP</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSendForgotEmail} className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="athlete@example.com"
                          className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Password reset instructions and 6-digit code will be sent to your email.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={sendingForgotOtp}
                      className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                    >
                      {sendingForgotOtp ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Dispatching Email...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Password Reset Email</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )
              ) : (
                /* Step 2: Verify Code and Enter New Password */
                <form
                  onSubmit={
                    forgotChannel === "whatsapp"
                      ? handleResetPasswordSubmit
                      : handleResetPasswordEmailSubmit
                  }
                  className="space-y-3"
                >
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-between">
                    <span>
                      Code sent to: <strong>{forgotChannel === "whatsapp" ? forgotPhone : forgotEmail}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setForgotOtpSent(false)}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        placeholder="e.g. 549182"
                        className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 font-mono text-center tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      New Account Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resettingPassword}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {resettingPassword ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Confirm &amp; Reset Password</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleModeChange("login")}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          ) : viewMode === "login" ? (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address or Gamer Tag
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="athlete@example.com"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs font-normal"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleModeChange("forgot_password")}
                    className="text-[11px] font-medium text-emerald-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs font-normal"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-slate-600">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeChange("register")}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    Create one now
                  </button>
                </span>
              </div>
            </form>
          ) : (
            /* ================= REGISTER FORM ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Arjun Sharma"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs font-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username (User ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="e.g. viper_god"
                    maxLength={20}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs font-normal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="athlete@example.com"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs font-normal"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    WhatsApp Number
                  </label>
                  {regOtpVerified ? (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 font-mono">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendRegOtp}
                      disabled={sendingRegOtp}
                      className="text-[10px] text-emerald-700 font-semibold hover:underline"
                    >
                      {sendingRegOtp ? "Sending..." : "Verify via WhatsApp OTP"}
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={regWhatsapp}
                  onChange={(e) => setRegWhatsapp(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs font-normal"
                />
              </div>

              {/* Optional WhatsApp OTP verification input if user clicked verify */}
              {regOtpSent && !regOtpVerified && (
                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <label className="block text-[11px] font-semibold text-emerald-900">
                    Enter 6-digit OTP sent to WhatsApp:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value)}
                      placeholder="e.g. 123456"
                      className="flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-mono tracking-widest text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyRegOtp}
                      disabled={verifyingRegOtp}
                      className="px-3 py-1 rounded-md bg-emerald-700 text-white text-xs font-bold font-mono hover:bg-emerald-600"
                    >
                      {verifyingRegOtp ? "..." : "Verify"}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Enrolling Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Register Athlete Account</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              <div className="text-center pt-1 space-y-1.5">
                <div>
                  <span className="text-xs text-slate-600">
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange("login")}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
