import React, { useState } from 'react';
import { Brain, Sparkles, Check, Trash2, BookOpen, ArrowRight, History } from 'lucide-react';
import { FeynmanEntry, Subject, StudyLog } from '../../types';

interface FeynmanWorkspaceProps {
  entries: FeynmanEntry[];
  subjects: Subject[];
  onSaveEntry: (entry: Omit<FeynmanEntry, 'id' | 'date'>) => void;
  onDeleteEntry: (id: string) => void;
  onLogStudySession: (log: Omit<StudyLog, 'id'>) => void;
}

export const FeynmanWorkspace: React.FC<FeynmanWorkspaceProps> = ({
  entries,
  subjects,
  onSaveEntry,
  onDeleteEntry,
  onLogStudySession
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeTab, setActiveTab] = useState<'workspace' | 'history'>('workspace');

  const [formData, setFormData] = useState({
    concept: '',
    subject: subjects[0]?.name || 'General Chemistry',
    childExplanation: '',
    identifiedGaps: '',
    analogy: ''
  });

  const handleFinish = () => {
    if (!formData.concept.trim() || !formData.childExplanation.trim()) {
      alert('Please complete the concept name and explanation.');
      return;
    }

    onSaveEntry(formData);
    onLogStudySession({
      technique: 'Feynman Technique',
      subject: formData.subject,
      topic: `Simplified Concept: ${formData.concept}`,
      durationMinutes: 30,
      timestamp: new Date().toISOString(),
      notes: `Completed 4-step Feynman simplification for ${formData.concept}.`
    });

    // Reset workspace
    setFormData({
      concept: '',
      subject: subjects[0]?.name || 'General Chemistry',
      childExplanation: '',
      identifiedGaps: '',
      analogy: ''
    });
    setCurrentStep(1);
    setActiveTab('history');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 5 Learning Techniques</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Feynman Technique Workspace</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            "If you can't explain it simply, you don't understand it well enough." — Richard Feynman
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'workspace' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Guided Workspace
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'history' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved Explanations ({entries.length})
          </button>
        </div>
      </div>

      {activeTab === 'workspace' ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          {/* Step indicator */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, title: 'Concept' },
              { num: 2, title: 'Teach a Child' },
              { num: 3, title: 'Pinpoint Gaps' },
              { num: 4, title: 'Analogy' }
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num as 1 | 2 | 3 | 4)}
                className={`py-2 px-1 text-center rounded-xl border transition-all ${
                  currentStep === s.num
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold'
                    : currentStep > s.num
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                <span className="text-[10px] block uppercase tracking-wider">Step {s.num}</span>
                <span className="text-xs truncate block">{s.title}</span>
              </button>
            ))}
          </div>

          {/* Step 1: Choose Concept */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Step 1: Select the Target Concept</h3>
                <p className="text-xs text-indigo-700 mt-1">
                  Identify the specific academic principle, theorem, mechanism, or event you struggle with.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Concept Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Le Chatelier's Principle or Binary Search Tree Rotations"
                  value={formData.concept}
                  onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  disabled={!formData.concept.trim()}
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl flex items-center gap-2"
                >
                  <span>Continue to Step 2</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Teach to a 12-Year-Old */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100">
                <h3 className="text-xs font-bold text-sky-900 uppercase tracking-wider">Step 2: Explain Like You're Teaching a 12-Year-Old</h3>
                <p className="text-xs text-sky-700 mt-1">
                  Write a comprehensive explanation of <span className="font-semibold text-sky-950">{formData.concept}</span> using only plain, intuitive words. Avoid jargon or textbooks definitions.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Plain-Language Explanation *</label>
                <textarea
                  rows={6}
                  placeholder="Imagine you are talking to a middle school student who has never taken this class..."
                  value={formData.childExplanation}
                  onChange={(e) => setFormData({ ...formData, childExplanation: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 leading-relaxed"
                />
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!formData.childExplanation.trim()}
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl flex items-center gap-2"
                >
                  <span>Continue to Step 3</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Pinpoint Knowledge Gaps */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Step 3: Identify Gaps and Clunky Jargon</h3>
                <p className="text-xs text-amber-700 mt-1">
                  Read over what you wrote. Where did you get stuck? Where did you lean on a technical word without explaining what it actually means?
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Identified Confusion Points & Gaps</label>
                <textarea
                  rows={4}
                  placeholder="e.g. I struggled to explain why pressure change shifts equilibrium without using the word 'partial pressure'. I need to review how volume contraction forces gas molecules closer together."
                  value={formData.identifiedGaps}
                  onChange={(e) => setFormData({ ...formData, identifiedGaps: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 leading-relaxed"
                />
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2"
                >
                  <span>Continue to Step 4</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Analogy & Finalize */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Step 4: Create a Powerful Mental Analogy</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Connect this concept to an everyday real-world object or human scenario.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Intuitive Real-World Analogy</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Think of a crowded dance floor: when the security guards push the walls inward, people partner up into slow dances to take up less space!"
                  value={formData.analogy}
                  onChange={(e) => setFormData({ ...formData, analogy: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 leading-relaxed"
                />
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Feynman Explanation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* History of Feynman Explanations */
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs">
              <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No saved Feynman entries yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Break down challenging formulas and theories using the guided 4-step workspace.
              </p>
              <button
                onClick={() => setActiveTab('workspace')}
                className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
              >
                Start First Explanation
              </button>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-600">{entry.subject}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{entry.concept}</h3>
                  </div>
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900 mb-1">Child Explanation:</p>
                  <p>{entry.childExplanation}</p>
                </div>

                {entry.analogy && (
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                    <p className="font-semibold mb-0.5">Analogy:</p>
                    <p>{entry.analogy}</p>
                  </div>
                )}

                {entry.identifiedGaps && (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900 leading-relaxed">
                    <p className="font-semibold mb-0.5">Review Notes / Gaps:</p>
                    <p>{entry.identifiedGaps}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
