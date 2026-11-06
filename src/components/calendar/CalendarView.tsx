import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  BookOpen,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Task, StudySession, Subject } from '../../types';

interface CalendarViewProps {
  tasks: Task[];
  sessions: StudySession[];
  subjects: Subject[];
  onAddTaskForDate: (dateStr: string) => void;
  onAddSessionForDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  sessions,
  subjects,
  onAddTaskForDate,
  onAddSessionForDate
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(new Date().toISOString().split('T')[0]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayStr(today.toISOString().split('T')[0]);
  };

  // Month grid calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create calendar cells (previous month trailing days, current days, next month leading days)
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const calendarDays = [];

  // Previous month trailing
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, d);
    calendarDays.push({
      dateStr: dateObj.toISOString().split('T')[0],
      dayNumber: d,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    calendarDays.push({
      dateStr: dateObj.toISOString().split('T')[0],
      dayNumber: d,
      isCurrentMonth: true
    });
  }

  // Next month leading to complete 35 or 42 cells
  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells && calendarDays.length < 35; d++) {
    const dateObj = new Date(year, month + 1, d);
    calendarDays.push({
      dateStr: dateObj.toISOString().split('T')[0],
      dayNumber: d,
      isCurrentMonth: false
    });
  }

  // Week view calculation: 7 days around current week
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayNumber: d.getDate(),
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
      isToday: d.toISOString().split('T')[0] === todayStr
    };
  });

  // Events on selected day
  const selectedDayTasks = tasks.filter((t) => t.deadline.startsWith(selectedDayStr));
  const selectedDaySessions = sessions.filter((s) => s.date === selectedDayStr);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Calendar</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized schedule of deadlines, examinations, and planned study sessions.
          </p>
        </div>

        {/* View mode toggle & month controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={handlePrev}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-column layout: Calendar Grid + Selected Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Exams / High</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>Tasks</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Study Sessions</span>
              </span>
            </div>
          </div>

          {viewMode === 'month' ? (
            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="bg-slate-50 py-2 text-center text-xs font-semibold text-slate-500">
                  {d}
                </div>
              ))}

              {calendarDays.map((cell, idx) => {
                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDayStr;

                const dayTasks = tasks.filter((t) => t.deadline.startsWith(cell.dateStr));
                const daySessions = sessions.filter((s) => s.date === cell.dateStr);

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDayStr(cell.dateStr)}
                    className={`min-h-[82px] sm:min-h-[96px] p-1.5 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/70 ring-2 ring-indigo-500 ring-inset'
                        : isToday
                        ? 'bg-indigo-50/30'
                        : cell.isCurrentMonth
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-slate-50/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-medium rounded-md w-6 h-6 flex items-center justify-center tabular-nums ${
                          isToday
                            ? 'bg-indigo-600 text-white font-bold'
                            : isSelected
                            ? 'text-indigo-700 font-bold'
                            : cell.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                    </div>

                    {/* Micro event indicators */}
                    <div className="space-y-1 mt-1">
                      {dayTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={`text-[10px] px-1 py-0.5 rounded truncate font-medium ${
                            t.priority === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {t.title}
                        </div>
                      ))}
                      {daySessions.slice(0, 1).map((s) => (
                        <div
                          key={s.id}
                          className="text-[10px] px-1 py-0.5 rounded truncate font-medium bg-indigo-100 text-indigo-800"
                        >
                          {s.startTime} {s.topic}
                        </div>
                      ))}
                      {dayTasks.length + daySessions.length > 3 && (
                        <span className="text-[9px] text-slate-400 block font-mono pl-1">
                          +{dayTasks.length + daySessions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Week View */
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const isSelected = day.dateStr === selectedDayStr;
                const dayTasks = tasks.filter((t) => t.deadline.startsWith(day.dateStr));
                const daySessions = sessions.filter((s) => s.date === day.dateStr);

                return (
                  <div
                    key={day.dateStr}
                    onClick={() => setSelectedDayStr(day.dateStr)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col min-h-[300px] ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/40 shadow-xs'
                        : day.isToday
                        ? 'border-indigo-300 bg-white'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-center pb-2 border-b border-slate-100">
                      <span className="text-[11px] font-medium text-slate-500 block">{day.dayName}</span>
                      <span
                        className={`inline-block mt-0.5 text-sm font-mono font-bold w-7 h-7 leading-7 rounded-full tabular-nums ${
                          day.isToday ? 'bg-indigo-600 text-white' : 'text-slate-800'
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                    </div>

                    <div className="flex-1 mt-2 space-y-1.5 overflow-y-auto">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          className={`p-1.5 rounded-lg text-[11px] font-medium leading-tight ${
                            t.priority === 'High' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-sky-50 text-sky-800 border border-sky-200'
                          }`}
                        >
                          <p className="font-semibold line-clamp-1">{t.title}</p>
                          <p className="text-[10px] text-slate-500">{t.subject}</p>
                        </div>
                      ))}

                      {daySessions.map((s) => (
                        <div
                          key={s.id}
                          className="p-1.5 rounded-lg text-[11px] font-medium leading-tight bg-indigo-50 text-indigo-800 border border-indigo-200"
                        >
                          <p className="font-semibold line-clamp-1">{s.topic}</p>
                          <p className="text-[10px] text-indigo-600 font-mono tabular-nums">{s.startTime} ({s.duration}m)</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Day Inspector (1 col on lg) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {new Date(selectedDayStr + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </h3>
                <p className="text-xs text-slate-500">Day details & scheduled events</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onAddTaskForDate(selectedDayStr)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors text-xs font-semibold"
                  title="Add Task for this date"
                >
                  + Task
                </button>
                <button
                  onClick={() => onAddSessionForDate(selectedDayStr)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors text-xs font-semibold"
                  title="Schedule Study for this date"
                >
                  + Session
                </button>
              </div>
            </div>

            {/* List of items on this day */}
            <div className="mt-4 space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {/* Tasks due */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Tasks Due ({selectedDayTasks.length})
                </h4>
                {selectedDayTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No tasks due on this date.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 line-clamp-1">{t.title}</span>
                          <span className={`text-[10px] font-semibold ${
                            t.priority === 'High' ? 'text-rose-600' : 'text-slate-500'
                          }`}>
                            {t.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{t.subject}</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">{t.estimatedDuration}m</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Study sessions */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Study Sessions ({selectedDaySessions.length})
                </h4>
                {selectedDaySessions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No study sessions scheduled for this date.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDaySessions.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 line-clamp-1">{s.topic}</span>
                          <span className="text-xs font-mono font-bold text-indigo-700 tabular-nums">{s.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{s.subject}</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">{s.duration} mins</span>
                          {s.technique && (
                            <>
                              <span>·</span>
                              <span className="text-indigo-600">{s.technique}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => onAddTaskForDate(selectedDayStr)}
              className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Add Task
            </button>
            <button
              onClick={() => onAddSessionForDate(selectedDayStr)}
              className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              Schedule Study
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
