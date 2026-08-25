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
  lastActiveTimestamp: number; // Date.now() offset
  isCurrentUser?: boolean;
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
  focusScore: number; // percentage e.g. 92%
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

  // Participants & User Status
  participants: Participant[];
  currentUser: Participant;
  updateUserStatus: (status: UserStatus, note?: string) => void;
  addSimulatedTeammate: () => void;
  removeParticipant: (id: string) => void;
  
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

  // Simulation & Multi-tab
  isSimulationActive: boolean;
  setIsSimulationActive: (active: boolean) => void;

  // History
  historyRecords: SessionHistoryRecord[];
  addHistoryRecord: (record: SessionHistoryRecord) => void;
}
