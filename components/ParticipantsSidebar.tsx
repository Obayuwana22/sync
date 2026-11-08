"use client";

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Bell,
  Volume2,
  Volume1,
  VolumeX,
  Check,
  Wifi,
  Edit2,
  X,
  Coffee,
  CloudRain,
  Sparkles,
  Trees,
  Music,
  Brain,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { Participant, UserStatus } from '../types';
import {
  ambientSound,
  AmbientSoundMode,
  AMBIENT_SOUND_OPTIONS,
} from '../lib/ambientSound';

const getSoundIcon = (iconName: string, className = 'h-3.5 w-3.5') => {
  switch (iconName) {
    case 'Coffee':
      return <Coffee className={className} />;
    case 'CloudRain':
      return <CloudRain className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Trees':
      return <Trees className={className} />;
    case 'Music':
      return <Music className={className} />;
    case 'Brain':
      return <Brain className={className} />;
    case 'VolumeX':
    default:
      return <VolumeX className={className} />;
  }
};

const getSoundColorBadge = (mode: AmbientSoundMode) => {
  switch (mode) {
    case 'lofi':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'rain-thunder':
      return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    case 'ambient':
      return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20';
    case 'nature':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'piano':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    case 'alpha':
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    default:
      return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20';
  }
};

export const ParticipantsSidebar: React.FC = () => {
  const {
    participants,
    currentUser,
    sendNudge,
    updateCurrentUserName,
    isConnected,
    room,
    setIsInviteModalOpen,
    pendingInvites,
    cancelInvite,
  } = useRoom();

  const [soundMode, setSoundMode] = useState<AmbientSoundMode>('off');
  const [volume, setVolume] = useState<number>(65);
  const [isSoundDrawerOpen, setIsSoundDrawerOpen] = useState(false);
  const [nudgedUserIds, setNudgedUserIds] = useState<Record<string, boolean>>({});
  const [isEditingMyName, setIsEditingMyName] = useState(false);
  const [myNameInput, setMyNameInput] = useState(currentUser.name);

  // Stop ambient sound on component unmount
  useEffect(() => {
    return () => {
      ambientSound.stop();
    };
  }, []);

  const handleSoundModeChange = (mode: AmbientSoundMode) => {
    setSoundMode(mode);
    ambientSound.setMode(mode);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    ambientSound.setVolume(newVol / 100);
  };

  const handleNudgeClick = (participant: Participant) => {
    sendNudge(participant.id);
    setNudgedUserIds(prev => ({ ...prev, [participant.id]: true }));
    setTimeout(() => {
      setNudgedUserIds(prev => ({ ...prev, [participant.id]: false }));
    }, 2500);
  };

  const handleSaveMyName = (e: React.FormEvent) => {
    e.preventDefault();
    if (myNameInput.trim()) {
      updateCurrentUserName(myNameInput.trim());
      setIsEditingMyName(false);
    }
  };

  const getStatusDot = (status: UserStatus) => {
    switch (status) {
      case 'working':
        return <span className="h-2 w-2 rounded-full bg-emerald-500" title="Working" />;
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
      
      {/* Header with WebSocket Status & Invite Action */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-neutral-600 dark:text-zinc-400 uppercase tracking-widest">
            Participants ({participants.length})
          </span>
          <span
            className={`inline-flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}
            title={isConnected ? "WebSocket connected across devices" : "Connecting to WebSocket..."}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isConnected ? 'In Sync' : 'Connecting'}</span>
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center space-x-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Invite teammate to this focus room"
            id="add-participant-btn"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Invite</span>
          </button>
        </div>
      </div>

      {/* Summary Presence Metric */}
      <div className="grid grid-cols-3 gap-1 mb-4 p-1.5 rounded-md bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 text-[11px]">
        <div className="flex items-center space-x-1 justify-center py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
              <div className="flex items-center space-x-2.5 min-w-0 pr-2 flex-1">
                <div className="relative flex-shrink-0">
                  <img
                    src={p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=6366f1&color=fff`}
                    alt={p.name}
                    className="h-7 w-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white dark:bg-neutral-950 p-0.5">
                    {getStatusDot(p.status)}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    {isMe && isEditingMyName ? (
                      <form onSubmit={handleSaveMyName} className="flex items-center space-x-1 flex-1">
                        <input
                          type="text"
                          value={myNameInput}
                          onChange={e => setMyNameInput(e.target.value)}
                          className="text-xs px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 w-24 focus:outline-none"
                          autoFocus
                          onBlur={handleSaveMyName}
                        />
                      </form>
                    ) : (
                      <>
                        <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {p.name}
                        </span>
                        {isMe && (
                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                              (you)
                            </span>
                            <button
                              onClick={() => {
                                setMyNameInput(currentUser.name);
                                setIsEditingMyName(true);
                              }}
                              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5"
                              title="Edit your display name"
                            >
                              <Edit2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        )}
                      </>
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

      {/* Direct Invite Card / Button */}
      <div className="mt-3">
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="w-full inline-flex items-center justify-center space-x-2 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold py-2 px-3 transition-colors cursor-pointer"
          id="sidebar-invite-hero-btn"
        >
          <UserPlus className="h-4 w-4 text-indigo-500" />
          <span>+ Invite Another Person</span>
        </button>
      </div>

      {/* Pending Email Invites (clearly marked as pending, not active dummy participants) */}
      {pendingInvites.length > 0 && (
        <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            <span className="uppercase tracking-wider font-semibold">Invited ({pendingInvites.length})</span>
            <span className="text-[10px] text-amber-500 dark:text-amber-400">awaiting join</span>
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-0.5">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-1.5 rounded border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/30 text-xs"
              >
                <div className="min-w-0 pr-1 flex-1">
                  <div className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 truncate" title={invite.email}>
                    {invite.email}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {invite.role}
                  </div>
                </div>
                <button
                  onClick={() => cancelInvite(invite.id)}
                  className="text-neutral-400 hover:text-rose-500 p-1 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
                  title="Cancel invitation"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Room Card */}
      <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800/80 space-y-3">
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="w-full flex items-center justify-between p-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Wifi className="h-3.5 w-3.5 text-indigo-500" />
            <span className="font-medium">Invite & Share Link</span>
          </div>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono font-medium">
            {room.code}
          </span>
        </button>

        {/* Ambient Focus Sound Switcher */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => setIsSoundDrawerOpen(!isSoundDrawerOpen)}
              className="text-neutral-600 dark:text-neutral-300 flex items-center space-x-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Volume2
                className={`h-3.5 w-3.5 transition-colors ${
                  soundMode !== 'off' ? 'text-indigo-500 animate-pulse' : 'text-neutral-400'
                }`}
              />
              <span className="font-medium">Ambient sound</span>
            </button>

            <div className="flex items-center space-x-1">
              {soundMode !== 'off' && (
                <button
                  onClick={() => handleSoundModeChange('off')}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium text-neutral-400 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Mute ambient sound"
                >
                  Mute
                </button>
              )}
              <button
                onClick={() => setIsSoundDrawerOpen(!isSoundDrawerOpen)}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  soundMode !== 'off'
                    ? `${getSoundColorBadge(soundMode)} shadow-xs`
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span className="max-w-[85px] truncate">
                  {(AMBIENT_SOUND_OPTIONS.find((s) => s.id === soundMode) || AMBIENT_SOUND_OPTIONS[0]).name}
                </span>
                {isSoundDrawerOpen ? (
                  <ChevronUp className="h-3 w-3 opacity-60 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-3 w-3 opacity-60 flex-shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Expanded Sound Palette & Volume Control */}
          {isSoundDrawerOpen && (
            <div className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/90 space-y-2 mt-1">
              {/* Volume Slider */}
              <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 px-1 pb-1 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center space-x-1.5">
                  {volume === 0 ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume1 className="h-3.5 w-3.5" />
                  )}
                  <span>Volume</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="font-mono text-[10px] w-6 text-right">{volume}%</span>
                </div>
              </div>

              {/* Sound Options List */}
              <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5">
                {AMBIENT_SOUND_OPTIONS.map((option) => {
                  const isSelected = soundMode === option.id;
                  return (
                    <div
                      key={option.id}
                      className={`group flex items-center justify-between p-1.5 rounded-md transition-all text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-neutral-800 border border-indigo-500/30 shadow-xs'
                          : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 border border-transparent'
                      }`}
                      onClick={() => handleSoundModeChange(option.id)}
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-1">
                        <div
                          className={`p-1 rounded flex-shrink-0 border ${getSoundColorBadge(
                            option.id
                          )}`}
                        >
                          {getSoundIcon(option.icon, 'h-3.5 w-3.5')}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1">
                            <span
                              className={`font-medium truncate ${
                                isSelected
                                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                                  : 'text-neutral-800 dark:text-neutral-200'
                              }`}
                            >
                              {option.name}
                            </span>
                            {isSelected && (
                              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate leading-tight">
                            {option.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {option.youtubeUrl && (
                          <a
                            href={option.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-all"
                            title="Listen on YouTube"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {isSelected && <Check className="h-3.5 w-3.5 text-indigo-500 ml-0.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
};
