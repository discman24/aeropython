import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Loader2, Lightbulb, Heart, Zap, Swords, Shield, Trophy, X, ChevronRight } from 'lucide-react';

// Reuse the pyodide singleton from CodePlayground
let pyodidePromise = null;

function loadPyodide() {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = new Promise((resolve, reject) => {
    if (window.pyodide) { resolve(window.pyodide); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js';
    script.onload = async () => {
      try {
        const py = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/',
        });
        window.pyodide = py;
        resolve(py);
      } catch (e) { pyodidePromise = null; reject(e); }
    };
    script.onerror = () => { pyodidePromise = null; reject(new Error('Failed to load Pyodide')); };
    document.head.appendChild(script);
  });
  return pyodidePromise;
}

export default function BattleScreen({ quest, onVictory, onRetreat, playerStats }) {
  const [code, setCode] = useState(quest.starterCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyReady, setPyReady] = useState(false);
  const [pyLoading, setPyLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [battleState, setBattleState] = useState('fighting'); // fighting | victory | defeat
  const [enemyHp, setEnemyHp] = useState(quest.enemy.hp);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const textareaRef = useRef(null);
  const lineCountRef = useRef(null);

  const enemy = quest.enemy;

  // Pre-load Pyodide
  const ensurePyodide = useCallback(async () => {
    if (pyReady) return true;
    setPyLoading(true);
    try {
      await loadPyodide();
      setPyReady(true);
      return true;
    } catch (e) {
      setOutput(`⚠️ Failed to load Python: ${e.message}`);
      return false;
    } finally { setPyLoading(false); }
  }, [pyReady]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setAttempts(a => a + 1);

    const ready = await ensurePyodide();
    if (!ready) { setIsRunning(false); return; }

    try {
      const py = window.pyodide;
      py.runPython(`import sys, io\nsys.stdout = io.StringIO()\nsys.stderr = io.StringIO()`);
      py.runPython(`import builtins\ndef _mock_input(prompt=""):\n    print(prompt, end="")\n    return ""\nbuiltins.input = _mock_input`);

      let userOutput = '';
      try {
        py.runPython(code);
        userOutput = py.runPython('sys.stdout.getvalue()');
        const stderr = py.runPython('sys.stderr.getvalue()');
        if (stderr) userOutput += '\n⚠️ ' + stderr;
      } catch (pyErr) {
        const stderr = py.runPython('sys.stderr.getvalue()');
        const errorMsg = stderr || pyErr.message;
        // Friendly error translation
        const friendly = translateError(errorMsg);
        setOutput(`❌ ${friendly}\n\n${errorMsg}`);
        setIsRunning(false);
        return;
      }

      setOutput(userOutput || '(No output — add print() to see results)');

      // Validate output
      const expected = quest.expectedOutput.trim();
      const actual = userOutput.trim();
      let isCorrect = false;

      switch (quest.validationType) {
        case 'exact':
          isCorrect = actual === expected;
          break;
        case 'contains':
          isCorrect = actual.includes(expected);
          break;
        case 'regex':
          isCorrect = new RegExp(expected).test(actual);
          break;
        default:
          isCorrect = actual === expected;
      }

      if (isCorrect) {
        // VICTORY!
        setShakeEnemy(true);
        setTimeout(() => {
          setEnemyHp(0);
          setBattleState('victory');
        }, 600);
      } else {
        // Damage the enemy a little for trying
        setShakeEnemy(true);
        setTimeout(() => setShakeEnemy(false), 400);
        setEnemyHp(prev => Math.max(prev - Math.floor(enemy.hp * 0.1), Math.floor(enemy.hp * 0.2)));
        setOutput(prev => prev + `\n\n🎯 Expected output:\n${expected}\n\n💡 Your output doesn't match yet. Keep trying!`);
      }
    } catch (e) {
      setOutput(`Error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const translateError = (error) => {
    if (error.includes('SyntaxError')) return "Syntax error! Check your colons, brackets, and indentation.";
    if (error.includes('NameError')) return "You're using a variable that doesn't exist yet. Did you misspell it?";
    if (error.includes('TypeError')) return "Type mismatch! You might be mixing strings and numbers.";
    if (error.includes('IndentationError')) return "Indentation problem! Python needs consistent spacing (use 4 spaces).";
    if (error.includes('IndexError')) return "Index out of range! Your list isn't that long.";
    if (error.includes('KeyError')) return "Key not found in dictionary! Check your key spelling.";
    return "Something went wrong. Read the error below for clues.";
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      setCode(code.substring(0, start) + '    ' + code.substring(end));
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
  };

  const handleScroll = () => {
    if (lineCountRef.current && textareaRef.current) {
      lineCountRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lineCount = code.split('\n').length;
  const hpPercent = (enemyHp / enemy.hp) * 100;
  const difficulty = enemy.isBoss ? 'Boss' : enemy.hp <= 50 ? 'Easy' : enemy.hp <= 70 ? 'Medium' : 'Hard';
  const diffColor = difficulty === 'Boss' ? 'text-amber-400' : difficulty === 'Easy' ? 'text-emerald-400' : difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400';

  // Victory screen
  if (battleState === 'victory') {
    return (
      <div className="text-center py-10 space-y-6 animate-in">
        <div className="text-6xl mb-4">
          {enemy.isBoss ? '👑' : '⚔️'}
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight">
          {enemy.isBoss ? 'BOSS DEFEATED!' : 'VICTORY!'}
        </h2>
        <p className="text-slate-400 text-sm">
          You defeated the <span className="text-white font-bold">{enemy.name}</span> in {attempts} {attempts === 1 ? 'attempt' : 'attempts'}!
        </p>

        {/* Rewards */}
        <div className="flex items-center justify-center gap-4">
          <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-black">+{quest.xpReward} XP</span>
          </div>
          {enemy.isBoss && (
            <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center gap-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-black">Region Clear!</span>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mx-auto max-w-md">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Concept Mastered</p>
          <p className="text-cyan-400 font-bold">{quest.concept}</p>
        </div>

        <button
          onClick={() => onVictory(quest)}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95 uppercase tracking-wider"
        >
          Continue Adventure <ChevronRight className="w-4 h-4 inline ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enemy bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`text-3xl transition-transform ${shakeEnemy ? 'animate-bounce' : ''}`}>
              {enemy.icon}
            </div>
            <div>
              <h3 className="font-black text-sm text-white">
                {enemy.isBoss && <span className="text-amber-400 mr-1">👑</span>}
                {enemy.name}
              </h3>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                {quest.concept} <span className={`ml-1 ${diffColor}`}>• {difficulty}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-black text-red-400 tabular-nums">{enemyHp}/{enemy.hp}</span>
          </div>
        </div>
        {/* HP bar */}
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${hpPercent}%`,
              backgroundColor: hpPercent > 50 ? '#ef4444' : hpPercent > 25 ? '#f59e0b' : '#22c55e',
            }}
          />
        </div>
      </div>

      {/* Quest story & instructions */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
        <p className="text-sm text-slate-300 leading-relaxed italic">"{quest.story}"</p>
        <div className="pt-2 border-t border-slate-800">
          <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-1.5">📋 Mission Objective</p>
          <p className="text-sm text-slate-200 font-medium">{quest.instructions}</p>
        </div>
      </div>

      {/* Code editor */}
      <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-2">battle.py</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setCode(quest.starterCode); setOutput(''); }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
              title="Reset code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={runCode}
              disabled={isRunning || pyLoading}
              className="ml-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-all disabled:opacity-50 hover:scale-105 active:scale-95 uppercase tracking-wider"
            >
              {isRunning || pyLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Swords className="w-3 h-3" />
              )}
              {pyLoading ? 'Loading...' : isRunning ? 'Running...' : 'ATTACK!'}
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="relative flex" style={{ minHeight: '180px', maxHeight: '350px' }}>
          <div
            ref={lineCountRef}
            className="w-10 flex-shrink-0 bg-slate-950 text-right pr-2 py-3 text-[11px] text-slate-700 font-mono leading-[1.625rem] select-none overflow-hidden border-r border-slate-900"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={false}
            className="flex-1 bg-transparent text-cyan-200 font-mono text-sm leading-[1.625rem] p-3 resize-none outline-none overflow-auto"
            style={{ tabSize: 4, minHeight: '180px', maxHeight: '350px' }}
          />
        </div>

        {/* Output */}
        {(output || isRunning) && (
          <div className="border-t border-slate-800">
            <div className="px-4 py-1.5 bg-slate-900/50 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                isRunning ? 'bg-amber-400 animate-pulse'
                : output.includes('❌') || output.includes('Error') || output.includes('⚠️') ? 'bg-red-400'
                : 'bg-emerald-400'
              }`} />
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Output</span>
            </div>
            <pre className="px-4 py-3 text-sm font-mono text-slate-300 max-h-48 overflow-auto whitespace-pre-wrap leading-relaxed">
              {isRunning ? '⏳ Casting spell...' : output}
            </pre>
          </div>
        )}

        {/* Status bar */}
        <div className="px-4 py-1.5 bg-slate-900/30 border-t border-slate-800/50 flex items-center justify-between text-[9px] text-slate-700 font-bold">
          <span>{pyReady ? '🐍 Python 3.12' : pyLoading ? '⏳ Summoning Python...' : '💡 Click ATTACK to begin'}</span>
          <span className="tabular-nums">{lineCount} lines • ⌘↵ to attack</span>
        </div>
      </div>

      {/* Hints */}
      <div className="flex items-center gap-3">
        {quest.hints.map((_, i) => (
          <button
            key={i}
            onClick={() => setHintLevel(i + 1)}
            disabled={hintLevel > i}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              hintLevel > i
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-amber-500/30 hover:text-amber-400'
            }`}
          >
            <Lightbulb className="w-3 h-3 inline mr-1" />
            Hint {i + 1}
          </button>
        ))}
        <button
          onClick={onRetreat}
          className="ml-auto px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-600 hover:text-red-400 hover:border-red-500/30 transition-colors uppercase tracking-wider"
        >
          <Shield className="w-3 h-3 inline mr-1" />
          Retreat
        </button>
      </div>

      {/* Hint display */}
      {hintLevel > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">
            💡 Hint {hintLevel}
          </p>
          <p className="text-sm text-amber-200/80 font-mono whitespace-pre-wrap">
            {quest.hints[hintLevel - 1]}
          </p>
        </div>
      )}
    </div>
  );
}

