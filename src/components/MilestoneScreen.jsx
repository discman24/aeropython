import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGame, RANKS, getRankForStages } from '../context/GameContext.jsx';

export default function MilestoneScreen() {
  const { id } = useParams();
  const stageId = parseInt(id, 10);
  const navigate = useNavigate();
  const location = useLocation();
  const { regions, completedCount, rank, totalXP } = useGame();

  // Get state from navigation or compute from context
  const passedStage = location.state?.stage;
  const passedXp = location.state?.xp ?? 500;

  // Determine region from stageId
  const regionId = Math.ceil(stageId / 10);
  const region = regions.find((r) => r.id === regionId);

  // Rank before this milestone
  const prevCount = Math.max(0, completedCount - 1);
  const prevRank = getRankForStages(prevCount);
  const rankChanged = prevRank.name !== rank.name;

  // XP counter animation
  const [displayXP, setDisplayXP] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Delay reveal
    const revealTimer = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(revealTimer);
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const target = passedXp;
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setDisplayXP(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [revealed, passedXp]);

  return (
    <div style={styles.page}>
      <div style={styles.backdrop} />

      {/* Particles */}
      <Particles />

      <div style={{ ...styles.card, opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(30px)', transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {/* Region complete header */}
        <div style={styles.header}>
          <span style={styles.checkmark}>✅</span>
          <div>
            <div style={styles.regionCompleteLabel}>Region Complete</div>
            {region && (
              <h1 style={{ ...styles.regionName, color: region.color }}>
                {region.icon} {region.name}
              </h1>
            )}
          </div>
        </div>

        {/* XP gained */}
        <div style={styles.xpBlock}>
          <div style={styles.xpLabel}>XP Earned</div>
          <div style={styles.xpAmount}>
            <span style={styles.xpPlus}>+</span>
            <span style={styles.xpNum}>{displayXP.toLocaleString()}</span>
            <span style={styles.xpUnit}>XP</span>
          </div>
          <div style={styles.xpTotal}>Total: {totalXP.toLocaleString()} XP</div>
        </div>

        {/* Rank block */}
        <div style={styles.rankBlock}>
          {rankChanged ? (
            <>
              <div style={styles.rankUnlockLabel}>🎖️ New Rank Unlocked!</div>
              <div style={styles.rankDisplay}>
                <div style={styles.rankBadgeWrap}>
                  <span style={styles.rankBadge}>{rank.badge}</span>
                </div>
                <div>
                  <div style={{ ...styles.rankName, color: rank.color }}>{rank.name}</div>
                  <div style={styles.rankSub}>Previous: {prevRank.badge} {prevRank.name}</div>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.rankDisplay}>
              <div style={styles.rankBadgeWrap}>
                <span style={styles.rankBadge}>{rank.badge}</span>
              </div>
              <div>
                <div style={{ ...styles.rankName, color: rank.color }}>{rank.name}</div>
                <div style={styles.rankSub}>{completedCount} stages completed</div>
              </div>
            </div>
          )}
        </div>

        {/* Next region preview */}
        {regionId < 7 && (
          <div style={styles.nextRegionBlock}>
            <div style={styles.nextRegionLabel}>Next Region</div>
            <div style={styles.nextRegionName}>
              {regions.find((r) => r.id === regionId + 1)?.icon}{' '}
              {regions.find((r) => r.id === regionId + 1)?.name}
            </div>
            <div style={styles.nextRegionSub}>
              {regions.find((r) => r.id === regionId + 1)?.subtitle}
            </div>
          </div>
        )}
        {regionId === 7 && (
          <div style={styles.finalBlock}>
            <span style={{ fontSize: '32px' }}>🏆</span>
            <div style={styles.finalTitle}>All Regions Complete!</div>
            <div style={styles.finalSub}>You've earned the Airline Transport rank. Legendary.</div>
          </div>
        )}

        {/* Action buttons */}
        <div style={styles.actions}>
          <button
            style={styles.continueBtn}
            onClick={() => navigate('/')}
          >
            Continue Mission →
          </button>
          {regionId < 7 && (
            <button
              style={styles.nextRegionBtn}
              onClick={() => navigate(`/region/${regionId + 1}`)}
            >
              Enter {regions.find((r) => r.id === regionId + 1)?.name} →
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes milestone-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px var(--accent-glow); }
          50%       { transform: scale(1.08); box-shadow: 0 0 60px var(--accent-glow), 0 0 100px rgba(0,212,255,0.1); }
        }
        @keyframes float-up {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-120px) scale(0.5); }
        }
        .rank-badge-anim {
          animation: milestone-pulse 2s ease-in-out infinite;
        }
        .particle {
          animation: float-up 3s ease-out infinite;
        }
      `}</style>
    </div>
  );
}

function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    duration: `${2 + Math.random() * 2}s`,
    size: `${8 + Math.random() * 16}px`,
    emoji: ['✨', '⭐', '🌟', '💫', '🔥'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: p.left,
            fontSize: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 60px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.06) 0%, var(--bg) 60%)',
    zIndex: 0,
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'var(--panel)',
    border: '1px solid var(--accent)',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '480px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    boxShadow: '0 0 60px var(--accent-glow), 0 20px 60px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  checkmark: {
    fontSize: '40px',
    flexShrink: 0,
  },
  regionCompleteLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontFamily: 'var(--font-mono)',
    marginBottom: '4px',
  },
  regionName: {
    fontSize: '22px',
    fontWeight: 700,
    margin: 0,
  },
  xpBlock: {
    background: 'rgba(0,212,255,0.05)',
    border: '1px solid rgba(0,212,255,0.2)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  xpLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: 'var(--font-mono)',
    marginBottom: '8px',
  },
  xpAmount: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '4px',
  },
  xpPlus: {
    fontSize: '24px',
    color: 'var(--accent)',
    fontWeight: 700,
  },
  xpNum: {
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    fontSize: '48px',
    color: 'var(--accent)',
    lineHeight: 1,
    textShadow: '0 0 30px var(--accent-glow)',
  },
  xpUnit: {
    fontSize: '18px',
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
  },
  xpTotal: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    marginTop: '8px',
  },
  rankBlock: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
  },
  rankUnlockLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--gold)',
    marginBottom: '12px',
    fontFamily: 'var(--font-mono)',
  },
  rankDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  rankBadgeWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'var(--bg3)',
    border: '2px solid var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    flexShrink: 0,
    animation: 'milestone-pulse 2s ease-in-out infinite',
    boxShadow: '0 0 20px var(--accent-glow)',
  },
  rankBadge: {
    lineHeight: 1,
  },
  rankName: {
    fontSize: '18px',
    fontWeight: 700,
  },
  rankSub: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  nextRegionBlock: {
    background: 'var(--bg2)',
    border: '1px dashed var(--border)',
    borderRadius: '10px',
    padding: '14px',
  },
  nextRegionLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: 'var(--font-mono)',
    marginBottom: '4px',
  },
  nextRegionName: {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--text)',
  },
  nextRegionSub: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  finalBlock: {
    textAlign: 'center',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  finalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--gold)',
  },
  finalSub: {
    fontSize: '13px',
    color: 'var(--text-dim)',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  continueBtn: {
    width: '100%',
    padding: '13px',
    background: 'var(--accent)',
    color: '#000',
    border: 'none',
    borderRadius: '10px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    boxShadow: '0 0 20px var(--accent-glow)',
  },
  nextRegionBtn: {
    width: '100%',
    padding: '11px',
    background: 'transparent',
    color: 'var(--text-dim)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
  },
};
