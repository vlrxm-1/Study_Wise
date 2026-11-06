import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Shuffle,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Sparkles,
  HelpCircle,
  Eye,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { FlashcardDeck, Flashcard, Subject, StudyLog } from '../../types';

interface ActiveRecallCardsProps {
  decks: FlashcardDeck[];
  flashcards: Flashcard[];
  subjects: Subject[];
  onAddDeck: (deck: Omit<FlashcardDeck, 'id' | 'createdAt'>) => void;
  onAddCard: (card: Omit<Flashcard, 'id'>) => void;
  onUpdateCard: (card: Flashcard) => void;
  onDeleteCard: (cardId: string) => void;
  onDeleteDeck: (deckId: string) => void;
  onLogStudySession: (log: Omit<StudyLog, 'id'>) => void;
}

export const ActiveRecallCards: React.FC<ActiveRecallCardsProps> = ({
  decks,
  flashcards,
  subjects,
  onAddDeck,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onDeleteDeck,
  onLogStudySession
}) => {
  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || '');
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ correct: number; total: number } | null>(null);

  // Deck modal
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [deckFormData, setDeckFormData] = useState({
    title: '',
    subject: subjects[0]?.name || 'General Chemistry',
    topic: '',
    description: ''
  });

  // Card modal
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [cardFormData, setCardFormData] = useState({
    front: '',
    back: '',
    hint: ''
  });

  const activeDeck = decks.find((d) => d.id === selectedDeckId);
  const deckCards = flashcards.filter((c) => c.deckId === selectedDeckId);

  // Start study session
  const startStudying = (randomize: boolean = false) => {
    if (deckCards.length === 0) return;
    let queue = [...deckCards];
    if (randomize) {
      queue = queue.sort(() => Math.random() - 0.5);
    }
    setStudyQueue(queue);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setSessionResults(null);
    setIsStudyMode(true);
  };

  // Spaced Repetition calculation (SuperMemo / Leitner hybrid)
  const handleRateResponse = (quality: 'again' | 'hard' | 'good' | 'easy') => {
    const currentCard = studyQueue[currentCardIndex];
    if (!currentCard) return;

    let newBox = currentCard.box;
    let newInterval = currentCard.intervalDays || 1;
    let newEase = currentCard.easeFactor || 2.5;

    if (quality === 'again') {
      newBox = 1;
      newInterval = 1;
      newEase = Math.max(1.3, newEase - 0.2);
    } else if (quality === 'hard') {
      newInterval = Math.max(1, Math.round(newInterval * 1.2));
      newEase = Math.max(1.3, newEase - 0.15);
    } else if (quality === 'good') {
      newBox = Math.min(5, newBox + 1);
      newInterval = Math.round(newInterval * newEase);
    } else if (quality === 'easy') {
      newBox = Math.min(5, newBox + 1);
      newInterval = Math.round(newInterval * newEase * 1.3);
      newEase = Math.min(3.0, newEase + 0.15);
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    const updated: Flashcard = {
      ...currentCard,
      box: newBox,
      intervalDays: newInterval,
      easeFactor: newEase,
      repetitions: (currentCard.repetitions || 0) + 1,
      lastReviewed: new Date().toISOString().split('T')[0],
      nextReviewDate: nextDate.toISOString().split('T')[0]
    };

    onUpdateCard(updated);

    // Advance to next card or complete session
    if (currentCardIndex + 1 < studyQueue.length) {
      setCurrentCardIndex((i) => i + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else {
      // Completed deck review
      const correctCards = studyQueue.length;
      setSessionResults({ correct: correctCards, total: studyQueue.length });

      onLogStudySession({
        technique: 'Active Recall & Spaced Repetition',
        subject: activeDeck?.subject || 'Academics',
        topic: `${activeDeck?.title} Flashcards`,
        durationMinutes: Math.max(10, Math.round(studyQueue.length * 1.5)),
        timestamp: new Date().toISOString(),
        notes: `Reviewed ${studyQueue.length} cards using active recall spaced repetition.`
      });
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFormData.front.trim() || !cardFormData.back.trim()) return;

    if (editingCard) {
      onUpdateCard({
        ...editingCard,
        front: cardFormData.front,
        back: cardFormData.back,
        hint: cardFormData.hint
      });
    } else {
      onAddCard({
        deckId: selectedDeckId,
        front: cardFormData.front,
        back: cardFormData.back,
        hint: cardFormData.hint,
        box: 1,
        repetitions: 0,
        easeFactor: 2.5,
        intervalDays: 1,
        nextReviewDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsCardModalOpen(false);
  };

  const handleDeckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckFormData.title.trim()) return;
    onAddDeck(deckFormData);
    setIsDeckModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 4 Active Recall & Spaced Repetition</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Flashcard Decks & Spaced Intervals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test retention actively, flip cards in 3D, and advance cards along the Leitner intervals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDeckModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Deck</span>
          </button>
        </div>
      </div>

      {/* Deck Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {decks.map((deck) => {
          const isSelected = deck.id === selectedDeckId;
          const count = flashcards.filter((c) => c.deckId === deck.id).length;
          return (
            <button
              key={deck.id}
              onClick={() => {
                setSelectedDeckId(deck.id);
                setIsStudyMode(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-left border shrink-0 transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-500'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className={`text-xs font-bold truncate max-w-[180px] ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                {deck.title}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span>{deck.subject}</span>
                <span>·</span>
                <span className="font-mono tabular-nums">{count} cards</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main View Area: Study Mode vs Card Manager */}
      {isStudyMode && studyQueue.length > 0 ? (
        /* --- ACTIVE RECALL 3D STUDY MODE --- */
        <div className="space-y-6">
          {sessionResults ? (
            /* Session Completed Screen */
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/90 shadow-sm max-w-lg mx-auto">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">Deck Review Complete!</h3>
              <p className="text-xs text-slate-500 mt-1">
                You reviewed all {sessionResults.total} cards in <span className="font-semibold">{activeDeck?.title}</span>.
              </p>

              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                Spaced repetition review intervals have been automatically recalculated based on your responses.
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => startStudying(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Review Again
                </button>
                <button
                  onClick={() => setIsStudyMode(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                >
                  Back to Deck View
                </button>
              </div>
            </div>
          ) : (
            /* Active Card Stage */
            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <button
                  onClick={() => setIsStudyMode(false)}
                  className="text-slate-500 hover:text-slate-800"
                >
                  ← Exit Practice
                </button>
                <span className="font-mono tabular-nums font-semibold text-indigo-700">
                  Card {currentCardIndex + 1} of {studyQueue.length}
                </span>
                <span className="text-slate-400">Box {studyQueue[currentCardIndex]?.box || 1} / 5</span>
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[300px] bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 flex flex-col justify-between cursor-pointer hover:border-indigo-300 transition-all select-none relative"
                style={{ perspective: '1000px' }}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    <span>{isFlipped ? 'Answer (Back)' : 'Question (Front)'}</span>
                    <span className="text-[11px] text-indigo-600 font-normal">Click anywhere to flip</span>
                  </div>

                  <div className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed pt-2">
                    {isFlipped
                      ? studyQueue[currentCardIndex]?.back
                      : studyQueue[currentCardIndex]?.front}
                  </div>

                  {!isFlipped && studyQueue[currentCardIndex]?.hint && (
                    <div className="mt-4">
                      {showHint ? (
                        <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                          Hint: {studyQueue[currentCardIndex]?.hint}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHint(true);
                          }}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Show Hint</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Press Space / Click to reveal</span>
                  <RotateCw className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Spaced Repetition Rating Buttons (visible when flipped) */}
              {isFlipped ? (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <p className="text-xs text-center font-medium text-slate-500">
                    How well did you retrieve this concept?
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleRateResponse('again')}
                      className="py-2.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-center transition-colors"
                    >
                      <span className="text-xs font-bold text-rose-700 block">Again</span>
                      <span className="text-[10px] text-rose-500 block">&lt; 1 day</span>
                    </button>
                    <button
                      onClick={() => handleRateResponse('hard')}
                      className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-center transition-colors"
                    >
                      <span className="text-xs font-bold text-amber-700 block">Hard</span>
                      <span className="text-[10px] text-amber-500 block">+2 days</span>
                    </button>
                    <button
                      onClick={() => handleRateResponse('good')}
                      className="py-2.5 px-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-center transition-colors"
                    >
                      <span className="text-xs font-bold text-indigo-700 block">Good</span>
                      <span className="text-[10px] text-indigo-500 block">+4 days</span>
                    </button>
                    <button
                      onClick={() => handleRateResponse('easy')}
                      className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-center transition-colors"
                    >
                      <span className="text-xs font-bold text-emerald-700 block">Easy</span>
                      <span className="text-[10px] text-emerald-500 block">+7 days</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Reveal Answer</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* --- DECK MANAGEMENT & CARD LIST VIEW --- */
        <div className="space-y-6">
          {activeDeck && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600">{activeDeck.subject}</span>
                <h3 className="text-lg font-bold text-slate-900">{activeDeck.title}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">{activeDeck.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => startStudying(false)}
                  disabled={deckCards.length === 0}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <span>Practice Deck</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => startStudying(true)}
                  disabled={deckCards.length === 0}
                  className="p-2 text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-xl transition-colors"
                  title="Random practice order"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingCard(null);
                    setCardFormData({ front: '', back: '', hint: '' });
                    setIsCardModalOpen(true);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Card</span>
                </button>
              </div>
            </div>
          )}

          {/* Cards Table / List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
              <span>Cards in this deck ({deckCards.length})</span>
              <span>Leitner Box / Spaced Interval</span>
            </div>

            {deckCards.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/90 shadow-xs">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No flashcards yet in this deck</p>
                <p className="text-xs text-slate-500 mt-0.5">Add cards with clear questions and concise answers.</p>
                <button
                  onClick={() => {
                    setEditingCard(null);
                    setCardFormData({ front: '', back: '', hint: '' });
                    setIsCardModalOpen(true);
                  }}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                >
                  Add First Flashcard
                </button>
              </div>
            ) : (
              deckCards.map((card, idx) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900">{card.front}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{card.back}</p>
                    {card.hint && (
                      <p className="text-[11px] text-amber-700 mt-1">Hint: {card.hint}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-indigo-700 block">
                        Box {card.box} / 5
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono tabular-nums block">
                        Interval: {card.intervalDays}d
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setEditingCard(card);
                        setCardFormData({
                          front: card.front,
                          back: card.back,
                          hint: card.hint || ''
                        });
                        setIsCardModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit card"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteCard(card.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Deck Modal */}
      {isDeckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsDeckModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4">Create New Flashcard Deck</h3>
            <form onSubmit={handleDeckSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deck Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry Functional Groups"
                  value={deckFormData.title}
                  onChange={(e) => setDeckFormData({ ...deckFormData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                <select
                  value={deckFormData.subject}
                  onChange={(e) => setDeckFormData({ ...deckFormData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Alcohols, Aldehydes & Ketones"
                  value={deckFormData.topic}
                  onChange={(e) => setDeckFormData({ ...deckFormData, topic: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of concepts covered..."
                  value={deckFormData.description}
                  onChange={(e) => setDeckFormData({ ...deckFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeckModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  Create Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Card Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsCardModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingCard ? 'Edit Flashcard' : 'Add Flashcard'}
            </h3>
            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question / Concept (Front) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. What is the conjugate base of HSO4-?"
                  value={cardFormData.front}
                  onChange={(e) => setCardFormData({ ...cardFormData, front: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Answer (Back) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. SO4^2- (Sulfate ion). A conjugate base is formed after donating a proton (H+)."
                  value={cardFormData.back}
                  onChange={(e) => setCardFormData({ ...cardFormData, back: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Memory Hint (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Remember to subtract one H+ and decrease formal charge by 1"
                  value={cardFormData.hint}
                  onChange={(e) => setCardFormData({ ...cardFormData, hint: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingCard ? 'Save Changes' : 'Add Flashcard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
