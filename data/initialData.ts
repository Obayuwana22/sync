import { DesignTemplate, Participant, RoomSession, SessionHistoryRecord, Task } from '../types';

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'linear-dark',
    name: 'Linear Obsidian',
    tagline: 'Quiet, near-black dark mode with soft indigo accents and high typography contrast.',
    accentColor: 'indigo',
    accentHex: '#6366f1',
    bgMode: 'dark',
    previewBg: '#09090b',
    previewCard: '#121215',
    previewBorder: '#27272a',
    previewText: '#f4f4f5',
    fontStyle: 'Inter / Neutral',
  },
  {
    id: 'notion-light',
    name: 'Notion Warm Canvas',
    tagline: 'Clean, near-white warm canvas with crisp 1px subtle borders and serene layout.',
    accentColor: 'indigo',
    accentHex: '#4f46e5',
    bgMode: 'light',
    previewBg: '#fafafa',
    previewCard: '#ffffff',
    previewBorder: '#e4e4e7',
    previewText: '#09090b',
    fontStyle: 'Serene Sans',
  },
  {
    id: 'vercel-minimal',
    name: 'Vercel Clean Slate',
    tagline: 'Monochrome precision with stark typography, zero clutter, and razor-sharp focus.',
    accentColor: 'zinc',
    accentHex: '#3f3f46',
    bgMode: 'dark',
    previewBg: '#000000',
    previewCard: '#0a0a0a',
    previewBorder: '#1f1f1f',
    previewText: '#ffffff',
    fontStyle: 'System Monospace UI',
  },
  {
    id: 'nordic-slate',
    name: 'Nordic Slate',
    tagline: 'Cool slate tones designed for long daytime hours with reduced visual strain.',
    accentColor: 'cyan',
    accentHex: '#0ea5e9',
    bgMode: 'light',
    previewBg: '#f8fafc',
    previewCard: '#ffffff',
    previewBorder: '#cbd5e1',
    previewText: '#0f172a',
    fontStyle: 'Geist Sans',
  },
];

export const INITIAL_PARTICIPANTS: Participant[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_ROOM: RoomSession = {
  id: 'room-default-1',
  name: 'Focus Room',
  topic: 'Deep Work Session',
  code: 'SYNC-1234',
  templateId: 'linear-dark',
  targetDurationMinutes: 50,
  elapsedSeconds: 0,
  isRunning: false,
  mode: 'pomodoro',
  createdAt: Date.now(),
};

export const INITIAL_SESSION_HISTORY: SessionHistoryRecord[] = [];
