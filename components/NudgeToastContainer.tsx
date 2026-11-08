"use client";

import React from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Play,
  PlusCircle,
  Trash2,
  Activity,
} from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { TaskActivityNotification } from '../types';

export const NudgeToastContainer: React.FC = () => {
  const { nudges, dismissNudge, taskActivities, dismissTaskActivityById } = useRoom();

  const hasToasts = nudges.length > 0 || taskActivities.length > 0;
  if (!hasToasts) return null;

  const getActivityIcon = (type?: TaskActivityNotification['activityType']) => {
    switch (type) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-bounce" />;
      case 'blocked':
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      case 'added':
        return <PlusCircle className="h-4 w-4 text-indigo-500" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-neutral-400" />;
      default:
        return <Activity className="h-4 w-4 text-indigo-500 animate-pulse" />;
    }
  };

  const getActivityBadge = (type?: TaskActivityNotification['activityType'], status?: string) => {
    switch (type) {
      case 'completed':
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Completed 🎉
          </span>
        );
      case 'blocked':
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
            Blocked
          </span>
        );
      case 'added':
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
            New Task
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
            {status === 'in_progress' ? 'In Progress' : 'Moved'}
          </span>
        );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2.5 max-w-xs sm:max-w-sm w-full pointer-events-none">
      {/* 1. Real-Time Task Activity Toasts */}
      {taskActivities.map(activity => {
        const isCompleted = activity.activityType === 'completed';
        const isBlocked = activity.activityType === 'blocked';

        return (
          <div
            key={activity.id}
            className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 text-xs animate-in fade-in slide-in-from-bottom-2 ${
              isCompleted
                ? 'border-emerald-300/80 dark:border-emerald-700/80 bg-white/95 dark:bg-zinc-900/95 ring-1 ring-emerald-500/20'
                : isBlocked
                ? 'border-rose-300/80 dark:border-rose-800/80 bg-white/95 dark:bg-zinc-900/95 ring-1 ring-rose-500/20'
                : 'border-neutral-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95'
            }`}
            id={`task-activity-toast-${activity.id}`}
          >
            <div className="flex items-start space-x-3 pr-2 flex-1 min-w-0">
              <div className="mt-0.5 flex-shrink-0">
                {getActivityIcon(activity.activityType)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5 mb-0.5">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {activity.movedBy}
                  </span>
                  {getActivityBadge(activity.activityType, activity.newStatus)}
                </div>

                <p className="text-neutral-700 dark:text-neutral-300 font-medium line-clamp-2 leading-snug">
                  &ldquo;{activity.taskTitle}&rdquo;
                </p>

                <span className="text-[10px] text-neutral-400 font-mono mt-1 inline-block">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <button
              onClick={() => dismissTaskActivityById(activity.id)}
              className="flex-shrink-0 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
              title="Dismiss notification"
              id={`dismiss-activity-${activity.id}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}

      {/* 2. Direct Teammate Focus Nudges */}
      {nudges.map(nudge => (
        <div
          key={nudge.id}
          className="pointer-events-auto flex items-start justify-between p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl transition-all duration-300 text-xs animate-in fade-in slide-in-from-bottom-2 ring-1 ring-indigo-500/20"
          id={`nudge-toast-${nudge.id}`}
        >
          <div className="flex items-start space-x-3 pr-2 flex-1 min-w-0">
            <div className="mt-0.5 flex-shrink-0">
              {nudge.type === 'stuck' ? (
                <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />
              ) : (
                <Sparkles className="h-4 w-4 text-indigo-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5 mb-0.5">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {nudge.senderName}
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  Focus Nudge
                </span>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 mt-0.5 leading-snug">
                {nudge.message}
              </p>
              <span className="text-[10px] text-neutral-400 font-mono mt-1 inline-block">
                {new Date(nudge.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <button
            onClick={() => dismissNudge(nudge.id)}
            className="flex-shrink-0 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
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
