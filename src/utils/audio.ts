// Pure Web Audio API chime generator for Pomodoro and timer notifications
// Zero external file dependencies; plays a relaxing singing bowl / marimba chime tone

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTimerCompletionChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Play a gentle two-chord harmony chime: E5 (659.25Hz) + B5 (987.77Hz) then G#5 (830.61Hz)
    const tones = [
      { freq: 523.25, time: 0.0, dur: 1.2, vol: 0.25 }, // C5
      { freq: 659.25, time: 0.15, dur: 1.4, vol: 0.3 }, // E5
      { freq: 783.99, time: 0.3, dur: 1.6, vol: 0.35 }, // G5
      { freq: 1046.50, time: 0.45, dur: 2.0, vol: 0.25 } // C6
    ];

    tones.forEach(({ freq, time, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Soft envelope attack and long gentle exponential decay
      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.exponentialRampToValueAtTime(vol, now + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.1);
    });
  } catch {
    // Audio may be blocked by browser autoplay policy before user interaction
  }
}

export function playTickSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch {
    // Ignore tick sound errors
  }
}
