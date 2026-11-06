import React, { useState } from 'react';
import {
  User,
  Sliders,
  Volume2,
  VolumeX,
  RotateCcw,
  Trash2,
  Plus,
  CheckCircle2,
  Sparkles,
  School,
  Flame,
  Snowflake
} from 'lucide-react';
import { UserProfile, Subject } from '../../types';

interface SettingsViewProps {
  profile: UserProfile;
  subjects: Subject[];
  isSampleData: boolean;
  onUpdateProfile: (updated: UserProfile) => void;
  onAddSubject: (newSub: Subject) => void;
  onDeleteSubject: (subId: string) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  subjects,
  isSampleData,
  onUpdateProfile,
  onAddSubject,
  onDeleteSubject,
  onResetSampleData,
  onClearAllData
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New subject form
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubColor, setNewSubColor] = useState('indigo');

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
      indigo: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700', border: 'border-indigo-300' },
      sky: { bg: 'bg-sky-50 text-sky-700 border-sky-200', text: 'text-sky-700', border: 'border-sky-300' },
      purple: { bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700', border: 'border-purple-300' },
      emerald: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', border: 'border-emerald-300' },
      amber: { bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'text-amber-800', border: 'border-amber-300' },
      rose: { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', border: 'border-rose-300' },
    };

    const styling = colorClasses[newSubColor] || colorClasses.indigo;

    onAddSubject({
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      code: newSubCode.trim() || newSubName.slice(0, 4).toUpperCase(),
      color: newSubColor,
      bgClass: styling.bg,
      textClass: styling.text,
      borderClass: styling.border
    });

    setNewSubName('');
    setNewSubCode('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Settings & Preferences</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure student academic identity, daily goals, audio feedback, and study subjects.
        </p>
      </div>

      {/* Sample Data Status Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isSampleData
          ? 'bg-indigo-50/70 border-indigo-100 text-indigo-900'
          : 'bg-emerald-50/70 border-emerald-100 text-emerald-900'
      }`}>
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold">
              {isSampleData ? 'Sample Demo Mode Active' : 'Personal Academic Mode Active'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {isSampleData
                ? 'You are viewing realistic high school/college sample tasks, schedules, and flashcards. You can add your own data at any time or start fresh.'
                : 'Using your custom workspace data. Everything is persisted locally in your browser.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (confirm('Reset to realistic sample demo data? This will restore sample tasks, schedules, and flashcard decks.')) {
                onResetSampleData();
              }
            }}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Demo Data</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Clear all tasks, study logs, and schedules to start with a blank slate?')) {
                onClearAllData();
              }
            }}
            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear to Empty</span>
          </button>
        </div>
      </div>

      {/* Student Profile Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Student Profile</h2>
        </div>

        <form onSubmit={handleSubmitProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Level *</label>
              <select
                value={formData.academicLevel}
                onChange={(e) => setFormData({ ...formData, academicLevel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Senior High School (Grade 11-12)">Senior High School (Grade 11-12)</option>
                <option value="College / University Freshman">College / University Freshman</option>
                <option value="College / University Sophomore">College / University Sophomore</option>
                <option value="College / University Junior">College / University Junior</option>
                <option value="College / University Senior">College / University Senior</option>
                <option value="Postgraduate / Graduate Studies">Postgraduate / Graduate Studies</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Strand or College Major *</label>
              <input
                type="text"
                required
                placeholder="e.g. STEM Track, BS Computer Science, Pre-Med..."
                value={formData.strandOrMajor}
                onChange={(e) => setFormData({ ...formData, strandOrMajor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">School / University</label>
              <input
                type="text"
                placeholder="e.g. Metro Science Academy"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Daily Goal & Timer preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Study Goal: <span className="text-indigo-600 font-mono tabular-nums">{(formData.dailyStudyGoalMinutes / 60).toFixed(1)} hours</span> ({formData.dailyStudyGoalMinutes} mins)
              </label>
              <input
                type="range"
                min="60"
                max="480"
                step="30"
                value={formData.dailyStudyGoalMinutes}
                onChange={(e) => setFormData({ ...formData, dailyStudyGoalMinutes: parseInt(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>1.0h</span>
                <span>3.0h</span>
                <span>5.0h</span>
                <span>8.0h</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sound Chimes
              </label>
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, soundEnabled: !formData.soundEnabled })}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border flex items-center gap-2 transition-colors ${
                    formData.soundEnabled
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  {formData.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{formData.soundEnabled ? 'Chime Sounds Enabled' : 'Muted'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {saveSuccess ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              Save Profile Settings
            </button>
          </div>
        </form>
      </div>

      {/* Academic Subjects Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <School className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Registered Academic Subjects ({subjects.length})</h2>
        </div>

        {/* Existing subjects list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${sub.bgClass}`}
            >
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{sub.name}</p>
                <span className="text-[10px] font-mono opacity-80">{sub.code}</span>
              </div>
              {subjects.length > 1 && (
                <button
                  onClick={() => onDeleteSubject(sub.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove subject"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add new subject inline form */}
        <form onSubmit={handleCreateSubject} className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Add New Subject</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Organic Chemistry II"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
              <input
                type="text"
                placeholder="e.g. CHEM 202"
                value={newSubCode}
                onChange={(e) => setNewSubCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Color Palette</label>
              <select
                value={newSubColor}
                onChange={(e) => setNewSubColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="indigo">Indigo / Lavender</option>
                <option value="sky">Pastel Sky Blue</option>
                <option value="purple">Royal Purple</option>
                <option value="emerald">Emerald Green</option>
                <option value="amber">Warm Amber</option>
                <option value="rose">Soft Rose</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Subject</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
