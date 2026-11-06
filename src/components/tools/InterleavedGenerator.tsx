import React, { useState } from 'react';
import { Shuffle, Plus, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Subject, StudySession } from '../../types';

interface InterleavedGeneratorProps {
  subjects: Subject[];
  onAddScheduledSessions: (sessions: Omit<StudySession, 'id'>[]) => void;
}

export const InterleavedGenerator: React.FC<InterleavedGeneratorProps> = ({
  subjects,
  onAddScheduledSessions
}) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    subjects[0]?.name || 'General Chemistry',
    subjects[1]?.name || 'Calculus & Analytic Geometry'
  ]);
  const [blockDurationMinutes, setBlockDurationMinutes] = useState(25);
  const [totalRotations, setTotalRotations] = useState(4); // 4 blocks = 100 mins
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('16:00');
  const [generatedPlan, setGeneratedPlan] = useState<Omit<StudySession, 'id'>[] | null>(null);

  const toggleSubject = (name: string) => {
    if (selectedSubjects.includes(name)) {
      if (selectedSubjects.length > 2) {
        setSelectedSubjects(selectedSubjects.filter(s => s !== name));
      } else {
        alert('Please keep at least 2 subjects to interleave.');
      }
    } else {
      if (selectedSubjects.length < 4) {
        setSelectedSubjects([...selectedSubjects, name]);
      } else {
        alert('Interleaving works best with 2 to 4 distinct topics.');
      }
    }
  };

  const handleGenerate = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    let currentMins = startH * 60 + startM;

    const sessions: Omit<StudySession, 'id'>[] = [];

    for (let i = 0; i < totalRotations; i++) {
      const subjectIndex = i % selectedSubjects.length;
      const subName = selectedSubjects[subjectIndex];

      const h = Math.floor(currentMins / 60);
      const m = currentMins % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      sessions.push({
        subject: subName,
        topic: `Interleaved Block ${i + 1}: ${subName} Practice`,
        date: targetDate,
        startTime: timeStr,
        duration: blockDurationMinutes,
        priority: 'Medium',
        status: 'scheduled',
        technique: 'Interleaved Practice',
        notes: `Interleaving rotation block ${i + 1} of ${totalRotations}.`
      });

      currentMins += blockDurationMinutes + breakMinutes;
    }

    setGeneratedPlan(sessions);
  };

  const handleApplyToScheduler = () => {
    if (generatedPlan) {
      onAddScheduledSessions(generatedPlan);
      alert(`Successfully added ${generatedPlan.length} interleaved sessions to your Study Scheduler!`);
      setGeneratedPlan(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cognitive Psychology Technique</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Interleaved Practice Generator</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Instead of studying one subject for 4 hours (blocked practice), alternate between 2-3 subjects in 25-minute blocks. This forces your brain to continually discriminate between problem types.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select 2 to 4 Subjects to Interleave
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {subjects.map((sub) => {
              const isSelected = selectedSubjects.includes(sub.name);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => toggleSubject(sub.name)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                  }`}
                >
                  <p className="text-xs font-bold truncate">{sub.name}</p>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{sub.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Block Duration</label>
            <select
              value={blockDurationMinutes}
              onChange={(e) => setBlockDurationMinutes(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            >
              <option value={20}>20 Minutes per subject</option>
              <option value={25}>25 Minutes (Recommended)</option>
              <option value={35}>35 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Rotations</label>
            <select
              value={totalRotations}
              onChange={(e) => setTotalRotations(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            >
              <option value={3}>3 alternating blocks</option>
              <option value={4}>4 alternating blocks (~2 hrs)</option>
              <option value={6}>6 alternating blocks (~3 hrs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rest Buffer Between</label>
            <select
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            >
              <option value={5}>5-minute rest</option>
              <option value={10}>10-minute rest</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            <span>Generate Interleaved Routine</span>
          </button>
        </div>

        {/* Generated Preview */}
        {generatedPlan && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 animate-in fade-in">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Generated Rotational Schedule ({generatedPlan.length} Blocks)
            </h3>
            <div className="space-y-2">
              {generatedPlan.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{s.subject}</p>
                      <p className="text-slate-500 text-[11px]">{s.topic}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700">{s.startTime}</span>
                    <span className="text-[10px] text-slate-400 block">{s.duration} mins</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleApplyToScheduler}
              className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              Save All Blocks into Study Scheduler
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
