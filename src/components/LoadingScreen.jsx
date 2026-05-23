import React, { useEffect, useState } from 'react';

const MESSAGES = [
  'Loading flight computer...',
  'Calibrating instruments...',
  'Establishing comms link...',
  'Uploading Python runtime...',
  'Pre-flight checks complete.',
];

export default function LoadingScreen({ message }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(msgTimer);
  }, []);

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(dotTimer);
  }, []);

  return (
    <div style={styles.container}>
      {/* Radar animation */}
      <div style={styles.radarWrap}>
        <div style={styles.radarRing1} />
        <div style={styles.radarRing2} />
        <div style={styles.radarRing3} />
        <div style={styles.radarCenter}>
          <span style={styles.radarIcon}>✈️</span>
        </div>
        <div style={styles.radarSweep} />
      </div>

      {/* Text */}
      <div style={styles.textArea}>
        <div style={styles.title}>AeroPython</div>
        <div style={styles.subtitle}>FLIGHT COMPUTER ONLINE</div>
        <div style={styles.message}>
          {message || MESSAGES[msgIndex]}{dots}
        </div>

        {/* Progress bar */}
        <div style={styles.barTrack}>
          <div style={styles.barFill} />
        </div>

        <div style={styles.hint}>
          Python 3.12 • Pyodide v0.27.4 • Initializing WASM sandbox
        </div>
      </div>

      <style>{`
        @keyframes radar-pulse {
          0%   { transform: scale(0.8); opacity: 0.8; }
          50%  { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(0.8); opacity: 0.8; }
        }
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes bar-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .radar-ring-1 { animation: radar-pulse 2s ease-in-out infinite; }
        .radar-ring-2 { animation: radar-pulse 2s ease-in-out infinite 0.4s; }
        .radar-ring-3 { animation: radar-pulse 2s ease-in-out infinite 0.8s; }
        .radar-sweep  { animation: radar-sweep 3s linear infinite; }
        .bar-shimmer  {
          background: linear-gradient(90deg, var(--accent) 0%, #66e6ff 30%, var(--accent) 60%, var(--blue) 100%);
          background-size: 200% auto;
          animation: bar-shimmer 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: 'calc(100vh - 60px)',
    gap: '40px',
    padding: '40px 20px',
    background: 'var(--bg)',
  },
  radarWrap: {
    position: 'relative',
    width: '140px',
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRing1: {
    position: 'absolute',
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    border: '1px solid rgba(0,212,255,0.3)',
    animation: 'radar-pulse 2s ease-in-out infinite',
  },
  radarRing2: {
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '1px solid rgba(0,212,255,0.4)',
    animation: 'radar-pulse 2s ease-in-out infinite 0.4s',
  },
  radarRing3: {
    position: 'absolute',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: '1px solid rgba(0,212,255,0.6)',
    animation: 'radar-pulse 2s ease-in-out infinite 0.8s',
  },
  radarCenter: {
    position: 'relative',
    zIndex: 2,
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'var(--bg2)',
    border: '1px solid var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px var(--accent-glow)',
  },
  radarIcon: {
    fontSize: '22px',
  },
  radarSweep: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '50%',
    height: '1px',
    transformOrigin: '0 50%',
    background: 'linear-gradient(90deg, rgba(0,212,255,0.8), transparent)',
    animation: 'radar-sweep 3s linear infinite',
    boxShadow: '0 0 4px var(--accent)',
  },
  textArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    maxWidth: '340px',
    width: '100%',
  },
  title: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: '28px',
    color: 'var(--text)',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--accent)',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  message: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: 'var(--text-dim)',
    marginTop: '8px',
    minHeight: '20px',
    textAlign: 'center',
  },
  barTrack: {
    width: '100%',
    height: '3px',
    background: 'var(--bg3)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '4px',
  },
  barFill: {
    height: '100%',
    width: '100%',
    borderRadius: '2px',
    background: 'linear-gradient(90deg, var(--accent) 0%, #66e6ff 30%, var(--accent) 60%, var(--blue) 100%)',
    backgroundSize: '200% auto',
    animation: 'bar-shimmer 2s linear infinite',
  },
  hint: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginTop: '4px',
  },
};
