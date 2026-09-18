"use client";

import React from "react";
import { Sparkles, ArrowRight, X } from "lucide-react";

interface GuestBannerProps {
  onSignInClick: () => void;
  onDismiss?: () => void;
}

export const GuestBanner: React.FC<GuestBannerProps> = ({
  onSignInClick,
  onDismiss,
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-zinc-900 border-b border-indigo-500/30 text-white px-4 py-2.5 shadow-md flex items-center justify-between transition-all duration-300">
      <div className="flex items-center space-x-3 max-w-4xl mx-auto flex-1 justify-center sm:justify-start">
        {/* Google Multicolor Badge */}
        <div className="hidden sm:flex h-6 w-6 items-center justify-center rounded-full bg-white p-1 shadow-xs flex-shrink-0">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
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
        </div>

        <div className="flex items-center space-x-2 text-xs font-medium truncate">
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] uppercase font-bold tracking-wider">
            Guest Mode
          </span>
          <span className="text-neutral-200 truncate">
            You are in temporary guest mode. <strong className="text-white">Sign In with Google</strong> to save session history & real user status!
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3 flex-shrink-0 pl-2">
        <button
          onClick={onSignInClick}
          className="inline-flex items-center space-x-1.5 rounded-md bg-white hover:bg-neutral-100 text-neutral-900 px-3 py-1 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          id="guest-banner-signin-btn"
        >
          <span>Sign In with Google</span>
          <ArrowRight className="h-3.5 w-3.5 text-indigo-600" />
        </button>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            title="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
