"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { DESIGN_TEMPLATES, INITIAL_ROOM, INITIAL_SESSION_HISTORY, INITIAL_TASKS } from '../data/initialData';
import {
  RoomContextType,
  ActiveView,
  DesignTemplate,
  NudgeNotification,
  Participant,
  RoomInvite,
  RoomSession,
  SessionHistoryRecord,
  Task,
  TaskActivityNotification,
  UserStatus,
  TaskStatus,
} from '../types';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { playNotificationChime } from '@/lib/sound';

const RoomContext = createContext<RoomContextType | undefined>(undefined);

interface TaskMovedPayload {
  taskId: string;
  taskTitle?: string;
  status: TaskStatus;
  movedBy: string;
  completedAt?: number;
}

interface TaskAddedPayload {
  task: Task;
  addedBy: string;
}

interface TaskDeletedPayload {
  taskId: string;
  deletedBy?: string;
}

interface TaskUpdatedPayload {
  task: Task;
}

interface ParticipantAddedPayload {
  participant: Participant;
  addedBy?: string;
}

interface UserStatusUpdatedPayload {
  userId: string;
  status: UserStatus;
  note?: string;
}

interface NudgeSentPayload {
  nudge: NudgeNotification;
}

interface TimerSyncPayload {
  isRunning?: boolean;
  elapsedSeconds?: number;
  targetDurationMinutes?: number;
  mode?: 'pomodoro' | 'stopwatch';
}

interface RequestRoomStatePayload {
  requesterId: string;
}

interface ResponseRoomStatePayload {
  tasks?: Task[];
  room?: RoomSession;
  pendingInvites?: RoomInvite[];
  targetDeviceId?: string;
}

// Helper to sanitize any legacy dummy tasks from previous builds
const isDummyTask = (t: unknown): boolean => {
  if (!t || typeof t !== 'object') return true;
  const taskObj = t as Record<string, unknown>;
  const dummyIds = ['task-1', 'task-2', 'task-3', 'task-4', 'task-5'];
  if (typeof taskObj.id === 'string' && dummyIds.includes(taskObj.id)) return true;
  if (typeof taskObj.title === 'string') {
    const lower = taskObj.title.toLowerCase();
    if (
      lower.includes('migrate user session tokens') ||
      lower.includes('optimistic ui for status dot') ||
      lower.includes('review spacing and typography') ||
      lower.includes('audit accessibility colors') ||
      lower.includes('broadcastchannel state sync')
    ) {
      return true;
    }
  }
  return false;
};

// Helper to sanitize legacy dummy history records
const isDummyHistory = (h: unknown): boolean => {
  if (!h || typeof h !== 'object') return true;
  const histObj = h as Record<string, unknown>;
  const dummyIds = ['sess-1', 'sess-2', 'sess-3', 'sess-4', 'sess-5'];
  return typeof histObj.id === 'string' && dummyIds.includes(histObj.id);
};

// Initialize current user identity for this specific device/browser
const getInitialUser = (): Participant => {
  if (typeof window !== 'undefined') {
    const savedGoogle = localStorage.getItem('sync_google_user');
    if (savedGoogle) {
      try {
        const gu = JSON.parse(savedGoogle);
        return {
          id: gu.id,
          name: gu.name,
          avatar: gu.avatar,
          role: 'Focus Member',
          status: 'working',
          statusNote: '',
          lastActiveTimestamp: Date.now(),
          isCurrentUser: true,
          isOnline: true,
        };
      } catch {}
    }

    const savedGuest = localStorage.getItem('sync_guest_user');
    if (savedGuest) {
      try {
        const guest = JSON.parse(savedGuest);
        return {
          id: guest.id,
          name: guest.name || 'You',
          avatar: guest.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(guest.name || 'You')}&background=6366f1&color=fff`,
          role: guest.role || 'Focus Member',
          status: 'working',
          statusNote: '',
          lastActiveTimestamp: Date.now(),
          isCurrentUser: true,
          isOnline: true,
        };
      } catch {}
    }

    // Generate fresh unique guest identity for this device
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newGuest: Participant = {
      id: `dev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
      name: `User ${randomNum}`,
      avatar: `https://ui-avatars.com/api/?name=U+${randomNum}&background=6366f1&color=fff`,
      role: 'Focus Member',
      status: 'working',
      statusNote: '',
      lastActiveTimestamp: Date.now(),
      isCurrentUser: true,
      isOnline: true,
    };
    localStorage.setItem('sync_guest_user', JSON.stringify(newGuest));
    return newGuest;
  }

  return {
    id: 'user-default',
    name: 'You',
    avatar: 'https://ui-avatars.com/api/?name=You&background=6366f1&color=fff',
    role: 'Focus Member',
    status: 'working',
    statusNote: '',
    lastActiveTimestamp: Date.now(),
    isCurrentUser: true,
    isOnline: true,
  };
};

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('room');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('sync_theme');
      if (savedTheme !== null) {
        return savedTheme === 'dark';
      }
    }
    return true;
  });
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate>(DESIGN_TEMPLATES[0]);

  // Sync dark class on <html> and save to localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sync_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sync_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Supabase Client Instance (singleton)
  const supabase = createClient();

  // Current User & Google Auth
  const [currentUser, setCurrentUser] = useState<Participant>(getInitialUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [googleUser, setGoogleUser] = useState<{
    id: string;
    name: string;
    email: string;
    avatar: string;
  } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sync_google_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const isAuthenticated = !!googleUser;

  // Sync user profile state from Supabase auth user
  const syncUserData = useCallback((user: { id?: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
    if (!user) {
      setGoogleUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sync_google_user');
      }
      return;
    }

    const meta = (user.user_metadata || {}) as Record<string, string>;
    const name = meta.full_name || meta.name || user.email?.split('@')[0] || 'Google User';
    const avatar = meta.avatar_url || meta.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;

    const userProfile = {
      id: user.id || `google-${Date.now()}`,
      name,
      email: user.email || '',
      avatar,
    };

    setGoogleUser(userProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sync_google_user', JSON.stringify(userProfile));
    }

    setCurrentUser(prev => ({
      ...prev,
      id: userProfile.id,
      name: userProfile.name,
      avatar: userProfile.avatar,
      role: 'Focus Member',
      isCurrentUser: true,
      isOnline: true,
    }));
  }, []);

  // Sync Supabase Auth Session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          syncUserData(user as unknown as { id?: string; email?: string; user_metadata?: Record<string, unknown> });
        }
      } catch (err) {
        console.error("Error fetching Supabase user:", err);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: unknown) => {
      const s = session as { user?: { id?: string; email?: string; user_metadata?: Record<string, unknown> } } | null;
      if (s?.user) {
        syncUserData(s.user);
        if (_event === 'SIGNED_IN' && typeof window !== 'undefined' && window.location.pathname === '/') {
          window.location.href = '/room';
        }
      } else if (_event === 'SIGNED_OUT') {
        syncUserData(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncUserData]);

  // Login with Google handler
  const loginWithGoogle = async (nextPath?: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const targetPath = nextPath && typeof nextPath === 'string' && nextPath.startsWith('/') && nextPath !== '/' ? nextPath : '/room';
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(targetPath)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      console.error("Supabase Google sign in error:", error.message);
      throw error;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase sign out error:", err);
    }
    syncUserData(null);
  };

  // Room state with URL query parameter support (e.g. ?code=SYNC-8899)
  const [room, setRoom] = useState<RoomSession>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('code') || params.get('room');
      if (codeParam) {
        return { ...INITIAL_ROOM, code: codeParam.toUpperCase() };
      }
    }
    return INITIAL_ROOM;
  });

  const joinRoomByCode = useCallback((code: string) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return;
    setRoom(prev => ({ ...prev, code: cleanCode }));
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('code', cleanCode);
      window.history.pushState({}, '', url.toString());

      // Attempt loading room-specific tasks if previously cached
      const savedRoomTasks = localStorage.getItem(`sync_tasks_${cleanCode}`);
      if (savedRoomTasks) {
        try {
          const parsed = JSON.parse(savedRoomTasks);
          if (Array.isArray(parsed)) setTasks(parsed.filter(t => !isDummyTask(t)));
        } catch {}
      } else {
        setTasks([]);
      }
    }
  }, []);

  // Sync room code when URL changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('code') || params.get('room');
      if (codeParam && codeParam.toUpperCase() !== room.code) {
        setRoom(prev => ({ ...prev, code: codeParam.toUpperCase() }));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [room.code]);

  // Remote participants joined via WebSocket presence (real devices only)
  const [remoteParticipants, setRemoteParticipants] = useState<Participant[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [pendingInvites, setPendingInvites] = useState<RoomInvite[]>(() => {
    if (typeof window !== 'undefined') {
      // Purge any legacy fake/dummy manual participants
      try {
        localStorage.removeItem('sync_manual_participants');
      } catch {}

      const saved = localStorage.getItem('sync_pending_invites');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });

  // Combine currentUser + remote participants from real connected devices ONLY (no dummy data)
  const participants = React.useMemo<Participant[]>(() => {
    const map = new Map<string, Participant>();

    // Current user is always first
    map.set(currentUser.id, { ...currentUser, isCurrentUser: true, isOnline: true });

    // Remote devices from real-time WebSocket presence
    remoteParticipants.forEach(p => {
      if (p.id !== currentUser.id) {
        map.set(p.id, { ...p, isCurrentUser: false, isOnline: true });
      }
    });

    return Array.from(map.values());
  }, [currentUser, remoteParticipants]);

  // Tasks with room-scoped localStorage persistence and dummy scrubbing
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeParam = (params.get('code') || params.get('room') || INITIAL_ROOM.code).toUpperCase();
      const savedRoomTasks = localStorage.getItem(`sync_tasks_${codeParam}`);
      if (savedRoomTasks) {
        try {
          const parsed = JSON.parse(savedRoomTasks);
          if (Array.isArray(parsed)) return parsed.filter(t => !isDummyTask(t));
        } catch {}
      }
      const saved = localStorage.getItem('sync_tasks');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const clean = parsed.filter(t => !isDummyTask(t));
            return clean;
          }
        } catch {
          return INITIAL_TASKS;
        }
      }
    }
    return INITIAL_TASKS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (room.code) {
        localStorage.setItem(`sync_tasks_${room.code.toUpperCase()}`, JSON.stringify(tasks));
      }
      localStorage.setItem('sync_tasks', JSON.stringify(tasks));
    }
  }, [tasks, room.code]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sync_pending_invites', JSON.stringify(pendingInvites));
    }
  }, [pendingInvites]);

  // Nudges & Notifications
  const [nudges, setNudges] = useState<NudgeNotification[]>([]);

  // Task Activity Toast (real-time notification queue)
  const [taskActivities, setTaskActivities] = useState<TaskActivityNotification[]>([]);
  const [lastTaskActivity, setLastTaskActivity] = useState<TaskActivityNotification | null>(null);

  const addActivityNotification = useCallback((notification: Omit<TaskActivityNotification, 'id' | 'timestamp'>) => {
    const item: TaskActivityNotification = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      ...notification,
    };
    setTaskActivities(prev => [item, ...prev.slice(0, 4)]);
    setLastTaskActivity(item);

    // Audio cue via Web Audio API
    if (item.activityType === 'completed') {
      playNotificationChime('complete');
    } else {
      playNotificationChime('activity');
    }

    // Background tab alert if user is working on another window
    if (typeof document !== 'undefined' && document.hidden) {
      const origTitle = document.title;
      document.title = item.activityType === 'completed'
        ? `🎉 ${item.movedBy} finished task! - Sync`
        : `(1) ${item.movedBy} updated a task - Sync`;
      const onVisChange = () => {
        if (!document.hidden) {
          document.title = origTitle;
          document.removeEventListener('visibilitychange', onVisChange);
        }
      };
      document.addEventListener('visibilitychange', onVisChange);
    }
  }, []);

  const dismissTaskActivity = useCallback(() => {
    setLastTaskActivity(null);
  }, []);

  const dismissTaskActivityById = useCallback((id: string) => {
    setTaskActivities(prev => prev.filter(a => a.id !== id));
  }, []);

  // Auto-dismiss task activities after 5 seconds
  useEffect(() => {
    if (taskActivities.length === 0) return;
    const timer = setTimeout(() => {
      setTaskActivities(prev => prev.slice(0, prev.length - 1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [taskActivities]);

  // History with localStorage persistence and dummy scrubbing
  const [historyRecords, setHistoryRecords] = useState<SessionHistoryRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sync_history_records');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter(h => !isDummyHistory(h));
          }
        } catch {
          return INITIAL_SESSION_HISTORY;
        }
      }
    }
    return INITIAL_SESSION_HISTORY;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sync_history_records', JSON.stringify(historyRecords));
    }
  }, [historyRecords]);

  // ==========================================
  // REAL-TIME WEBSOCKET SUBSCRIPTION (SUPABASE REALTIME)
  // ==========================================
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Keep a ref to latest state so event callbacks always have current data
  const stateRef = useRef({
    currentUser,
    tasks,
    room,
    pendingInvites,
  });

  useEffect(() => {
    stateRef.current = { currentUser, tasks, room, pendingInvites };
  }, [currentUser, tasks, room, pendingInvites]);

  useEffect(() => {
    const roomCode = room.code || 'SYNC-1234';
    const channelName = `sync-room-${roomCode.toLowerCase()}`;

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: true, self: false },
        presence: { key: currentUser.id },
      },
    });

    channelRef.current = channel;

    // 1. Presence Sync: track users currently connected from different devices
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const newRemote: Participant[] = [];

      Object.keys(state).forEach(key => {
        const presences = (state[key] || []) as unknown as Array<Record<string, unknown>>;
        presences.forEach(presence => {
          if (presence && typeof presence.id === 'string' && presence.id !== currentUser.id) {
            newRemote.push({
              id: presence.id,
              name: (presence.name as string) || 'Teammate',
              avatar: (presence.avatar as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent((presence.name as string) || 'Teammate')}&background=6366f1&color=fff`,
              role: (presence.role as string) || 'Focus Member',
              status: (presence.status as UserStatus) || 'working',
              statusNote: (presence.statusNote as string) || '',
              lastActiveTimestamp: (presence.lastActiveTimestamp as number) || Date.now(),
              isCurrentUser: false,
              isOnline: true,
            });
          }
        });
      });

      setRemoteParticipants(newRemote);
    });

    // 2. Broadcast: TASK_MOVED
    channel.on('broadcast', { event: 'TASK_MOVED' }, ({ payload }: { payload: TaskMovedPayload }) => {
      if (!payload || !payload.taskId) return;

      setTasks(prev =>
        prev.map(t => {
          if (t.id === payload.taskId) {
            return {
              ...t,
              status: payload.status,
              completedAt: payload.status === 'done' ? (payload.completedAt || Date.now()) : undefined,
              lastMovedBy: payload.movedBy,
              lastMovedAt: Date.now(),
            };
          }
          return t;
        })
      );

      const actType: TaskActivityNotification['activityType'] =
        payload.status === 'done'
          ? 'completed'
          : payload.status === 'blocked'
          ? 'blocked'
          : 'moved';

      addActivityNotification({
        taskId: payload.taskId,
        taskTitle: payload.taskTitle || 'Task',
        movedBy: payload.movedBy || 'A teammate',
        newStatus: payload.status,
        activityType: actType,
      });
    });

    // 3. Broadcast: TASK_ADDED
    channel.on('broadcast', { event: 'TASK_ADDED' }, ({ payload }: { payload: TaskAddedPayload }) => {
      if (!payload || !payload.task) return;
      const newTask: Task = payload.task;

      setTasks(prev => {
        if (prev.some(t => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });

      addActivityNotification({
        taskId: newTask.id,
        taskTitle: newTask.title,
        movedBy: payload.addedBy || 'A teammate',
        newStatus: newTask.status,
        activityType: 'added',
      });
    });

    // 4. Broadcast: TASK_DELETED
    channel.on('broadcast', { event: 'TASK_DELETED' }, ({ payload }: { payload: TaskDeletedPayload }) => {
      if (!payload || !payload.taskId) return;
      setTasks(prev => prev.filter(t => t.id !== payload.taskId));
      if (payload.deletedBy) {
        addActivityNotification({
          taskId: payload.taskId,
          taskTitle: 'Task deleted',
          movedBy: payload.deletedBy,
          newStatus: 'todo',
          activityType: 'deleted',
        });
      }
    });

    // 5. Broadcast: TASK_UPDATED
    channel.on('broadcast', { event: 'TASK_UPDATED' }, ({ payload }: { payload: TaskUpdatedPayload }) => {
      if (!payload || !payload.task) return;
      const updated: Task = payload.task;
      setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    });

    // 6. Broadcast: INVITE_SENT & INVITE_CANCELLED
    channel.on('broadcast', { event: 'INVITE_SENT' }, ({ payload }: { payload: { invite: RoomInvite } }) => {
      if (!payload || !payload.invite) return;
      const inv = payload.invite;
      setPendingInvites(prev => {
        if (prev.some(i => i.id === inv.id || i.email.toLowerCase() === inv.email.toLowerCase())) {
          return prev;
        }
        return [inv, ...prev];
      });
    });

    channel.on('broadcast', { event: 'INVITE_CANCELLED' }, ({ payload }: { payload: { inviteId: string } }) => {
      if (!payload || !payload.inviteId) return;
      setPendingInvites(prev => prev.filter(i => i.id !== payload.inviteId));
    });

    // 7. Broadcast: USER_STATUS_UPDATED
    channel.on('broadcast', { event: 'USER_STATUS_UPDATED' }, ({ payload }: { payload: UserStatusUpdatedPayload }) => {
      if (!payload || !payload.userId) return;
      setRemoteParticipants(prev =>
        prev.map(p =>
          p.id === payload.userId
            ? { ...p, status: payload.status, statusNote: payload.note, lastActiveTimestamp: Date.now() }
            : p
        )
      );
    });

    // 8. Broadcast: NUDGE_SENT
    channel.on('broadcast', { event: 'NUDGE_SENT' }, ({ payload }: { payload: NudgeSentPayload }) => {
      if (!payload || !payload.nudge) return;
      const n: NudgeNotification = payload.nudge;
      if (n.targetId === currentUser.id) {
        setNudges(prev => [n, ...prev]);
      }
    });

    // 9. Broadcast: TIMER_SYNC
    channel.on('broadcast', { event: 'TIMER_SYNC' }, ({ payload }: { payload: TimerSyncPayload }) => {
      if (!payload) return;
      setRoom(prev => ({
        ...prev,
        isRunning: payload.isRunning !== undefined ? payload.isRunning : prev.isRunning,
        elapsedSeconds: payload.elapsedSeconds !== undefined ? payload.elapsedSeconds : prev.elapsedSeconds,
        targetDurationMinutes: payload.targetDurationMinutes || prev.targetDurationMinutes,
        mode: payload.mode || prev.mode,
      }));
    });

    // 10. Initial Room State Request / Response
    // When a new device joins, it asks other connected devices for existing room tasks
    channel.on('broadcast', { event: 'REQUEST_ROOM_STATE' }, ({ payload }: { payload: RequestRoomStatePayload }) => {
      const current = stateRef.current;
      if (current.tasks.length > 0 || current.pendingInvites.length > 0) {
        channel.send({
          type: 'broadcast',
          event: 'RESPONSE_ROOM_STATE',
          payload: {
            tasks: current.tasks,
            room: current.room,
            pendingInvites: current.pendingInvites,
            targetDeviceId: payload?.requesterId,
          },
        });
      }
    });

    channel.on('broadcast', { event: 'RESPONSE_ROOM_STATE' }, ({ payload }: { payload: ResponseRoomStatePayload }) => {
      if (!payload) return;
      if (payload.targetDeviceId && payload.targetDeviceId !== currentUser.id) return;

      if (Array.isArray(payload.tasks) && payload.tasks.length > 0) {
        setTasks(payload.tasks.filter((t: Task) => !isDummyTask(t)));
      }

      if (Array.isArray(payload.pendingInvites)) {
        setPendingInvites(prev => {
          const map = new Map<string, RoomInvite>();
          payload.pendingInvites?.forEach((i: RoomInvite) => map.set(i.id, i));
          prev.forEach(i => map.set(i.id, i));
          return Array.from(map.values());
        });
      }

      if (payload.room) {
        setRoom(prev => ({
          ...prev,
          isRunning: payload.room?.isRunning !== undefined ? payload.room.isRunning : prev.isRunning,
          elapsedSeconds: payload.room?.elapsedSeconds !== undefined ? payload.room.elapsedSeconds : prev.elapsedSeconds,
          targetDurationMinutes: payload.room?.targetDurationMinutes || prev.targetDurationMinutes,
          mode: payload.room?.mode || prev.mode,
        }));
      }
    });

    // Subscribe to WebSocket channel
    let retryTimer: NodeJS.Timeout | null = null;
    channel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);

        // Track presence of this device
        await channel.track({
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.role,
          status: currentUser.status,
          statusNote: currentUser.statusNote,
          lastActiveTimestamp: Date.now(),
        });

        // Request current state from existing devices in the room
        channel.send({
          type: 'broadcast',
          event: 'REQUEST_ROOM_STATE',
          payload: { requesterId: currentUser.id },
        });

        // Backup request after 750ms in case host client is still completing handshake
        retryTimer = setTimeout(() => {
          if (channelRef.current) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'REQUEST_ROOM_STATE',
              payload: { requesterId: currentUser.id },
            });
          }
        }, 750);
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setIsConnected(false);
      }
    });

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      channel.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
    };
  }, [room.code, currentUser.id]);

  // Update presence whenever currentUser changes
  useEffect(() => {
    if (channelRef.current && isConnected) {
      channelRef.current.track({
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.role,
        status: currentUser.status,
        statusNote: currentUser.statusNote,
        lastActiveTimestamp: Date.now(),
      });
    }
  }, [currentUser, isConnected]);

  // Helper for updating room state
  const updateRoom = (partial: Partial<RoomSession>) => {
    setRoom(prev => {
      const next = { ...prev, ...partial };
      if (channelRef.current && isConnected) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'TIMER_SYNC',
          payload: {
            isRunning: next.isRunning,
            elapsedSeconds: next.elapsedSeconds,
            targetDurationMinutes: next.targetDurationMinutes,
            mode: next.mode,
          },
        });
      }
      return next;
    });
  };

  // Timer Tick Effect & Auto Record on Completion
  useEffect(() => {
    if (!room.isRunning) return;

    const interval = setInterval(() => {
      setRoom(prev => {
        const nextSeconds = prev.elapsedSeconds + 1;
        // Check if Pomodoro target reached
        if (prev.mode === 'pomodoro' && nextSeconds >= prev.targetDurationMinutes * 60) {
          const completedTasksCount = tasks.filter(t => t.status === 'done').length;
          const score = tasks.length > 0
            ? Math.round((completedTasksCount / tasks.length) * 100)
            : 100;

          const newRecord: SessionHistoryRecord = {
            id: `session-${Date.now()}`,
            roomName: prev.name || 'Focus Room',
            date: new Date().toISOString().split('T')[0],
            startTime: new Date(Date.now() - (prev.targetDurationMinutes * 60 * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            durationMinutes: prev.targetDurationMinutes,
            focusMinutes: prev.targetDurationMinutes,
            breakMinutes: 0,
            participantsCount: participants.length,
            tasksCompleted: completedTasksCount,
            totalTasks: tasks.length,
            focusScore: score,
            tags: ['Pomodoro', 'Completed'],
          };

          setHistoryRecords(hPrev => [newRecord, ...hPrev]);
          return { ...prev, elapsedSeconds: nextSeconds, isRunning: false };
        }
        return { ...prev, elapsedSeconds: nextSeconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room.isRunning, room.mode, room.targetDurationMinutes, tasks, participants.length]);

  const toggleTimer = () => {
    setRoom(prev => {
      const nextRunning = !prev.isRunning;
      if (channelRef.current && isConnected) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'TIMER_SYNC',
          payload: { isRunning: nextRunning, elapsedSeconds: prev.elapsedSeconds },
        });
      }
      return { ...prev, isRunning: nextRunning };
    });
  };

  const resetTimer = () => {
    setRoom(prev => {
      if (channelRef.current && isConnected) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'TIMER_SYNC',
          payload: { isRunning: false, elapsedSeconds: 0 },
        });
      }
      return { ...prev, elapsedSeconds: 0, isRunning: false };
    });
  };

  const setTimerMinutes = (mins: number) => {
    setRoom(prev => {
      if (channelRef.current && isConnected) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'TIMER_SYNC',
          payload: { targetDurationMinutes: mins, elapsedSeconds: 0, isRunning: false },
        });
      }
      return { ...prev, targetDurationMinutes: mins, elapsedSeconds: 0, isRunning: false };
    });
  };

  const completeSession = () => {
    const elapsedMinutes = Math.max(1, Math.round(room.elapsedSeconds / 60));
    const completedTasksCount = tasks.filter(t => t.status === 'done').length;
    const score = tasks.length > 0
      ? Math.round((completedTasksCount / tasks.length) * 100)
      : 100;

    const newRecord: SessionHistoryRecord = {
      id: `session-${Date.now()}`,
      roomName: room.name || 'Focus Room',
      date: new Date().toISOString().split('T')[0],
      startTime: new Date(Date.now() - (room.elapsedSeconds * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: elapsedMinutes,
      focusMinutes: elapsedMinutes,
      breakMinutes: 0,
      participantsCount: participants.length,
      tasksCompleted: completedTasksCount,
      totalTasks: tasks.length,
      focusScore: score,
      tags: ['Focus', room.mode],
    };

    setHistoryRecords(prev => [newRecord, ...prev]);
    resetTimer();
  };

  // User Status Updates (real-time broadcast)
  const updateUserStatus = (status: UserStatus, note?: string) => {
    setCurrentUser(prev => {
      const updated = {
        ...prev,
        status,
        statusNote: note !== undefined ? note : prev.statusNote,
        lastActiveTimestamp: Date.now(),
      };
      return updated;
    });

    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'USER_STATUS_UPDATED',
        payload: {
          userId: currentUser.id,
          status,
          note,
        },
      });
    }
  };

  // Allow user to edit their name on this device
  const updateCurrentUserName = (name: string) => {
    if (!name.trim()) return;
    const trimmed = name.trim();
    const newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmed)}&background=6366f1&color=fff`;

    setCurrentUser(prev => {
      const updated = { ...prev, name: trimmed, avatar: newAvatar };
      if (typeof window !== 'undefined') {
        const savedGuest = localStorage.getItem('sync_guest_user');
        if (savedGuest) {
          try {
            const guestObj = JSON.parse(savedGuest);
            localStorage.setItem('sync_guest_user', JSON.stringify({ ...guestObj, name: trimmed, avatar: newAvatar }));
          } catch {}
        }
      }
      return updated;
    });
  };

  // Send an invitation to an email address (no dummy data created in active list)
  const sendEmailInvite = async (email: string, role = 'Focus Member'): Promise<{ success: boolean; error?: string }> => {
    const trimmed = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (googleUser?.email && googleUser.email.toLowerCase() === trimmed) {
      return { success: false, error: 'You are already in this room!' };
    }

    const alreadyInvited = pendingInvites.some(i => i.email.toLowerCase() === trimmed);
    if (alreadyInvited) {
      return { success: false, error: 'An invitation has already been recorded for this email.' };
    }

    const newInvite: RoomInvite = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: trimmed,
      role,
      invitedAt: Date.now(),
      invitedBy: currentUser.name,
      status: 'pending',
    };

    setPendingInvites(prev => [newInvite, ...prev]);

    // Broadcast over WebSocket to all devices in the room
    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'INVITE_SENT',
        payload: { invite: newInvite },
      });
    }

    return { success: true };
  };

  const cancelInvite = (inviteId: string) => {
    setPendingInvites(prev => prev.filter(i => i.id !== inviteId));

    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'INVITE_CANCELLED',
        payload: { inviteId },
      });
    }
  };

  // Safe wrapper that opens the invite modal without injecting fake dummy participants
  const addParticipant = (nameOrEmail?: string, role = 'Focus Member') => {
    const trimmed = (nameOrEmail || '').trim();
    if (trimmed && trimmed.includes('@')) {
      sendEmailInvite(trimmed, role);
    } else {
      setIsInviteModalOpen(true);
    }
  };

  const removeParticipant = (id: string) => {
    cancelInvite(id);
  };

  // Task Operations with Real-Time WebSocket Broadcast
  const addTask = (title: string, assigneeId?: string, estimatedMinutes = 25, priority: Task['priority'] = 'medium') => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      status: 'todo',
      priority,
      assigneeId,
      createdById: currentUser.id,
      createdAt: Date.now(),
      estimatedMinutes,
      lastMovedBy: currentUser.name,
      lastMovedAt: Date.now(),
    };

    setTasks(prev => [newTask, ...prev]);

    // Broadcast over WebSocket so all connected devices see the new task
    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'TASK_ADDED',
        payload: {
          task: newTask,
          addedBy: currentUser.name,
        },
      });
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    let updatedStatus: Task['status'] = 'done';
    let targetTaskTitle = '';

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const isDone = t.status === 'done';
          updatedStatus = isDone ? 'in_progress' : 'done';
          targetTaskTitle = t.title;
          return {
            ...t,
            status: updatedStatus,
            completedAt: !isDone ? Date.now() : undefined,
            lastMovedBy: currentUser.name,
            lastMovedAt: Date.now(),
          };
        }
        return t;
      })
    );

    // Broadcast task move to other devices
    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'TASK_MOVED',
        payload: {
          taskId,
          taskTitle: targetTaskTitle,
          status: updatedStatus,
          movedBy: currentUser.name,
          completedAt: updatedStatus === 'done' ? Date.now() : undefined,
        },
      });
    }
  };

  // Core task move handler (e.g. from To Do -> In Progress -> Done / Blocked)
  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    let targetTaskTitle = '';

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          targetTaskTitle = t.title;
          return {
            ...t,
            status,
            completedAt: status === 'done' ? Date.now() : undefined,
            lastMovedBy: currentUser.name,
            lastMovedAt: Date.now(),
          };
        }
        return t;
      })
    );

    // Broadcast task move over WebSocket so all other devices see it instantly
    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'TASK_MOVED',
        payload: {
          taskId,
          taskTitle: targetTaskTitle,
          status,
          movedBy: currentUser.name,
          completedAt: status === 'done' ? Date.now() : undefined,
        },
      });
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));

    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'TASK_DELETED',
        payload: { taskId, deletedBy: currentUser.name },
      });
    }
  };

  // Nudge Actions (Real-Time across devices)
  const sendNudge = (targetId: string, customMessage?: string) => {
    const target = participants.find(p => p.id === targetId);
    if (!target) return;

    const newNudge: NudgeNotification = {
      id: `nudge-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name.split(' ')[0],
      targetId,
      targetName: target.name.split(' ')[0],
      message: customMessage || `${currentUser.name.split(' ')[0]} sent you a friendly focus nudge.`,
      timestamp: Date.now(),
      type: target.status === 'stuck' ? 'stuck' : 'idle',
    };

    setNudges(prev => [newNudge, ...prev]);

    // Send to recipient device over WebSocket
    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'NUDGE_SENT',
        payload: { nudge: newNudge },
      });
    }
  };

  const dismissNudge = (nudgeId: string) => {
    setNudges(prev => prev.filter(n => n.id !== nudgeId));
  };

  const addHistoryRecord = (record: SessionHistoryRecord) => {
    setHistoryRecords(prev => [record, ...prev]);
  };

  return (
    <RoomContext.Provider
      value={{
        activeView,
        setActiveView,
        isDark,
        setIsDark,
        toggleTheme,
        selectedTemplate,
        setSelectedTemplate,
        room,
        updateRoom,
        toggleTimer,
        resetTimer,
        setTimerMinutes,
        completeSession,
        isConnected,
        lastTaskActivity,
        taskActivities,
        dismissTaskActivity,
        dismissTaskActivityById,
        joinRoomByCode,
        participants,
        currentUser,
        updateUserStatus,
        updateCurrentUserName,
        addParticipant,
        removeParticipant,
        pendingInvites,
        sendEmailInvite,
        cancelInvite,
        isInviteModalOpen,
        setIsInviteModalOpen,
        tasks,
        addTask,
        toggleTaskComplete,
        updateTaskStatus,
        deleteTask,
        nudges,
        sendNudge,
        dismissNudge,
        historyRecords,
        addHistoryRecord,
        isAuthenticated,
        googleUser,
        loginWithGoogle,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
