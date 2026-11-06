import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Flame,
  Brain,
  Hourglass,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Check,
  Plus
} from 'lucide-react';
import { Task, StudySession, StudyLog, UserProfile, PageId, StudyToolId } from '../../types';

interface DashboardProps {
  profile: UserProfile;
  tasks: Task[];
  sessions: StudySession[];
  logs: StudyLog[];
  onNavigate: (page: PageId) => void;
  onOpenTool: (toolId: StudyToolId) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onOpenAddTaskModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  tasks,
  sessions,
  logs,
  onNavigate,
  onOpenTool,
  onToggleTaskComplete,
  onOpenAddTaskModal
}) => {
  // Current date & greeting
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Metrics
  const totalStudyMinutes = logs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalHours = (totalStudyMinutes / 60).toFixed(1);

  // Today study minutes
  const todayLogs = logs.filter(l => l.timestamp.startsWith(todayStr));
  const todayMinutes = todayLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const goalMinutes = profile.dailyStudyGoalMinutes || 180;
  const goalPercent = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  // Completed & pending tasks
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  // Upcoming deadlines (next 4 days)
  const upcomingTasks = pendingTasks
    .slice()
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  // Today's scheduled sessions
  const todaySessions = sessions.filter(s => s.date === todayStr);

  // Weekly study data for the last 7 days
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayLogs = logs.filter(l => l.timestamp.startsWith(dStr));
    const dayMins = dayLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
    return {
      dayName: daysOfWeek[d.getDay()],
      dateStr: dStr,
      isToday: dStr === todayStr,
      hours: Math.round((dayMins / 60) * 10) / 10
    };
  });

  const maxWeeklyHours = Math.max(4, ...last7Days.map(d => d.hours));

  // Study streak calculation
  let currentStreak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const hasLog = logs.some(l => l.timestamp.startsWith(dStr));
    if (hasLog) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white p-6 sm:p-8 shadow-sm">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-8 w-40 h-40 bg-violet-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{profile.academicLevel}</span>
              <span>·</span>
              <span>{profile.strandOrMajor}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {greeting}, {profile.name}!
            </h1>
            <p className="text-indigo-100 text-sm max-w-xl font-normal leading-relaxed">
              "Continuous effort, not strength or intelligence, is the key to unlocking your academic potential."
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenTool('pomodoro')}
              className="px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Hourglass className="w-4 h-4 text-indigo-600" />
              <span>Open Study Timer</span>
            </button>
            <button
              onClick={() => onNavigate('scheduler')}
              className="px-4 py-2.5 bg-indigo-700/80 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl border border-indigo-400/40 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Study Hours */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Study Time</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{totalHours}</span>
            <span className="text-xs text-slate-500">hours</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Across all study techniques</p>
        </div>

        {/* Metric 2: Completed Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{completedTasks.length}</span>
            <span className="text-xs text-slate-500">/ {tasks.length} total</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{pendingTasks.length} remaining to finish</p>
        </div>

        {/* Metric 3: Upcoming Deadlines */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Deadlines</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{upcomingTasks.length}</span>
            <span className="text-xs text-slate-500">due soon</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Priority assignments & exams</p>
        </div>

        {/* Metric 4: Daily Goal & Streak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-violet-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Goal</span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Flame className="w-4 h-4 text-violet-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{goalPercent}%</span>
            <span className="text-xs text-slate-500">({Math.round(todayMinutes)} / {goalMinutes}m)</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Activity Chart & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart (2 columns on lg) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Weekly Study Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Hours spent per day over the last 7 days</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clean SVG Bar Chart with subtle grid */}
          <div className="h-56 w-full flex items-end gap-3 sm:gap-6 pt-4 pb-2 px-2 border-b border-slate-100">
            {last7Days.map((item, idx) => {
              const heightPercent = maxWeeklyHours > 0 ? (item.hours / maxWeeklyHours) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 px-2 py-1 bg-slate-800 text-white text-[11px] font-medium rounded-md pointer-events-none whitespace-nowrap tabular-nums shadow-sm">
                    {item.hours}h ({Math.round(item.hours * 60)}m)
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end h-40">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        item.isToday
                          ? 'bg-gradient-to-t from-indigo-600 to-violet-500'
                          : 'bg-indigo-200/90 group-hover:bg-indigo-300'
                      }`}
                      style={{ height: `${Math.max(6, heightPercent)}%` }}
                    />
                  </div>

                  {/* Day label */}
                  <div className="mt-3 text-center">
                    <span className={`text-xs font-medium block ${item.isToday ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
                      {item.dayName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono tabular-nums block">
                      {item.hours}h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-gradient-to-t from-indigo-600 to-violet-500" />
              <span>Today</span>
              <span className="w-3 h-3 rounded-md bg-indigo-200 ml-2" />
              <span>Past Days</span>
            </div>
            <span className="font-medium text-slate-600 tabular-nums">Daily Target: {(goalMinutes / 60).toFixed(1)}h</span>
          </div>
        </div>

        {/* Upcoming Deadlines (1 column on lg) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Upcoming Deadlines</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tasks needing immediate attention</p>
            </div>
            <button
              onClick={onOpenAddTaskModal}
              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Add Task"
              aria-label="Add Task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No upcoming deadlines! Great job staying ahead.
              </div>
            ) : (
              upcomingTasks.map((t) => {
                const deadlineDate = new Date(t.deadline);
                const isOverdue = deadlineDate < today;
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-white transition-all flex items-start gap-3"
                  >
                    <button
                      onClick={() => onToggleTaskComplete(t.id)}
                      className="mt-0.5 w-5 h-5 rounded-md border border-slate-300 hover:border-indigo-600 flex items-center justify-center text-transparent hover:text-slate-400 transition-colors shrink-0"
                      title="Mark task completed"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="truncate">{t.subject}</span>
                        <span>·</span>
                        <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600 font-mono tabular-nums'}>
                          {deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span>·</span>
                        <span className={`font-medium ${
                          t.priority === 'High' ? 'text-rose-600' : t.priority === 'Medium' ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={() => onNavigate('tasks')}
            className="mt-4 w-full py-2 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/60 hover:bg-indigo-50 rounded-xl transition-colors"
          >
            Manage All Tasks ({tasks.length})
          </button>
        </div>
      </div>

      {/* Today's Scheduled Sessions & Quick Access to Study Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Schedule</h2>
              <p className="text-xs text-slate-500 mt-0.5">{todaySessions.length} session(s) planned for today</p>
            </div>
            <button
              onClick={() => onNavigate('scheduler')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todaySessions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No sessions scheduled for today. Use the Scheduler to plan study blocks.
              </div>
            ) : (
              todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{session.topic}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{session.subject}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-indigo-600 tabular-nums">{session.startTime}</span>
                    <span className="text-[11px] text-slate-400 block tabular-nums">{session.duration} mins</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Access to Evidence-Based Study Tools */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Study Techniques & Tools</h2>
              <p className="text-xs text-slate-500 mt-0.5">Quick access to proven learning methods</p>
            </div>
            <button
              onClick={() => onNavigate('tools')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Tool 1: Pomodoro & Visual Timer */}
            <button
              onClick={() => onOpenTool('pomodoro')}
              className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/40 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Hourglass className="w-4 h-4" />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Visual & Pomodoro Timer
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">Melting ice & candle visual countdowns</p>
            </button>

            {/* Tool 2: Active Recall */}
            <button
              onClick={() => onOpenTool('active-recall')}
              className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/40 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Active Recall Flashcards
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">Spaced repetition deck drills</p>
            </button>

            {/* Tool 3: Feynman Technique */}
            <button
              onClick={() => onOpenTool('feynman')}
              className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/40 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Feynman Technique
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">Explain concepts in simple terms</p>
            </button>

            {/* Tool 4: Blurting Method */}
            <button
              onClick={() => onOpenTool('blurting')}
              className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/40 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Blurting Method
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">Timed memory braindump challenge</p>
            </button>

            {/* Tool 5: Leitner Box */}
            <button
              onClick={() => onOpenTool('leitner')}
              className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/40 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Leitner 5-Box System
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">Systematic mastery progression</p>
            </button>

            {/* Tool 6: Interleaved Practice */}
            <button
              onClick={() => onOpenTool('interleaved')}
              className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/40 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Interleaved Practice
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">Alternate topics to boost retention</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
