import React, { useState } from 'react';
import { Clock, Plus, Trash2, Calendar, Sparkles } from 'lucide-react';
import { Subject } from '../../types';

interface TimeBlockItem {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  category: 'deep_study' | 'class' | 'review' | 'break' | 'exercise';
  color: string;
}

const INITIAL_BLOCKS: TimeBlockItem[] = [
  { id: 'tb-1', startTime: '08:00', endTime: '11:30', title: 'Morning Classes & Lectures', category: 'class', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { id: 'tb-2', startTime: '12:00', endTime: '13:00', title: 'Lunch & Cognitive Rest', category: 'break', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { id: 'tb-3', startTime: '14:00', endTime: '16:00', title: 'Deep Work: Problem Sets (Calculus)', category: 'deep_study', color: 'bg-indigo-50 text-indigo-800 border-indigo-300' },
  { id: 'tb-4', startTime: '16:30', endTime: '17:30', title: 'Active Recall & Flashcard Drill', category: 'review', color: 'bg-violet-50 text-violet-800 border-violet-300' },
  { id: 'tb-5', startTime: '19:00', endTime: '20:30', title: 'Lab Report Drafting (Chemistry)', category: 'deep_study', color: 'bg-indigo-50 text-indigo-800 border-indigo-300' },
];

export const TimeBlocking: React.FC = () => {
  const [blocks, setBlocks] = useState<TimeBlockItem[]>(INITIAL_BLOCKS);
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('15:00');
  const [newEnd, setNewEnd] = useState('16:00');
  const [newCategory, setNewCategory] = useState<TimeBlockItem['category']>('deep_study');

  const addBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const colors: Record<TimeBlockItem['category'], string> = {
      deep_study: 'bg-indigo-50 text-indigo-800 border-indigo-300',
      class: 'bg-slate-100 text-slate-800 border-slate-300',
      review: 'bg-violet-50 text-violet-800 border-violet-300',
      break: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      exercise: 'bg-amber-50 text-amber-800 border-amber-300'
    };

    setBlocks([
      ...blocks,
      {
        id: `tb-${Date.now()}`,
        startTime: newStart,
        endTime: newEnd,
        title: newTitle,
        category: newCategory,
        color: colors[newCategory]
      }
    ].sort((a, b) => a.startTime.localeCompare(b.startTime)));

    setNewTitle('');
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Productivity Architecture</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Time Blocking Planner</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Dedicate explicit non-negotiable blocks of time to specific tasks to eliminate context switching and decision fatigue.
        </p>
      </div>

      {/* Add Block Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Add Time Block</h3>
        <form onSubmit={addBlock} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Block Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Organic Chemistry Titration Review"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as TimeBlockItem['category'])}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            >
              <option value="deep_study">Deep Study</option>
              <option value="review">Review / Recall</option>
              <option value="class">Class / Lecture</option>
              <option value="break">Rest / Meal</option>
              <option value="exercise">Exercise / Sport</option>
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Start</label>
              <input
                type="time"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">End</label>
              <input
                type="time"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="sm:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Block</span>
            </button>
          </div>
        </form>
      </div>

      {/* Visual Timeline Schedule */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
          Daily Schedule Blocks
        </h3>

        <div className="space-y-2.5">
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${block.color}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-24 text-xs font-mono font-bold shrink-0">
                  {block.startTime} – {block.endTime}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{block.title}</p>
                  <span className="text-[10px] uppercase font-semibold tracking-wider opacity-75">
                    {block.category.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => deleteBlock(block.id)}
                className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                title="Remove block"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
