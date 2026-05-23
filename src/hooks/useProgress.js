import { useState, useCallback } from 'react';

const STORAGE_KEY = 'aeropython_v2';
const LEGACY_KEY = 'aeropython_v1_progress';

function loadProgress() {
  // Clear legacy key if present
  if (localStorage.getItem(LEGACY_KEY)) {
    localStorage.removeItem(LEGACY_KEY);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Restore Set from array
    return {
      ...parsed,
      completedStages: new Set(parsed.completedStages || []),
    };
  } catch {
    return null;
  }
}

function serializeProgress(progress) {
  return JSON.stringify({
    ...progress,
    completedStages: Array.from(progress.completedStages),
  });
}

const DEFAULT_PROGRESS = {
  completedStages: new Set(),
  xp: 0,
};

export function useProgress() {
  const [progress, setProgressState] = useState(() => {
    return loadProgress() || { ...DEFAULT_PROGRESS, completedStages: new Set() };
  });

  const saveProgress = useCallback((newProgress) => {
    setProgressState(newProgress);
    localStorage.setItem(STORAGE_KEY, serializeProgress(newProgress));
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = { completedStages: new Set(), xp: 0 };
    setProgressState(fresh);
    localStorage.setItem(STORAGE_KEY, serializeProgress(fresh));
  }, []);

  return { progress, saveProgress, resetProgress };
}
