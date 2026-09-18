"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { useRoom } from "../context/RoomContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useRoom();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle('/room');
      // Browser will redirect to Google OAuth consent screen.
    } catch (err) {
      console.error("Google sign in error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          id="close-auth-modal-btn"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xl shadow-lg mb-4">
            S
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Sign In to Sync
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Connect your Google account to save focus sessions, track task progress, and unlock team features.
          </p>
        </div>

        {/* Primary CTA: Google Sign In */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3.5 text-sm font-semibold text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
            id="google-signin-modal-btn"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
          </button>
        </div>

        {/* Feature Unlocks List */}
        <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800 space-y-2.5">
          <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            What you unlock with Google Sign-In:
          </p>

          <div className="flex items-start space-x-2 text-xs text-neutral-600 dark:text-neutral-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>Real Google avatar & verified team display name</span>
          </div>

          <div className="flex items-start space-x-2 text-xs text-neutral-600 dark:text-neutral-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>Persistent session history & focus time analytics</span>
          </div>

          <div className="flex items-start space-x-2 text-xs text-neutral-600 dark:text-neutral-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>Task assignment & real-time team synchronization</span>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};
