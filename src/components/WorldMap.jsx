import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';

export default function WorldMap() {
  const { regions, getRegionProgress, getStageStatus, totalXP, rank, completedCount } = useGame();
  const navigate = useNavigate();

  function getRegionStatus(region) {
    const firstStageId = (region.id - 1) * 10 + 1;
    // Region 1 is always accessible
    if (region.id === 1) {
      const { completed, total } = getRegionProgress(region.id);
      if (completed === total && total > 0) return 'completed';
      return 'available';
    }
    // Region is available if previous region's first stage is completed
    // (i.e., any stage in this region is available/completed)
    const { completed, total } = getRegionProgress(region.id);
    if (completed === total && total > 0) return 'completed';
    const regionStatus = getStageStatus(firstStageId);
    if (regionStatus === 'locked') return 'locked';
    return 'available';
  }

  function handleRegionClick(region) {
    const status = getRegionStatus(region);
    if (status === 'locked') return;
    navigate(`/region/${region.id}`);
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <span style={styles.headerIcon}>🌍</span>
          <div>
            <h1 style={styles.title}>Flight Training World</h1>
            <p style={styles.titleSub}>Master Python — one region at a time</p>
          </div>
        </div>
        <div style={styles.statsRow}>
          <StatPill label="Total XP" value={totalXP.toLocaleString()} color="var(--accent)" />
          <StatPill label="Stages Done" value={`${completedCount}/70`} color="var(--green)" />
          <StatPill label="Rank" value={`${rank.badge} ${rank.name}`} color={rank.color} />
        </div>
      </div>

      {/* Region grid */}
      <div style={styles.grid}>
        {regions.map((region) => {
          const status = getRegionStatus(region);
          const { completed, total } = getRegionProgress(region.id);
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          return (
            <RegionCard
              key={region.id}
              region={region}
              status={status}
              completed={completed}
              total={total}
              pct={pct}
              onClick={() => handleRegionClick(region)}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.footerText}>
          ✈️ AeroPython v2 — Fly Through Code
        </span>
      </div>
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={styles.statPill}>
      <span style={styles.statLabel}>{label}</span>
      <span style={{ ...styles.statValue, color }}>{value}</span>
    </div>
  );
}

function RegionCard({ region, status, completed, total, pct, onClick }) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';

  const cardStyle = {
    ...styles.card,
    ...(isLocked ? styles.cardLocked : {}),
    ...(isCompleted ? styles.cardCompleted : {}),
    ...(isAvailable ? styles.cardAvailable : {}),
    borderColor: isLocked ? 'var(--border)' : region.color + (isCompleted ? '' : '66'),
    cursor: isLocked ? 'default' : 'pointer',
  };

  const glowStyle = isAvailable
    ? { boxShadow: `0 0 24px ${region.color}22, 0 4px 12px rgba(0,0,0,0.4)` }
    : isCompleted
    ? { boxShadow: `0 0 16px rgba(63,185,80,0.12), 0 4px 12px rgba(0,0,0,0.4)` }
    : { boxShadow: '0 2px 8px rgba(0,0,0,0.3)' };

  return (
    <div style={{ ...cardStyle, ...glowStyle }} onClick={onClick} role={isLocked ? undefined : 'button'}>
      {/* Region number */}
      <div style={styles.regionNum}>
        Region {region.id}
      </div>

      {/* Status indicator */}
      <div style={styles.statusRow}>
        {isLocked && <span style={styles.lockIcon}>🔒</span>}
        {isCompleted && <span style={styles.checkIcon}>✅</span>}
        {isAvailable && (
          <span style={{ ...styles.availDot, background: region.color, boxShadow: `0 0 8px ${region.color}` }} />
        )}
      </div>

      {/* Icon */}
      <div
        style={{
          ...styles.regionIcon,
          opacity: isLocked ? 0.35 : 1,
          filter: isLocked ? 'grayscale(1)' : 'none',
        }}
      >
        {region.icon}
      </div>

      {/* Name */}
      <div style={styles.regionName} className={isLocked ? '' : ''}>
        <h3
          style={{
            ...styles.regionTitle,
            color: isLocked ? 'var(--text-muted)' : 'var(--text)',
          }}
        >
          {region.name}
        </h3>
        <p
          style={{
            ...styles.regionSubtitle,
            color: isLocked ? 'var(--text-muted)' : region.color,
          }}
        >
          {region.subtitle}
        </p>
      </div>

      {/* Description */}
      <p style={styles.regionDesc}>{region.description}</p>

      {/* Progress */}
      <div style={styles.progressArea}>
        <div style={styles.progressLabel}>
          <span style={{ color: isLocked ? 'var(--text-muted)' : 'var(--text-dim)', fontSize: '12px' }}>
            {completed}/{total} complete
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: isLocked ? 'var(--text-muted)' : region.color,
            }}
          >
            {pct}%
          </span>
        </div>
        <div style={styles.progTrack}>
          <div
            style={{
              ...styles.progFill,
              width: `${pct}%`,
              background: isCompleted
                ? 'var(--green)'
                : `linear-gradient(90deg, ${region.color}, ${region.color}aa)`,
              boxShadow: pct > 0 ? `0 0 8px ${region.color}44` : 'none',
            }}
          />
        </div>
      </div>

      {/* Locked tooltip */}
      {isLocked && (
        <div style={styles.lockedMsg}>
          Complete Region {region.id - 1} first
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 60px)',
    padding: '32px 24px 60px',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  headerIcon: {
    fontSize: '36px',
    lineHeight: 1,
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
  },
  titleSub: {
    fontSize: '13px',
    color: 'var(--text-dim)',
    margin: 0,
  },
  statsRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  statPill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'var(--panel)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px 16px',
    gap: '2px',
  },
  statLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  card: {
    background: 'var(--panel)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    position: 'relative',
    transition: 'all 200ms ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardCompleted: {
    background: 'linear-gradient(135deg, var(--panel), rgba(63,185,80,0.04))',
  },
  cardAvailable: {
    background: 'linear-gradient(135deg, var(--panel), rgba(0,212,255,0.03))',
  },
  regionNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  statusRow: {
    position: 'absolute',
    top: '16px',
    right: '16px',
  },
  lockIcon: {
    fontSize: '14px',
    opacity: 0.5,
  },
  checkIcon: {
    fontSize: '16px',
  },
  availDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  regionIcon: {
    fontSize: '40px',
    lineHeight: 1,
    marginBottom: '4px',
  },
  regionName: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  regionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    margin: 0,
  },
  regionSubtitle: {
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: 'var(--font-mono)',
    margin: 0,
  },
  regionDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    margin: 0,
  },
  progressArea: {
    marginTop: '4px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progTrack: {
    height: '4px',
    background: 'var(--bg3)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 600ms ease',
  },
  lockedMsg: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    fontFamily: 'var(--font-mono)',
    marginTop: '4px',
    padding: '4px',
    background: 'var(--bg3)',
    borderRadius: '4px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
  },
  footerText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
};
