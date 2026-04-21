import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, RotateCcw, Loader2, Lightbulb, Heart, Zap, Swords,
  Shield, Trophy, ChevronRight, Flame, Star, Sparkles
} from 'lucide-react';
import { ELEMENTS } from '../../data/rpgQuests';

// Reuse the pyodide singleton
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

function Particle({ x, y, color, symbol }) {
  return (
    <div
      className="absolute pointer-events-none font-black text-sm animate-bounce select-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        color,
        animationDuration: `${0.5 + Math.random() * 0.5}s`,
        textShadow: `0 0 8px ${color}`,
      }}
    >
      {symbol}
    </div>
  );
}

function VictoryParticles({ element }) {
  const el = ELEMENTS[element] || ELEMENTS.variables;
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: 5 + (i * 4.5 + Math.sin(i) * 10) % 90,
    y: (i * 7 + Math.cos(i) * 15) % 80,
    symbol: el.particle,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <Particle key={i} x={p.x} y={p.y} color={el.color} symbol={p.symbol} />
      ))}
    </div>
  );
}

export default function BattleScreen({ quest, onVictory, onRetreat, playerStats, regionElement }) {
  const [code, setCode] = useState(quest.starterCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyReady, setPyReady] = useState(false);
  const [pyLoading, setPyLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [battleState, setBattleState] = useState('fighting'); // fighting | victory
  const [enemyHp, setEnemyHp] = useState(quest.enemy.hp);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [bounceEnemy, setBounceEnemy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hitLabel, setHitLabel] = useState(null); // 'CRITICAL HIT!' | 'ELEMENTAL BURST!' | 'HIT!'
  const [showAttackFlash, setShowAttackFlash] = useState(false);
  const textareaRef = useRef(null);
  const lineCountRef = useRef(null);

  const enemy = quest.enemy;
  const el = ELEMENTS[regionElement] || ELEMENTS.variables;

  // Enemy idle bounce animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBounceEnemy(true);
      setTimeout(() => setBounceEnemy(false), 600);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Pre-load Pyodide
  const ensurePyodide = useCallback(async () => {
    if (pyReady) return true;
    setPyLoading(true);
    try {
      await loadPyodide();
      setPyReady(true);
      return true;
    } catch (e) {
      setOutput(`Failed to load Python: ${e.message}`);
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
        if (stderr) userOutput += '\n' + stderr;
      } catch (pyErr) {
        const stderr = py.runPython('sys.stderr.getvalue()');
        const errorMsg = stderr || pyErr.message;
        const friendly = translateError(errorMsg);
        setOutput(`❌ ${friendly}\n\n${errorMsg}`);
        setIsRunning(false);
        setCombo(0);
        return;
      }

      setOutput(userOutput || '(No output — add print() to see results)');

      const expected = quest.expectedOutput.trim();
      const normalize = s => s.replace(/\s+/g, " ").trim();
      const actual = userOutput.trim();
      let isCorrect = false;

      switch (quest.validationType) {
        case 'exact': isCorrect = normalize(actual) === normalize(expected); break;
        case 'contains': isCorrect = actual.includes(expected); break;
        case 'regex': isCorrect = new RegExp(expected).test(actual); break;
        default: isCorrect = actual === expected;
      }

      if (isCorrect) {
        // Determine hit label
        const isFirstTry = attempts === 0;
        const isPerfect = isFirstTry && hintLevel === 0;
        const label = isPerfect
          ? 'ELEMENTAL BURST!'
          : isFirstTry
            ? 'CRITICAL HIT!'
            : combo >= 2
              ? 'COMBO x' + (combo + 1) + '!'
              : 'VICTORY!';

        setHitLabel(label);
        setShowAttackFlash(true);
        setShakeEnemy(true);
        setCombo(c => c + 1);

        setTimeout(() => {
          setHitLabel(null);
          setShowAttackFlash(false);
        }, 1500);

        setTimeout(() => {
          setEnemyHp(0);
          setBattleState('victory');
        }, 800);
      } else {
        setShakeEnemy(true);
        setCombo(0);
        setTimeout(() => setShakeEnemy(false), 500);
        setEnemyHp(prev => Math.max(prev - Math.floor(enemy.hp * 0.1), Math.floor(enemy.hp * 0.15)));
        setHitLabel('HIT!');
        setTimeout(() => setHitLabel(null), 800);
        setOutput(prev => prev + `\n\n🎯 Expected:\n${expected}\n\n💡 Your output doesn't match yet. Keep trying!`);
      }
    } catch (e) {
      setOutput(`Error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const translateError = (error) => {
    if (error.includes('SyntaxError')) return "Syntax error! Check your colons (:), brackets, and indentation.";
    if (error.includes('NameError')) return "Variable not found! Did you misspell a name, or forget to create it first?";
    if (error.includes('TypeError')) return "Type mismatch! Are you mixing strings and numbers without converting?";
    if (error.includes('IndentationError')) return "Indentation error! Python needs consistent spacing (use 4 spaces after :).";
    if (error.includes('IndexError')) return "Index out of range! Your list isn't that long — check your index number.";
    if (error.includes('KeyError')) return "Key not found in dictionary! Check the key spelling inside quotes.";
    if (error.includes('ZeroDivisionError')) return "You tried to divide by zero! Make sure the denominator isn't 0.";
    if (error.includes('AttributeError')) return "That method or attribute doesn't exist on this object!";
    return "Something went wrong — read the error below for clues.";
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
  const difficulty = enemy.isBoss ? 'BOSS' : enemy.hp <= 50 ? 'Novice' : enemy.hp <= 70 ? 'Adept' : 'Expert';

  const hpBarColor = hpPercent > 60
    ? el.color
    : hpPercent > 30
      ? '#f59e0b'
      : '#ef4444';

  // ── Victory Screen ──
  if (battleState === 'victory') {
    return (
      <div className="relative text-center py-10 space-y-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 px-6">
        {/* Particles */}
        <VictoryParticles element={regionElement} />

        <div className="relative z-10 space-y-6">
          {/* Trophy */}
          <div className="text-6xl mb-2 animate-bounce" style={{ filter: `drop-shadow(0 0 16px ${el.color})` }}>
            {enemy.isBoss ? '👑' : '⚔️'}
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: el.color }}>
              {enemy.isBoss ? 'BOSS DEFEATED!' : 'VICTORY!'}
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              You defeated <span className="text-white font-bold">{enemy.name}</span> in{' '}
              <span className="text-white font-bold">{attempts}</span> {attempts === 1 ? 'attempt' : 'attempts'}!
            </p>
          </div>

          {/* Battle stats */}
          <div className="flex justify-center gap-3 flex-wrap">
            {attempts === 1 && (
              <div className="px-3 py-1.5 rounded-full text-sm font-black border" style={{ color: el.color, borderColor: el.border, backgroundColor: el.bg }}>
                ⚡ First Try!
              </div>
            )}
            {hintLevel === 0 && (
              <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm font-black text-purple-400">
                🧠 No Hints Used
              </div>
            )}
            {combo > 1 && (
              <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm font-black text-amber-400">
                🔥 Combo x{combo}
              </div>
            )}
          </div>

          {/* Reward cards */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center">
              <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-amber-400 font-black text-lg">+{quest.xpReward}</div>
              <div className="text-sm font-bold text-slate-600 uppercase">XP</div>
            </div>
            <div className="px-5 py-3 rounded-2xl text-center border" style={{ backgroundColor: el.bg, borderColor: el.border }}>
              <span className="text-2xl block mb-1">{el.icon}</span>
              <div className="font-black text-sm" style={{ color: el.color }}>{el.name}</div>
              <div className="text-sm font-bold text-slate-600 uppercase">Affinity</div>
            </div>
            {enemy.isBoss && (
              <div className="px-5 py-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-center">
                <Trophy className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <div className="text-purple-400 font-black text-sm">Region!</div>
                <div className="text-sm font-bold text-slate-600 uppercase">Clear</div>
              </div>
            )}
          </div>

          {/* Concept mastered */}
          <div className="rounded-xl p-4 mx-auto max-w-sm border" style={{ backgroundColor: el.bg, borderColor: el.border }}>
            <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Concept Mastered</p>
            <p className="font-bold" style={{ color: el.color }}>{quest.concept}</p>
          </div>

          <button
            onClick={() => onVictory(quest, { attempts, usedHints: hintLevel, combo })}
            className="px-10 py-4 text-white rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95 uppercase tracking-wider shadow-lg"
            style={{ background: `linear-gradient(to right, ${el.color}cc, ${el.color}88)`, boxShadow: `0 8px 24px ${el.color}33` }}
          >
            Continue Adventure <ChevronRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enemy section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
        {/* Elemental background glow */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle at 70% 50%, ${el.color}, transparent 70%)` }} />

        {/* Attack flash overlay */}
        {showAttackFlash && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none animate-ping opacity-25"
            style={{ backgroundColor: el.color, animationDuration: '0.4s', animationIterationCount: 1 }}
          />
        )}

        <div className="relative z-10 flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Enemy icon with animations */}
            <div className="relative">
              <div
                className="text-4xl transition-all duration-300 select-none"
                style={{
                  transform: shakeEnemy
                    ? 'translateX(-8px) rotate(-5deg)'
                    : bounceEnemy
                      ? 'translateY(-6px)'
                      : 'translateY(0)',
                  filter: shakeEnemy ? `drop-shadow(0 0 12px ${el.color})` : 'none',
                  transition: shakeEnemy ? 'transform 0.1s ease' : 'transform 0.6s ease',
                }}
                onTransitionEnd={() => { setShakeEnemy(false); }}
              >
                {enemy.icon}
              </div>

              {/* Hit label popup */}
              {hitLabel && (
                <div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-black uppercase tracking-wider animate-bounce"
                  style={{ color: el.color, textShadow: `0 0 8px ${el.color}` }}
                >
                  {hitLabel}
                </div>
              )}

              {/* Element icon badge */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-sm border border-slate-900"
                style={{ backgroundColor: el.bg }}
              >
                {el.icon}
              </div>
            </div>

            <div>
              <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                {enemy.isBoss && <span className="text-amber-400">👑</span>}
                {enemy.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-slate-500">{quest.concept}</span>
                <span
                  className="text-xs font-black px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={enemy.isBoss
                    ? { color: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.1)' }
                    : { color: el.color, backgroundColor: el.bg }
                  }
                >
                  {difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* HP counter */}
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              <span className="text-sm font-black tabular-nums" style={{ color: hpBarColor }}>{enemyHp}</span>
              <span className="text-sm text-slate-600 font-bold">/ {enemy.hp}</span>
            </div>
            {combo > 1 && (
              <div className="text-sm font-black text-amber-400 mt-0.5">🔥 Combo x{combo}</div>
            )}
          </div>
        </div>

        {/* HP bar */}
        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${hpPercent}%`,
              background: `linear-gradient(to right, ${hpBarColor}aa, ${hpBarColor})`,
              boxShadow: `0 0 8px ${hpBarColor}66`,
            }}
          />
          {/* HP bar segment lines */}
          {[25, 50, 75].map(pct => (
            <div key={pct} className="absolute top-0 bottom-0 w-px bg-slate-900/60" style={{ left: `${pct}%` }} />
          ))}
        </div>
      </div>

      {/* Quest story & instructions */}
      <div className="rounded-xl p-4 space-y-3 border" style={{ backgroundColor: el.bg + '40', borderColor: el.border }}>
        <p className="text-sm text-slate-300 leading-relaxed italic">"{quest.story}"</p>
        <div className="pt-2 border-t border-slate-800/50">
          <p className="text-sm font-black uppercase tracking-widest mb-1.5" style={{ color: el.color }}>
            {el.icon} Mission Objective
          </p>
          <p className="text-sm text-slate-200 font-medium leading-relaxed">{quest.instructions}</p>
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
            <span className="text-sm font-bold text-slate-600 uppercase tracking-widest ml-2">battle.py</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Keyboard hint */}
            <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-700 border border-slate-800 rounded px-1.5 py-0.5">
              Ctrl+↵ Attack
            </span>
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
              className="ml-1 px-4 py-1.5 rounded-lg text-sm font-black flex items-center gap-1.5 transition-all disabled:opacity-50 hover:scale-105 active:scale-95 uppercase tracking-wider text-white"
              style={{
                background: `linear-gradient(to right, ${el.color}cc, ${el.color}88)`,
                boxShadow: `0 4px 12px ${el.color}33`,
              }}
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

        {/* Editor with line numbers */}
        <div className="relative flex" style={{ minHeight: '180px', maxHeight: '360px' }}>
          <div
            ref={lineCountRef}
            className="w-10 flex-shrink-0 bg-slate-950 text-right pr-2 py-3 text-sm text-slate-700 font-mono leading-[1.625rem] select-none overflow-hidden border-r border-slate-900/80"
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
            style={{ tabSize: 4, minHeight: '180px', maxHeight: '360px' }}
          />
        </div>

        {/* Output */}
        {(output || isRunning) && (
          <div className="border-t border-slate-800">
            <div className="px-4 py-1.5 bg-slate-900/60 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                isRunning ? 'bg-amber-400 animate-pulse'
                : output.includes('❌') || output.includes('Error') ? 'bg-red-400'
                : 'bg-emerald-400'
              }`} />
              <span className="text-sm font-black text-slate-600 uppercase tracking-widest">Output</span>
            </div>
            <pre className="px-4 py-3 text-sm font-mono text-slate-300 max-h-48 overflow-auto whitespace-pre-wrap leading-relaxed">
              {isRunning ? `${el.icon} Casting spell...` : output}
            </pre>
          </div>
        )}

        {/* Status bar */}
        <div className="px-4 py-1.5 bg-slate-900/30 border-t border-slate-800/50 flex items-center justify-between text-sm text-slate-700 font-bold">
          <span>{pyReady ? '🐍 Python 3.12 ready' : pyLoading ? '⏳ Summoning Python...' : '💡 Click ATTACK or Ctrl+Enter to run'}</span>
          <span className="tabular-nums">{lineCount} lines</span>
        </div>
      </div>

      {/* Hints + Retreat row */}
      <div className="flex items-center gap-2 flex-wrap">
        {quest.hints.map((_, i) => (
          <button
            key={i}
            onClick={() => setHintLevel(i + 1)}
            disabled={hintLevel > i}
            className={`px-3 py-1.5 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${
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
          className="ml-auto px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm font-bold text-slate-600 hover:text-red-400 hover:border-red-500/30 transition-colors uppercase tracking-wider"
        >
          <Shield className="w-3 h-3 inline mr-1" />
          Retreat
        </button>
      </div>

      {/* Hint display */}
      {hintLevel > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-sm font-black text-amber-500 uppercase tracking-widest mb-2">
            💡 Hint {hintLevel}
          </p>
          <p className="text-sm text-amber-200/80 font-mono whitespace-pre-wrap leading-relaxed">
            {quest.hints[hintLevel - 1]}
          </p>
        </div>
      )}
    </div>
  );
}
