import React from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';

export default function HUD() {
  const { rank, rankProgress, totalXP, completedCount } = useGame();

  return (
    <header style={styles.hud}>
      {/* Left — Logo */}
      <Link to="/" style={styles.logo}>
        <span style={styles.logoIcon}>✈️</span>
        <span style={styles.logoText}>
          Aero<span style={styles.logoPython}>Python</span>
        </span>
      </Link>

      {/* Center — Rank + XP bar */}
      <div style={styles.center}>
        <div style={styles.rankRow}>
          <span style={styles.rankBadge}>{rank.badge}</span>
          <span style={{ ...styles.rankName, color: rank.color }}>{rank.name}</span>
          <span style={styles.xpLabel}>{totalXP.toLocaleString()} XP</span>
        </div>
        <div style={styles.xpTrack}>
          <div
            style={{
              ...styles.xpFill,
              width: `${rankProgress.pct}%`,
            }}
          />
        </div>
        <div style={styles.rankMeta}>
          <span style={styles.rankMetaText}>
            {rankProgress.progress}/{rankProgress.total} stages to next rank
          </span>
        </div>
      </div>

      {/* Right — Stage counter */}
      <div style={styles.right}>
        <div style={styles.counterBox}>
          <span style={styles.counterNum}>{completedCount}</span>
          <span style={styles.counterSep}>/</span>
          <span style={styles.counterTotal}>70</span>
          <span style={styles.counterLabel}>stages</span>
        </div>
      </div>
    </header>
  );
}

const styles = {
  hud: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'var(--panel)',
    borderBottom: '1px solid var(--green)',
    boxShadow: '0 0 20px rgba(63, 185, 80, 0.12), 0 2px 8px rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    zIndex: 1000,
    gap: '16px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoIcon: {
    fontSize: '22px',
    lineHeight: 1,
  },
  logoText: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: '16px',
    color: 'var(--text)',
    letterSpacing: '-0.3px',
  },
  logoPython: {
    color: 'var(--accent)',
  },
  center: {
    flex: 1,
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  rankRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
  },
  rankBadge: {
    fontSize: '14px',
    lineHeight: 1,
  },
  rankName: {
    fontWeight: 600,
    fontSize: '13px',
    flex: 1,
  },
  xpLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  xpTrack: {
    height: '4px',
    background: 'var(--bg3)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: '2px',
    background: 'linear-gradient(90deg, var(--accent), var(--blue))',
    boxShadow: '0 0 8px var(--accent-glow)',
    transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  rankMeta: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  rankMetaText: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  right: {
    flexShrink: 0,
  },
  counterBox: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '3px',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '4px 10px',
  },
  counterNum: {
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    fontSize: '16px',
    color: 'var(--accent)',
  },
  counterSep: {
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  counterTotal: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--text-dim)',
  },
  counterLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginLeft: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};
