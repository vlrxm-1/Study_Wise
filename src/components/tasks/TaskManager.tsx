import React, { useState } from 'react';
import {
  Plus,
  Search,
  Check,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  AlertCircle,
  Play,
  CalendarPlus,
  Filter,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { Task, Subject, Priority, TaskStatus } from '../../types';

interface TaskManagerProps {
  tasks: Task[];
  subjects: Subject[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onStartTimerForTask: (task: Task) => void;
  onScheduleTask: (task: Task) => void;
  isAddModalOpen?: boolean;
  setIsAddModalOpen?: (open: boolean) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  subjects,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onStartTimerForTask,
  onScheduleTask,
  isAddModalOpen: externalIsAddModalOpen,
  setIsAddModalOpen: externalSetIsAddModalOpen
}) => {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isModalOpen = externalIsAddModalOpen !== undefined ? externalIsAddModalOpen : internalModalOpen;
  const setModalOpen = externalSetIsAddModalOpen !== undefined ? externalSetIsAddModalOpen : setInternalModalOpen;

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'duration'>('deadline');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    subject: subjects[0]?.name || 'General Chemistry',
    deadline: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    priority: 'Medium' as Priority,
    estimatedDuration: 60,
    status: 'pending' as TaskStatus,
    notes: ''
  });

  const now = new Date();

  // Helper to open modal for editing
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      subject: task.subject,
      deadline: task.deadline,
      priority: task.priority,
      estimatedDuration: task.estimatedDuration,
      status: task.status,
      notes: task.notes || ''
    });
    setModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      subject: subjects[0]?.name || 'General Chemistry',
      deadline: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      priority: 'Medium',
      estimatedDuration: 60,
      status: 'pending',
      notes: ''
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        ...formData
      });
    } else {
      onAddTask(formData);
    }
    setModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (subjectFilter !== 'all' && t.subject !== subjectFilter) {
      return false;
    }

    const isOverdue = new Date(t.deadline) < now && t.status !== 'completed';

    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return t.status === 'pending';
    if (statusFilter === 'in_progress') return t.status === 'in_progress';
    if (statusFilter === 'completed') return t.status === 'completed';
    if (statusFilter === 'overdue') return isOverdue;

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sortBy === 'priority') {
      const priorityMap: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    }
    if (sortBy === 'duration') {
      return b.estimatedDuration - a.estimatedDuration;
    }
    return 0;
  });

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = tasks.filter(t => new Date(t.deadline) < now && t.status !== 'completed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Task Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track assignments, laboratory reports, problem sets, and exam preparations.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === 'in_progress'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress ({tasks.filter(t => t.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({completedCount})
            </button>
            {overdueCount > 0 && (
              <button
                onClick={() => setStatusFilter('overdue')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === 'overdue'
                    ? 'bg-rose-50 text-rose-700 shadow-xs font-semibold'
                    : 'text-rose-600 hover:text-rose-700'
                }`}
              >
                Overdue ({overdueCount})
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Secondary filters: Subject & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Subject:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'deadline' | 'priority' | 'duration')}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="deadline">Deadline (Earliest)</option>
              <option value="priority">Priority (High to Low)</option>
              <option value="duration">Estimated Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No tasks found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || subjectFilter !== 'all'
                ? 'Try adjusting your filters or search keywords to see other tasks.'
                : 'All caught up! Add a new task to organize your study workload.'}
            </p>
            <button
              onClick={handleOpenNew}
              className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              Create New Task
            </button>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const deadlineDate = new Date(task.deadline);
            const isOverdue = deadlineDate < now && !isCompleted;

            return (
              <div
                key={task.id}
                className={`group bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                  isCompleted
                    ? 'border-slate-200/60 bg-slate-50/50 opacity-75'
                    : isOverdue
                    ? 'border-rose-200/90 shadow-xs hover:border-rose-300'
                    : 'border-slate-200/90 shadow-xs hover:border-indigo-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Completion Checkbox + Title + Metadata */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleComplete(task.id)}
                      className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-indigo-600 text-transparent hover:text-slate-300'
                      }`}
                      title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold tracking-tight ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}>
                          {task.title}
                        </span>

                        {/* Priority label */}
                        <span className={`text-[11px] font-semibold ${
                          task.priority === 'High'
                            ? 'text-rose-600'
                            : task.priority === 'Medium'
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}>
                          {task.priority} Priority
                        </span>

                        {/* Status tag */}
                        <span className="text-[11px] text-slate-500 font-medium">
                          · {task.status === 'in_progress' ? 'In Progress' : task.status}
                        </span>
                      </div>

                      {/* Unboxed Metadata row */}
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap">
                        <span className="font-medium text-slate-700">{task.subject}</span>
                        <span aria-hidden="true">·</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600 font-mono tabular-nums'}>
                            {deadlineDate.toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <span aria-hidden="true">·</span>
                        <div className="flex items-center gap-1 font-mono tabular-nums">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{task.estimatedDuration} mins</span>
                        </div>
                      </div>

                      {task.notes && (
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-2 border border-slate-100">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                    {!isCompleted && (
                      <>
                        <button
                          onClick={() => onStartTimerForTask(task)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
                          title="Start study timer for this task"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Timer</span>
                        </button>

                        <button
                          onClick={() => onScheduleTask(task)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                          title="Add to study schedule"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Schedule</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleEditClick(task)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {editingTask ? 'Edit Task' : 'Add New Academic Task'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Report: Acid-Base Titration"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deadline (Date & Time) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono tabular-nums focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    step="5"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono tabular-nums focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {[30, 45, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setFormData({ ...formData, estimatedDuration: mins })}
                        className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded text-slate-600 tabular-nums"
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Chapter sections, reference materials, formatting requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
