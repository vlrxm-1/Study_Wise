import React, { useState, useEffect } from 'react';
import {
  PageId,
  StudyToolId,
  Task,
  StudySession,
  FlashcardDeck,
  Flashcard,
  StudyLog,
  UserProfile,
  Subject,
  FeynmanEntry,
  BlurtingEntry
} from './types';
import { StorageService } from './utils/storage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { TaskManager } from './components/tasks/TaskManager';
import { StudyScheduler } from './components/scheduler/StudyScheduler';
import { CalendarView } from './components/calendar/CalendarView';
import { StudyToolsHub } from './components/tools/StudyToolsHub';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [activeToolId, setActiveToolId] = useState<StudyToolId>('pomodoro');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persistent application states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [feynmanEntries, setFeynmanEntries] = useState<FeynmanEntry[]>([]);
  const [blurtingEntries, setBlurtingEntries] = useState<BlurtingEntry[]>([]);
  const [isSampleData, setIsSampleData] = useState(true);

  // Quick Action / Modals
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [prefilledTaskDate, setPrefilledTaskDate] = useState<string | null>(null);

  // Initialize from storage on first mount
  useEffect(() => {
    setTasks(StorageService.getTasks());
    setSessions(StorageService.getSessions());
    setDecks(StorageService.getDecks());
    setFlashcards(StorageService.getFlashcards());
    setLogs(StorageService.getLogs());
    setProfile(StorageService.getProfile());
    setSubjects(StorageService.getSubjects());
    setFeynmanEntries(StorageService.getFeynman());
    setBlurtingEntries(StorageService.getBlurting());
    setIsSampleData(StorageService.isSampleDataActive());
  }, []);

  // Today's formatted date string
  const todayDateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const todayIsoDate = new Date().toISOString().split('T')[0];
  const todayStudyMinutes = logs
    .filter(l => l.timestamp.startsWith(todayIsoDate))
    .reduce((acc, l) => acc + l.durationMinutes, 0);

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;

  // --- TASK ACTIONS ---
  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const created: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [created, ...tasks];
    setTasks(updated);
    StorageService.saveTasks(updated);
    setIsSampleData(false);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(updated);
    StorageService.saveTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    StorageService.saveTasks(updated);
  };

  const handleToggleTaskComplete = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const isDone = t.status === 'completed';
        return {
          ...t,
          status: (isDone ? 'pending' : 'completed') as Task['status'],
          completedAt: isDone ? undefined : new Date().toISOString()
        };
      }
      return t;
    });
    setTasks(updated);
    StorageService.saveTasks(updated);
  };

  // --- SESSION ACTIONS ---
  const handleAddSession = (newSession: Omit<StudySession, 'id'>) => {
    const created: StudySession = {
      ...newSession,
      id: `session-${Date.now()}`
    };
    const updated = [...sessions, created];
    setSessions(updated);
    StorageService.saveSessions(updated);
    setIsSampleData(false);
  };

  const handleUpdateSession = (updatedSession: StudySession) => {
    const updated = sessions.map(s => s.id === updatedSession.id ? updatedSession : s);
    setSessions(updated);
    StorageService.saveSessions(updated);
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter(s => s.id !== sessionId);
    setSessions(updated);
    StorageService.saveSessions(updated);
  };

  const handleGenerateSmartSchedule = (newSessions: Omit<StudySession, 'id'>[]) => {
    const createdSessions: StudySession[] = newSessions.map((s, idx) => ({
      ...s,
      id: `session-auto-${Date.now()}-${idx}`
    }));
    const updated = [...sessions, ...createdSessions];
    setSessions(updated);
    StorageService.saveSessions(updated);
    setIsSampleData(false);
  };

  // --- STUDY LOGS ---
  const handleLogStudySession = (newLog: Omit<StudyLog, 'id'>) => {
    const created = StorageService.addLog(newLog);
    setLogs(StorageService.getLogs());
  };

  // --- QUICK START ACTIONS ---
  const handleQuickStartStudy = () => {
    setActiveToolId('pomodoro');
    setCurrentPage('tools');
  };

  const handleStartTimerForTask = (task: Task) => {
    setActiveToolId('pomodoro');
    setCurrentPage('tools');
  };

  const handleScheduleTask = (task: Task) => {
    const todayStr = new Date().toISOString().split('T')[0];
    handleAddSession({
      subject: task.subject,
      topic: task.title,
      date: todayStr,
      startTime: '16:00',
      duration: task.estimatedDuration || 50,
      priority: task.priority,
      status: 'scheduled',
      taskId: task.id,
      technique: 'Pomodoro'
    });
    setCurrentPage('scheduler');
  };

  const handleStartSessionTimer = (session: StudySession) => {
    setActiveToolId('pomodoro');
    setCurrentPage('tools');
  };

  // --- FLASHCARDS ---
  const handleAddDeck = (deck: Omit<FlashcardDeck, 'id' | 'createdAt'>) => {
    const created: FlashcardDeck = {
      ...deck,
      id: `deck-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [...decks, created];
    setDecks(updated);
    StorageService.saveDecks(updated);
  };

  const handleAddCard = (card: Omit<Flashcard, 'id'>) => {
    const created: Flashcard = {
      ...card,
      id: `card-${Date.now()}`
    };
    const updated = [...flashcards, created];
    setFlashcards(updated);
    StorageService.saveFlashcards(updated);
  };

  const handleUpdateCard = (updatedCard: Flashcard) => {
    const updated = flashcards.map(c => c.id === updatedCard.id ? updatedCard : c);
    setFlashcards(updated);
    StorageService.saveFlashcards(updated);
  };

  const handleDeleteCard = (cardId: string) => {
    const updated = flashcards.filter(c => c.id !== cardId);
    setFlashcards(updated);
    StorageService.saveFlashcards(updated);
  };

  const handleDeleteDeck = (deckId: string) => {
    const updatedDecks = decks.filter(d => d.id !== deckId);
    const updatedCards = flashcards.filter(c => c.deckId !== deckId);
    setDecks(updatedDecks);
    setFlashcards(updatedCards);
    StorageService.saveDecks(updatedDecks);
    StorageService.saveFlashcards(updatedCards);
  };

  // --- FEYNMAN & BLURTING ---
  const handleSaveFeynman = (entry: Omit<FeynmanEntry, 'id' | 'date'>) => {
    const created: FeynmanEntry = {
      ...entry,
      id: `feynman-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [created, ...feynmanEntries];
    setFeynmanEntries(updated);
    StorageService.saveFeynman(updated);
  };

  const handleDeleteFeynman = (id: string) => {
    const updated = feynmanEntries.filter(e => e.id !== id);
    setFeynmanEntries(updated);
    StorageService.saveFeynman(updated);
  };

  const handleSaveBlurting = (entry: Omit<BlurtingEntry, 'id' | 'date'>) => {
    const created: BlurtingEntry = {
      ...entry,
      id: `blurting-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [created, ...blurtingEntries];
    setBlurtingEntries(updated);
    StorageService.saveBlurting(updated);
  };

  const handleDeleteBlurting = (id: string) => {
    const updated = blurtingEntries.filter(e => e.id !== id);
    setBlurtingEntries(updated);
    StorageService.saveBlurting(updated);
  };

  // --- SETTINGS & SUBJECTS ---
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
  };

  const handleAddSubject = (newSubject: Subject) => {
    const updated = [...subjects, newSubject];
    setSubjects(updated);
    StorageService.saveSubjects(updated);
  };

  const handleDeleteSubject = (subId: string) => {
    const updated = subjects.filter(s => s.id !== subId);
    setSubjects(updated);
    StorageService.saveSubjects(updated);
  };

  const handleResetSampleData = () => {
    StorageService.resetToSampleData();
    setTasks(StorageService.getTasks());
    setSessions(StorageService.getSessions());
    setDecks(StorageService.getDecks());
    setFlashcards(StorageService.getFlashcards());
    setLogs(StorageService.getLogs());
    setProfile(StorageService.getProfile());
    setSubjects(StorageService.getSubjects());
    setFeynmanEntries(StorageService.getFeynman());
    setBlurtingEntries(StorageService.getBlurting());
    setIsSampleData(true);
  };

  const handleClearAllData = () => {
    StorageService.clearAllData();
    setTasks([]);
    setSessions([]);
    setDecks([]);
    setFlashcards([]);
    setLogs([]);
    setFeynmanEntries([]);
    setBlurtingEntries([]);
    setIsSampleData(false);
  };

  // Calendar quick action triggers
  const handleCalendarAddTask = (dateStr: string) => {
    setPrefilledTaskDate(dateStr);
    setIsAddTaskModalOpen(true);
    setCurrentPage('tasks');
  };

  const handleCalendarAddSession = (dateStr: string) => {
    handleAddSession({
      subject: subjects[0]?.name || 'General Chemistry',
      topic: 'Study Session',
      date: dateStr,
      startTime: '15:00',
      duration: 50,
      priority: 'Medium',
      status: 'scheduled',
      technique: 'Pomodoro'
    });
    setCurrentPage('scheduler');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased selection:bg-indigo-100 selection:text-indigo-900 text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        pendingTasksCount={pendingTasksCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        profile={profile}
        todayStudyMinutes={todayStudyMinutes}
        isSampleData={isSampleData}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentPage={currentPage}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onQuickStartStudy={handleQuickStartStudy}
          todayDateStr={todayDateStr}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentPage === 'dashboard' && (
            <Dashboard
              profile={profile}
              tasks={tasks}
              sessions={sessions}
              logs={logs}
              onNavigate={setCurrentPage}
              onOpenTool={(toolId) => {
                setActiveToolId(toolId);
                setCurrentPage('tools');
              }}
              onToggleTaskComplete={handleToggleTaskComplete}
              onOpenAddTaskModal={() => {
                setIsAddTaskModalOpen(true);
                setCurrentPage('tasks');
              }}
            />
          )}

          {currentPage === 'tasks' && (
            <TaskManager
              tasks={tasks}
              subjects={subjects}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onToggleComplete={handleToggleTaskComplete}
              onStartTimerForTask={handleStartTimerForTask}
              onScheduleTask={handleScheduleTask}
              isAddModalOpen={isAddTaskModalOpen}
              setIsAddModalOpen={setIsAddTaskModalOpen}
            />
          )}

          {currentPage === 'scheduler' && (
            <StudyScheduler
              sessions={sessions}
              subjects={subjects}
              tasks={tasks}
              onAddSession={handleAddSession}
              onUpdateSession={handleUpdateSession}
              onDeleteSession={handleDeleteSession}
              onStartSessionTimer={handleStartSessionTimer}
              onGenerateSmartSchedule={handleGenerateSmartSchedule}
            />
          )}

          {currentPage === 'calendar' && (
            <CalendarView
              tasks={tasks}
              sessions={sessions}
              subjects={subjects}
              onAddTaskForDate={handleCalendarAddTask}
              onAddSessionForDate={handleCalendarAddSession}
            />
          )}

          {currentPage === 'tools' && (
            <StudyToolsHub
              initialToolId={activeToolId}
              subjects={subjects}
              tasks={tasks}
              decks={decks}
              flashcards={flashcards}
              feynmanEntries={feynmanEntries}
              blurtingEntries={blurtingEntries}
              soundEnabled={profile.soundEnabled}
              onToggleSound={() => handleUpdateProfile({ ...profile, soundEnabled: !profile.soundEnabled })}
              onLogStudySession={handleLogStudySession}
              onAddDeck={handleAddDeck}
              onAddCard={handleAddCard}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              onDeleteDeck={handleDeleteDeck}
              onSaveFeynman={handleSaveFeynman}
              onDeleteFeynman={handleDeleteFeynman}
              onSaveBlurting={handleSaveBlurting}
              onDeleteBlurting={handleDeleteBlurting}
              onAddScheduledSessions={handleGenerateSmartSchedule}
            />
          )}

          {currentPage === 'analytics' && (
            <AnalyticsView
              logs={logs}
              tasks={tasks}
              sessions={sessions}
              profile={profile}
              subjects={subjects}
              onNavigateToScheduler={() => setCurrentPage('scheduler')}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              profile={profile}
              subjects={subjects}
              isSampleData={isSampleData}
              onUpdateProfile={handleUpdateProfile}
              onAddSubject={handleAddSubject}
              onDeleteSubject={handleDeleteSubject}
              onResetSampleData={handleResetSampleData}
              onClearAllData={handleClearAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
