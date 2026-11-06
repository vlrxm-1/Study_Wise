import React from 'react';
import { Menu, Play, Calendar, Sparkles } from 'lucide-react';
import { PageId } from '../../types';

interface HeaderProps {
  currentPage: PageId;
  onOpenMobileMenu: () => void;
  onQuickStartStudy: () => void;
  todayDateStr: string;
}

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview & Academic Pulse' },
  tasks: { title: 'Task Manager', subtitle: 'Organize, Prioritize & Execute' },
  scheduler: { title: 'Study Scheduler', subtitle: 'Plan Conflict-Free Sessions' },
  calendar: { title: 'Academic Calendar', subtitle: 'Deadlines, Exams & Blocks' },
  tools: { title: 'Study Techniques & Timers', subtitle: 'Evidence-Based Learning Hub' },
  analytics: { title: 'Study Analytics & Workload', subtitle: 'Habit Metrics & Workload Balance' },
  settings: { title: 'Settings & Preferences', subtitle: 'Profile & App Customization' },
};

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onOpenMobileMenu,
  onQuickStartStudy,
  todayDateStr
}) => {
  const pageInfo = PAGE_TITLES[currentPage] || { title: 'StudyWise', subtitle: 'Academic Productivity' };

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: mobile toggle + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>StudyWise</span>
              <span aria-hidden="true">/</span>
              <span className="text-indigo-600 font-semibold">{pageInfo.title}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight hidden sm:block">
              {pageInfo.subtitle}
            </h2>
          </div>
        </div>

        {/* Right: Date & Quick Start Study Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>{todayDateStr}</span>
          </div>

          <button
            onClick={onQuickStartStudy}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Study Now</span>
          </button>
        </div>
      </div>
    </header>
  );
};
