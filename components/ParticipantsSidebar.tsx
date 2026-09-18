"use client";

import React, { useState } from 'react';
import { UserPlus, Bell, Volume2, VolumeX, Check, AlertCircle, Coffee, ShieldAlert } from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { Participant, UserStatus } from '../types';

export const ParticipantsSidebar: React.FC = () => {
  const {
    participants,
    currentUser,
    sendNudge,
    addSimulatedTeammate,
    removeParticipant,
    isSimulationActive,
    setIsSimulationActive,
  } = useRoom();

  const [soundMode, setSoundMode] = useState<'off' | 'rain' | 'alpha'>('off');
  const [nudgedUserIds, setNudgedUserIds] = useState<Record<string, boolean>>({});

  const handleNudgeClick = (participant: Participant) => {
    sendNudge(participant.id);
    setNudgedUserIds(prev => ({ ...prev, [participant.id]: true }));
    setTimeout(() => {
      setNudgedUserIds(prev => ({ ...prev, [participant.id]: false }));
    }, 2500);
  };

  const getStatusDot = (status: UserStatus) => {
    switch (status) {
      case 'working':
        return <span className="h-2 w-2 rounded-full bg-indigo-400" title="Working" />;
      case 'break':
        return <span className="h-2 w-2 rounded-full bg-amber-400" title="On break" />;
      case 'stuck':
        return <span className="h-2 w-2 rounded-full bg-rose-400" title="Stuck" />;
      case 'idle':
        return <span className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-600" title="Idle" />;
    }
  };

  const getStatusLabel = (status: UserStatus) => {
    switch (status) {
      case 'working':
        return 'working';
      case 'break':
        return 'on break';
      case 'stuck':
        return 'stuck';
      case 'idle':
        return 'idle';
    }
  };

  const workingCount = participants.filter(p => p.status === 'working').length;
  const breakCount = participants.filter(p => p.status === 'break').length;
  const stuckCount = participants.filter(p => p.status === 'stuck').length;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-zinc-950/40 p-4 transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Participants ({participants.length})
          </span>
        </div>

        <button
          onClick={addSimulatedTeammate}
          className="inline-flex items-center space-x-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Add a co-working teammate"
          id="add-teammate-btn"
        >
          <UserPlus className="h-3 w-3" />
          <span className="text-[11px] font-medium">Join +</span>
        </button>
      </div>

      {/* Summary Presence Metric */}
      <div className="grid grid-cols-3 gap-1 mb-4 p-1.5 rounded-md bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 text-[11px]">
        <div className="flex items-center space-x-1 justify-center py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          <span className="text-neutral-600 dark:text-neutral-400">{workingCount} working</span>
        </div>
        <div className="flex items-center space-x-1 justify-center py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="text-neutral-600 dark:text-neutral-400">{breakCount} break</span>
        </div>
        <div className="flex items-center space-x-1 justify-center py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          <span className="text-neutral-600 dark:text-neutral-400">{stuckCount} stuck</span>
        </div>
      </div>

      {/* Participant Rows */}
      <div className="space-y-1">
        {participants.map(p => {
          const isMe = p.isCurrentUser;
          const wasNudged = nudgedUserIds[p.id];

          return (
            <div
              key={p.id}
              className={`group flex items-center justify-between p-2 rounded-md transition-all duration-200 ${
                isMe
                  ? 'bg-neutral-200/50 dark:bg-neutral-800/50 border border-neutral-300/50 dark:border-neutral-700/50'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-900/50'
              }`}
              id={`participant-row-${p.id}`}
            >
              {/* Left: Avatar + Name + Note */}
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <div className="relative flex-shrink-0">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="h-7 w-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white dark:bg-neutral-950 p-0.5">
                    {getStatusDot(p.status)}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {p.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                        (you)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    <span className="capitalize text-neutral-600 dark:text-neutral-400 font-medium">
                      {getStatusLabel(p.status)}
                    </span>
                    {p.statusNote && (
                      <>
                        <span>•</span>
                        <span className="truncate italic font-normal text-neutral-400 dark:text-neutral-500">
                          {p.statusNote}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Nudge action for non-self */}
              {!isMe && (
                <button
                  onClick={() => handleNudgeClick(p)}
                  disabled={wasNudged}
                  className={`opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded transition-opacity ${
                    wasNudged
                      ? 'text-emerald-500 opacity-100'
                      : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                  }`}
                  title={`Send focus nudge to ${p.name.split(' ')[0]}`}
                  id={`nudge-btn-${p.id}`}
                >
                  {wasNudged ? <Check className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Subtle Controls at bottom of sidebar */}
      <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800/80 space-y-3">
        {/* Ambient Focus Sound Switcher */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
            <Volume2 className="h-3.5 w-3.5" />
            <span>Ambient sound</span>
          </span>
          
          <div className="flex items-center space-x-1 rounded bg-neutral-200/60 dark:bg-neutral-900 p-0.5">
            <button
              onClick={() => setSoundMode('off')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                soundMode === 'off' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
              }`}
            >
              Off
            </button>
            <button
              onClick={() => setSoundMode('rain')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                soundMode === 'rain' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
              }`}
            >
              Rain
            </button>
            <button
              onClick={() => setSoundMode('alpha')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                soundMode === 'alpha' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
              }`}
            >
              Binaural
            </button>
          </div>
        </div>

        {/* Live Simulation Engine Toggle */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-neutral-500 dark:text-neutral-400">Live teammate simulation</span>
          <button
            onClick={() => setIsSimulationActive(!isSimulationActive)}
            className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isSimulationActive ? 'bg-indigo-600' : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
            id="simulation-toggle-btn"
          >
            <span
              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                isSimulationActive ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

    </aside>
  );
};
