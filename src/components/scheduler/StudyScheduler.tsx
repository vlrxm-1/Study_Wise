import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  Wand2,
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  Play,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { StudySession, Subject, Task, Priority } from '../../types';

interface StudySchedulerProps {
  sessions: StudySession[];
  subjects: Subject[];
  tasks: Task[];
  onAddSession: (session: Omit<StudySession, 'id'>) => void;
  onUpdateSession: (session: StudySession) => void;
  onDeleteSession: (sessionId: string) => void;
  onStartSessionTimer: (session: StudySession) => void;
  onGenerateSmartSchedule: (newSessions: Omit<StudySession, 'id'>[]) => void;
}

export const StudyScheduler: React.FC<StudySchedulerProps> = ({
  sessions,
  subjects,
  tasks,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
  onStartSessionTimer,
  onGenerateSmartSchedule
}) => {
  const [selectedDateFilter, setSelectedDateFilter] = useState<'today' | 'tomorrow' | 'week' | 'all'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Manual Session Form state
  const [formData, setFormData] = useState({
    subject: subjects[0]?.name || 'General Chemistry',
    topic: '',
    date: todayStr,
    startTime: '15:00',
    duration: 50,
    priority: 'Medium' as Priority,
    status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'missed',
    technique: 'Pomodoro',
    notes: ''
  });

  // Generator settings
  const [generatorConfig, setGeneratorConfig] = useState({
    targetDate: todayStr,
    startHour: '14:00',
    availableHours: 4,
    breakIntervalMinutes: 10,
    preferredTechnique: 'Pomodoro'
  });

  const handleOpenAdd = (date?: string) => {
    setEditingSession(null);
    setFormData({
      subject: subjects[0]?.name || 'General Chemistry',
      topic: '',
      date: date || todayStr,
      startTime: '16:00',
      duration: 50,
      priority: 'Medium',
      status: 'scheduled',
      technique: 'Pomodoro',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (session: StudySession) => {
    setEditingSession(session);
    setFormData({
      subject: session.subject,
      topic: session.topic,
      date: session.date,
      startTime: session.startTime,
      duration: session.duration,
      priority: session.priority,
      status: session.status,
      technique: session.technique || 'Pomodoro',
      notes: session.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;

    if (editingSession) {
      onUpdateSession({
        ...editingSession,
        ...formData
      });
    } else {
      onAddSession(formData);
    }
    setIsModalOpen(false);
  };

  // Smart Schedule Generator: Automatically maps pending tasks to conflict-free time slots with breaks
  const runScheduleGenerator = () => {
    const pendingTasks = tasks
      .filter(t => t.status !== 'completed')
      .sort((a, b) => {
        const pScore: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };
        return pScore[b.priority] - pScore[a.priority] || new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });

    if (pendingTasks.length === 0) {
      alert('You have no pending tasks to schedule! Create or uncomplete tasks first.');
      return;
    }

    const [startH, startM] = generatorConfig.startHour.split(':').map(Number);
    let currentTotalMinutes = startH * 60 + startM;
    const maxMinutes = currentTotalMinutes + (generatorConfig.availableHours * 60);

    const generated: Omit<StudySession, 'id'>[] = [];

    for (const task of pendingTasks) {
      // Allocate study session (e.g. 45 or 50 mins chunk)
      const sessionDuration = Math.min(task.estimatedDuration || 50, 60);

      if (currentTotalMinutes + sessionDuration > maxMinutes) {
        break; // exceed available window
      }

      const sessionH = Math.floor(currentTotalMinutes / 60);
      const sessionM = currentTotalMinutes % 60;
      const timeStr = `${String(sessionH).padStart(2, '0')}:${String(sessionM).padStart(2, '0')}`;

      generated.push({
        subject: task.subject,
        topic: `Work on: ${task.title}`,
        date: generatorConfig.targetDate,
        startTime: timeStr,
        duration: sessionDuration,
        priority: task.priority,
        status: 'scheduled',
        taskId: task.id,
        technique: generatorConfig.preferredTechnique,
        notes: `Auto-generated schedule slot with ${generatorConfig.breakIntervalMinutes}m buffer break.`
      });

      // advance by session duration + break buffer
      currentTotalMinutes += sessionDuration + generatorConfig.breakIntervalMinutes;
    }

    if (generated.length > 0) {
      onGenerateSmartSchedule(generated);
      setIsGeneratorOpen(false);
    }
  };

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    if (selectedDateFilter === 'today') return s.date === todayStr;
    if (selectedDateFilter === 'tomorrow') return s.date === tomorrowStr;
    if (selectedDateFilter === 'week') {
      const now = new Date();
      const sessionDate = new Date(s.date);
      const diffTime = sessionDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= -1 && diffDays <= 7;
    }
    return true;
  }).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Study Session Scheduler</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize study blocks, prevent cognitive overload, and auto-balance with buffer breaks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200/80"
          >
            <Wand2 className="w-4 h-4 text-indigo-600" />
            <span>Generate Schedule</span>
          </button>
          <button
            onClick={() => handleOpenAdd()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* Date Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setSelectedDateFilter('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedDateFilter === 'today'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today ({sessions.filter(s => s.date === todayStr).length})
          </button>
          <button
            onClick={() => setSelectedDateFilter('tomorrow')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedDateFilter === 'tomorrow'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tomorrow ({sessions.filter(s => s.date === tomorrowStr).length})
          </button>
          <button
            onClick={() => setSelectedDateFilter('week')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedDateFilter === 'week'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Next 7 Days
          </button>
          <button
            onClick={() => setSelectedDateFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedDateFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Sessions ({sessions.length})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-bold">{filteredSessions.length}</span> planned sessions
        </div>
      </div>

      {/* Sessions Timeline List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs">
            <CalendarClock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No scheduled sessions for this period</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Plan out focused study intervals to maintain momentum, or use the auto-generator to allocate your pending assignments.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
              >
                Auto-Generate from Tasks
              </button>
              <button
                onClick={() => handleOpenAdd()}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Schedule Manually
              </button>
            </div>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isDone = session.status === 'completed';
            const isToday = session.date === todayStr;

            return (
              <div
                key={session.id}
                className={`group bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                  isDone
                    ? 'border-slate-200/60 bg-slate-50/50 opacity-75'
                    : isToday
                    ? 'border-indigo-200 shadow-xs'
                    : 'border-slate-200/90 shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Time & Topic */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Time Pill */}
                    <div className="shrink-0 text-center w-16 py-1.5 px-2 bg-slate-50 border border-slate-200/80 rounded-xl">
                      <span className="text-xs font-bold font-mono text-indigo-700 tabular-nums block">
                        {session.startTime}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono tabular-nums block">
                        {session.duration}m
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold tracking-tight ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {session.topic}
                        </span>
                        <span className={`text-[11px] font-semibold ${
                          session.priority === 'High' ? 'text-rose-600' : session.priority === 'Medium' ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {session.priority} Priority
                        </span>
                        {session.technique && (
                          <span className="text-[11px] text-indigo-600 font-medium">
                            · {session.technique}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap">
                        <span className="font-medium text-slate-700">{session.subject}</span>
                        <span aria-hidden="true">·</span>
                        <div className="flex items-center gap-1 font-mono tabular-nums">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{session.date}</span>
                        </div>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{session.status}</span>
                      </div>

                      {session.notes && (
                        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                          {session.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!isDone && (
                      <button
                        onClick={() => onStartSessionTimer(session)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        onUpdateSession({
                          ...session,
                          status: isDone ? 'scheduled' : 'completed'
                        })
                      }
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title={isDone ? 'Mark as scheduled' : 'Mark as completed'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleEdit(session)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit session"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete session"
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

      {/* Add / Edit Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {editingSession ? 'Edit Study Session' : 'Schedule Study Session'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  Topic / Goal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hess's Law & Enthalpy Drills"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono tabular-nums focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono tabular-nums focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="240"
                    step="5"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono tabular-nums focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Study Technique
                  </label>
                  <select
                    value={formData.technique}
                    onChange={(e) => setFormData({ ...formData, technique: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Pomodoro">Pomodoro Technique</option>
                    <option value="Visual Timer">Visual Timer (Ice/Candle)</option>
                    <option value="Active Recall">Active Recall Flashcards</option>
                    <option value="Feynman Technique">Feynman Technique</option>
                    <option value="Blurting Method">Blurting Method</option>
                    <option value="Interleaved Practice">Interleaved Practice</option>
                    <option value="Retrieval Practice">Retrieval Practice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Complete problems 1-10 before break"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingSession ? 'Save Changes' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Schedule Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsGeneratorOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Auto-Generate Study Schedule</h2>
                  <p className="text-[11px] text-slate-500">Maps pending tasks into balanced slots with breaks</p>
                </div>
              </div>
              <button onClick={() => setIsGeneratorOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-800 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  StudyWise will inspect your pending tasks, prioritize by urgency and weight, and allocate conflict-free study sessions separated by healthy buffer breaks.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={generatorConfig.targetDate}
                    onChange={(e) => setGeneratorConfig({ ...generatorConfig, targetDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={generatorConfig.startHour}
                    onChange={(e) => setGeneratorConfig({ ...generatorConfig, startHour: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Available Study Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={generatorConfig.availableHours}
                    onChange={(e) => setGeneratorConfig({ ...generatorConfig, availableHours: parseFloat(e.target.value) || 3 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buffer Break Between Blocks
                  </label>
                  <select
                    value={generatorConfig.breakIntervalMinutes}
                    onChange={(e) => setGeneratorConfig({ ...generatorConfig, breakIntervalMinutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value={5}>5-minute quick break</option>
                    <option value={10}>10-minute restorative break (Recommended)</option>
                    <option value={15}>15-minute cognitive recharge</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Technique
                </label>
                <select
                  value={generatorConfig.preferredTechnique}
                  onChange={(e) => setGeneratorConfig({ ...generatorConfig, preferredTechnique: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="Pomodoro">Pomodoro Technique (25m/5m cycles)</option>
                  <option value="Visual Timer">Visual Timer (Melting Ice / Candle)</option>
                  <option value="Active Recall">Active Recall Drills</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={runScheduleGenerator}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Sessions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
