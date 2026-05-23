import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
  lazy,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import LoadingScreen from './LoadingScreen.jsx';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

const TIMEOUT_MS = 5000;

export default function StageScreen() {
  const { id } = useParams();
  const stageId = parseInt(id, 10);
  const navigate = useNavigate();
  const { stages, regions, getStageStatus, completeStage } = useGame();

  const stage = stages.find((s) => s.id === stageId);
  const status = getStageStatus(stageId);

  // Redirect if locked or invalid
  useEffect(() => {
    if (!stage) return; // still loading stages
    if (status === 'locked') {
      navigate('/', { replace: true });
    }
  }, [status, stage, navigate]);

  // Wait for stages to load
  if (stages.length === 0) {
    return <LoadingScreen message="Loading stage data..." />;
  }

  if (!stage) {
    return (
      <div style={styles.errorPage}>
        <p style={{ color: 'var(--text-dim)' }}>Stage {stageId} not found.</p>
        <Link to="/" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
          ← World Map
        </Link>
      </div>
    );
  }

  if (status === 'locked') return null;

  return <StageContent stage={stage} stageId={stageId} regions={regions} completeStage={completeStage} navigate={navigate} />;
}

function StageContent({ stage, stageId, regions, completeStage, navigate }) {
  const region = regions.find((r) => r.id === stage.regionId);

  // Worker state
  const [workerState, setWorkerState] = useState('loading'); // loading | ready | running
  const workerRef = useRef(null);
  const timeoutRef = useRef(null);

  // UI state
  const [activeTab, setActiveTab] = useState('briefing');
  const [code, setCode] = useState(stage.starterCode || '# Write your code here\n');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState([]); // [{desc, passed, expected}]
  const [failCount, setFailCount] = useState(0);
  const [stageComplete, setStageComplete] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  // Boot worker
  const bootWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    setWorkerState('loading');

    // type: 'classic' required — worker uses importScripts (not ES modules)
    const worker = new Worker(
      new URL('../workers/pyodide.worker.js', import.meta.url),
      { type: 'classic' }
    );

    worker.onmessage = (e) => {
      const { type, output: out, error: err } = e.data;

      if (type === 'ready') {
        setWorkerState('ready');
        return;
      }

      if (type === 'init_error') {
        setWorkerState('loading');
        setError('Failed to load Python runtime: ' + err);
        return;
      }

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setOutput(out || '');
      if (type === 'error') {
        setError(err || 'Unknown error');
      } else {
        setError(null);
      }
      setWorkerState('ready');
    };

    worker.onerror = (e) => {
      setWorkerState('ready');
      setError('Worker error: ' + e.message);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    workerRef.current = worker;
  }, []);

  useEffect(() => {
    bootWorker();
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [bootWorker]);

  // Reset when stage changes
  useEffect(() => {
    setCode(stage.starterCode || '# Write your code here\n');
    setOutput('');
    setError(null);
    setTestResults([]);
    setFailCount(0);
    setStageComplete(false);
    setXpGained(0);
    setActiveTab('briefing');
  }, [stage.id, stage.starterCode]);

  const runCode = useCallback(
    (onComplete) => {
      if (!workerRef.current || workerState !== 'ready') return;
      setWorkerState('running');
      setOutput('');
      setError(null);

      // Set timeout
      timeoutRef.current = setTimeout(() => {
        setError('Execution timed out (5s limit). Check for infinite loops.');
        setOutput('');
        setWorkerState('loading');
        // Reboot worker after timeout
        bootWorker();
        if (onComplete) onComplete(null);
      }, TIMEOUT_MS);

      // Listen for next message
      const handler = (e) => {
        const { type, output: out, error: err } = e.data;
        if (type === 'ready') return; // ignore ready messages during run
        if (type === 'result' || type === 'error') {
          workerRef.current.removeEventListener('message', handler);
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
          const finalOutput = out || '';
          const finalError = type === 'error' ? (err || 'Unknown error') : null;
          setOutput(finalOutput);
          setError(finalError);
          setWorkerState('ready');
          if (onComplete) onComplete(finalOutput, finalError);
        }
      };

      workerRef.current.addEventListener('message', handler);
      workerRef.current.postMessage({ type: 'run', code });
    },
    [code, workerState, bootWorker]
  );

  const handleRun = useCallback(() => {
    runCode(null);
  }, [runCode]);

  const handleSubmit = useCallback(() => {
    runCode((out, err) => {
      if (out === null) return; // timed out
      const results = (stage.tests || []).map((test) => {
        const passed = !err && typeof out === 'string' && out.includes(test.expectedOutput.trim());
        return { desc: test.description, passed, expected: test.expectedOutput };
      });
      setTestResults(results);
      const allPassed = results.length > 0 && results.every((r) => r.passed);
      if (allPassed) {
        completeStage(stageId);
        setStageComplete(true);
        setXpGained(stage.xp ?? 100);
        // Navigate to milestone on milestone stages
        if (stage.isMilestone) {
          setTimeout(() => {
            navigate(`/milestone/${stageId}`, {
              state: { stage, xp: stage.xp ?? 500 },
            });
          }, 1200);
        }
      } else {
        setFailCount((c) => c + 1);
      }
    });
  }, [runCode, stage, stageId, completeStage, navigate]);

  const isRunDisabled = workerState !== 'ready' || stageComplete;

  const prevStageId = stageId > 1 ? stageId - 1 : null;
  const nextStageId = stageId < 70 ? stageId + 1 : null;

  return (
    <div style={styles.container}>
      {/* Top nav bar */}
      <div style={styles.topBar}>
        <button style={styles.navBtn} onClick={() => navigate(`/region/${stage.regionId}`)}>
          ← {region?.name || 'Region'}
        </button>
        <div style={styles.breadcrumb}>
          <span style={{ color: region?.color || 'var(--accent)' }}>{region?.name}</span>
          <span style={styles.breadSep}>›</span>
          <span style={{ color: 'var(--text-dim)' }}>Stage {stage.regionStage}</span>
          <span style={styles.breadSep}>›</span>
          <span style={{ color: 'var(--text)' }}>{stage.title}</span>
        </div>
        <div style={styles.stageNav}>
          {prevStageId && (
            <button style={styles.navBtn} onClick={() => navigate(`/stage/${prevStageId}`)}>
              ‹ Prev
            </button>
          )}
          {nextStageId && (
            <button
              style={{
                ...styles.navBtn,
                ...(stageComplete ? styles.navBtnActive : {}),
              }}
              onClick={() => navigate(`/stage/${nextStageId}`)}
            >
              Next ›
            </button>
          )}
        </div>
      </div>

      {/* Split layout */}
      <div style={styles.split}>
        {/* LEFT PANEL — Briefing / Lesson / Hint */}
        <div style={styles.leftPanel}>
          {/* Stage header */}
          <div style={styles.stageHeader}>
            <div style={styles.stageTagRow}>
              {stage.isMilestone && (
                <span style={styles.milestoneBadge}>🏁 MILESTONE</span>
              )}
              <span
                style={{
                  ...styles.conceptBadge,
                  background: `${region?.color || 'var(--accent)'}22`,
                  color: region?.color || 'var(--accent)',
                  border: `1px solid ${region?.color || 'var(--accent)'}44`,
                }}
              >
                {stage.concept}
              </span>
            </div>
            <h2 style={styles.stageTitle}>{stage.title}</h2>
            <p style={styles.stageSub}>{stage.subtitle}</p>
          </div>

          {/* Tabs */}
          <div style={styles.tabBar}>
            {['briefing', 'lesson', 'hint'].map((tab) => (
              <button
                key={tab}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab ? styles.tabActive : {}),
                  ...(tab === 'hint' && failCount < 2 ? styles.tabDisabled : {}),
                }}
                onClick={() => {
                  if (tab === 'hint' && failCount < 2) return;
                  setActiveTab(tab);
                }}
              >
                {tab === 'briefing' && '📋 Briefing'}
                {tab === 'lesson' && '📖 Lesson'}
                {tab === 'hint' && (
                  <>
                    💡 Hint
                    {failCount < 2 && (
                      <span style={styles.hintLock}> (2 attempts needed)</span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={styles.tabContent}>
            {activeTab === 'briefing' && (
              <BriefingTab stage={stage} region={region} />
            )}
            {activeTab === 'lesson' && (
              <LessonTab stage={stage} />
            )}
            {activeTab === 'hint' && (
              <HintTab stage={stage} />
            )}
          </div>

          {/* XP reward footer */}
          <div style={styles.xpFooter}>
            <span style={styles.xpLabel}>
              Stage {stageId} of 70
            </span>
            <span style={styles.xpValue}>
              {stageComplete ? (
                <span style={{ color: 'var(--green)' }}>✓ +{xpGained} XP earned!</span>
              ) : (
                <span style={{ color: 'var(--amber)' }}>+{stage.xp ?? 100} XP on completion</span>
              )}
            </span>
          </div>
        </div>

        {/* RIGHT PANEL — Editor + Output + Tests */}
        <div style={styles.rightPanel}>
          {/* Worker status bar */}
          <div style={styles.workerBar}>
            <div style={styles.workerStatus}>
              <span
                style={{
                  ...styles.workerDot,
                  background:
                    workerState === 'ready' ? 'var(--green)' :
                    workerState === 'running' ? 'var(--amber)' : 'var(--text-muted)',
                  boxShadow:
                    workerState === 'ready' ? '0 0 6px var(--green)' :
                    workerState === 'running' ? '0 0 6px var(--amber)' : 'none',
                }}
              />
              <span style={styles.workerLabel}>
                {workerState === 'loading' && 'Loading Python runtime...'}
                {workerState === 'ready' && 'Python 3.12 ready'}
                {workerState === 'running' && 'Running...'}
              </span>
            </div>
            {stage.isMilestone && (
              <span style={styles.milestoneTag}>⭐ Milestone Stage</span>
            )}
          </div>

          {/* Monaco Editor */}
          <div style={styles.editorWrap}>
            {workerState === 'loading' ? (
              <div style={styles.editorLoading}>
                <LoadingScreen message="Initializing Python runtime..." />
              </div>
            ) : (
              <Suspense fallback={
                <div style={styles.editorFallback}>Loading editor...</div>
              }>
                <MonacoEditor
                  height="100%"
                  language="python"
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                    fontSize: 13,
                    lineHeight: 1.7,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 12, bottom: 12 },
                    renderLineHighlight: 'gutter',
                    bracketPairColorization: { enabled: true },
                    automaticLayout: true,
                    readOnly: stageComplete,
                    wordWrap: 'on',
                  }}
                />
              </Suspense>
            )}
          </div>

          {/* Action buttons */}
          <div style={styles.actionBar}>
            <button
              style={{
                ...styles.runBtn,
                ...(isRunDisabled ? styles.btnDisabled : {}),
              }}
              onClick={handleRun}
              disabled={isRunDisabled}
            >
              {workerState === 'running' ? '⏳ Running...' : '▶ Run Code'}
            </button>
            <button
              style={{
                ...styles.submitBtn,
                ...(isRunDisabled ? styles.btnDisabled : {}),
              }}
              onClick={handleSubmit}
              disabled={isRunDisabled}
            >
              ✓ Submit
            </button>
            <button
              style={styles.resetBtn}
              onClick={() => {
                setCode(stage.starterCode || '');
                setOutput('');
                setError(null);
                setTestResults([]);
              }}
            >
              ↺ Reset
            </button>
          </div>

          {/* Output panel */}
          <div style={styles.outputPanel}>
            <div style={styles.outputHeader}>
              <span style={styles.outputTitle}>Output</span>
              {error && (
                <span style={styles.errorBadge}>Error</span>
              )}
            </div>
            <pre style={{
              ...styles.outputPre,
              color: error ? 'var(--red)' : 'var(--green)',
            }}>
              {error ? `${output ? output + '\n' : ''}${error}` : (output || '— Run your code to see output —')}
            </pre>
          </div>

          {/* Test results */}
          {testResults.length > 0 && (
            <div style={styles.testsPanel}>
              <div style={styles.testsHeader}>
                <span style={styles.testsTitle}>Test Results</span>
                <span style={{
                  ...styles.testsSummary,
                  color: testResults.every((r) => r.passed) ? 'var(--green)' : 'var(--red)',
                }}>
                  {testResults.filter((r) => r.passed).length}/{testResults.length} passed
                </span>
              </div>
              {testResults.map((result, i) => (
                <div key={i} style={styles.testRow}>
                  <span style={{ fontSize: '14px' }}>
                    {result.passed ? '✅' : '❌'}
                  </span>
                  <div style={styles.testInfo}>
                    <span style={{
                      ...styles.testDesc,
                      color: result.passed ? 'var(--text)' : 'var(--text-dim)',
                    }}>
                      {result.desc}
                    </span>
                    {!result.passed && (
                      <span style={styles.testExpected}>
                        Expected: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>{result.expected}</code>
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {/* Success banner */}
              {stageComplete && (
                <div style={styles.successBanner}>
                  <span style={styles.successEmoji}>🎉</span>
                  <div>
                    <div style={styles.successTitle}>All tests passed!</div>
                    <div style={styles.successSub}>+{xpGained} XP earned — Stage complete</div>
                  </div>
                  {nextStageId && (
                    <button
                      style={styles.nextBtn}
                      onClick={() => navigate(`/stage/${nextStageId}`)}
                    >
                      Next Stage →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function BriefingTab({ stage, region }) {
  return (
    <div style={styles.tabPane}>
      <div style={styles.briefingText}>{stage.briefing}</div>
      <div style={styles.briefingMeta}>
        <div style={styles.briefingMetaItem}>
          <span style={styles.metaLabel}>Region</span>
          <span style={{ color: region?.color || 'var(--accent)', fontWeight: 600 }}>
            {region?.name}
          </span>
        </div>
        <div style={styles.briefingMetaItem}>
          <span style={styles.metaLabel}>Concept</span>
          <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            {stage.concept}
          </span>
        </div>
        <div style={styles.briefingMetaItem}>
          <span style={styles.metaLabel}>XP Reward</span>
          <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            +{stage.xp ?? 100}
          </span>
        </div>
      </div>
    </div>
  );
}

function LessonTab({ stage }) {
  // Split lesson by code blocks (``` markers)
  const parts = (stage.lesson || '').split(/(```[\s\S]*?```)/g);

  return (
    <div style={styles.tabPane}>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/^```[a-z]*\n?/, '').replace(/```$/, '');
          return (
            <pre key={i} style={styles.lessonCode}>
              {code}
            </pre>
          );
        }
        return (
          <p key={i} style={styles.lessonText}>{part}</p>
        );
      })}
    </div>
  );
}

function HintTab({ stage }) {
  return (
    <div style={styles.tabPane}>
      <div style={styles.hintBox}>
        <div style={styles.hintHeader}>
          <span style={{ fontSize: '18px' }}>💡</span>
          <span style={styles.hintTitle}>Flight Hint</span>
        </div>
        <p style={styles.hintText}>{stage.hint || 'No hint available for this stage.'}</p>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = {
  container: {
    height: 'calc(100vh - 60px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  errorPage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 60px)',
    gap: '16px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    background: 'var(--bg2)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  navBtn: {
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    padding: '5px 12px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    flexShrink: 0,
  },
  navBtnActive: {
    borderColor: 'var(--green)',
    color: 'var(--green)',
  },
  breadcrumb: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    overflow: 'hidden',
  },
  breadSep: {
    color: 'var(--text-muted)',
  },
  stageNav: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0,
  },
  split: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  leftPanel: {
    width: '38%',
    minWidth: '300px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--border)',
    overflow: 'hidden',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  stageHeader: {
    padding: '16px 16px 12px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flexShrink: 0,
  },
  stageTagRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  milestoneBadge: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    background: 'rgba(255,165,0,0.12)',
    color: 'var(--gold)',
    border: '1px solid rgba(255,165,0,0.3)',
    borderRadius: '4px',
    padding: '2px 8px',
  },
  conceptBadge: {
    fontSize: '10px',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    borderRadius: '4px',
    padding: '2px 8px',
  },
  stageTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
  },
  stageSub: {
    fontSize: '13px',
    color: 'var(--text-dim)',
    margin: 0,
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    padding: '9px 4px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 150ms ease',
    marginBottom: '-1px',
    textAlign: 'center',
  },
  tabActive: {
    color: 'var(--accent)',
    borderBottomColor: 'var(--accent)',
  },
  tabDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  hintLock: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  tabContent: {
    flex: 1,
    overflowY: 'auto',
  },
  tabPane: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  briefingText: {
    fontSize: '14px',
    color: 'var(--text-dim)',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
  },
  briefingMeta: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  briefingMetaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  lessonText: {
    fontSize: '13px',
    color: 'var(--text-dim)',
    lineHeight: 1.7,
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  lessonCode: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '12px 14px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    lineHeight: 1.7,
    color: 'var(--text)',
    overflow: 'auto',
    margin: 0,
    whiteSpace: 'pre',
  },
  hintBox: {
    background: 'rgba(210,153,34,0.06)',
    border: '1px solid rgba(210,153,34,0.3)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  hintHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  hintTitle: {
    fontWeight: 600,
    fontSize: '14px',
    color: 'var(--amber)',
  },
  hintText: {
    fontSize: '13px',
    color: 'var(--text-dim)',
    lineHeight: 1.7,
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  xpFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg2)',
    flexShrink: 0,
  },
  xpLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  xpValue: {
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
  },
  workerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 12px',
    background: 'var(--bg2)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  workerStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  workerDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    transition: 'all 200ms ease',
    flexShrink: 0,
  },
  workerLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-dim)',
  },
  milestoneTag: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--gold)',
    background: 'rgba(255,165,0,0.1)',
    border: '1px solid rgba(255,165,0,0.25)',
    borderRadius: '4px',
    padding: '2px 8px',
    fontFamily: 'var(--font-mono)',
  },
  editorWrap: {
    flex: '0 0 50vh',
    minHeight: '200px',
    overflow: 'hidden',
    borderBottom: '1px solid var(--border)',
  },
  editorLoading: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
  },
  editorFallback: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
  },
  actionBar: {
    display: 'flex',
    gap: '8px',
    padding: '8px 12px',
    background: 'var(--bg2)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  runBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 18px',
    background: 'var(--accent)',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 18px',
    background: 'var(--green)',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '7px 14px',
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    marginLeft: 'auto',
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  outputPanel: {
    flexShrink: 0,
    borderBottom: '1px solid var(--border)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  outputHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg2)',
  },
  outputTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  errorBadge: {
    fontSize: '10px',
    fontWeight: 600,
    background: 'rgba(248,81,73,0.15)',
    color: 'var(--red)',
    border: '1px solid rgba(248,81,73,0.3)',
    borderRadius: '4px',
    padding: '1px 6px',
  },
  outputPre: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    lineHeight: 1.6,
    padding: '10px 12px',
    margin: 0,
    overflowY: 'auto',
    maxHeight: '100px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  testsPanel: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  testsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  testsTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  testsSummary: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: 700,
  },
  testRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '6px 8px',
    background: 'var(--bg2)',
    borderRadius: '6px',
    border: '1px solid var(--border)',
  },
  testInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  testDesc: {
    fontSize: '12px',
    lineHeight: 1.4,
  },
  testExpected: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    background: 'rgba(63,185,80,0.08)',
    border: '1px solid rgba(63,185,80,0.3)',
    borderRadius: '8px',
    marginTop: '4px',
    animation: 'slide-up 400ms ease',
  },
  successEmoji: {
    fontSize: '24px',
    flexShrink: 0,
  },
  successTitle: {
    fontWeight: 700,
    color: 'var(--green)',
    fontSize: '14px',
  },
  successSub: {
    fontSize: '12px',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-mono)',
  },
  nextBtn: {
    marginLeft: 'auto',
    padding: '7px 16px',
    background: 'var(--green)',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    flexShrink: 0,
  },
};
