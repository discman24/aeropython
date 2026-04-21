import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function MistakesPanel({ mistakes = [] }) {
  const [expanded, setExpanded] = useState(null);

  if (!mistakes.length) {
    return (
      <div className="text-center py-8 text-slate-500 text-xs">
        <AlertTriangle className="w-6 h-6 mx-auto mb-2 opacity-30" />
        <p className="font-bold uppercase tracking-widest">No gotchas for this module yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mistakes.map((m, i) => (
        <div key={i} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/30">
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-900/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-sm font-bold">{m.title}</span>
            </div>
            {expanded === i ? (
              <ChevronUp className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {expanded === i && (
            <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Wrong */}
              <div>
                <span className="text-sm font-black text-red-400 uppercase tracking-widest block mb-1.5">❌ Wrong</span>
                <pre className="text-xs font-mono text-red-300/80 bg-red-500/5 border border-red-500/10 p-3 rounded-lg whitespace-pre-wrap leading-relaxed">
                  {m.wrong}
                </pre>
              </div>

              {/* Right */}
              <div>
                <span className="text-sm font-black text-emerald-400 uppercase tracking-widest block mb-1.5">✅ Correct</span>
                <pre className="text-xs font-mono text-emerald-300/80 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg whitespace-pre-wrap leading-relaxed">
                  {m.right}
                </pre>
              </div>

              {/* Explanation */}
              <p className="text-xs text-slate-400 leading-relaxed pl-3 border-l-2 border-slate-700 italic">
                {m.explanation}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
