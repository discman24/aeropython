import React, { useState, useMemo } from 'react';
import { Flame, Eye, EyeOff, Check, Zap, ChevronRight, ChevronLeft } from 'lucide-react';

export default function DailyChallenge({ challenges = [], streak = 0, hasDoneToday = false, onComplete }) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState(hasDoneToday);

  // Deterministic daily challenge based on day-of-year
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const challengeIndex = dayOfYear % Math.max(challenges.length, 1);
  const challenge = challenges[challengeIndex];

  if (!challenge) {
    return (
      <div className="text-center py-8 text-slate-500 text-xs">
        <p className="font-bold uppercase tracking-widest">Loading challenges...</p>
      </div>
    );
  }

  const diffColor = {
    easy: 'text-emerald-400 bg-emerald-500/10',
    medium: 'text-amber-400 bg-amber-500/10',
    hard: 'text-red-400 bg-red-500/10'
  }[challenge.difficulty] || 'text-slate-400 bg-slate-500/10';

  const handleComplete = () => {
    if (completed) return;
    setCompleted(true);
    onComplete?.();
  };

  return (
    <div className="space-y-5">
      {/* Header with streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-400' : 'text-slate-600'}`} />
          <span className="text-xs font-black">
            {streak > 0 ? `${streak}-day streak!` : 'Start a streak!'}
          </span>
        </div>
        <span className={`text-sm font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${diffColor}`}>
          {challenge.difficulty} • +{challenge.xp} XP
        </span>
      </div>

      {/* Challenge card */}
      <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
        <h4 className="text-base font-bold">{challenge.title}</h4>
        <p className="text-sm text-slate-300 leading-relaxed">{challenge.prompt}</p>

        {/* Hint toggle */}
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-cyan-400 transition-colors"
        >
          {showHint ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </button>
        {showHint && (
          <p className="text-xs text-cyan-400/70 italic pl-5 border-l-2 border-cyan-500/20 animate-in fade-in duration-300">
            💡 {challenge.hint}
          </p>
        )}

        {/* Solution toggle */}
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-amber-400 transition-colors"
        >
          {showSolution ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {showSolution ? 'Hide Solution' : 'Reveal Solution'}
        </button>
        {showSolution && (
          <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-3 rounded-lg border border-slate-800/50 overflow-x-auto whitespace-pre-wrap animate-in fade-in duration-300">
            {challenge.solution}
          </pre>
        )}
      </div>

      {/* Complete button */}
      {completed ? (
        <div className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold">
          <Check className="w-4 h-4" /> Completed today! +{challenge.xp} XP
        </div>
      ) : (
        <button
          onClick={handleComplete}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-orange-500/20"
        >
          <Zap className="w-4 h-4" /> Mark as Completed
        </button>
      )}
    </div>
  );
}
