"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Check,
  Users,
  Sparkles,
  Clock,
  Palette,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Moon,
  Zap,
  Target,
  ChevronDown,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { useRoom } from "../context/RoomContext";
import { DESIGN_TEMPLATES } from "../data/initialData";
import { DesignTemplate, UserStatus } from "../types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { AuthModal } from "./AuthModal";

export const LandingPage: React.FC = () => {
  const router = useRouter();
  const {
    setActiveView,
    selectedTemplate,
    setSelectedTemplate,
    isDark,
    toggleTheme,
    setTimerMinutes,
    setIsAuthModalOpen,
    isAuthModalOpen,
  } = useRoom();

  // Interactive Live Demo State
  const [demoStatus, setDemoStatus] = useState<UserStatus>("working");
  const [demoNote, setDemoNote] = useState("Refactoring API state hooks");
  const [demoTimerRunning, setDemoTimerRunning] = useState(false);
  const [demoTimerSeconds, setDemoTimerSeconds] = useState(1420); // 23:40
  const [demoNudgeSent, setDemoNudgeSent] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Demo timer tick
  React.useEffect(() => {
    if (!demoTimerRunning) return;
    const interval = setInterval(() => {
      setDemoTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [demoTimerRunning]);

  const handleSelectTemplate = (template: DesignTemplate) => {
    setSelectedTemplate(template);
  };

  const handleStartSession = (duration = 50) => {
    setTimerMinutes(duration);
    setActiveView("room");
    router.push("/room");
  };

  const formattedDemoTime = `${String(Math.floor(demoTimerSeconds / 60)).padStart(2, "0")}:${String(demoTimerSeconds % 60).padStart(2, "0")}`;

  const faqItems = [
    {
      q: "Do I need to turn on my video camera or microphone?",
      a: "No, absolutely not. Sync is designed specifically for camera-free, silent co-working. You share live status dots, real-time task progress, and light text nudges without meeting fatigue.",
    },
    {
      q: "How does real-time synchronization work across team members?",
      a: "Sync uses low-latency WebSockets and multi-tab state sync. When you update your status dot or complete a task, your room teammates see the updates instantly without refreshing.",
    },
    {
      q: "Can I join or create a room as a guest without signing up?",
      a: "Yes! Guest mode allows instant 1-click access to focus rooms. You can start focusing immediately, and optionally sign in with Google later to persist your session history.",
    },
    {
      q: "Can I customize timer lengths and aesthetic design templates?",
      a: "Yes. You can switch between 25m Pomodoro sprints, 50m flow blocks, or open Stopwatch mode anytime. You can also customize your aesthetic mode (Linear Obsidian, Notion Warm Canvas, Vercel Clean Slate, Nordic Slate).",
    },
    {
      q: "Is Sync free to use for small teams and solo workers?",
      a: "Sync is 100% free for individual focus and team co-working rooms. There are no limits on focus hours or task tracking.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200 selection:bg-indigo-500/20 selection:text-indigo-400 font-sans">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <img src="/icon.png" alt="sync logo" className="h-8 w-8" />
              <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                Sync
              </span>
            </Link>
          </div>

          {/* Navigation Anchor Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-neutral-600 dark:text-zinc-400">
            <a href="#demo" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Live Demo
            </a>
            <a href="#features" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Features
            </a>
            <a href="#templates" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Aesthetics
            </a>
            <a href="#workflows" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Sprint Modes
            </a>
            <a href="#analytics" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Analytics
            </a>
            <a href="#faq" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Actions & Theme Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="rounded-md border border-neutral-200 dark:border-zinc-800 p-2 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Toggle dark/light theme"
              id="landing-theme-toggle"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-zinc-300" />
              ) : (
                <Moon className="h-4 w-4 text-zinc-600" />
              )}
            </button>

            <UserMenu onOpenAuthModal={() => setIsAuthModalOpen(true)} />

            <button
              onClick={() => handleStartSession(50)}
              className="inline-flex items-center space-x-1.5 rounded-md bg-neutral-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-xs cursor-pointer"
              id="landing-header-cta"
            >
              <span>Start Focus Room</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Subtle Pill Tag */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-1.5 text-xs text-neutral-600 dark:text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span className="font-medium">Real-Time Co-Working & Silent Focus</span>
            <span className="text-neutral-300 dark:text-zinc-700">•</span>
            <span>Zero Video Fatigue</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 leading-[1.08] max-w-4xl mx-auto">
            Calm, live focus rooms for team flow.
          </h1>

          {/* Supporting Subtext */}
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            See live presence status, share real-time task progress, and keep each other accountable in quiet, synced focus rooms without noisy meetings.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => handleStartSession(50)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-lg bg-neutral-900 dark:bg-white px-7 py-3.5 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all cursor-pointer group"
              id="hero-start-btn"
            >
              <span>Start a Free Focus Room</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3.5 text-sm font-medium text-neutral-700 dark:text-zinc-300 hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <span>Try Interactive Sandbox</span>
              <Play className="h-3.5 w-3.5 text-zinc-400" />
            </a>
          </div>

          {/* Live Social Proof Badge */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-500 dark:text-zinc-400">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-zinc-950 object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                alt="Alex"
              />
              <img
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-zinc-950 object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
                alt="Sarah"
              />
              <img
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-zinc-950 object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                alt="Marcus"
              />
              <img
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-zinc-950 object-cover"
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80"
                alt="Elena"
              />
            </div>
            <span>Joined by <strong className="text-neutral-900 dark:text-neutral-100">10,000+</strong> engineers, designers & remote teams</span>
            <span className="text-neutral-300 dark:text-zinc-700">•</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">★ 4.9/5</span>
          </div>
        </div>
      </section>

      {/* 3. Interactive Live Room Sandbox */}
      <section id="demo" className="py-16 border-t border-neutral-200 dark:border-zinc-800/80 bg-neutral-100/60 dark:bg-zinc-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">
              <Activity className="h-3.5 w-3.5 text-indigo-500" />
              <span>Interactive Sandbox</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Experience the Sync workspace live
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-zinc-400">
              Test status dot toggles, timer controls, and focus nudges directly in the interactive sandbox below.
            </p>
          </div>

          {/* Live Sandbox Container */}
          <div className="rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            {/* Header Bar */}
            <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-zinc-800 bg-neutral-50/80 dark:bg-zinc-950/80 gap-3">
              <div className="flex items-center space-x-2">
                <img src="/icon.png" alt="sync logo" className="h-5 w-5" />
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Product Engineering #focus
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-neutral-200 dark:border-zinc-800 text-neutral-500 dark:text-zinc-400">
                  SYNC-8492
                </span>
              </div>

              {/* Demo Timer Controls */}
              <div className="flex items-center space-x-2 rounded-md border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-xs">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                  {formattedDemoTime}
                </span>
                <button
                  onClick={() => setDemoTimerRunning((prev) => !prev)}
                  className="p-1 rounded bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 transition-colors text-neutral-700 dark:text-zinc-300 cursor-pointer"
                  title={demoTimerRunning ? "Pause timer" : "Start timer"}
                >
                  {demoTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </button>
                <button
                  onClick={() => setDemoTimerSeconds(1500)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Reset demo timer"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>

              {/* Status Dot Toggle Pills for Demo User */}
              <div className="flex items-center space-x-1 rounded-md border border-neutral-200 dark:border-zinc-800 bg-neutral-100 dark:bg-zinc-800/60 p-0.5">
                {(["working", "break", "stuck"] as UserStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setDemoStatus(st);
                      if (st === "working") setDemoNote("Refactoring API state hooks");
                      if (st === "break") setDemoNote("Grabbing green tea");
                      if (st === "stuck") setDemoNote("Waiting for design review");
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-all cursor-pointer ${
                      demoStatus === st
                        ? "bg-white dark:bg-zinc-950 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold"
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    ● {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Sandbox Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-zinc-800">
              {/* Presence Sidebar */}
              <div className="md:col-span-5 p-4 space-y-3 bg-neutral-50/40 dark:bg-zinc-950/40">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-zinc-300">
                    Live Room Teammates (4)
                  </span>
                  <span className="text-[10px] font-mono text-indigo-500">LIVE</span>
                </div>

                {/* You */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                      className="h-8 w-8 rounded-full object-cover border border-neutral-300 dark:border-zinc-700"
                      alt="Alex"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          Alex Chen (You)
                        </span>
                        <span
                          className={`h-2 w-2 rounded-full ${
                            demoStatus === "working"
                              ? "bg-emerald-500"
                              : demoStatus === "break"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-zinc-400">
                        {demoNote}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">Active</span>
                </div>

                {/* Teammate 2 */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
                      className="h-8 w-8 rounded-full object-cover"
                      alt="Sarah"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          Sarah Miller
                        </span>
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-zinc-400">
                        Building state hooks
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDemoNudgeSent(true);
                      setTimeout(() => setDemoNudgeSent(false), 2500);
                    }}
                    className="text-[10px] px-2 py-1 rounded border border-neutral-200 dark:border-zinc-700 bg-neutral-50 dark:bg-zinc-800 hover:bg-neutral-100 text-neutral-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {demoNudgeSent ? "Nudged! ✨" : "Send Nudge"}
                  </button>
                </div>

                {/* Teammate 3 */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                      className="h-8 w-8 rounded-full object-cover"
                      alt="Marcus"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          Marcus Vance
                        </span>
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-zinc-400">
                        Blocked on design tokens
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-neutral-600 dark:text-zinc-400 border border-neutral-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                    Stuck
                  </span>
                </div>
              </div>

              {/* Task Board Column */}
              <div className="md:col-span-7 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-zinc-300">
                    Shared Session Tasks (3 of 4 Done)
                  </span>
                  <div className="w-24 bg-neutral-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-neutral-900 dark:bg-white h-full w-[75%]" />
                  </div>
                </div>

                {/* Sample Tasks */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-md border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-neutral-400" />
                      <span className="line-through text-neutral-400">
                        Migrate user session tokens to HttpOnly cookies
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">45m</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-md border border-neutral-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded border border-neutral-400 dark:border-zinc-500 flex items-center justify-center font-bold text-[10px]">
                        ●
                      </div>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        Implement optimistic UI for status dot transitions
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-900 dark:text-neutral-100 font-semibold">
                      In Progress
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-md border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-neutral-400" />
                      <span className="line-through text-neutral-400">
                        Audit accessibility colors for WCAG AA in dark theme
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">25m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Recommended Design Templates Chooser */}
      <section id="templates" className="py-16 border-t border-neutral-200 dark:border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">
                <Palette className="h-3.5 w-3.5 text-indigo-500" />
                <span>Recommended Visual Aesthetics</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                Select your workspace aesthetic
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-zinc-400">
              Click any template to preview contrast & border styling instantly
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DESIGN_TEMPLATES.map((template) => {
              const isSelected = selectedTemplate.id === template.id;

              return (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`group relative rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-neutral-900 dark:border-white ring-1 ring-neutral-900/10 dark:ring-white/10 bg-white dark:bg-zinc-900 shadow-sm"
                      : "border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-neutral-300 dark:hover:border-zinc-700"
                  }`}
                  id={`template-card-${template.id}`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}

                  <div
                    className="h-20 w-full rounded-lg p-2.5 mb-3 flex flex-col justify-between border text-[10px]"
                    style={{
                      backgroundColor: template.previewBg,
                      borderColor: template.previewBorder,
                      color: template.previewText,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{template.name}</span>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: template.accentHex }}
                      />
                    </div>
                    <div
                      className="p-1 rounded text-[9px] border"
                      style={{
                        backgroundColor: template.previewCard,
                        borderColor: template.previewBorder,
                      }}
                    >
                      ● working • API Refactoring
                    </div>
                  </div>

                  <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    {template.name}
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {template.tagline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Key Product Features Grid */}
      <section id="features" className="py-20 border-t border-neutral-200 dark:border-zinc-800/80 bg-neutral-100/40 dark:bg-zinc-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5 text-indigo-500" />
              <span>Built for High-Focus Teams</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Everything you need for seamless deep work
            </h2>
            <p className="text-sm text-neutral-600 dark:text-zinc-400">
              Sync combines live presence, synchronized timers, and low-friction task tracking into a calm interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-neutral-300 dark:hover:border-zinc-700 transition-all space-y-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center text-neutral-900 dark:text-neutral-100">
                <Users className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Live Teammate Presence
              </h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                See real-time status dots (Working, Break, Stuck) and custom status notes without interrupting anyone with video calls.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-neutral-300 dark:hover:border-zinc-700 transition-all space-y-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center text-neutral-900 dark:text-neutral-100">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Synced Sprint Timers
              </h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Run synchronized 25m Pomodoros, 50m deep flow sprints, or open stopwatches with automatic break notifications.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-neutral-300 dark:hover:border-zinc-700 transition-all space-y-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center text-neutral-900 dark:text-neutral-100">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Shared Task Board
              </h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Create, assign, and track session tasks in real time. Watch team progress bars update live as items get completed.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-neutral-300 dark:hover:border-zinc-700 transition-all space-y-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center text-neutral-900 dark:text-neutral-100">
                <MessageSquare className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Low-Friction Nudges
              </h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Send 1-click focus encouragement or offer help when teammates mark themselves as stuck without needing a meeting.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-neutral-300 dark:hover:border-zinc-700 transition-all space-y-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center text-neutral-900 dark:text-neutral-100">
                <Palette className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Custom Visual Aesthetics
              </h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Choose from curated visual design templates tailored for daytime focus or quiet night hours with minimal eye strain.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-neutral-300 dark:hover:border-zinc-700 transition-all space-y-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center text-neutral-900 dark:text-neutral-100">
                <BarChart3 className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Focus Scores & History
              </h3>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                Review focus vs break distribution, completed sprint counts, session tags, and focus quality analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Preset Focus Workflows Section */}
      <section id="workflows" className="py-16 border-t border-neutral-200 dark:border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">
                <Target className="h-3.5 w-3.5 text-indigo-500" />
                <span>Sprint Modes</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                Choose your focus workflow
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-zinc-400">
              Click any workflow card to launch directly into a preset room session
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Workflow 1 */}
            <div
              onClick={() => handleStartSession(50)}
              className="group p-6 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-neutral-400 dark:hover:border-zinc-600 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  50m Flow Sprint
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400">
                  50m / 10m break
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed">
                Designed for complex architecture, deep coding, or writing sessions requiring uninterrupted concentration.
              </p>
              <div className="pt-2 flex items-center text-xs font-medium text-neutral-900 dark:text-neutral-100 group-hover:translate-x-1 transition-transform">
                <span>Start 50m Sprint</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </div>

            {/* Workflow 2 */}
            <div
              onClick={() => handleStartSession(25)}
              className="group p-6 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-neutral-400 dark:hover:border-zinc-600 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  25m Classic Pomodoro
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400">
                  25m / 5m break
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed">
                Perfect for quick iterative bursts, pull request reviews, bug squashing, and administrative tasks.
              </p>
              <div className="pt-2 flex items-center text-xs font-medium text-neutral-900 dark:text-neutral-100 group-hover:translate-x-1 transition-transform">
                <span>Start 25m Pomodoro</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </div>

            {/* Workflow 3 */}
            <div
              onClick={() => handleStartSession(90)}
              className="group p-6 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-neutral-400 dark:hover:border-zinc-600 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Quiet Co-Reading
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400">
                  Open Stopwatch
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed">
                Unstructured, relaxed focus sessions with real-time status dots and shared activity tracking.
              </p>
              <div className="pt-2 flex items-center text-xs font-medium text-neutral-900 dark:text-neutral-100 group-hover:translate-x-1 transition-transform">
                <span>Open Stopwatch Room</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Productivity Impact & Stats Banner */}
      <section id="analytics" className="py-16 border-t border-neutral-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                +42%
              </div>
              <div className="text-xs text-neutral-500 dark:text-zinc-400 font-medium">
                Deep Work Retention
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                0 hrs
              </div>
              <div className="text-xs text-neutral-500 dark:text-zinc-400 font-medium">
                Video Meeting Fatigue
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                94%
              </div>
              <div className="text-xs text-neutral-500 dark:text-zinc-400 font-medium">
                Average Focus Score
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                &lt; 1 sec
              </div>
              <div className="text-xs text-neutral-500 dark:text-zinc-400 font-medium">
                Multi-Tab Sync Speed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions (FAQ) Accordion */}
      <section id="faq" className="py-20 border-t border-neutral-200 dark:border-zinc-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-neutral-600 dark:text-zinc-400">
              Everything you need to know about getting starting with Sync co-working rooms.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-neutral-900 dark:text-neutral-100" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed border-t border-neutral-100 dark:border-zinc-800/50">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. High-Impact CTA Banner */}
      <section className="py-16 border-t border-neutral-200 dark:border-zinc-800/80 bg-neutral-100/60 dark:bg-zinc-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-neutral-200 dark:border-zinc-800 bg-neutral-900 dark:bg-zinc-900 text-white p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl mx-auto text-white">
              Ready to find your team's flow state?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Start a quiet co-working room in 1 click. No credit card required, no video meeting fatigue.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleStartSession(50)}
                className="inline-flex items-center justify-center space-x-2 rounded-lg bg-white px-8 py-3.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer group"
                id="footer-cta-btn"
              >
                <span>Launch Your Focus Room</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Professional Landing Footer */}
      <footer className="border-t border-neutral-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-12 text-xs text-neutral-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <img src="/icon.png" alt="sync logo" className="h-6 w-6" />
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              Sync
            </span>
            <span className="text-neutral-300 dark:text-zinc-700">|</span>
            <span>Calm live focus rooms for modern teams.</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#demo" className="hover:text-neutral-800 dark:hover:text-zinc-200 transition-colors">
              Demo
            </a>
            <a href="#features" className="hover:text-neutral-800 dark:hover:text-zinc-200 transition-colors">
              Features
            </a>
            <a href="#templates" className="hover:text-neutral-800 dark:hover:text-zinc-200 transition-colors">
              Aesthetics
            </a>
            <a href="#workflows" className="hover:text-neutral-800 dark:hover:text-zinc-200 transition-colors">
              Sprint Modes
            </a>
            <a href="#faq" className="hover:text-neutral-800 dark:hover:text-zinc-200 transition-colors">
              FAQ
            </a>
          </div>

          <div className="text-neutral-400 dark:text-zinc-600">
            © {new Date().getFullYear()} Sync Inc. Built for deep focus.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};


