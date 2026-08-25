"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DESIGN_TEMPLATES, INITIAL_PARTICIPANTS, INITIAL_ROOM, INITIAL_SESSION_HISTORY, INITIAL_TASKS } from '../data/initialData';
import {RoomContextType, ActiveView, DesignTemplate, NudgeNotification, Participant, RoomSession, SessionHistoryRecord, Task, UserStatus } from '../types';

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('room');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate>(DESIGN_TEMPLATES[0]);

  // Apply dark class to <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Room state
  const [room, setRoom] = useState<RoomSession>(INITIAL_ROOM);

  // Participants
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  // Nudges
  const [nudges, setNudges] = useState<NudgeNotification[]>([]);

  // Simulation
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);

  // History
  const [historyRecords, setHistoryRecords] = useState<SessionHistoryRecord[]>(INITIAL_SESSION_HISTORY);

  // Current User reference
  const currentUser = participants.find(p => p.isCurrentUser) || participants[0];

  // Helper for updating room state
  const updateRoom = (partial: Partial<RoomSession>) => {
    setRoom(prev => ({ ...prev, ...partial }));
  };

  // Timer Tick Effect
  useEffect(() => {
    if (!room.isRunning) return;

    const interval = setInterval(() => {
      setRoom(prev => {
        const nextSeconds = prev.elapsedSeconds + 1;
        // Check if Pomodoro target reached
        if (prev.mode === 'pomodoro' && nextSeconds >= prev.targetDurationMinutes * 60) {
          // Trigger session completed nudge or status update
          return { ...prev, elapsedSeconds: nextSeconds, isRunning: false };
        }
        return { ...prev, elapsedSeconds: nextSeconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room.isRunning, room.mode, room.targetDurationMinutes]);

  const toggleTimer = () => {
    setRoom(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const resetTimer = () => {
    setRoom(prev => ({ ...prev, elapsedSeconds: 0, isRunning: false }));
  };

  const setTimerMinutes = (mins: number) => {
    setRoom(prev => ({ ...prev, targetDurationMinutes: mins, elapsedSeconds: 0 }));
  };

  // User Status Updates
  const updateUserStatus = (status: UserStatus, note?: string) => {
    setParticipants(prev =>
      prev.map(p => {
        if (p.isCurrentUser) {
          return {
            ...p,
            status,
            statusNote: note !== undefined ? note : p.statusNote,
            lastActiveTimestamp: Date.now(),
          };
        }
        return p;
      })
    );

    // Broadcast change
    broadcastStateChange({
      type: 'STATUS_UPDATE',
      userId: currentUser.id,
      status,
      note,
    });
  };

  // Add simulated teammate
  const addSimulatedTeammate = () => {
    const names = [
      'Devon Vance', 'Maya Lin', 'Kaitlyn Vance', 'Liam O\'Connor', 'Zoe Kravitz', 'Siddharth Patel'
    ];
    const roles = ['Systems Engineer', 'Product Designer', 'Data Analyst', 'Frontend Dev', 'QA Lead'];
    const avatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    ];

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newParticipant: Participant = {
      id: `sim-${Date.now()}`,
      name: randomName,
      avatar: randomAvatar,
      role: randomRole,
      status: 'working',
      statusNote: 'Joined session',
      lastActiveTimestamp: Date.now(),
      isCurrentUser: false,
      isSimulated: true,
    };

    setParticipants(prev => [...prev, newParticipant]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  // Task Operations
  const addTask = (title: string, assigneeId?: string, estimatedMinutes = 25, priority: Task['priority'] = 'medium') => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      status: 'todo',
      priority,
      assigneeId,
      createdById: currentUser.id,
      createdAt: Date.now(),
      estimatedMinutes,
    };

    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const isDone = t.status === 'done';
          return {
            ...t,
            status: isDone ? 'in_progress' : 'done',
            completedAt: !isDone ? Date.now() : undefined,
          };
        }
        return t;
      })
    );
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status,
            completedAt: status === 'done' ? Date.now() : undefined,
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Nudge Actions
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
  };

  const dismissNudge = (nudgeId: string) => {
    setNudges(prev => prev.filter(n => n.id !== nudgeId));
  };

  const addHistoryRecord = (record: SessionHistoryRecord) => {
    setHistoryRecords(prev => [record, ...prev]);
  };

  // Multi-Tab Sync with BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const bc = new BroadcastChannel('sync_room_channel');

    bc.onmessage = event => {
      const { type, data } = event.data || {};
      if (type === 'SYNC_STATE') {
        if (data.participants) setParticipants(data.participants);
        if (data.tasks) setTasks(data.tasks);
        if (data.room) setRoom(data.room);
      }
    };

    return () => bc.close();
  }, []);

  const broadcastStateChange = (payload: any) => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const bc = new BroadcastChannel('sync_room_channel');
    bc.postMessage(payload);
    bc.close();
  };

  // Simulated Live Activity Engine
  useEffect(() => {
    if (!isSimulationActive) return;

    const interval = setInterval(() => {
      // Pick a random simulated participant
      const simulated = participants.filter(p => p.isSimulated);
      if (simulated.length === 0) return;

      const randomPerson = simulated[Math.floor(Math.random() * simulated.length)];
      const statuses: UserStatus[] = ['working', 'working', 'break', 'stuck', 'working'];
      const nextStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const statusNotes: Record<UserStatus, string[]> = {
        working: ['Coding core logic', 'Reviewing pull requests', 'Writing documentation', 'Focusing on unit tests'],
        break: ['Grabbing tea', 'Stretching for 5 mins', 'Quick walk outside'],
        stuck: ['Blocked on database query optimization', 'Waiting for design asset review', 'Debugging CORS header issue'],
        idle: ['Away from keyboard'],
      };

      const notesForStatus = statusNotes[nextStatus];
      const randomNote = notesForStatus[Math.floor(Math.random() * notesForStatus.length)];

      setParticipants(prev =>
        prev.map(p => {
          if (p.id === randomPerson.id) {
            return {
              ...p,
              status: nextStatus,
              statusNote: randomNote,
              lastActiveTimestamp: Date.now(),
            };
          }
          return p;
        })
      );

      // Random chance to auto-nudge if someone becomes stuck
      if (nextStatus === 'stuck' && Math.random() > 0.5) {
        const nudgeMessage = `${randomPerson.name.split(' ')[0]} is stuck on "${randomNote}". Can anyone help?`;
        setNudges(prev => {
          if (prev.some(n => n.targetId === randomPerson.id)) return prev;
          return [
            {
              id: `nudge-auto-${Date.now()}`,
              senderId: randomPerson.id,
              senderName: randomPerson.name.split(' ')[0],
              targetId: currentUser.id,
              targetName: currentUser.name.split(' ')[0],
              message: nudgeMessage,
              timestamp: Date.now(),
              type: 'stuck',
            },
            ...prev,
          ];
        });
      }
    }, 28000); // Trigger every 28s for calm subtle activity

    return () => clearInterval(interval);
  }, [isSimulationActive, participants, currentUser]);

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
        participants,
        currentUser,
        updateUserStatus,
        addSimulatedTeammate,
        removeParticipant,
        tasks,
        addTask,
        toggleTaskComplete,
        updateTaskStatus,
        deleteTask,
        nudges,
        sendNudge,
        dismissNudge,
        isSimulationActive,
        setIsSimulationActive,
        historyRecords,
        addHistoryRecord,
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
