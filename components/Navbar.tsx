"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Moon,
  Sun,
  Clock,
  Users,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { useRoom } from "../context/RoomContext";
import { UserStatus } from "../types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { AuthModal } from "./AuthModal";

export const Navbar: React.FC = () => {
  const router = useRouter();

  const {
    activeView,
    setActiveView,
    isDark,
    toggleTheme,
    room,
    toggleTimer,
    resetTimer,
    setTimerMinutes,
    currentUser,
    updateUserStatus,
    isAuthModalOpen,
    setIsAuthModalOpen,
  } = useRoom();

  const [copied, setCopied] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState(currentUser.statusNote || "");

  // Format MM:SS for timer
  const totalSeconds =
    room.mode === "pomodoro"
      ? Math.max(0, room.targetDurationMinutes * 60 - room.elapsedSeconds)
      : room.elapsedSeconds;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusPills: {
    id: UserStatus;
    label: string;
    dotColor: string;
    activeStyle: string;
  }[] = [
    {
      id: "working",
      label: "working",
      dotColor: "bg-emerald-500",
      activeStyle:
        "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold",
    },
    {
      id: "break",
      label: "break",
      dotColor: "bg-amber-500",
      activeStyle:
        "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold",
    },
    {
      id: "stuck",
      label: "stuck",
      dotColor: "bg-rose-500",
      activeStyle:
        "bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-neutral-200 dark:border-neutral-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Section: App Title & Room Code */}
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-2 cursor-pointer group"
            >
              {/* <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs">
                S
              </div> */}
               <img src="/icon.png" alt="sync logo" className="h-7 w-7" />
              <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                Sync
              </span>
            </Link>

            <span className="text-neutral-300 dark:text-neutral-700">/</span>

            {/* Room Code Badge */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center space-x-1.5 rounded-md bg-neutral-100 dark:bg-neutral-900 px-2 py-1 text-xs font-mono text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800/80 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Click to copy room link"
              id="room-code-badge"
            >
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {room.code}
              </span>
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3 text-neutral-400" />
              )}
            </button>
          </div>

          {/* Center Section: Compact Room Timer */}
          <div className="hidden sm:flex items-center space-x-2 rounded-md border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 px-3 py-1 text-xs">
            <div className="flex items-center space-x-1.5 font-mono text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums">
              <Clock className="h-3.5 w-3.5 text-neutral-400" />
              <span>{formattedTime}</span>
            </div>

            <button
              onClick={toggleTimer}
              className={`p-1 rounded transition-colors ${
                room.isRunning
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                  : "bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700"
              }`}
              title={room.isRunning ? "Pause timer" : "Start timer"}
              id="timer-toggle-btn"
            >
              {room.isRunning ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              title="Reset timer"
              id="timer-reset-btn"
            >
              <RotateCcw className="h-3 w-3" />
            </button>

            {/* Quick presets */}
            <div className="ml-1 flex items-center space-x-1 border-l border-neutral-200 dark:border-neutral-800 pl-2">
              {[25, 50].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setTimerMinutes(mins)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    room.targetDurationMinutes === mins
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Right Section: Status Pill Buttons, User Menu & Theme Toggle */}
          <div className="flex items-center space-x-3">
            {/* User's own status toggle: 3 small pill buttons */}
            <div className="flex items-center space-x-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-0.5">
              {statusPills.map((pill) => {
                const isActive = currentUser.status === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => updateUserStatus(pill.id)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs transition-all duration-150 cursor-pointer ${
                      isActive
                        ? pill.activeStyle
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                    }`}
                    id={`status-pill-${pill.id}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${pill.dotColor} ${isActive ? "animate-pulse" : ""}`}
                    />
                    <span className="capitalize">{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {/* View Toggle */}
            <div className="hidden md:flex items-center space-x-1 border-l border-neutral-200 dark:border-neutral-800 pl-3">
              <button
                onClick={() => {
                  setActiveView("room");
                  router.push("/room");
                }}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                  activeView === "room"
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
                title="Room View"
                id="nav-room-view-btn"
              >
                <Users className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Room</span>
              </button>

              <Link href="/history">
                <button
                  className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                    activeView === "history"
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                  title="Session History"
                  id="nav-history-view-btn"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">History</span>
                </button>
              </Link>
            </div>

            {/* Google User Menu / Sign In Trigger */}
            <UserMenu onOpenAuthModal={() => setIsAuthModalOpen(true)} />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="rounded-md border border-neutral-200 dark:border-neutral-800 p-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title={
                isDark
                  ? "Switch to Near-White theme"
                  : "Switch to Near-Black theme"
              }
              id="theme-toggle-btn"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-neutral-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* In-Context Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
