import React, { useState } from 'react';
import {
  BarChart3,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
  Brain,
  ShieldAlert
} from 'lucide-react';
import { StudyLog, Task, StudySession, UserProfile, Subject } from '../../types';

interface AnalyticsViewProps {
  logs: StudyLog[];
  tasks: Task[];
  sessions: StudySession[];
  profile: UserProfile;
  subjects: Subject[];
  onNavigateToScheduler: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  logs,
  tasks,
  sessions,
  profile,
  subjects,
  onNavigateToScheduler
}) => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('7days');

  // Total study minutes calculation
  const totalMinutes = logs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Completed tasks count
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Study hours by subject
  const subjectHoursMap: Record<string, number> = {};
  logs.forEach((log) => {
    const sub = log.subject || 'Other';
    subjectHoursMap[sub] = (subjectHoursMap[sub] || 0) + log.durationMinutes / 60;
  });

  const subjectStats = Object.entries(subjectHoursMap)
    .map(([name, hours]) => ({
      name,
      hours: Math.round(hours * 10) / 10,
      percent: totalMinutes > 0 ? Math.round(((hours * 60) / totalMinutes) * 100) : 0
    }))
    .sort((a, b) => b.hours - a.hours);

  // Study hours by technique
  const techniqueMap: Record<string, number> = {};
  logs.forEach((log) => {
    const tech = log.technique || 'Pomodoro Timer';
    techniqueMap[tech] = (techniqueMap[tech] || 0) + log.durationMinutes;
  });

  const techniqueStats = Object.entries(techniqueMap)
    .map(([tech, mins]) => ({
      tech,
      hours: Math.round((mins / 60) * 10) / 10,
      percent: totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0
    }))
    .sort((a, b) => b.hours - a.hours);

  // Consistency & Streak
  let streakDays = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const hasLog = logs.some(l => l.timestamp.startsWith(dStr));
    if (hasLog) {
      streakDays++;
    } else if (i > 0) {
      break;
    }
  }

  // --- ACADEMIC WORKLOAD ANALYZER ---
  // Inspect upcoming 7 days: evaluate deadline pressure + scheduled study hours
  // Daily capacity threshold: recommended <= 4.0h study or <= 2 high-priority deadlines per day
  const next7DaysWorkload = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];

    // Tasks due on this day
    const dayTasks = tasks.filter(t => t.deadline.startsWith(dateStr) && t.status !== 'completed');
    const highPriorityTasks = dayTasks.filter(t => t.priority === 'High');

    // Sessions scheduled on this day
    const daySessions = sessions.filter(s => s.date === dateStr);
    const scheduledMins = daySessions.reduce((acc, s) => acc + s.duration, 0);
    const scheduledHours = Math.round((scheduledMins / 60) * 10) / 10;

    // Estimated hours from tasks due today
    const estimatedTaskMins = dayTasks.reduce((acc, t) => acc + (t.estimatedDuration || 60), 0);
    const totalDemandedHours = Math.round(((scheduledMins + estimatedTaskMins) / 60) * 10) / 10;

    // Severity assessment:
    // Overloaded if > 4.5 hours OR >= 3 deadlines OR >= 2 high priority deadlines
    const isOverloaded = totalDemandedHours >= 4.0 || dayTasks.length >= 3 || highPriorityTasks.length >= 2;
    const isModerate = !isOverloaded && (totalDemandedHours >= 2.5 || dayTasks.length >= 2);

    return {
      dateStr,
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayName,
      dayTasks,
      scheduledHours,
      totalDemandedHours,
      isOverloaded,
      isModerate,
      highPriorityTasks
    };
  });

  const overloadedDays = next7DaysWorkload.filter(d => d.isOverloaded);
  const lighterDays = next7DaysWorkload.filter(d => !d.isOverloaded && !d.isModerate);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 6 Analytics & Workload Analysis</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Study Habits & Academic Workload Analyzer</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify cognitive overload, examine study consistency, and balance upcoming exam preparations.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              timeRange === '7days' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              timeRange === '30days' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past 30 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              timeRange === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Study Time</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">{totalHours}</span>
            <span className="text-xs text-slate-500">hours</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Recorded across {logs.length} logged sessions</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Task Completion Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-600 tabular-nums">{taskCompletionRate}%</span>
            <span className="text-xs text-slate-500">({completedTasks.length}/{tasks.length})</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Academic assignments finished</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Study Consistency Streak</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-indigo-600 tabular-nums">{streakDays}</span>
            <span className="text-xs text-slate-500">consecutive days</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Daily habit engagement</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Workload Status</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-xl font-bold ${overloadedDays.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {overloadedDays.length > 0 ? `${overloadedDays.length} Heavy Day(s)` : 'Balanced'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Upcoming 7-day academic horizon</p>
        </div>
      </div>

      {/* ACADEMIC WORKLOAD ANALYZER & REDISTRIBUTION RECOMMENDATIONS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Academic Workload Analyzer (Next 7 Days)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies congestion where task deadlines cluster, and recommends rebalancing.
            </p>
          </div>

          <button
            onClick={onNavigateToScheduler}
            className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Open Scheduler</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 7-Day Workload Bar Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {next7DaysWorkload.map((day, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                day.isOverloaded
                  ? 'border-rose-300 bg-rose-50/70'
                  : day.isModerate
                  ? 'border-amber-200 bg-amber-50/40'
                  : 'border-slate-200 bg-slate-50/60'
              }`}
            >
              <span className="text-xs font-bold text-slate-800 block truncate">{day.dayName}</span>
              <span className="text-[10px] text-slate-400 font-mono tabular-nums block">{day.dateStr.slice(5)}</span>

              <div className="mt-2.5">
                <span className={`text-base font-bold font-mono tabular-nums ${
                  day.isOverloaded ? 'text-rose-700' : day.isModerate ? 'text-amber-700' : 'text-slate-700'
                }`}>
                  {day.totalDemandedHours}h
                </span>
                <span className="text-[10px] text-slate-500 block">demand</span>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] space-y-0.5">
                <span className="block text-slate-600 tabular-nums">{day.dayTasks.length} deadline(s)</span>
                {day.isOverloaded && (
                  <span className="inline-block px-1.5 py-0.5 bg-rose-100 text-rose-800 font-bold rounded">
                    Overload
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Smart Redistribution Advisory Box */}
        {overloadedDays.length > 0 ? (
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Redistribution Recommendation:</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              You have high academic congestion on <span className="font-semibold">{overloadedDays.map(d => d.dayName).join(', ')}</span> due to overlapping deadlines and heavy study hours ({overloadedDays.map(d => `${d.totalDemandedHours}h`).join(', ')}).
            </p>
            {lighterDays.length > 0 && (
              <p className="text-xs text-amber-800 leading-relaxed">
                👉 <span className="font-semibold">Suggested Action:</span> Shift prep sessions or early draft work forward to <span className="font-bold underline">{lighterDays[0]?.dayName}</span>, which has only {lighterDays[0]?.totalDemandedHours}h currently booked. This will prevent late-night cramming and maintain cognitive clarity.
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Balanced Academic Distribution</p>
              <p className="text-emerald-700">Your upcoming assignments and study sessions are smoothly spread without danger of cognitive burnout.</p>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Breakdown: Subject Distribution & Learning Technique Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Study Time by Subject</h3>
          <div className="space-y-3">
            {subjectStats.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No logged study hours yet.</p>
            ) : (
              subjectStats.map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 truncate">{s.name}</span>
                    <span className="font-mono tabular-nums text-slate-600">{s.hours}h ({s.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Technique Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Technique Breakdown</h3>
          <div className="space-y-3">
            {techniqueStats.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No technique sessions recorded yet.</p>
            ) : (
              techniqueStats.map((t, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 truncate">{t.tech}</span>
                    <span className="font-mono tabular-nums text-slate-600">{t.hours}h ({t.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-600 rounded-full transition-all duration-500"
                      style={{ width: `${t.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
