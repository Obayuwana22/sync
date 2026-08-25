"use client";

import React from 'react';
import { X, Bell, AlertTriangle, Sparkles } from 'lucide-react';
import { useRoom } from '../context/RoomContext';

export const NudgeToastContainer: React.FC = () => {
  const { nudges, dismissNudge } = useRoom();

  if (nudges.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-xs sm:max-w-sm w-full pointer-events-none">
      {nudges.map(nudge => (
        <div
          key={nudge.id}
          className="pointer-events-auto flex items-start justify-between p-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-md transition-all duration-200 text-xs"
          id={`nudge-toast-${nudge.id}`}
        >
          <div className="flex items-start space-x-2.5 pr-2">
            <div className="mt-0.5 flex-shrink-0">
              {nudge.type === 'stuck' ? (
                <AlertTriangle className="h-4 w-4 text-rose-500" />
              ) : (
                <Bell className="h-4 w-4 text-indigo-500" />
              )}
            </div>

            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center space-x-1">
                <span>{nudge.senderName}</span>
                <span className="text-[10px] text-neutral-400 font-mono font-normal">
                  • {new Date(nudge.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 mt-0.5 leading-snug">
                {nudge.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => dismissNudge(nudge.id)}
            className="flex-shrink-0 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 rounded transition-colors"
            title="Dismiss notification"
            id={`dismiss-nudge-${nudge.id}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
