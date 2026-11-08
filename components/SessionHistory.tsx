"use client";

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, CheckCircle2, TrendingUp, Calendar, Tag, Flame, ArrowLeft, Layers, X, Target } from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { SessionHistoryRecord } from '../types';
import { useRouter } from 'next/navigation';

export const SessionHistory: React.FC = () => {
  const router = useRouter();
  const { historyRecords, setActiveView } = useRoom();
  const [selectedRecord, setSelectedRecord] = useState<SessionHistoryRecord | null>(null);

  // Weekly focus chart data computed dynamically from real history
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayMap: Record<string, number> = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
    };

    historyRecords.forEach(r => {
      try {
        const d = new Date(r.date);
        const dayName = days[d.getDay()];
        if (dayName && dayMap[dayName] !== undefined) {
          dayMap[dayName] += r.focusMinutes / 60;
        }
      } catch {
        // ignore invalid dates
      }
    });

    return [
      { day: 'Mon', focusHours: Number(dayMap['Mon'].toFixed(1)), breakHours: 0 },
      { day: 'Tue', focusHours: Number(dayMap['Tue'].toFixed(1)), breakHours: 0 },
      { day: 'Wed', focusHours: Number(dayMap['Wed'].toFixed(1)), breakHours: 0 },
      { day: 'Thu', focusHours: Number(dayMap['Thu'].toFixed(1)), breakHours: 0 },
      { day: 'Fri', focusHours: Number(dayMap['Fri'].toFixed(1)), breakHours: 0 },
      { day: 'Sat', focusHours: Number(dayMap['Sat'].toFixed(1)), breakHours: 0 },
      { day: 'Sun', focusHours: Number(dayMap['Sun'].toFixed(1)), breakHours: 0 },
    ];
  }, [historyRecords]);

  // Aggregate metrics
  const totalFocusMins = historyRecords.reduce((acc, r) => acc + r.focusMinutes, 0);
  const totalFocusHours = (totalFocusMins / 60).toFixed(1);
  const avgScore = historyRecords.length > 0
    ? Math.round(historyRecords.reduce((acc, r) => acc + r.focusScore, 0) / historyRecords.length)
    : 0;
  const totalTasksDone = historyRecords.reduce((acc, r) => acc + r.tasksCompleted, 0);

  // Dynamic streak calculation
  const streakDays = useMemo(() => {
    if (historyRecords.length === 0) return 0;
    const uniqueDates = Array.from(new Set(historyRecords.map(r => r.date))).filter(Boolean);
    return uniqueDates.length;
  }, [historyRecords]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Session History & Focus Analytics
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Track your deep work velocity, completed focus blocks, and session history over time.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveView('room');
            router.push('/room');
          }}
          className="inline-flex items-center space-x-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          id="back-to-room-btn"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Live Room</span>
        </button>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Total Focus Time</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {totalFocusHours} <span className="text-xs font-sans text-neutral-500 font-normal">hrs</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {historyRecords.length === 1 ? '1 session logged' : `${historyRecords.length} sessions logged`}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Average Flow Score</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {avgScore}%
          </div>
          <p className="text-[11px] text-emerald-500 mt-1">
            {historyRecords.length === 0 ? 'No sessions yet' : avgScore >= 80 ? 'High focus continuity' : 'Steady progress'}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Tasks Finished</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {totalTasksDone}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Across {historyRecords.length} {historyRecords.length === 1 ? 'session' : 'sessions'}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Active Days</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {streakDays} <span className="text-xs font-sans text-neutral-500 font-normal">days</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {streakDays > 0 ? 'Daily momentum active' : 'Complete a session to start'}
          </p>
        </div>

      </div>

      {/* Weekly Focus Chart */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Weekly Focus Hours
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Daily deep work hours (Mon – Sun)
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
              <span className="text-neutral-600 dark:text-neutral-400">Focus Hours</span>
            </div>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#f4f4f5',
                }}
                formatter={(val: any) => [`${val} hrs`, 'Focus Time']}
              />
              <Bar dataKey="focusHours" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.focusHours > 0 ? '#6366f1' : '#3f3f46'} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Past Sessions List */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Past Sessions
        </h2>

        {historyRecords.length > 0 ? (
          <div className="space-y-2">
            {historyRecords.map(record => (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition-colors"
                id={`session-record-${record.id}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {record.roomName}
                    </span>
                    {record.tags && record.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{record.date} at {record.startTime}</span>
                    </span>
                    <span>•</span>
                    <span>{record.durationMinutes}m total ({record.focusMinutes}m focus)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                  <div className="text-right">
                    <div className="text-xs font-mono font-medium text-neutral-900 dark:text-neutral-100">
                      {record.tasksCompleted}/{record.totalTasks} tasks done
                    </div>
                    <div className="text-[11px] text-emerald-500 font-mono">
                      {record.focusScore}% flow score
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center p-8 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/20">
            <Calendar className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mb-3" />
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              No completed sessions yet
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
              Start a focus block with the timer in your room and check off tasks. When your session wraps up, your flow velocity, task count, and focus time will be recorded here automatically.
            </p>
            <button
              onClick={() => {
                setActiveView('room');
                router.push('/room');
              }}
              className="mt-4 inline-flex items-center space-x-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            >
              <span>Go to Focus Room</span>
            </button>
          </div>
        )}
      </div>

      {/* Selected Session Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-indigo-500" />
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {selectedRecord.roomName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60">
                <span className="text-neutral-400 block mb-1">Date & Time</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {selectedRecord.date} at {selectedRecord.startTime}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60">
                <span className="text-neutral-400 block mb-1">Focus Duration</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {selectedRecord.focusMinutes} minutes
                </span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60">
                <span className="text-neutral-400 block mb-1">Tasks Completed</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {selectedRecord.tasksCompleted} of {selectedRecord.totalTasks}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60">
                <span className="text-neutral-400 block mb-1">Flow Score</span>
                <span className="font-semibold text-emerald-500">
                  {selectedRecord.focusScore}%
                </span>
              </div>
            </div>

            {selectedRecord.tags && selectedRecord.tags.length > 0 && (
              <div className="flex items-center space-x-1.5 pt-1">
                <span className="text-xs text-neutral-400">Tags:</span>
                {selectedRecord.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded px-2 py-0.5 text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-full rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2 text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
