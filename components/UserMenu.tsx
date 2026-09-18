"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  LogOut,
  User as UserIcon,
  Check,
  Sparkles,
  BarChart3,
  Users,
  ChevronDown,
  Clock,
  LogIn,
} from "lucide-react";
import { useRoom } from "../context/RoomContext";
import { UserStatus } from "../types";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  onOpenAuthModal: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onOpenAuthModal }) => {
  const router = useRouter();

  const {
    currentUser,
    googleUser,
    isAuthenticated,
    loginWithGoogle,
    logout,
    updateUserStatus,
  } = useRoom();

  const [isOpen, setIsOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState(currentUser.statusNote || "");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserStatus(currentUser.status, noteInput);
    setEditingNote(false);
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "working":
        return <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" title="Working" />;
      case "break":
        return <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" title="On Break" />;
      case "stuck":
        return <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/20" title="Stuck" />;
      default:
        return <span className="h-2.5 w-2.5 rounded-full bg-neutral-400" title="Idle" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => router.push('/login')}
        className="inline-flex items-center space-x-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer"
        id="nav-signin-google-btn"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
          <path
            fill="#ffffff"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#ffffff"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#ffffff"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#ffffff"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer border border-neutral-200/80 dark:border-neutral-800/80"
        id="user-profile-menu-btn"
      >
        <div className="relative">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-7 w-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
          />
          <div className="absolute -bottom-0.5 -right-0.5">
            {getStatusBadge(currentUser.status)}
          </div>
        </div>

        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 max-w-[100px] truncate leading-tight">
            {currentUser.name}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize font-medium leading-tight">
            Google Sync
          </span>
        </div>

        <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
      </button>

      {/* Profile Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-zinc-900 p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Details */}
          <div className="flex items-center space-x-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-10 w-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {googleUser?.email || "Google Account"}
              </p>
              <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span>● Google Authenticated</span>
              </span>
            </div>
          </div>

          {/* Status Note Editor */}
          <div className="py-3 border-b border-neutral-200 dark:border-neutral-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
              Live Status Note
            </p>
            {editingNote ? (
              <form onSubmit={handleNoteSubmit} className="flex items-center space-x-1">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. 'Refactoring API'"
                  className="w-full text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2 py-1 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setEditingNote(true)}
                className="w-full text-left text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100/60 dark:bg-neutral-800/60 p-2 rounded-md transition-colors truncate"
              >
                {currentUser.statusNote || "+ Add status note (e.g. 'Writing docs')"}
              </button>
            )}
          </div>

          {/* Quick Status Selectors */}
          <div className="py-2 border-b border-neutral-200 dark:border-neutral-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
              Status Indicator
            </p>
            <div className="grid grid-cols-3 gap-1">
              {[
                { status: "working", label: "Working", color: "bg-emerald-500" },
                { status: "break", label: "Break", color: "bg-amber-500" },
                { status: "stuck", label: "Stuck", color: "bg-rose-500" },
              ].map((s) => (
                <button
                  key={s.status}
                  onClick={() => updateUserStatus(s.status as UserStatus)}
                  className={`flex items-center space-x-1.5 p-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    currentUser.status === s.status
                      ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${s.color}`} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-2">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-2 rounded-md px-2 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              id="sign-out-btn"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
