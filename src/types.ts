export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // e.g., 'indigo', 'sky', 'purple', 'emerald', 'amber', 'rose'
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  deadline: string; // 'YYYY-MM-DDTHH:mm'
  priority: Priority;
  estimatedDuration: number; // in minutes
  status: TaskStatus;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
  duration: number; // in minutes
  priority: Priority;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed';
  taskId?: string;
  technique?: string;
  notes?: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  box: number; // 1 to 5 (Leitner system)
  lastReviewed?: string;
  nextReviewDate: string; // 'YYYY-MM-DD'
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
}

export interface FlashcardDeck {
  id: string;
  subject: string;
  topic: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface StudyLog {
  id: string;
  technique: string;
  subject: string;
  topic?: string;
  durationMinutes: number;
  timestamp: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  academicLevel: string; // 'Senior High School (Grade 11-12)' | 'College / University'
  strandOrMajor: string; // e.g., 'STEM' | 'Computer Science' | 'Accountancy'
  school: string;
  dailyStudyGoalMinutes: number;
  soundEnabled: boolean;
  preferredVisualTimer: 'ice' | 'candle';
}

export interface FeynmanEntry {
  id: string;
  concept: string;
  subject: string;
  childExplanation: string;
  identifiedGaps: string;
  analogy: string;
  date: string;
}

export interface BlurtingEntry {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  content: string;
  checklist: { item: string; checked: boolean }[];
  retentionScore: number;
  date: string;
}

export interface RetrievalQuestion {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type PageId = 
  | 'dashboard'
  | 'tasks'
  | 'scheduler'
  | 'calendar'
  | 'tools'
  | 'analytics'
  | 'settings';

export type StudyToolId =
  | 'pomodoro'
  | 'visual-timer'
  | 'active-recall'
  | 'spaced-repetition'
  | 'leitner'
  | 'feynman'
  | 'blurting'
  | 'interleaved'
  | 'retrieval'
  | 'time-blocking';
