import React, { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Trophy, ChevronRight, Code2 } from 'lucide-react';

export default function QuizPanel({ moduleId, quizData = [], onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => quizData || [], [quizData]);
  const q = questions[currentQ];

  if (!questions.length) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Code2 className="w-8 h-8 mx-auto mb-3 opacity-40" />
        <p className="text-xs font-bold uppercase tracking-widest">Quiz data loading...</p>
      </div>
    );
  }

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setShowResult(true);
    setAnswers(prev => [...prev, { questionId: q.id, selected, correct: q.correct, isCorrect: selected === q.correct }]);
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
      const score = answers.filter(a => a.isCorrect).length + (selected === q.correct ? 1 : 0);
      onComplete?.(score, questions.length);
      return;
    }
    setCurrentQ(prev => prev + 1);
    setSelected(null);
    setShowResult(false);
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setAnswers([]);
    setFinished(false);
  };

  // --- RESULTS SCREEN ---
  if (finished) {
    const finalAnswers = [...answers];
    const score = finalAnswers.filter(a => a.isCorrect).length;
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 80;

    return (
      <div className="text-center py-8 space-y-6">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-black ${passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
          {pct}%
        </div>
        <div>
          <h3 className="text-xl font-black">{passed ? '🎉 Mission Passed!' : '💪 Almost There!'}</h3>
          <p className="text-sm text-slate-400 mt-1">{score}/{questions.length} correct</p>
        </div>
        {passed && (
          <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold">
            <Trophy className="w-4 h-4" /> +{score * 10} XP earned
          </div>
        )}
        <button
          onClick={handleRetry}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 mx-auto transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" /> {passed ? 'Try Again for Perfect Score' : 'Retry Quiz'}
        </button>
      </div>
    );
  }

  // --- QUESTION SCREEN ---
  const typeLabel = q.type === 'mcq' ? 'Multiple Choice' : q.type === 'output' ? 'Predict Output' : 'Find the Bug';

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-black text-slate-500 tabular-nums">{currentQ + 1}/{questions.length}</span>
      </div>

      {/* Question type badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-black text-cyan-500 uppercase tracking-[0.3em] bg-cyan-500/10 px-2 py-0.5 rounded-full">{typeLabel}</span>
      </div>

      {/* Question text */}
      <h4 className="text-base font-bold leading-relaxed">{q.question}</h4>

      {/* Code block if present */}
      {q.code && (
        <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm font-mono text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed">
          {q.code}
        </pre>
      )}

      {/* Options */}
      <div className="space-y-2">
        {q.options.map((opt, idx) => {
          let borderClass = 'border-slate-800 hover:border-slate-600';
          let bgClass = 'bg-slate-900/50 hover:bg-slate-900';

          if (selected === idx && !showResult) {
            borderClass = 'border-cyan-500 ring-1 ring-cyan-500/30';
            bgClass = 'bg-cyan-500/10';
          }
          if (showResult && idx === q.correct) {
            borderClass = 'border-emerald-500';
            bgClass = 'bg-emerald-500/10';
          }
          if (showResult && selected === idx && idx !== q.correct) {
            borderClass = 'border-red-500';
            bgClass = 'bg-red-500/10';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showResult}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${borderClass} ${bgClass} ${showResult ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}`}
            >
              <span className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-sm flex-1">{opt}</span>
              {showResult && idx === q.correct && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              {showResult && selected === idx && idx !== q.correct && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/50 text-sm text-slate-300 leading-relaxed animate-in fade-in duration-300">
          <span className="text-sm font-black text-slate-500 uppercase tracking-widest block mb-1">Explanation</span>
          {q.explanation}
        </div>
      )}

      {/* Action button */}
      <div className="flex justify-end">
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            {currentQ + 1 >= questions.length ? 'See Results' : 'Next'} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
