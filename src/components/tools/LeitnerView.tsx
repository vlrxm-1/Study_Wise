import React, { useState } from 'react';
import { Layers, ArrowRight, RotateCw, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { Flashcard, FlashcardDeck } from '../../types';

interface LeitnerViewProps {
  decks: FlashcardDeck[];
  flashcards: Flashcard[];
  onUpdateCard: (card: Flashcard) => void;
}

export const LeitnerView: React.FC<LeitnerViewProps> = ({ decks, flashcards, onUpdateCard }) => {
  const [selectedBox, setSelectedBox] = useState<number>(1);

  const BOX_CONFIGS = [
    { box: 1, name: 'Box 1', frequency: 'Daily Review', interval: '1 day', desc: 'New & difficult cards requiring frequent recall drills.', color: 'border-rose-200 bg-rose-50/50 text-rose-800' },
    { box: 2, name: 'Box 2', frequency: 'Every 2-3 Days', interval: '2-3 days', desc: 'Cards recalled once correctly; consolidating in working memory.', color: 'border-amber-200 bg-amber-50/50 text-amber-800' },
    { box: 3, name: 'Box 3', frequency: 'Weekly Review', interval: '5-7 days', desc: 'Intermediate mastery; testing medium-term retention.', color: 'border-indigo-200 bg-indigo-50/50 text-indigo-800' },
    { box: 4, name: 'Box 4', frequency: 'Bi-Weekly Review', interval: '14 days', desc: 'Strong recall; transitioning into permanent knowledge.', color: 'border-violet-200 bg-violet-50/50 text-violet-800' },
    { box: 5, name: 'Box 5', frequency: 'Monthly / Exam Ready', interval: '30 days', desc: 'Mastered concepts; periodic refresher before exams.', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800' },
  ];

  const cardsInSelectedBox = flashcards.filter(c => (c.box || 1) === selectedBox);

  const moveCard = (card: Flashcard, newBox: number) => {
    onUpdateCard({
      ...card,
      box: newBox,
      lastReviewed: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Leitner 5-Box Learning System</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          A systematic method of flashcard review where mastered cards graduate to higher boxes, while missed cards return to Box 1.
        </p>
      </div>

      {/* 5-Box Pipeline Visual Track */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {BOX_CONFIGS.map((cfg) => {
          const count = flashcards.filter(c => (c.box || 1) === cfg.box).length;
          const isSelected = selectedBox === cfg.box;

          return (
            <button
              key={cfg.box}
              onClick={() => setSelectedBox(cfg.box)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-white ring-2 ring-indigo-500 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">{cfg.name}</span>
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-mono font-bold text-indigo-600 tabular-nums">
                  {count}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-indigo-600">{cfg.frequency}</p>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{cfg.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Cards in Selected Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Cards in Box {selectedBox} ({cardsInSelectedBox.length})
            </h3>
            <p className="text-xs text-slate-500">
              {BOX_CONFIGS.find(b => b.box === selectedBox)?.desc}
            </p>
          </div>
        </div>

        {cardsInSelectedBox.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            No cards currently in Box {selectedBox}. Cards advance here as you answer them correctly during flashcard practice.
          </div>
        ) : (
          <div className="space-y-3">
            {cardsInSelectedBox.map((card) => {
              const deck = decks.find(d => d.id === card.deckId);
              return (
                <div
                  key={card.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block">
                      {deck?.title || 'Flashcard'}
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{card.front}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{card.back}</p>
                  </div>

                  {/* Manual Graduating / Demoting buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {selectedBox > 1 && (
                      <button
                        onClick={() => moveCard(card, selectedBox - 1)}
                        className="px-2.5 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                        title="Demote to lower box"
                      >
                        ← Move to Box {selectedBox - 1}
                      </button>
                    )}
                    {selectedBox < 5 && (
                      <button
                        onClick={() => moveCard(card, selectedBox + 1)}
                        className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        title="Graduate to next box"
                      >
                        Graduate to Box {selectedBox + 1} →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
