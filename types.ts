export type UserStatus = 'working' | 'break' | 'stuck' | 'idle';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: UserStatus;
  statusNote?: string;
  lastActiveTimestamp: number;
  isCurrentUser?: boolean;
  isOnline?: boolean;
  isSimulated?: boolean;
  tasksCount?: {
    total: number;
    completed: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  createdById: string;
  createdAt: number;
  estimatedMinutes?: number;
  completedAt?: number;
  lastMovedBy?: string;
  lastMovedAt?: number;
}

export interface RoomSession {
  id: string;
  name: string;
  topic: string;
  code: string;
  templateId: string;
  targetDurationMinutes: number; // e.g. 25, 50, 90
  elapsedSeconds: number;
  isRunning: boolean;
  mode: 'pomodoro' | 'stopwatch';
  createdAt: number;
}

export interface DesignTemplate {
  id: string;
  name: string;
  tagline: string;
  accentColor: string;
  accentHex: string;
  bgMode: 'dark' | 'light';
  previewBg: string;
  previewCard: string;
  previewBorder: string;
  previewText: string;
  fontStyle: string;
}

export interface SessionHistoryRecord {
  id: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  durationMinutes: number;
  focusMinutes: number;
  breakMinutes: number;
  participantsCount: number;
  tasksCompleted: number;
  totalTasks: number;
  focusScore: number;
  tags: string[];
}

export interface NudgeNotification {
  id: string;
  senderId: string;
  senderName: string;
  targetId: string;
  targetName: string;
  message: string;
  timestamp: number;
  type: 'idle' | 'stuck' | 'encouragement';
}

export interface TaskActivityNotification {
  id: string;
  taskId: string;
  taskTitle: string;
  movedBy: string;
  newStatus: TaskStatus;
  timestamp: number;
  activityType?: 'moved' | 'completed' | 'added' | 'blocked' | 'deleted';
}

export interface RoomInvite {
  id: string;
  email: string;
  role: string;
  invitedAt: number;
  invitedBy?: string;
  status: 'pending' | 'joined';
}

export type ActiveView = 'landing' | 'room' | 'history';

export interface RoomContextType {
  // Navigation & Theme
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  toggleTheme: () => void;
  selectedTemplate: DesignTemplate;
  setSelectedTemplate: (template: DesignTemplate) => void;

  // Room Session
  room: RoomSession;
  updateRoom: (partial: Partial<RoomSession>) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  setTimerMinutes: (mins: number) => void;
  completeSession: () => void;

  // Real-Time WebSocket Connection
  isConnected: boolean;
  lastTaskActivity: TaskActivityNotification | null;
  taskActivities: TaskActivityNotification[];
  dismissTaskActivity: () => void;
  dismissTaskActivityById: (id: string) => void;
  joinRoomByCode: (code: string) => void;

  // Participants & User Status (Real-Time connected users only)
  participants: Participant[];
  currentUser: Participant;
  updateUserStatus: (status: UserStatus, note?: string) => void;
  updateCurrentUserName: (name: string) => void;
  addParticipant: (name: string, role?: string, avatar?: string) => void;
  removeParticipant: (id: string) => void;

  // Room Invites (Email & Shareable Links)
  pendingInvites: RoomInvite[];
  sendEmailInvite: (email: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  cancelInvite: (inviteId: string) => void;
  isInviteModalOpen: boolean;
  setIsInviteModalOpen: (open: boolean) => void;
  
  // Tasks
  tasks: Task[];
  addTask: (title: string, assigneeId?: string, estimatedMinutes?: number, priority?: Task['priority']) => void;
  toggleTaskComplete: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  deleteTask: (taskId: string) => void;

  // Nudges & Toasts
  nudges: NudgeNotification[];
  sendNudge: (targetId: string, message?: string) => void;
  dismissNudge: (nudgeId: string) => void;

  // Authentication & Auth Modal
  isAuthenticated: boolean;
  googleUser: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  } | null;
  loginWithGoogle: (nextPath?: string) => Promise<void>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // History
  historyRecords: SessionHistoryRecord[];
  addHistoryRecord: (record: SessionHistoryRecord) => void;
}
