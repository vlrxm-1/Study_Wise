import {
  Task,
  StudySession,
  FlashcardDeck,
  Flashcard,
  StudyLog,
  UserProfile,
  Subject,
  FeynmanEntry,
  BlurtingEntry
} from '../types';
import {
  INITIAL_TASKS,
  INITIAL_SESSIONS,
  INITIAL_DECKS,
  INITIAL_FLASHCARDS,
  INITIAL_STUDY_LOGS,
  INITIAL_PROFILE,
  INITIAL_SUBJECTS,
  INITIAL_FEYNMAN,
  INITIAL_BLURTING
} from '../data/sampleData';

const KEYS = {
  TASKS: 'studywise_tasks_v1',
  SESSIONS: 'studywise_sessions_v1',
  DECKS: 'studywise_decks_v1',
  FLASHCARDS: 'studywise_flashcards_v1',
  LOGS: 'studywise_logs_v1',
  PROFILE: 'studywise_profile_v1',
  SUBJECTS: 'studywise_subjects_v1',
  FEYNMAN: 'studywise_feynman_v1',
  BLURTING: 'studywise_blurting_v1',
  IS_SAMPLE: 'studywise_is_sample_mode'
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading localStorage for key ${key}:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`Error writing localStorage for key ${key}:`, err);
  }
}

export const StorageService = {
  getTasks(): Task[] {
    return safeGet<Task[]>(KEYS.TASKS, INITIAL_TASKS);
  },
  saveTasks(tasks: Task[]): void {
    safeSet(KEYS.TASKS, tasks);
    safeSet(KEYS.IS_SAMPLE, false);
  },

  getSessions(): StudySession[] {
    return safeGet<StudySession[]>(KEYS.SESSIONS, INITIAL_SESSIONS);
  },
  saveSessions(sessions: StudySession[]): void {
    safeSet(KEYS.SESSIONS, sessions);
    safeSet(KEYS.IS_SAMPLE, false);
  },

  getDecks(): FlashcardDeck[] {
    return safeGet<FlashcardDeck[]>(KEYS.DECKS, INITIAL_DECKS);
  },
  saveDecks(decks: FlashcardDeck[]): void {
    safeSet(KEYS.DECKS, decks);
  },

  getFlashcards(): Flashcard[] {
    return safeGet<Flashcard[]>(KEYS.FLASHCARDS, INITIAL_FLASHCARDS);
  },
  saveFlashcards(cards: Flashcard[]): void {
    safeSet(KEYS.FLASHCARDS, cards);
  },

  getLogs(): StudyLog[] {
    return safeGet<StudyLog[]>(KEYS.LOGS, INITIAL_STUDY_LOGS);
  },
  saveLogs(logs: StudyLog[]): void {
    safeSet(KEYS.LOGS, logs);
  },
  addLog(newLog: Omit<StudyLog, 'id'>): StudyLog {
    const logs = this.getLogs();
    const created: StudyLog = {
      ...newLog,
      id: `log-${Date.now()}`
    };
    this.saveLogs([created, ...logs]);
    return created;
  },

  getProfile(): UserProfile {
    return safeGet<UserProfile>(KEYS.PROFILE, INITIAL_PROFILE);
  },
  saveProfile(profile: UserProfile): void {
    safeSet(KEYS.PROFILE, profile);
  },

  getSubjects(): Subject[] {
    return safeGet<Subject[]>(KEYS.SUBJECTS, INITIAL_SUBJECTS);
  },
  saveSubjects(subjects: Subject[]): void {
    safeSet(KEYS.SUBJECTS, subjects);
  },

  getFeynman(): FeynmanEntry[] {
    return safeGet<FeynmanEntry[]>(KEYS.FEYNMAN, INITIAL_FEYNMAN);
  },
  saveFeynman(entries: FeynmanEntry[]): void {
    safeSet(KEYS.FEYNMAN, entries);
  },

  getBlurting(): BlurtingEntry[] {
    return safeGet<BlurtingEntry[]>(KEYS.BLURTING, INITIAL_BLURTING);
  },
  saveBlurting(entries: BlurtingEntry[]): void {
    safeSet(KEYS.BLURTING, entries);
  },

  isSampleDataActive(): boolean {
    const raw = localStorage.getItem(KEYS.IS_SAMPLE);
    return raw === null ? true : raw === 'true';
  },

  resetToSampleData(): void {
    safeSet(KEYS.TASKS, INITIAL_TASKS);
    safeSet(KEYS.SESSIONS, INITIAL_SESSIONS);
    safeSet(KEYS.DECKS, INITIAL_DECKS);
    safeSet(KEYS.FLASHCARDS, INITIAL_FLASHCARDS);
    safeSet(KEYS.LOGS, INITIAL_STUDY_LOGS);
    safeSet(KEYS.PROFILE, INITIAL_PROFILE);
    safeSet(KEYS.SUBJECTS, INITIAL_SUBJECTS);
    safeSet(KEYS.FEYNMAN, INITIAL_FEYNMAN);
    safeSet(KEYS.BLURTING, INITIAL_BLURTING);
    safeSet(KEYS.IS_SAMPLE, true);
  },

  clearAllData(): void {
    safeSet(KEYS.TASKS, []);
    safeSet(KEYS.SESSIONS, []);
    safeSet(KEYS.DECKS, []);
    safeSet(KEYS.FLASHCARDS, []);
    safeSet(KEYS.LOGS, []);
    safeSet(KEYS.FEYNMAN, []);
    safeSet(KEYS.BLURTING, []);
    safeSet(KEYS.IS_SAMPLE, false);
  }
};
