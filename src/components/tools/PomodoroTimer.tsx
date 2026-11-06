import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Snowflake,
  Settings,
  CheckCircle2
} from 'lucide-react';
import { Subject, Task, StudyLog } from '../../types';
import { playTimerCompletionChime, playTickSound } from '../../utils/audio';

interface PomodoroTimerProps {
  subjects: Subject[];
  tasks: Task[];
  initialTask?: Task | null;
  initialSubject?: string;
  onLogStudySession: (log: Omit<StudyLog, 'id'>) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

type TimerStyle = 'ice' | 'candle' | 'digital';
type TimerMode = 'pomodoro' | 'short_break' | 'long_break' | 'custom';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  subjects,
  tasks,
  initialTask,
  initialSubject,
  onLogStudySession,
  soundEnabled,
  onToggleSound
}) => {
  const [timerStyle, setTimerStyle] = useState<TimerStyle>('ice');
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  
  // Custom duration inputs in minutes
  const [customMinutes, setCustomMinutes] = useState(30);

  // Default minutes for each mode
  const modeMinutes: Record<TimerMode, number> = {
    pomodoro: 25,
    short_break: 5,
    long_break: 15,
    custom: customMinutes
  };

  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCompletedNotice, setSessionCompletedNotice] = useState(false);

  // Subject and topic
  const [selectedSubject, setSelectedSubject] = useState(
    initialTask?.subject || initialSubject || subjects[0]?.name || 'General Chemistry'
  );
  const [topic, setTopic] = useState(initialTask?.title || '');
  const [completedCount, setCompletedCount] = useState(0);

  const timerRef = useRef<number | null>(null);

  // Sync when initialTask changes
  useEffect(() => {
    if (initialTask) {
      setSelectedSubject(initialTask.subject);
      setTopic(initialTask.title);
    }
  }, [initialTask]);

  // Mode change handler
  const handleModeChange = (mode: TimerMode) => {
    setTimerMode(mode);
    setIsRunning(false);
    const secs = (mode === 'custom' ? customMinutes : modeMinutes[mode]) * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setSessionCompletedNotice(false);
  };

  // Reset
  const handleReset = () => {
    setIsRunning(false);
    const secs = (timerMode === 'custom' ? customMinutes : modeMinutes[timerMode]) * 60;
    setSecondsLeft(secs);
    setSessionCompletedNotice(false);
  };

  // Main countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Completed!
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setSessionCompletedNotice(true);

            if (soundEnabled) {
              playTimerCompletionChime();
            }

            // Log session if work mode
            const durationMins = Math.round(totalSeconds / 60);
            if (timerMode === 'pomodoro' || timerMode === 'custom') {
              onLogStudySession({
                technique: timerStyle === 'ice' ? 'Visual Timer (Melting Ice)' : timerStyle === 'candle' ? 'Visual Timer (Candle)' : 'Pomodoro Timer',
                subject: selectedSubject,
                topic: topic || 'Focused Study Session',
                durationMinutes: durationMins,
                timestamp: new Date().toISOString(),
                notes: `Completed ${durationMins}-minute study interval.`
              });
              setCompletedCount((c) => c + 1);
            }

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
  }, [isRunning, totalSeconds, timerMode, timerStyle, selectedSubject, topic, soundEnabled, onLogStudySession]);

  // Calculate elapsed progress (0% to 100%)
  const elapsedFraction = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const progressPercent = Math.min(100, Math.max(0, elapsedFraction * 100));

  // Time format
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Ice cube physics simulation parameters:
  // As progressPercent increases:
  // - cube size shrinks (height 100% -> 20%)
  // - rounded corners increase (rx/ry 4 -> 24)
  // - opacity/translucency softens
  // - puddle at bottom expands from 0px to 140px
  const iceScaleY = Math.max(0.18, 1 - elapsedFraction * 0.82);
  const iceScaleX = Math.max(0.25, 1 - elapsedFraction * 0.75);
  const iceCornerRadius = 8 + elapsedFraction * 20;
  const puddleScaleX = 0.2 + elapsedFraction * 1.3;
  const puddleOpacity = 0.15 + elapsedFraction * 0.75;

  // Candle physics simulation parameters:
  // As progressPercent increases:
  // - candle height decreases from 120px to 25px
  // - flame moves down with the candle top wick
  // - wax drip formations expand
  const candleMaxHeight = 120;
  const candleMinHeight = 26;
  const currentCandleHeight = candleMaxHeight - elapsedFraction * (candleMaxHeight - candleMinHeight);
  const candleTopY = 160 - currentCandleHeight; // base is at y=160

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Session Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 3 Study Timers</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Pomodoro & Visual Timers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reinforce focus with tactile visual passage of time or classic intervals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                soundEnabled
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
              title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Chimes On' : 'Muted'}</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => handleModeChange('pomodoro')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                timerMode === 'pomodoro'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pomodoro (25m)
            </button>
            <button
              onClick={() => handleModeChange('short_break')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                timerMode === 'short_break'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => handleModeChange('long_break')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                timerMode === 'long_break'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Long Break (15m)
            </button>
            <button
              onClick={() => handleModeChange('custom')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                timerMode === 'custom'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Visual Timer Style Picker */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setTimerStyle('ice')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                timerStyle === 'ice'
                  ? 'bg-white text-sky-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 text-sky-500" />
              <span>Melting Ice</span>
            </button>
            <button
              onClick={() => setTimerStyle('candle')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                timerStyle === 'candle'
                  ? 'bg-white text-amber-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Candle Burn</span>
            </button>
            <button
              onClick={() => setTimerStyle('digital')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                timerStyle === 'digital'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Digital Minimal
            </button>
          </div>
        </div>

        {/* Custom duration input if custom mode */}
        {timerMode === 'custom' && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600">Custom Duration:</span>
            <input
              type="number"
              min="1"
              max="180"
              value={customMinutes}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 25;
                setCustomMinutes(val);
                if (!isRunning) {
                  setTotalSeconds(val * 60);
                  setSecondsLeft(val * 60);
                }
              }}
              className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
            />
            <span className="text-xs text-slate-500">minutes</span>
          </div>
        )}
      </div>

      {/* Main Timer Display Stage */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
        {/* Subtle background glow based on timer style */}
        {timerStyle === 'ice' && (
          <div className="absolute inset-0 bg-gradient-to-b from-sky-50/40 via-transparent to-indigo-50/30 pointer-events-none" />
        )}
        {timerStyle === 'candle' && (
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/40 via-transparent to-orange-50/20 pointer-events-none" />
        )}

        {/* Visual Animation Container */}
        <div className="h-56 w-64 flex items-center justify-center relative z-10 mb-4">
          {timerStyle === 'ice' ? (
            /* --- MELTING ICE CUBE VISUAL TIMER --- */
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm">
                <defs>
                  {/* Ice Linear Gradients */}
                  <linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
                    <stop offset="40%" stopColor="#bae6fd" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.65" />
                  </linearGradient>
                  <linearGradient id="iceHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                  </linearGradient>
                  <radialGradient id="puddleGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.6 * puddleOpacity} />
                    <stop offset="70%" stopColor="#7dd3fc" stopOpacity={0.35 * puddleOpacity} />
                    <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Melt Puddle at the bottom */}
                <ellipse
                  cx="100"
                  cy="165"
                  rx={35 * puddleScaleX}
                  ry={12 * puddleScaleX}
                  fill="url(#puddleGradient)"
                  className="transition-all duration-700"
                />

                {/* Melting Ice Cube Body */}
                <g
                  transform={`translate(100, 160) scale(${iceScaleX}, ${iceScaleY}) translate(-100, -160)`}
                  className="transition-all duration-500"
                >
                  {/* Base Ice Cube Rect */}
                  <rect
                    x="55"
                    y="65"
                    width="90"
                    height="90"
                    rx={iceCornerRadius}
                    ry={iceCornerRadius}
                    fill="url(#iceGradient)"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                  />

                  {/* Crystalline internal facets */}
                  <path
                    d="M 68 80 L 132 80 L 122 135 L 78 135 Z"
                    fill="#ffffff"
                    fillOpacity={0.25 - elapsedFraction * 0.15}
                  />

                  {/* Specular Glint Top-Left */}
                  <path
                    d={`M 65 75 Q 85 70 115 72`}
                    stroke="url(#iceHighlight)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Air bubbles inside ice cube */}
                  <circle cx="80" cy="100" r="3" fill="#ffffff" fillOpacity="0.6" />
                  <circle cx="115" cy="115" r="2.5" fill="#ffffff" fillOpacity="0.5" />
                  <circle cx="95" cy="125" r="4" fill="#ffffff" fillOpacity="0.4" />
                </g>

                {/* Animated Water Droplets falling if running */}
                {isRunning && secondsLeft > 0 && (
                  <g className="animate-pulse">
                    <circle cx="92" cy="155" r="2" fill="#38bdf8" />
                    <circle cx="110" cy="158" r="1.5" fill="#0284c7" />
                  </g>
                )}
              </svg>
            </div>
          ) : timerStyle === 'candle' ? (
            /* --- CANDLE BURNING VISUAL TIMER --- */
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm">
                <defs>
                  {/* Wax Gradient */}
                  <linearGradient id="waxGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fef3c7" />
                    <stop offset="50%" stopColor="#fde68a" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
                  </linearGradient>
                  {/* Flame Gradient */}
                  <radialGradient id="flameInner" cx="50%" cy="60%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="35%" stopColor="#fef08a" />
                    <stop offset="70%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.1" />
                  </radialGradient>
                  {/* Flame Glow */}
                  <radialGradient id="flameHalo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fde047" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Candle Stand / Dish */}
                <ellipse cx="100" cy="165" rx="45" ry="9" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
                <rect x="75" y="163" width="50" height="6" rx="3" fill="#cbd5e1" />

                {/* Melted Wax pool on dish */}
                <ellipse
                  cx="100"
                  cy="163"
                  rx={15 + elapsedFraction * 20}
                  ry={4 + elapsedFraction * 4}
                  fill="#fef3c7"
                  fillOpacity="0.85"
                />

                {/* Candle Body (height decreases as timer elapses) */}
                <rect
                  x="84"
                  y={candleTopY}
                  width="32"
                  height={currentCandleHeight}
                  rx="4"
                  fill="url(#waxGradient)"
                  stroke="#d97706"
                  strokeWidth="0.8"
                  className="transition-all duration-500"
                />

                {/* Candle Top Rim Oval */}
                <ellipse
                  cx="100"
                  cy={candleTopY}
                  rx="16"
                  ry="4"
                  fill="#fef08a"
                  stroke="#d97706"
                  strokeWidth="0.8"
                  className="transition-all duration-500"
                />

                {/* Wick */}
                <line
                  x1="100"
                  y1={candleTopY}
                  x2="100"
                  y2={candleTopY - 10}
                  stroke="#475569"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />

                {/* Candle Flame (only active if secondsLeft > 0) */}
                {secondsLeft > 0 && (
                  <g className={isRunning ? 'animate-pulse' : ''} style={{ transformOrigin: `100px ${candleTopY - 18}px` }}>
                    {/* Flame Warm Glow Halo */}
                    <circle
                      cx="100"
                      cy={candleTopY - 20}
                      r="22"
                      fill="url(#flameHalo)"
                      className="transition-all duration-500"
                    />

                    {/* Tear-drop flame shape */}
                    <path
                      d={`M 100 ${candleTopY - 32} 
                          C 93 ${candleTopY - 22}, 93 ${candleTopY - 12}, 100 ${candleTopY - 10} 
                          C 107 ${candleTopY - 12}, 107 ${candleTopY - 22}, 100 ${candleTopY - 32} Z`}
                      fill="url(#flameInner)"
                      className="transition-all duration-500"
                    />
                  </g>
                )}
              </svg>
            </div>
          ) : (
            /* --- DIGITAL MINIMAL RING TIMER --- */
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="8"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  fill="transparent"
                  stroke="#4f46e5"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 78}
                  strokeDashoffset={2 * Math.PI * 78 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  {timerMode.replace('_', ' ')}
                </span>
                <span className="text-3xl font-mono font-bold text-slate-900 tabular-nums">
                  {formattedTime}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Numerical Countdown Display */}
        <div className="text-center z-10">
          <div className="text-4xl sm:text-5xl font-mono font-bold text-slate-900 tracking-tight tabular-nums">
            {formattedTime}
          </div>
          <div className="mt-1 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
            <span>{Math.round(progressPercent)}% elapsed</span>
            <span>·</span>
            <span className="capitalize">{timerMode.replace('_', ' ')}</span>
            {completedCount > 0 && (
              <>
                <span>·</span>
                <span className="text-indigo-600 font-semibold">{completedCount} session{completedCount > 1 ? 's' : ''} done</span>
              </>
            )}
          </div>
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="mt-6 flex items-center gap-3 z-10">
          <button
            onClick={handleReset}
            className="p-3 rounded-2xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3.5 rounded-2xl text-sm font-bold text-white shadow-sm transition-all flex items-center gap-2 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{secondsLeft < totalSeconds ? 'Resume' : 'Start Focus'}</span>
              </>
            )}
          </button>
        </div>

        {/* Completion Celebration Message */}
        {sessionCompletedNotice && (
          <div className="mt-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Outstanding focus! Session finished.</p>
              <p className="text-emerald-700">
                Your study hours have been automatically logged to your Analytics. Time for a well-deserved break!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Linked Subject & Task Info */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Session Association
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Topic or Associated Task
            </label>
            <input
              type="text"
              placeholder="e.g. Chapter 4 problem set drills"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
