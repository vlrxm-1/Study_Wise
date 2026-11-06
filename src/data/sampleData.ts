import { Subject, Task, StudySession, FlashcardDeck, Flashcard, StudyLog, UserProfile, FeynmanEntry, BlurtingEntry, RetrievalQuestion } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'chem',
    name: 'General Chemistry',
    code: 'CHEM 101',
    color: 'purple',
    bgClass: 'bg-purple-50 text-purple-700 border-purple-200',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-300'
  },
  {
    id: 'calc',
    name: 'Calculus & Analytic Geometry',
    code: 'MATH 201',
    color: 'sky',
    bgClass: 'bg-sky-50 text-sky-700 border-sky-200',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-300'
  },
  {
    id: 'phys',
    name: 'University Physics',
    code: 'PHYS 102',
    color: 'indigo',
    bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-300'
  },
  {
    id: 'bio',
    name: 'Cellular & Molecular Biology',
    code: 'BIO 110',
    color: 'emerald',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-300'
  },
  {
    id: 'hist',
    name: 'World History & Civilizations',
    code: 'HIST 105',
    color: 'amber',
    bgClass: 'bg-amber-50 text-amber-800 border-amber-200',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-300'
  },
  {
    id: 'cs',
    name: 'Data Structures & Algorithms',
    code: 'CS 120',
    color: 'blue',
    bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300'
  }
];

export const INITIAL_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  academicLevel: 'Senior High School (STEM)',
  strandOrMajor: 'STEM Track & Pre-Engineering',
  school: 'Metro Science Academy',
  dailyStudyGoalMinutes: 180, // 3 hours
  soundEnabled: true,
  preferredVisualTimer: 'ice'
};

// Helper for dates relative to today
const getRelativeDateStr = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

const getRelativeDateTimeStr = (daysOffset: number, timeStr: string = '17:00'): string => {
  return `${getRelativeDateStr(daysOffset)}T${timeStr}`;
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Lab Report: Stoichiometry & Ideal Gas Law',
    subject: 'General Chemistry',
    deadline: getRelativeDateTimeStr(1, '23:59'),
    priority: 'High',
    estimatedDuration: 90,
    status: 'in_progress',
    notes: 'Include percent error analysis and discussion of experimental apparatus limitations.',
    createdAt: getRelativeDateStr(-2)
  },
  {
    id: 'task-2',
    title: 'Problem Set 4: Integration by Parts & Trigonometric Substitution',
    subject: 'Calculus & Analytic Geometry',
    deadline: getRelativeDateTimeStr(2, '18:00'),
    priority: 'High',
    estimatedDuration: 120,
    status: 'pending',
    notes: 'Practice problems 14 through 28 on Stewart Chapter 7.2.',
    createdAt: getRelativeDateStr(-1)
  },
  {
    id: 'task-3',
    title: 'Reading Summary: Mitosis vs Meiosis Regulation Checkpoints',
    subject: 'Cellular & Molecular Biology',
    deadline: getRelativeDateTimeStr(3, '20:00'),
    priority: 'Medium',
    estimatedDuration: 60,
    status: 'pending',
    notes: 'Create summary table contrasting cyclin-dependent kinase (CDK) complexes.',
    createdAt: getRelativeDateStr(-1)
  },
  {
    id: 'task-4',
    title: 'Review: Kirchhoff’s Laws & RC Circuit Transients',
    subject: 'University Physics',
    deadline: getRelativeDateTimeStr(4, '16:00'),
    priority: 'Medium',
    estimatedDuration: 75,
    status: 'pending',
    notes: 'Solve loop and junction equation problems in Giancoli Chapter 19.',
    createdAt: getRelativeDateStr(0)
  },
  {
    id: 'task-5',
    title: 'Term Paper Draft: Geopolitical Impact of the Silk Road',
    subject: 'World History & Civilizations',
    deadline: getRelativeDateTimeStr(6, '23:59'),
    priority: 'Low',
    estimatedDuration: 110,
    status: 'pending',
    notes: 'Focus on maritime routes and transmission of botanical commodities.',
    createdAt: getRelativeDateStr(-3)
  },
  {
    id: 'task-6',
    title: 'Binary Search Tree & Balance Factor Implementation',
    subject: 'Data Structures & Algorithms',
    deadline: getRelativeDateTimeStr(-1, '23:59'),
    priority: 'High',
    estimatedDuration: 90,
    status: 'completed',
    notes: 'Completed in TypeScript with AVL rotation test cases.',
    createdAt: getRelativeDateStr(-4),
    completedAt: getRelativeDateStr(-1)
  }
];

export const INITIAL_SESSIONS: StudySession[] = [
  {
    id: 'session-1',
    subject: 'General Chemistry',
    topic: 'Gas Law Equations & Deviation from Ideality',
    date: getRelativeDateStr(0), // Today
    startTime: '15:30',
    duration: 50,
    priority: 'High',
    status: 'scheduled',
    technique: 'Pomodoro'
  },
  {
    id: 'session-2',
    subject: 'Calculus & Analytic Geometry',
    topic: 'Trigonometric Substitutions Drills',
    date: getRelativeDateStr(0), // Today
    startTime: '17:00',
    duration: 60,
    priority: 'High',
    status: 'scheduled',
    technique: 'Active Recall'
  },
  {
    id: 'session-3',
    subject: 'Cellular & Molecular Biology',
    topic: 'Cell Cycle & Mitotic Spindle Formation',
    date: getRelativeDateStr(1),
    startTime: '16:00',
    duration: 45,
    priority: 'Medium',
    status: 'scheduled',
    technique: 'Blurting Method'
  },
  {
    id: 'session-4',
    subject: 'University Physics',
    topic: 'DC Circuits & Multi-Loop Analysis',
    date: getRelativeDateStr(2),
    startTime: '14:00',
    duration: 60,
    priority: 'Medium',
    status: 'scheduled',
    technique: 'Interleaved Practice'
  },
  {
    id: 'session-5',
    subject: 'Data Structures & Algorithms',
    topic: 'Graph Traversal Algorithms (BFS & DFS)',
    date: getRelativeDateStr(-1),
    startTime: '19:00',
    duration: 90,
    priority: 'High',
    status: 'completed',
    technique: 'Feynman Technique'
  }
];

export const INITIAL_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-chem-1',
    subject: 'General Chemistry',
    topic: 'Thermodynamics & Kinetics',
    title: 'Chemical Kinetics & Enthalpy Core Concepts',
    description: 'Reaction orders, activation energy, rate laws, and Hess’s Law essentials.',
    createdAt: getRelativeDateStr(-10)
  },
  {
    id: 'deck-calc-1',
    subject: 'Calculus & Analytic Geometry',
    topic: 'Integration Techniques',
    title: 'Standard Integrals & Substitution Rules',
    description: 'Trig identities, integration by parts formulas, and inverse trig antiderivatives.',
    createdAt: getRelativeDateStr(-7)
  },
  {
    id: 'deck-bio-1',
    subject: 'Cellular & Molecular Biology',
    topic: 'Cellular Energetics',
    title: 'Cellular Respiration & ATP Synthase',
    description: 'Glycolysis, Krebs cycle electron transport chain, and chemiosmosis.',
    createdAt: getRelativeDateStr(-5)
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'card-1',
    deckId: 'deck-chem-1',
    front: 'What is the Arrhenius equation and what does each variable represent?',
    back: 'k = A * e^(-Ea / (R * T)). Where k is rate constant, A is frequency factor, Ea is activation energy, R is gas constant (8.314 J/mol·K), and T is absolute temperature (Kelvin).',
    hint: 'Relates temperature and activation energy to reaction rate constant.',
    box: 3,
    lastReviewed: getRelativeDateStr(-2),
    nextReviewDate: getRelativeDateStr(1),
    repetitions: 4,
    easeFactor: 2.5,
    intervalDays: 3
  },
  {
    id: 'card-2',
    deckId: 'deck-chem-1',
    front: 'State the difference between zero-order, first-order, and second-order half-life.',
    back: 'Zero-order: t_1/2 = [A]0 / 2k (depends on initial concentration). First-order: t_1/2 = 0.693 / k (independent of concentration). Second-order: t_1/2 = 1 / (k * [A]0) (inversely proportional).',
    hint: 'Look at how [A]0 appears in the numerator, omitted, or in denominator.',
    box: 2,
    lastReviewed: getRelativeDateStr(-1),
    nextReviewDate: getRelativeDateStr(0),
    repetitions: 2,
    easeFactor: 2.3,
    intervalDays: 1
  },
  {
    id: 'card-3',
    deckId: 'deck-calc-1',
    front: 'What is the Integration by Parts formula derived from the product rule?',
    back: '∫ u dv = u*v - ∫ v du. Choose u using the LIATE rule (Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential).',
    hint: 'Ultra Violet Voodoo',
    box: 4,
    lastReviewed: getRelativeDateStr(-3),
    nextReviewDate: getRelativeDateStr(4),
    repetitions: 5,
    easeFactor: 2.7,
    intervalDays: 7
  },
  {
    id: 'card-4',
    deckId: 'deck-calc-1',
    front: 'What trigonometric substitution is used for sqrt(a^2 - x^2)?',
    back: 'Let x = a * sin(θ), then dx = a * cos(θ) dθ, and sqrt(a^2 - x^2) = a * cos(θ).',
    hint: 'Think of the Pythagorean identity 1 - sin^2 = cos^2',
    box: 1,
    lastReviewed: getRelativeDateStr(-1),
    nextReviewDate: getRelativeDateStr(0),
    repetitions: 1,
    easeFactor: 2.1,
    intervalDays: 1
  },
  {
    id: 'card-5',
    deckId: 'deck-bio-1',
    front: 'Where does the Krebs (Citric Acid) Cycle take place in eukaryotic cells, and what is its net NADH yield per glucose?',
    back: 'Location: Mitochondrial matrix. Net yield per glucose molecule (2 turns): 6 NADH, 2 FADH2, and 2 ATP (or GTP).',
    hint: 'Matrix vs cristae vs intermembrane space.',
    box: 3,
    lastReviewed: getRelativeDateStr(-3),
    nextReviewDate: getRelativeDateStr(1),
    repetitions: 3,
    easeFactor: 2.5,
    intervalDays: 4
  }
];

export const INITIAL_STUDY_LOGS: StudyLog[] = [
  {
    id: 'log-1',
    technique: 'Pomodoro Timer',
    subject: 'General Chemistry',
    topic: 'Gas Law Problems',
    durationMinutes: 50,
    timestamp: `${getRelativeDateStr(-6)}T16:30:00`,
    notes: 'Completed 2 full pomodoro intervals.'
  },
  {
    id: 'log-2',
    technique: 'Active Recall',
    subject: 'Cellular & Molecular Biology',
    topic: 'Mitochondrial Membrane Proteins',
    durationMinutes: 45,
    timestamp: `${getRelativeDateStr(-5)}T18:00:00`,
    notes: 'Reviewed 20 flashcards with 85% accuracy.'
  },
  {
    id: 'log-3',
    technique: 'Visual Timer',
    subject: 'Calculus & Analytic Geometry',
    topic: 'Integration by Parts',
    durationMinutes: 75,
    timestamp: `${getRelativeDateStr(-4)}T15:00:00`,
    notes: 'Focused work with melting ice cube visual timer.'
  },
  {
    id: 'log-4',
    technique: 'Feynman Technique',
    subject: 'University Physics',
    topic: 'Electromagnetic Induction & Lenz’s Law',
    durationMinutes: 60,
    timestamp: `${getRelativeDateStr(-3)}T19:00:00`,
    notes: 'Drafted plain-language explanation for why induced current opposes change.'
  },
  {
    id: 'log-5',
    technique: 'Blurting Method',
    subject: 'Cellular & Molecular Biology',
    topic: 'Cell Cycle Regulation',
    durationMinutes: 40,
    timestamp: `${getRelativeDateStr(-2)}T17:30:00`,
    notes: 'Braindumped 12 key concepts in 10 minutes.'
  },
  {
    id: 'log-6',
    technique: 'Pomodoro Timer',
    subject: 'Data Structures & Algorithms',
    topic: 'Tree Balancing and Rotations',
    durationMinutes: 80,
    timestamp: `${getRelativeDateStr(-1)}T16:00:00`,
    notes: 'Finished coding AVL rotateLeft and rotateRight.'
  },
  {
    id: 'log-7',
    technique: 'Spaced Repetition',
    subject: 'General Chemistry',
    topic: 'Thermodynamics Flashcards',
    durationMinutes: 30,
    timestamp: `${getRelativeDateStr(0)}T11:00:00`,
    notes: 'Today morning review session.'
  }
];

export const INITIAL_FEYNMAN: FeynmanEntry[] = [
  {
    id: 'feynman-1',
    concept: 'Lenz’s Law & Electromagnetic Induction',
    subject: 'University Physics',
    childExplanation: 'Nature is stubborn and hates sudden changes. Imagine you try to push a magnet into a metal coil. The coil doesn’t like that the magnetic field inside it is increasing, so it immediately spins its own electric current to create an opposing magnet to push you back.',
    identifiedGaps: 'Need to clearly separate the magnetic flux change from the actual induced magnetic field direction without mixing up the right-hand grip rule.',
    analogy: 'A revolving door that pushes back harder when you rush into it.',
    date: getRelativeDateStr(-3)
  }
];

export const INITIAL_BLURTING: BlurtingEntry[] = [
  {
    id: 'blurting-1',
    subject: 'Cellular & Molecular Biology',
    topic: 'Mitosis vs Meiosis Differences',
    durationMinutes: 10,
    content: 'Mitosis creates 2 identical diploid somatic cells. Meiosis makes 4 genetically diverse haploid gametes. Meiosis I has crossing over (prophase I, chiasmata, synaptonemal complex). Homologous chromosomes separate in Anaphase I. Sister chromatids separate in Anaphase II. Mitosis has no crossing over and sister chromatids separate in single anaphase.',
    checklist: [
      { item: 'Diploid vs Haploid chromosome counts', checked: true },
      { item: 'Crossing over in Prophase I (Chiasmata)', checked: true },
      { item: 'Homologous pairs separating in Meiosis I', checked: true },
      { item: 'Sister chromatids separating in Meiosis II', checked: true },
      { item: 'Spindle fiber kinetochore attachment mechanics', checked: false }
    ],
    retentionScore: 80,
    date: getRelativeDateStr(-2)
  }
];

export const INITIAL_RETRIEVAL_QUESTIONS: RetrievalQuestion[] = [
  {
    id: 'rq-1',
    subject: 'General Chemistry',
    question: 'According to Le Chatelier’s principle, what happens to an exothermic equilibrium reaction (ΔH < 0) when the temperature is raised?',
    options: [
      'The equilibrium shifts toward products to produce more heat',
      'The equilibrium shifts toward reactants to absorb added heat',
      'The equilibrium constant K increases significantly',
      'The rate of forward reaction increases while reverse rate decreases'
    ],
    correctIndex: 1,
    explanation: 'For exothermic reactions, heat can be treated as a product. Adding heat shifts the equilibrium in the endothermic direction (reverse/reactants) to absorb excess thermal energy.'
  },
  {
    id: 'rq-2',
    subject: 'Calculus & Analytic Geometry',
    question: 'What is the derivative of f(x) = ln(sec(x) + tan(x)) with respect to x?',
    options: [
      'sec(x) * tan(x)',
      'sec^2(x)',
      'sec(x)',
      '1 / (sec(x) + tan(x))'
    ],
    correctIndex: 2,
    explanation: 'By the chain rule, f\'(x) = (sec(x)tan(x) + sec^2(x)) / (sec(x) + tan(x)) = sec(x)(tan(x) + sec(x)) / (sec(x) + tan(x)) = sec(x).'
  },
  {
    id: 'rq-3',
    subject: 'University Physics',
    question: 'Two identical light bulbs are connected in parallel to a battery. If one bulb burns out and creates an open circuit, what happens to the brightness of the other bulb?',
    options: [
      'It becomes noticeably dimmer',
      'It stays essentially the same brightness',
      'It shines twice as bright and burns out quickly',
      'It turns off because the circuit is broken'
    ],
    correctIndex: 1,
    explanation: 'In an ideal parallel circuit, each branch experiences the same full voltage from the source. The current through the remaining bulb depends only on V/R, which remains unchanged.'
  }
];
