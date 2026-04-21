import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Copy, Check, Loader2, Download } from 'lucide-react';

// Pyodide singleton — loaded once, shared across component instances
let pyodidePromise = null;

function loadPyodide() {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = new Promise((resolve, reject) => {
    if (window.pyodide) {
      resolve(window.pyodide);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js';
    script.onload = async () => {
      try {
        const py = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/',
        });
        window.pyodide = py;
        resolve(py);
      } catch (e) {
        pyodidePromise = null;
        reject(e);
      }
    };
    script.onerror = () => {
      pyodidePromise = null;
      reject(new Error('Failed to load Pyodide'));
    };
    document.head.appendChild(script);
  });

  return pyodidePromise;
}

export default function CodePlayground({ starterCode = '# Start coding here\nprint("Hello, AeroPython!")', moduleId }) {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyReady, setPyReady] = useState(false);
  const [pyLoading, setPyLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);
  const lineCountRef = useRef(null);

  // Reset code when module changes
  useEffect(() => {
    setCode(starterCode);
    setOutput('');
  }, [moduleId, starterCode]);

  // Pre-load Pyodide on first interaction
  const ensurePyodide = useCallback(async () => {
    if (pyReady) return true;
    setPyLoading(true);
    try {
      await loadPyodide();
      setPyReady(true);
      return true;
    } catch (e) {
      setOutput(`⚠️ Failed to load Python runtime: ${e.message}\n\nTip: Copy the code and run it locally with: python3 script.py`);
      return false;
    } finally {
      setPyLoading(false);
    }
  }, [pyReady]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');

    const ready = await ensurePyodide();
    if (!ready) { setIsRunning(false); return; }

    try {
      const py = window.pyodide;

      // Capture stdout/stderr
      py.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
      `);

      // Replace input() with a mock that returns empty string
      py.runPython(`
import builtins
_original_input = builtins.input
def _mock_input(prompt=""):
    print(prompt, end="")
    return ""
builtins.input = _mock_input
      `);

      try {
        py.runPython(code);
      } catch (pyErr) {
        const stderr = py.runPython('sys.stderr.getvalue()');
        setOutput(stderr || pyErr.message);
        setIsRunning(false);
        return;
      }

      const stdout = py.runPython('sys.stdout.getvalue()');
      const stderr = py.runPython('sys.stderr.getvalue()');

      setOutput(stdout + (stderr ? '\n⚠️ ' + stderr : '') || '(No output — add print() to see results)');
    } catch (e) {
      setOutput(`Error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };

  const handleReset = () => {
    setCode(starterCode);
    setOutput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      });
    }
    // Ctrl/Cmd + Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
  };

  // Sync scroll between textarea and line numbers
  const handleScroll = () => {
    if (lineCountRef.current && textareaRef.current) {
      lineCountRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
          </div>
          <span className="text-sm font-bold text-slate-600 uppercase tracking-widest ml-2">mission_{moduleId}.py</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            title="Reset to starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={runCode}
            disabled={isRunning || pyLoading}
            className="ml-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-black flex items-center gap-1.5 transition-all disabled:opacity-50 hover:scale-105 active:scale-95 uppercase tracking-wider"
          >
            {isRunning || pyLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            {pyLoading ? 'Loading...' : isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="relative flex" style={{ minHeight: '200px', maxHeight: '400px' }}>
        {/* Line numbers */}
        <div
          ref={lineCountRef}
          className="w-10 flex-shrink-0 bg-slate-950 text-right pr-2 py-3 text-sm text-slate-700 font-mono leading-[1.625rem] select-none overflow-hidden border-r border-slate-900"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          className="flex-1 bg-transparent text-cyan-200 font-mono text-sm leading-[1.625rem] p-3 resize-none outline-none overflow-auto"
          style={{ tabSize: 4, minHeight: '200px', maxHeight: '400px' }}
        />
      </div>

      {/* Output */}
      {(output || isRunning) && (
        <div className="border-t border-slate-800">
          <div className="px-4 py-1.5 bg-slate-900/50 flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : output.includes('Error') || output.includes('⚠️') ? 'bg-red-400' : 'bg-emerald-400'}`}></div>
            <span className="text-sm font-black text-slate-600 uppercase tracking-widest">Output</span>
          </div>
          <pre className="px-4 py-3 text-sm font-mono text-slate-300 max-h-48 overflow-auto whitespace-pre-wrap leading-relaxed">
            {isRunning ? '⏳ Running...' : output}
          </pre>
        </div>
      )}

      {/* Status bar */}
      <div className="px-4 py-1.5 bg-slate-900/30 border-t border-slate-800/50 flex items-center justify-between text-sm text-slate-700 font-bold">
        <span>
          {pyReady ? '🐍 Python 3.12 (Pyodide)' : pyLoading ? '⏳ Loading Python runtime...' : '💡 Click Run to load Python'}
        </span>
        <span className="tabular-nums">{lineCount} lines • ⌘↵ to run</span>
      </div>
    </div>
  );
}
