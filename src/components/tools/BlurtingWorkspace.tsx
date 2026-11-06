import React, { useState, useEffect, useRef } from 'react';
import { Flame, Play, RotateCcw, Check, Sparkles, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { BlurtingEntry, Subject, StudyLog } from '../../types';
import { playTimerCompletionChime } from '../../utils/audio';

interface BlurtingWorkspaceProps {
  entries: BlurtingEntry[];
  subjects: Subject[];
  onSaveEntry: (entry: Omit<BlurtingEntry, 'id' | 'date'>) => void;
  onDeleteEntry: (id: string) => void;
  onLogStudySession: (log: Omit<StudyLog, 'id'>) => void;
  soundEnabled: boolean;
}

export const BlurtingWorkspace: React.FC<BlurtingWorkspaceProps> = ({
  entries,
  subjects,
  onSaveEntry,
  onDeleteEntry,
  onLogStudySession,
  soundEnabled
}) => {
  const [activeTab, setActiveTab] = useState<'blurt' | 'history'>('blurt');
  const [phase, setPhase] = useState<'setup' | 'blurting' | 'review'>('setup');

  const [subject, setSubject] = useState(subjects[0]?.name || 'General Chemistry');
  const [topic, setTopic] = useState('');
  const [targetDuration, setTargetDuration] = useState<number>(5); // 5, 10, or 15 mins
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [braindumpText, setBraindumpText] = useState('');

  // Expected key concepts to compare against
  const [keyPoints, setKeyPoints] = useState<string[]>([
    'Core definition and primary formula',
    'Underlying assumptions and conditions',
    'Real-world examples or applications',
    'Common misconceptions or boundary cases'
  ]);
  const [newPointInput, setNewPointInput] = useState('');
  const [checkedPoints, setCheckedPoints] = useState<boolean[]>([false, false, false, false]);

  const timerRef = useRef<number | null>(null);

  const startBlurting = () => {
    if (!topic.trim()) {
      alert('Please enter a study topic or chapter to blurt.');
      return;
    }
    setSecondsLeft(targetDuration * 60);
    setBraindumpText('');
    setPhase('blurting');
  };

  useEffect(() => {
    if (phase === 'blurting') {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setPhase('review');
            if (soundEnabled) playTimerCompletionChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, soundEnabled]);

  const addKeyPoint = () => {
    if (!newPointInput.trim()) return;
    setKeyPoints([...keyPoints, newPointInput.trim()]);
    setCheckedPoints([...checkedPoints, false]);
    setNewPointInput('');
  };

  const handleFinishReview = () => {
    const checkedCount = checkedPoints.filter(Boolean).length;
    const score = keyPoints.length > 0 ? Math.round((checkedCount / keyPoints.length) * 100) : 100;

    const checklistItems = keyPoints.map((pt, i) => ({
      item: pt,
      checked: !!checkedPoints[i]
    }));

    onSaveEntry({
      subject,
      topic,
      durationMinutes: targetDuration,
      content: braindumpText,
      checklist: checklistItems,
      retentionScore: score
    });

    onLogStudySession({
      technique: 'Blurting Method',
      subject,
      topic: `Blurting: ${topic}`,
      durationMinutes: targetDuration,
      timestamp: new Date().toISOString(),
      notes: `Braindump scored ${score}% retention (${checkedCount}/${keyPoints.length} points recalled).`
    });

    setPhase('setup');
    setTopic('');
    setBraindumpText('');
    setActiveTab('history');
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Phase 5 Active Retrieval Challenge</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Blurting Method Challenge</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test immediate cognitive recall: set a timer, write everything you know from memory without looking, then evaluate against key concepts.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('blurt')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'blurt' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Timed Challenge
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'history' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved Blurts ({entries.length})
          </button>
        </div>
      </div>

      {activeTab === 'blurt' ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          {/* Phase 1: Setup */}
          {phase === 'setup' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 text-xs text-rose-900">
                <p className="font-bold mb-1">Rules of Blurting:</p>
                <ol className="list-decimal list-inside space-y-1 text-rose-800">
                  <li>No looking at textbook, slides, or search engines.</li>
                  <li>Type as fast as ideas come: facts, formulas, exceptions, steps.</li>
                  <li>When time is up, you will compare your output against key targets to calculate retention.</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Challenge Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 15].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTargetDuration(m)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                          targetDuration === m
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {m} Minutes
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Study Topic / Sub-Chapter *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enzyme Kinetics & Competitive Inhibition"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Key Concept Targets checklist before starting */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Key Concepts (To evaluate afterwards)
                </label>
                <div className="space-y-1.5 mb-2">
                  {keyPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                      <span>{pt}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setKeyPoints(keyPoints.filter((_, i) => i !== idx));
                          setCheckedPoints(checkedPoints.filter((_, i) => i !== idx));
                        }}
                        className="text-slate-400 hover:text-rose-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom key point to check..."
                    value={newPointInput}
                    onChange={(e) => setNewPointInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyPoint())}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={addKeyPoint}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-medium rounded-lg text-slate-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={startBlurting}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Blurting Challenge ({targetDuration}m)</span>
                </button>
              </div>
            </div>
          )}

          {/* Phase 2: Active Blurting */}
          {phase === 'blurting' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-rose-600">{subject}</span>
                  <h3 className="text-base font-bold text-slate-900">{topic}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl font-mono font-bold text-rose-600 tabular-nums">
                    {formattedTime}
                  </span>
                  <button
                    onClick={() => setPhase('review')}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Finish Early
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Braindump Canvas (Don't look at anything—write non-stop!)
                </label>
                <textarea
                  rows={12}
                  autoFocus
                  placeholder="Start typing every memory, definition, formula, diagram step, or exception..."
                  value={braindumpText}
                  onChange={(e) => setBraindumpText(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 leading-relaxed font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Word count: {braindumpText.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>Type naturally without editing grammar</span>
              </div>
            </div>
          )}

          {/* Phase 3: Review & Checklist */}
          {phase === 'review' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <h3 className="text-sm font-bold text-emerald-950">Challenge Complete! Review Your Recall</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Now look at your textbooks or notes. Check off the target concepts you remembered correctly in your braindump.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                {braindumpText || '(No text entered during the session)'}
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Checklist of Expected Points
                </h4>
                {keyPoints.map((pt, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedPoints[idx]}
                      onChange={(e) => {
                        const copy = [...checkedPoints];
                        copy[idx] = e.target.checked;
                        setCheckedPoints(copy);
                      }}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`text-xs ${checkedPoints[idx] ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                      {pt}
                    </span>
                  </label>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-500">Retention Score: </span>
                  <span className="font-bold text-indigo-600 font-mono tabular-nums text-sm">
                    {keyPoints.length > 0
                      ? Math.round((checkedPoints.filter(Boolean).length / keyPoints.length) * 100)
                      : 100}%
                  </span>
                </div>

                <button
                  onClick={handleFinishReview}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Blurting Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* History of Past Blurts */
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs">
              <Flame className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No blurting history yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Train your active recall pathways by writing continuous braindumps under time constraints.
              </p>
              <button
                onClick={() => setActiveTab('blurt')}
                className="mt-4 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
              >
                Start First Challenge
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
                    <span className="text-[11px] font-semibold text-rose-600">{entry.subject}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{entry.topic}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 tabular-nums">
                      {entry.retentionScore}% Retention
                    </span>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-mono max-h-36 overflow-y-auto leading-relaxed">
                  {entry.content}
                </div>

                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  {entry.checklist.map((chk, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded-md ${
                        chk.checked ? 'bg-emerald-50 text-emerald-800 font-medium' : 'bg-slate-100 text-slate-400 line-through'
                      }`}
                    >
                      {chk.item}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
