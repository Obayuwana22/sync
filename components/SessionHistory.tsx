"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, CheckCircle2, TrendingUp, Calendar, Tag, Flame, ArrowLeft, Layers } from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { SessionHistoryRecord } from '../types';
import { useRouter } from 'next/navigation';

export const SessionHistory: React.FC = () => {
  const router = useRouter();
  const { historyRecords, setActiveView } = useRoom();
  const [selectedRecord, setSelectedRecord] = useState<SessionHistoryRecord | null>(null);

  // Weekly focus chart mock data
  const chartData = [
    { day: 'Mon', focusHours: 3.5, breakHours: 0.5 },
    { day: 'Tue', focusHours: 4.2, breakHours: 0.8 },
    { day: 'Wed', focusHours: 2.8, breakHours: 0.4 },
    { day: 'Thu', focusHours: 5.0, breakHours: 1.0 },
    { day: 'Fri', focusHours: 4.5, breakHours: 0.7 },
    { day: 'Sat', focusHours: 1.5, breakHours: 0.2 },
    { day: 'Sun', focusHours: 2.0, breakHours: 0.3 },
  ];

  const totalFocusMins = historyRecords.reduce((acc, r) => acc + r.focusMinutes, 0);
  const totalFocusHours = (totalFocusMins / 60).toFixed(1);
  const avgScore = Math.round(
    historyRecords.reduce((acc, r) => acc + r.focusScore, 0) / (historyRecords.length || 1)
  );
  const totalTasksDone = historyRecords.reduce((acc, r) => acc + r.tasksCompleted, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Session History & Focus Analytics
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Track your deep work velocity, break ratios, and completed focus sessions over time.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveView('room');
            router.push('/room');
          }}
          className="inline-flex items-center space-x-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
          <p className="text-[11px] text-neutral-400 mt-1">+12% vs last week</p>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Average Flow Score</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {avgScore}%
          </div>
          <p className="text-[11px] text-emerald-500 mt-1">High focus continuity</p>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Tasks Finished</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {totalTasksDone}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Across 5 sessions</p>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Current Streak</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
            5 <span className="text-xs font-sans text-neutral-500 font-normal">days</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Daily goal met</p>
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
                  <Cell key={`cell-${index}`} fill={index === 3 ? '#6366f1' : '#818cf8'} opacity={0.85} />
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
                  {record.tags.map(tag => (
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
      </div>

    </div>
  );
};
