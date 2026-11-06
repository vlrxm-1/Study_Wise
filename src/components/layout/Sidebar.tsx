import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarClock,
  CalendarDays,
  Brain,
  BarChart3,
  Settings,
  GraduationCap,
  X,
  Sparkles,
  Flame
} from 'lucide-react';
import { PageId, UserProfile } from '../../types';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  pendingTasksCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  profile: UserProfile;
  todayStudyMinutes: number;
  isSampleData: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  pendingTasksCount,
  isOpenMobile,
  onCloseMobile,
  profile,
  todayStudyMinutes,
  isSampleData
}) => {
  const navItems = [
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as PageId, label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'scheduler' as PageId, label: 'Study Scheduler', icon: CalendarClock },
    { id: 'calendar' as PageId, label: 'Calendar', icon: CalendarDays },
    { id: 'tools' as PageId, label: 'Study Tools', icon: Brain },
    { id: 'analytics' as PageId, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as PageId, label: 'Settings', icon: Settings },
  ];

  const goalPercent = Math.min(100, Math.round((todayStudyMinutes / (profile.dailyStudyGoalMinutes || 180)) * 100));

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-100">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">StudyWise</h1>
            <p className="text-xs text-slate-500 font-medium">Academic Productivity</p>
          </div>
        </div>
        {isOpenMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mode hint if sample data */}
      {isSampleData && (
        <div className="mx-4 mt-3 px-3 py-2 bg-indigo-50/70 border border-indigo-100/80 rounded-xl flex items-center gap-2 text-xs text-indigo-700">
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
          <span className="truncate">Sample Student Demo Data</span>
        </div>
      )}

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                if (isOpenMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 tabular-nums">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Daily Progress Widget */}
      <div className="p-4 mx-3 mb-3 bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/80 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700">Daily Study Goal</span>
          <span className="text-xs font-bold text-indigo-600 tabular-nums">{goalPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 tabular-nums">
          <span>{Math.round(todayStudyMinutes / 60 * 10) / 10}h recorded</span>
          <span>Target: {Math.round(profile.dailyStudyGoalMinutes / 60 * 10) / 10}h</span>
        </div>
      </div>

      {/* Student user info */}
      <div className="p-4 border-t border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
          {profile.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 truncate">{profile.name}</p>
          <p className="text-xs text-slate-500 truncate">{profile.strandOrMajor || profile.academicLevel}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-20">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
