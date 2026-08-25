"use client";

import React, { useState } from 'react';
import { Plus, Check, Trash2, Filter, User, Clock, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { Task, TaskPriority, TaskStatus } from '../types';

export const TaskList: React.FC = () => {
  const { tasks, addTask, toggleTaskComplete, updateTaskStatus, deleteTask, participants, currentUser } = useRoom();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>(currentUser.id);
  const [selectedEstMinutes, setSelectedEstMinutes] = useState<number>(25);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('medium');
  const [filter, setFilter] = useState<'all' | 'mine' | 'in_progress' | 'blocked' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, selectedAssignee || undefined, selectedEstMinutes, selectedPriority);
    setNewTaskTitle('');
  };

  // Filter logic
  const filteredTasks = tasks.filter(t => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !(t.description && t.description.toLowerCase().includes(q))) {
        return false;
      }
    }

    if (filter === 'mine') return t.assigneeId === currentUser.id;
    if (filter === 'in_progress') return t.status === 'in_progress';
    if (filter === 'blocked') return t.status === 'blocked';
    if (filter === 'done') return t.status === 'done';
    return true; // 'all'
  });

  const getPriorityDot = (p: TaskPriority) => {
    switch (p) {
      case 'high':
        return <span className="h-1.5 w-1.5 rounded-full bg-rose-500" title="High Priority" />;
      case 'medium':
        return <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Medium Priority" />;
      case 'low':
        return <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600" title="Low Priority" />;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[11px] font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            In progress
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[11px] font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
            Blocked
          </span>
        );
      case 'done':
        return (
          <span className="inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
            To do
          </span>
        );
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800/80">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Shared Focus Tasks
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Single-click checkoffs with live teammate visibility
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'mine', label: 'My Tasks' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'blocked', label: 'Blocked' },
            { id: 'done', label: 'Done' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.id
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              id={`filter-btn-${f.id}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inline Quick Add Task Form */}
      <form onSubmit={handleAddTaskSubmit} className="my-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-2 shadow-xs transition-colors focus-within:border-neutral-400 dark:focus-within:border-neutral-600">
          
          <div className="flex-1 flex items-center space-x-2 px-2">
            <Plus className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task for this focus block... (e.g. 'Optimize PostgreSQL queries')"
              className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
              id="new-task-input"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-neutral-200 dark:border-neutral-800 pl-0 sm:pl-2">
            {/* Assignee select */}
            <select
              value={selectedAssignee}
              onChange={e => setSelectedAssignee(e.target.value)}
              className="bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 rounded px-2 py-1.5 border border-neutral-200 dark:border-neutral-700 focus:outline-none"
              id="assignee-select"
            >
              <option value={currentUser.id}>Assign to: Me</option>
              {participants.filter(p => !p.isCurrentUser).map(p => (
                <option key={p.id} value={p.id}>
                  Assign to: {p.name.split(' ')[0]}
                </option>
              ))}
            </select>

            {/* Estimated Minutes */}
            <select
              value={selectedEstMinutes}
              onChange={e => setSelectedEstMinutes(Number(e.target.value))}
              className="bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 rounded px-2 py-1.5 border border-neutral-200 dark:border-neutral-700 focus:outline-none font-mono"
              id="est-minutes-select"
            >
              <option value={15}>15m</option>
              <option value={25}>25m</option>
              <option value={45}>45m</option>
              <option value={60}>60m</option>
            </select>

            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="inline-flex items-center space-x-1 rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-40 transition-all shadow-xs"
              id="add-task-submit-btn"
            >
              <span>Add</span>
            </button>
          </div>

        </div>
      </form>

      {/* Clean Spacious Task Rows */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-2">
          {filteredTasks.map(task => {
            const assignee = participants.find(p => p.id === task.assigneeId);
            const isDone = task.status === 'done';

            return (
              <div
                key={task.id}
                className={`group flex items-start sm:items-center justify-between p-3.5 sm:p-4 rounded-md border transition-all duration-200 ${
                  isDone
                    ? 'border-neutral-200/50 dark:border-neutral-800/40 bg-neutral-50/30 dark:bg-neutral-900/20 opacity-60'
                    : 'border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs'
                }`}
                id={`task-row-${task.id}`}
              >
                {/* Left: Checkbox + Title + Meta */}
                <div className="flex items-start sm:items-center space-x-3.5 flex-1 min-w-0 pr-4">
                  {/* Custom Checkbox */}
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`mt-0.5 sm:mt-0 flex-shrink-0 flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      isDone
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-neutral-300 dark:border-neutral-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-transparent'
                    }`}
                    id={`toggle-task-${task.id}`}
                  >
                    {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {getPriorityDot(task.priority)}
                      <span
                        className={`text-xs sm:text-sm font-medium transition-all ${
                          isDone
                            ? 'line-through text-neutral-400 dark:text-neutral-500'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Status badge, Est Time, Assignee Avatar, Actions */}
                <div className="flex items-center space-x-3 flex-shrink-0 pt-1 sm:pt-0">
                  {/* Status selector badge */}
                  <select
                    value={task.status}
                    onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className="bg-transparent text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 cursor-pointer focus:outline-none"
                    id={`task-status-select-${task.id}`}
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Completed</option>
                  </select>

                  {/* Est Time */}
                  {task.estimatedMinutes && (
                    <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                      <Clock className="h-3 w-3" />
                      <span>{task.estimatedMinutes}m</span>
                    </span>
                  )}

                  {/* Assignee Avatar */}
                  {assignee ? (
                    <div className="flex items-center space-x-1" title={`Assigned to ${assignee.name}`}>
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="h-5 w-5 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>
                  ) : (
                    <span className="h-5 w-5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-[10px] text-neutral-400">
                      ?
                    </span>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 p-1 rounded transition-opacity"
                    title="Delete task"
                    id={`delete-task-${task.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State designed intentionally with clean SVG art & encouraging line */
        <div className="my-12 flex flex-col items-center justify-center text-center p-8 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
          <svg className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            No focus tasks found
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
            {searchQuery || filter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Add your first goal for this focus block to get in the flow.'}
          </p>
        </div>
      )}

    </main>
  );
};
