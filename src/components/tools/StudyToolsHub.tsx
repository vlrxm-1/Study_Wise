import React, { useState, useEffect } from 'react';
import {
  Hourglass,
  Layers,
  BookOpen,
  Brain,
  Flame,
  Shuffle,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { StudyToolId, Subject, Task, FlashcardDeck, Flashcard, FeynmanEntry, BlurtingEntry, StudyLog, StudySession } from '../../types';
import { PomodoroTimer } from './PomodoroTimer';
import { ActiveRecallCards } from './ActiveRecallCards';
import { LeitnerView } from './LeitnerView';
import { FeynmanWorkspace } from './FeynmanWorkspace';
import { BlurtingWorkspace } from './BlurtingWorkspace';
import { InterleavedGenerator } from './InterleavedGenerator';
import { RetrievalPractice } from './RetrievalPractice';
import { TimeBlocking } from './TimeBlocking';

interface StudyToolsHubProps {
  initialToolId?: StudyToolId;
  subjects: Subject[];
  tasks: Task[];
  decks: FlashcardDeck[];
  flashcards: Flashcard[];
  feynmanEntries: FeynmanEntry[];
  blurtingEntries: BlurtingEntry[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLogStudySession: (log: Omit<StudyLog, 'id'>) => void;
  onAddDeck: (deck: Omit<FlashcardDeck, 'id' | 'createdAt'>) => void;
  onAddCard: (card: Omit<Flashcard, 'id'>) => void;
  onUpdateCard: (card: Flashcard) => void;
  onDeleteCard: (cardId: string) => void;
  onDeleteDeck: (deckId: string) => void;
  onSaveFeynman: (entry: Omit<FeynmanEntry, 'id' | 'date'>) => void;
  onDeleteFeynman: (id: string) => void;
  onSaveBlurting: (entry: Omit<BlurtingEntry, 'id' | 'date'>) => void;
  onDeleteBlurting: (id: string) => void;
  onAddScheduledSessions: (sessions: Omit<StudySession, 'id'>[]) => void;
}

export const StudyToolsHub: React.FC<StudyToolsHubProps> = ({
  initialToolId = 'pomodoro',
  subjects,
  tasks,
  decks,
  flashcards,
  feynmanEntries,
  blurtingEntries,
  soundEnabled,
  onToggleSound,
  onLogStudySession,
  onAddDeck,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onDeleteDeck,
  onSaveFeynman,
  onDeleteFeynman,
  onSaveBlurting,
  onDeleteBlurting,
  onAddScheduledSessions
}) => {
  const [activeTool, setActiveTool] = useState<StudyToolId>(initialToolId);

  useEffect(() => {
    if (initialToolId) {
      setActiveTool(initialToolId);
    }
  }, [initialToolId]);

  const TOOLS = [
    { id: 'pomodoro' as StudyToolId, name: 'Pomodoro & Visual Timer', icon: Hourglass, desc: 'Melting ice & candle countdowns' },
    { id: 'active-recall' as StudyToolId, name: 'Active Recall Flashcards', icon: Layers, desc: '3D flip cards & spaced reviews' },
    { id: 'leitner' as StudyToolId, name: 'Leitner 5-Box System', icon: BookOpen, desc: 'Spaced mastery progression' },
    { id: 'feynman' as StudyToolId, name: 'Feynman Technique', icon: Brain, desc: 'Simplify to teach a child' },
    { id: 'blurting' as StudyToolId, name: 'Blurting Method', icon: Flame, desc: 'Timed recall braindump' },
    { id: 'interleaved' as StudyToolId, name: 'Interleaved Practice', icon: Shuffle, desc: 'Mix topics to boost retention' },
    { id: 'retrieval' as StudyToolId, name: 'Retrieval Practice', icon: HelpCircle, desc: 'Active self-quizzing' },
    { id: 'time-blocking' as StudyToolId, name: 'Time Blocking', icon: Clock, desc: 'Structured daily calendar blocks' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Tool Navigation Tabs Strip */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tool.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Tool */}
      {activeTool === 'pomodoro' && (
        <PomodoroTimer
          subjects={subjects}
          tasks={tasks}
          onLogStudySession={onLogStudySession}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
        />
      )}

      {activeTool === 'active-recall' && (
        <ActiveRecallCards
          decks={decks}
          flashcards={flashcards}
          subjects={subjects}
          onAddDeck={onAddDeck}
          onAddCard={onAddCard}
          onUpdateCard={onUpdateCard}
          onDeleteCard={onDeleteCard}
          onDeleteDeck={onDeleteDeck}
          onLogStudySession={onLogStudySession}
        />
      )}

      {activeTool === 'leitner' && (
        <LeitnerView
          decks={decks}
          flashcards={flashcards}
          onUpdateCard={onUpdateCard}
        />
      )}

      {activeTool === 'feynman' && (
        <FeynmanWorkspace
          entries={feynmanEntries}
          subjects={subjects}
          onSaveEntry={onSaveFeynman}
          onDeleteEntry={onDeleteFeynman}
          onLogStudySession={onLogStudySession}
        />
      )}

      {activeTool === 'blurting' && (
        <BlurtingWorkspace
          entries={blurtingEntries}
          subjects={subjects}
          onSaveEntry={onSaveBlurting}
          onDeleteEntry={onDeleteBlurting}
          onLogStudySession={onLogStudySession}
          soundEnabled={soundEnabled}
        />
      )}

      {activeTool === 'interleaved' && (
        <InterleavedGenerator
          subjects={subjects}
          onAddScheduledSessions={onAddScheduledSessions}
        />
      )}

      {activeTool === 'retrieval' && (
        <RetrievalPractice
          subjects={subjects}
          onLogStudySession={onLogStudySession}
        />
      )}

      {activeTool === 'time-blocking' && (
        <TimeBlocking />
      )}
    </div>
  );
};
