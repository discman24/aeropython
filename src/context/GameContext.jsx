import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { useProgress } from '../hooks/useProgress.js';
import { regions } from '../data/regions.js';

export const RANKS = [
  { min: 0,  max: 9,  name: 'Student Pilot',    badge: '🎓', color: '#8b949e' },
  { min: 10, max: 19, name: 'Private Pilot',     badge: '🛩️', color: '#58a6ff' },
  { min: 20, max: 29, name: 'Instrument Rating', badge: '🌩️', color: '#3fb950' },
  { min: 30, max: 39, name: 'Commercial Pilot',  badge: '💼', color: '#d29922' },
  { min: 40, max: 49, name: 'Multi-Engine',      badge: '✈️', color: '#bc8cff' },
  { min: 50, max: 59, name: 'Flight Instructor', badge: '👨‍✈️', color: '#00d4ff' },
  { min: 60, max: 70, name: 'Airline Transport', badge: '🏆', color: '#ffa500' },
];

export function getRankForStages(completedCount) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (completedCount >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
}

export function getXpToNextRank(completedCount) {
  for (const rank of RANKS) {
    if (completedCount >= rank.min && completedCount <= rank.max) {
      const progress = completedCount - rank.min;
      const total = rank.max - rank.min + 1;
      return { progress, total, pct: Math.round((progress / total) * 100) };
    }
  }
  return { progress: 1, total: 1, pct: 100 };
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { progress, saveProgress, resetProgress } = useProgress();
  const [stages, setStages] = useState([]);

  // Dynamically import stages so build succeeds even before stages.js exists
  useEffect(() => {
    import('../data/stages.js')
      .then((mod) => setStages(mod.stages || []))
      .catch(() => setStages([]));
  }, []);

  const getStageStatus = useCallback(
    (stageId) => {
      if (progress.completedStages.has(stageId)) return 'completed';
      if (stageId === 1) return 'available';
      if (progress.completedStages.has(stageId - 1)) return 'available';
      return 'locked';
    },
    [progress.completedStages]
  );

  const completeStage = useCallback(
    (stageId) => {
      if (progress.completedStages.has(stageId)) return;
      const stage = stages.find((s) => s.id === stageId);
      const xpGain = stage?.xp ?? 100;
      const newCompleted = new Set(progress.completedStages);
      newCompleted.add(stageId);
      saveProgress({
        completedStages: newCompleted,
        xp: progress.xp + xpGain,
      });
    },
    [progress, saveProgress, stages]
  );

  const getRegionProgress = useCallback(
    (regionId) => {
      const regionStages = stages.filter((s) => s.regionId === regionId);
      const total = regionStages.length || 10;
      const completed = regionStages.filter((s) =>
        progress.completedStages.has(s.id)
      ).length;
      return { completed, total };
    },
    [progress.completedStages, stages]
  );

  const totalXP = progress.xp;
  const completedCount = progress.completedStages.size;
  const rank = getRankForStages(completedCount);
  const rankProgress = getXpToNextRank(completedCount);

  const value = useMemo(
    () => ({
      stages,
      regions,
      progress,
      rank,
      rankProgress,
      totalXP,
      completedCount,
      completeStage,
      getStageStatus,
      getRegionProgress,
      resetProgress,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stages, progress, rank, rankProgress, totalXP, completedCount]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
