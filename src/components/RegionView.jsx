import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';

export default function RegionView() {
  const { id } = useParams();
  const regionId = parseInt(id, 10);
  const navigate = useNavigate();
  const { regions, stages, getStageStatus, getRegionProgress } = useGame();

  const region = regions.find((r) => r.id === regionId);

  // Guard: invalid region
  if (!region) {
    return (
      <div style={styles.errorPage}>
        <p style={{ color: 'var(--text-dim)' }}>Region not found.</p>
        <Link to="/" style={styles.backLink}>← Back to World Map</Link>
      </div>
    );
  }

  const regionStages = stages.filter((s) => s.regionId === regionId);
  const { completed, total } = getRegionProgress(regionId);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Generate stage slot list (10 slots regardless)
  const stageSlots = Array.from({ length: 10 }, (_, i) => {
    const regionStage = i + 1;
    const stageId = (regionId - 1) * 10 + regionStage;
    const stageData = regionStages.find((s) => s.regionStage === regionStage || s.id === stageId);
    return { stageId, regionStage, stageData };
  });

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          ← World Map
        </button>
        <div style={styles.regionMeta}>
          <span style={styles.regionIcon}>{region.icon}</span>
          <div>
            <h1 style={styles.regionTitle}>{region.name}</h1>
            <p style={{ ...styles.regionSubtitle, color: region.color }}>{region.subtitle}</p>
          </div>
        </div>
        <div style={styles.progressSummary}>
          <div style={styles.progNumbers}>
            <span style={styles.progCompleted}>{completed}</span>
            <span style={styles.progSlash}>/</span>
            <span style={styles.progTotal}>{total}</span>
            <span style={styles.progLabel}>complete</span>
          </div>
          <div style={styles.progTrack}>
            <div
              style={{
                ...styles.progFill,
                width: `${pct}%`,
                background: completed === total && total > 0
                  ? 'var(--green)'
                  : `linear-gradient(90deg, ${region.color}, ${region.color}aa)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={styles.description}>{region.description}</p>

      {/* Stage grid */}
      <div style={styles.grid}>
        {stageSlots.map(({ stageId, regionStage, stageData }) => {
          const status = getStageStatus(stageId);
          return (
            <StageCard
              key={stageId}
              stageId={stageId}
              regionStage={regionStage}
              stageData={stageData}
              status={status}
              regionColor={region.color}
              onClick={() => {
                if (status !== 'locked') navigate(`/stage/${stageId}`);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function StageCard({ stageId, regionStage, stageData, status, regionColor, onClick }) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';
  const isMilestone = stageData?.isMilestone || regionStage === 10;

  const borderColor = isCompleted
    ? 'var(--green)'
    : isAvailable
    ? regionColor
    : 'var(--border)';

  return (
    <div
      style={{
        ...styles.card,
        opacity: isLocked ? 0.5 : 1,
        cursor: isLocked ? 'default' : 'pointer',
        borderColor,
        boxShadow: isAvailable
          ? `0 0 16px ${regionColor}22`
          : isCompleted
          ? '0 0 12px rgba(63,185,80,0.1)'
          : 'none',
      }}
      onClick={onClick}
      role={isLocked ? undefined : 'button'}
    >
      {/* Stage number + milestone badge */}
      <div style={styles.cardHeader}>
        <div style={styles.stageNumRow}>
          <span
            style={{
              ...styles.stageNum,
              color: isLocked ? 'var(--text-muted)' : regionColor,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {String(regionStage).padStart(2, '0')}
          </span>
          {isMilestone && (
            <span style={styles.milestoneBadge}>MILESTONE</span>
          )}
        </div>
        <div style={styles.statusIcon}>
          {isCompleted && <span style={{ color: 'var(--green)', fontSize: '16px' }}>✓</span>}
          {isAvailable && (
            <span
              style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: regionColor,
                boxShadow: `0 0 6px ${regionColor}`,
              }}
            />
          )}
          {isLocked && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🔒</span>}
        </div>
      </div>

      {/* Stage info */}
      <div style={styles.cardBody}>
        <div
          style={{
            ...styles.stageTitle,
            color: isLocked ? 'var(--text-muted)' : 'var(--text)',
          }}
        >
          {stageData ? stageData.title : `Stage ${stageId}`}
        </div>
        {stageData && (
          <div style={styles.stageSubtitle}>{stageData.subtitle}</div>
        )}
        {stageData && (
          <div style={styles.conceptBadge}>
            {stageData.concept}
          </div>
        )}
      </div>

      {/* XP shown if completed */}
      {isCompleted && stageData && (
        <div style={styles.xpPill}>
          +{stageData.xp} XP
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 60px)',
    padding: '32px 24px 60px',
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  errorPage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 60px)',
    gap: '16px',
  },
  backLink: {
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  backBtn: {
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    padding: '7px 14px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    flexShrink: 0,
  },
  regionMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  regionIcon: {
    fontSize: '36px',
    lineHeight: 1,
  },
  regionTitle: {
    fontSize: '20px',
    fontWeight: 700,
    margin: 0,
    color: 'var(--text)',
  },
  regionSubtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: 500,
    margin: 0,
  },
  progressSummary: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    minWidth: '120px',
  },
  progNumbers: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '3px',
    justifyContent: 'flex-end',
  },
  progCompleted: {
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    fontSize: '18px',
    color: 'var(--text)',
  },
  progSlash: {
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  progTotal: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--text-dim)',
  },
  progLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginLeft: '4px',
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
  description: {
    fontSize: '13px',
    color: 'var(--text-dim)',
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '12px 16px',
    margin: 0,
    fontFamily: 'var(--font-mono)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  card: {
    background: 'var(--panel)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '16px',
    transition: 'all 200ms ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    position: 'relative',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageNumRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stageNum: {
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: 1,
  },
  milestoneBadge: {
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    background: 'rgba(255,165,0,0.12)',
    color: 'var(--gold)',
    border: '1px solid rgba(255,165,0,0.3)',
    borderRadius: '4px',
    padding: '2px 6px',
  },
  statusIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  stageTitle: {
    fontSize: '14px',
    fontWeight: 600,
  },
  stageSubtitle: {
    fontSize: '12px',
    color: 'var(--text-dim)',
  },
  conceptBadge: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    marginTop: '2px',
  },
  xpPill: {
    alignSelf: 'flex-start',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    color: 'var(--green)',
    background: 'var(--green-glow)',
    border: '1px solid rgba(63,185,80,0.25)',
    borderRadius: '4px',
    padding: '2px 8px',
    marginTop: '4px',
  },
};
