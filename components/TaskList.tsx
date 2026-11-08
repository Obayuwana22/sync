"use client";

import React, { useState } from 'react';
import {
  Plus,
  Check,
  Trash2,
  Clock,
  LayoutList,
  Kanban,
  Activity,
  X,
  UserPlus,
} from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { TaskPriority, TaskStatus } from '../types';

export const TaskList: React.FC = () => {
  const {
    tasks,
    addTask,
    toggleTaskComplete,
    updateTaskStatus,
    deleteTask,
    participants,
    currentUser,
    lastTaskActivity,
    dismissTaskActivity,
    setIsInviteModalOpen,
  } = useRoom();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>(currentUser.id);
  const [selectedEstMinutes, setSelectedEstMinutes] = useState<number>(25);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('medium');
  const [filter, setFilter] = useState<'all' | 'mine' | 'in_progress' | 'blocked' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

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
    return true;
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

  const formatStatus = (s: TaskStatus) => {
    switch (s) {
      case 'todo': return 'To Do';
      case 'in_progress': return 'In Progress';
      case 'blocked': return 'Blocked';
      case 'done': return 'Completed';
    }
  };

  // Drag & drop handlers for Board View
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = draggedTaskId || e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  const boardColumns: { id: TaskStatus; title: string; dotColor: string }[] = [
    { id: 'todo', title: 'To Do', dotColor: 'bg-neutral-400' },
    { id: 'in_progress', title: 'In Progress', dotColor: 'bg-indigo-500' },
    { id: 'blocked', title: 'Blocked', dotColor: 'bg-rose-500' },
    { id: 'done', title: 'Completed', dotColor: 'bg-emerald-500' },
  ];

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      
      {/* Real-Time Task Activity Notification Banner */}
      {lastTaskActivity && (
        <div className={`mb-4 flex items-center justify-between p-3 rounded-lg border text-xs animate-in fade-in slide-in-from-top-1 duration-300 shadow-xs ${
          lastTaskActivity.activityType === 'completed'
            ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
            : lastTaskActivity.activityType === 'blocked'
            ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
            : 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
        }`}>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-indigo-500 animate-pulse flex-shrink-0" />
            <span>
              {lastTaskActivity.activityType === 'completed' ? (
                <>
                  🎉 <strong className="font-semibold">{lastTaskActivity.movedBy}</strong> completed{' '}
                  <span className="italic font-medium">&ldquo;{lastTaskActivity.taskTitle}&rdquo;</span>!
                </>
              ) : lastTaskActivity.activityType === 'blocked' ? (
                <>
                  ⚠️ <strong className="font-semibold">{lastTaskActivity.movedBy}</strong> is blocked on{' '}
                  <span className="italic font-medium">&ldquo;{lastTaskActivity.taskTitle}&rdquo;</span>
                </>
              ) : lastTaskActivity.activityType === 'added' ? (
                <>
                  📋 <strong className="font-semibold">{lastTaskActivity.movedBy}</strong> added{' '}
                  <span className="italic font-medium">&ldquo;{lastTaskActivity.taskTitle}&rdquo;</span>
                </>
              ) : (
                <>
                  <strong className="font-semibold">{lastTaskActivity.movedBy}</strong> moved{' '}
                  <span className="italic font-medium">&ldquo;{lastTaskActivity.taskTitle}&rdquo;</span> to{' '}
                  <span className="font-semibold underline">{formatStatus(lastTaskActivity.newStatus)}</span>
                </>
              )}
            </span>
          </div>
          <button
            onClick={dismissTaskActivity}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 cursor-pointer"
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header & Filter / View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Shared Focus Tasks
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
              {tasks.length} total
            </span>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center space-x-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer"
              title="Invite a teammate to collaborate on this board"
              id="tasklist-invite-pill"
            >
              <UserPlus className="h-3 w-3" />
              <span>+ Invite Teammate</span>
            </button>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Tasks sync live across all connected devices and teammates via WebSockets
          </p>
        </div>

        {/* View Mode Switcher + Filters */}
        <div className="flex items-center space-x-2">
          {/* List vs Board Toggle */}
          <div className="flex items-center rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 p-0.5">
            <button
              onClick={() => setViewMode('board')}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Board View (Drag and move across columns)"
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="List View"
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>

          {/* Quick Filter */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { id: 'all' as const, label: 'All' },
              { id: 'mine' as const, label: 'Mine' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  filter === f.id
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
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
              placeholder="Add a new task for this focus block... (e.g. 'Build auth middleware')"
              className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
              id="new-task-input"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-neutral-200 dark:border-neutral-800 pl-0 sm:pl-2">
            {/* Assignee select containing all current room participants */}
            <select
              value={selectedAssignee}
              onChange={e => setSelectedAssignee(e.target.value)}
              className="bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 font-medium rounded px-2 py-1.5 border border-neutral-200 dark:border-neutral-700 focus:outline-none cursor-pointer"
              id="assignee-select"
            >
              <option value={currentUser.id}>Assign: You ({currentUser.name})</option>
              {participants.filter(p => p.id !== currentUser.id).map(p => (
                <option key={p.id} value={p.id}>
                  Assign: {p.name}
                </option>
              ))}
            </select>

            {/* Estimated Minutes */}
            <select
              value={selectedEstMinutes}
              onChange={e => setSelectedEstMinutes(Number(e.target.value))}
              className="bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 font-medium rounded px-2 py-1.5 border border-neutral-200 dark:border-neutral-700 focus:outline-none cursor-pointer font-mono"
              id="est-minutes-select"
            >
              <option value={15}>15m</option>
              <option value={25}>25m</option>
              <option value={45}>45m</option>
              <option value={60}>60m</option>
            </select>

            {/* Priority */}
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value as TaskPriority)}
              className="bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 font-medium rounded px-2 py-1.5 border border-neutral-200 dark:border-neutral-700 focus:outline-none cursor-pointer"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className={`inline-flex items-center space-x-1 rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-40 transition-all shadow-xs ${newTaskTitle ? "cursor-pointer" : "cursor-not-allowed"}`}
              id="add-task-submit-btn"
            >
              <span>Add task</span>
            </button>
          </div>

        </div>
      </form>

      {/* Task Content: Board View OR List View */}
      {filteredTasks.length > 0 ? (
        viewMode === 'board' ? (
          /* Kanban Board View with 4 status columns */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {boardColumns.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.id);

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, col.id)}
                  className="flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/30 p-3 min-h-[360px] transition-colors"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-200 dark:border-neutral-800/80">
                    <div className="flex items-center space-x-2">
                      <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        {col.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 bg-white dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task Cards in this Column */}
                  <div className="space-y-2.5 flex-1">
                    {colTasks.map(task => {
                      const assignee = participants.find(p => p.id === task.assigneeId);
                      const isRecentlyMoved = lastTaskActivity?.taskId === task.id;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={e => handleDragStart(e, task.id)}
                          className={`group relative rounded-lg border p-3 bg-white dark:bg-neutral-900 shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing ${
                            isRecentlyMoved
                              ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                          }`}
                        >
                          {/* Priority Dot + Title */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start space-x-2 flex-1">
                              <span className="mt-1">{getPriorityDot(task.priority)}</span>
                              <span
                                className={`text-xs font-medium leading-snug ${
                                  task.status === 'done'
                                    ? 'line-through text-neutral-400 dark:text-neutral-500'
                                    : 'text-neutral-900 dark:text-neutral-100'
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>

                            <button
                              onClick={() => deleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 p-0.5 transition-opacity"
                              title="Delete task"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Last Moved By Badge */}
                          {task.lastMovedBy && (
                            <div className="mt-2 text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center space-x-1 font-medium">
                              <span>• Moved by {task.lastMovedBy}</span>
                            </div>
                          )}

                          {/* Meta: Assignee + Time + Move Actions */}
                          <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                            <div className="flex items-center space-x-2">
                              {assignee ? (
                                <div className="flex items-center space-x-1" title={`Assigned to ${assignee.name}`}>
                                  <img
                                    src={assignee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}&background=6366f1&color=fff`}
                                    alt={assignee.name}
                                    className="h-4 w-4 rounded-full object-cover"
                                  />
                                  <span className="text-[10px] text-neutral-600 dark:text-neutral-400 truncate max-w-[70px]">
                                    {assignee.name.split(' ')[0]}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-neutral-400">Unassigned</span>
                              )}

                              {task.estimatedMinutes && (
                                <span className="font-mono text-[10px]">
                                  {task.estimatedMinutes}m
                                </span>
                              )}
                            </div>

                            {/* Quick Move Dropdown */}
                            <select
                              value={task.status}
                              onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                              className="text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 cursor-pointer focus:outline-none"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="blocked">Blocked</option>
                              <option value="done">Completed</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}

                    {colTasks.length === 0 && (
                      <div className="h-24 flex items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800/80 rounded-lg text-[11px] text-neutral-400">
                        Drag tasks here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {filteredTasks.map(task => {
              const assignee = participants.find(p => p.id === task.assigneeId);
              const isDone = task.status === 'done';
              const isRecentlyMoved = lastTaskActivity?.taskId === task.id;

              return (
                <div
                  key={task.id}
                  className={`group flex items-start sm:items-center justify-between p-3.5 sm:p-4 rounded-md border transition-all duration-200 ${
                    isRecentlyMoved
                      ? 'ring-2 ring-indigo-500/30 border-indigo-400 dark:border-indigo-500'
                      : isDone
                      ? 'border-neutral-200/50 dark:border-neutral-800/40 bg-neutral-50/30 dark:bg-neutral-900/20 opacity-60'
                      : 'border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs'
                  }`}
                  id={`task-row-${task.id}`}
                >
                  {/* Left: Checkbox + Title + Meta */}
                  <div className="flex items-start sm:items-center space-x-3.5 flex-1 min-w-0 pr-4">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`mt-0.5 sm:mt-0 flex-shrink-0 flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer ${
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

                      {task.lastMovedBy && (
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                          Moved by {task.lastMovedBy}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Status badge, Est Time, Assignee Avatar, Actions */}
                  <div className="flex items-center space-x-3 flex-shrink-0 pt-1 sm:pt-0">
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                      className="bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 font-medium px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 cursor-pointer focus:outline-none"
                      id={`task-status-select-${task.id}`}
                    >
                      <option value="todo">To do</option>
                      <option value="in_progress">In progress</option>
                      <option value="blocked">Blocked</option>
                      <option value="done">Completed</option>
                    </select>

                    {task.estimatedMinutes && (
                      <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                        <Clock className="h-3 w-3" />
                        <span>{task.estimatedMinutes}m</span>
                      </span>
                    )}

                    {assignee ? (
                      <div className="flex items-center space-x-1" title={`Assigned to ${assignee.name}`}>
                        <img
                          src={assignee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}&background=6366f1&color=fff`}
                          alt={assignee.name}
                          className="h-5 w-5 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                        />
                      </div>
                    ) : (
                      <span className="h-5 w-5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-[10px] text-neutral-400">
                        ?
                      </span>
                    )}

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 p-1 rounded transition-opacity cursor-pointer"
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
        )
      ) : (
        /* Clean Empty State */
        <div className="my-12 flex flex-col items-center justify-center text-center p-8 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
          <svg className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            No focus tasks yet
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
            Add a task above. When anyone moves or completes it, all connected devices will update in real time.
          </p>
        </div>
      )}

    </main>
  );
};
