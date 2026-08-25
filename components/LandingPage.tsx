"use client";

import React from "react";
import {
  ArrowRight,
  Check,
  Shield,
  Users,
  Sparkles,
  Clock,
  Palette,
} from "lucide-react";
import { useRoom } from "../context/RoomContext";
import { DESIGN_TEMPLATES } from "../data/initialData";
import { DesignTemplate } from "../types";
import { useRouter } from "next/navigation";


export const LandingPage: React.FC = () => {
  const router = useRouter()
  const {
    setActiveView,
    selectedTemplate,
    setSelectedTemplate,
    setIsDark,
    updateRoom,
    setTimerMinutes,
  } = useRoom();

  const handleSelectTemplate = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    setIsDark(template.bgMode === "dark");
  };

  const handleStartSession = (duration = 50) => {
    setTimerMinutes(duration);
    setActiveView("room");
    router.push('/room')
  };

  return (
    // <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">

    <div className="">
      {/* Hero Section: Headline, Supporting Line, Single CTA */}
      <div className="flex flex-col justify-center items-center h-dvh text-center max-w-3xl mx-auto space-y-6">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center space-x-2 rounded-full bg-neutral-100/80 dark:bg-neutral-900/80 px-3 py-1 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-medium">Real-time Co-working</span>
        </div>

        {/* Short Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 leading-[1.1]">
          Calm, live focus rooms for team flow.
        </h1>

        {/* Supporting Line */}
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
          See live presence, share real-time task progress, and keep each other
          accountable without noisy meetings.
        </p>

        {/* Single CTA Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => handleStartSession(50)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-md bg-neutral-900 dark:bg-white px-6 py-3 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-xs"
            id="start-focus-room-btn"
          >
            <span>Start a Focus Room</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Recommended Design Templates Chooser (Prompt Requirement: "Give me enough time to choose from the design template you recommend") */}
      {/* <div className="my-16 pt-12 border-t border-neutral-200 dark:border-neutral-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
              <Palette className="h-3.5 w-3.5" />
              <span>Recommended Visual Design Templates</span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
              Select your workspace aesthetic
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Click any template to customize theme, contrast & border styles instantly
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DESIGN_TEMPLATES.map(template => {
            const isSelected = selectedTemplate.id === template.id;

            return (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`group relative rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-neutral-900'
                    : 'border-neutral-200 dark:border-neutral-800/90 bg-white/60 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
                id={`template-card-${template.id}`}
              >
               
                {isSelected && (
                  <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}

             
                <div
                  className="h-20 w-full rounded-md p-2 mb-3 flex flex-col justify-between border text-[10px]"
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
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                  {template.tagline}
                </p>
              </div>
            );
          })}
        </div>
      </div> */}

      {/* Preset Session Workflows */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-neutral-200 dark:border-neutral-800/80 pt-10">
        
        <div
          onClick={() => handleStartSession(50)}
          className="group p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">50m Flow Sprint</span>
            <span className="text-[11px] font-mono text-indigo-500">50m / 10m break</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Deep architecture, heavy coding, or writing sessions requiring undivided attention.
          </p>
        </div>

        <div
          onClick={() => handleStartSession(25)}
          className="group p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">25m Pomodoro</span>
            <span className="text-[11px] font-mono text-amber-500">25m / 5m break</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Fast iterative bursts, triage, email clearing, and quick bug fixes.
          </p>
        </div>

        <div
          onClick={() => handleStartSession(90)}
          className="group p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Quiet Co-Reading</span>
            <span className="text-[11px] font-mono text-emerald-500">Open Stopwatch</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Unstructured silent focus blocks with real-time status dots and shared task logs.
          </p>
        </div>

      </div> */}
    </div>
  );
};
