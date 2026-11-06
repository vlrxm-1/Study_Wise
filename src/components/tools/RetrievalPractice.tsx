import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Sparkles, Plus, ArrowRight, RotateCcw } from 'lucide-react';
import { Subject, RetrievalQuestion, StudyLog } from '../../types';
import { INITIAL_RETRIEVAL_QUESTIONS } from '../../data/sampleData';

interface RetrievalPracticeProps {
  subjects: Subject[];
  onLogStudySession: (log: Omit<StudyLog, 'id'>) => void;
}

export const RetrievalPractice: React.FC<RetrievalPracticeProps> = ({
  subjects,
  onLogStudySession
}) => {
  const [questions, setQuestions] = useState<RetrievalQuestion[]>(INITIAL_RETRIEVAL_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  // New question form modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newQ, setNewQ] = useState({
    subject: subjects[0]?.name || 'General Chemistry',
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: ''
  });

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setCompleted(true);
      onLogStudySession({
        technique: 'Retrieval Practice',
        subject: currentQ.subject,
        topic: 'Self-Quizzing Drill',
        durationMinutes: 20,
        timestamp: new Date().toISOString(),
        notes: `Scored ${score + (selectedOption === currentQ.correctIndex ? 1 : 0)}/${questions.length} on active recall test.`
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setCompleted(false);
  };

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.question.trim() || newQ.options.some(o => !o.trim())) return;

    setQuestions([...questions, {
      id: `rq-${Date.now()}`,
      ...newQ
    }]);
    setIsAddModalOpen(false);
    setNewQ({
      subject: subjects[0]?.name || 'General Chemistry',
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 5 Self-Testing</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Retrieval Practice (Self-Quizzing)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Testing yourself is a potent memory tool, not merely an assessment. Attempting to retrieve answers strengthens synaptic connections.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Question</span>
        </button>
      </div>

      {completed ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/90 shadow-sm max-w-lg mx-auto">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">Quiz Completed!</h3>
          <p className="text-xs text-slate-500 mt-1">
            Your score: <span className="text-indigo-600 font-bold text-sm">{score} / {questions.length}</span> (
            {Math.round((score / questions.length) * 100)}%)
          </p>
          <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
            Study session logged to your Analytics.
          </div>
          <button
            onClick={handleRestart}
            className="mt-6 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            Practice Again
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
            <span className="font-semibold text-indigo-600">{currentQ.subject}</span>
            <span className="font-mono tabular-nums">Question {currentIndex + 1} of {questions.length}</span>
            <span className="font-mono tabular-nums font-semibold text-slate-700">Score: {score}</span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnClass = 'border-slate-200 bg-white hover:border-slate-300 text-slate-800';

              if (isAnswerSubmitted) {
                if (idx === currentQ.correctIndex) {
                  btnClass = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500';
                } else if (isSelected) {
                  btnClass = 'border-rose-500 bg-rose-50 text-rose-950 ring-1 ring-rose-500';
                } else {
                  btnClass = 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                btnClass = 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-500';
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-start gap-3 ${btnClass}`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] font-bold font-mono">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation if answered */}
          {isAnswerSubmitted && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1 animate-in fade-in">
              <p className="font-bold text-slate-900">
                {selectedOption === currentQ.correctIndex ? '✓ Correct!' : '✕ Incorrect'}
              </p>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            {!isAnswerSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Custom Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Custom Retrieval Question</h3>
            <form onSubmit={handleAddQuestionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={newQ.subject}
                  onChange={(e) => setNewQ({ ...newQ, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Question Prompt *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. What is the fundamental difference between Mitosis and Meiosis?"
                  value={newQ.question}
                  onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">4 Multiple-Choice Options *</label>
                {newQ.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctIdx"
                      checked={newQ.correctIndex === idx}
                      onChange={() => setNewQ({ ...newQ, correctIndex: idx })}
                      title="Select this as the correct answer"
                      className="text-indigo-600"
                    />
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...newQ.options];
                        copy[idx] = e.target.value;
                        setNewQ({ ...newQ, options: copy });
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                ))}
                <span className="text-[10px] text-slate-400">Click radio button on the left to designate correct answer.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Explanation</label>
                <textarea
                  rows={2}
                  placeholder="Explain why this option is correct to aid recall..."
                  value={newQ.explanation}
                  onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
