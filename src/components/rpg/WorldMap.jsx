import React from 'react';
import { Lock, Star, ChevronRight, Crown } from 'lucide-react';

const regionPositions = [
  { top: '75%', left: '10%' },
  { top: '60%', left: '28%' },
  { top: '48%', left: '48%' },
  { top: '35%', left: '68%' },
  { top: '22%', left: '85%' },
  { top: '22%', left: '60%' },
  { top: '10%', left: '38%' },
  { top: '8%', left: '15%' },
];

export default function WorldMap({ regions, playerLevel, completedRegions, onSelectRegion }) {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-950">
      {/* Map background */}
      <div className="relative w-full" style={{ paddingBottom: '50%', minHeight: '350px' }}>
        {/* Starfield background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950">
          {/* Decorative stars */}
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}

          {/* Path lines connecting regions */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M 10 75 Q 19 68 28 60 Q 38 54 48 48 Q 58 42 68 35 Q 77 28 85 22 Q 73 22 60 22 Q 49 16 38 10 Q 27 9 15 8"
              fill="none"
              stroke="rgba(100, 116, 139, 0.3)"
              strokeWidth="0.3"
              strokeDasharray="1,1"
            />
          </svg>

          {/* Region nodes */}
          {regions.map((region, index) => {
            const pos = regionPositions[index];
            const isCompleted = completedRegions.includes(region.id);
            const isLocked = playerLevel < region.unlockLevel;
            const isActive = !isLocked;
            const questsDone = region.quests?.filter(q =>
              completedRegions.includes(`${region.id}-${q.id}`)
            ).length || 0;

            return (
              <button
                key={region.id}
                onClick={() => isActive && onSelectRegion(region)}
                disabled={isLocked}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ top: pos.top, left: pos.left }}
              >
                {/* Glow ring */}
                {isActive && !isCompleted && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{
                      backgroundColor: region.color,
                      width: '80px',
                      height: '80px',
                      margin: '-16px',
                    }}
                  />
                )}

                {/* Main node */}
                <div
                  className={`
                    relative w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl
                    transition-all duration-300 shadow-lg
                    ${isLocked
                      ? 'bg-slate-900 border-2 border-slate-800 opacity-40 cursor-not-allowed'
                      : isCompleted
                        ? 'bg-emerald-500/20 border-2 border-emerald-500 cursor-pointer hover:scale-110'
                        : 'border-2 cursor-pointer hover:scale-110 active:scale-95'
                    }
                  `}
                  style={isActive && !isCompleted ? {
                    borderColor: region.color,
                    boxShadow: `0 0 20px ${region.color}33`,
                    backgroundColor: `${region.color}15`,
                  } : {}}
                >
                  {isLocked ? (
                    <Lock className="w-5 h-5 text-slate-700" />
                  ) : isCompleted ? (
                    <Star className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <span>{region.icon}</span>
                  )}
                </div>

                {/* Label */}
                <div className={`
                  absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-[9px] md:text-[10px] font-black uppercase tracking-wider text-center
                  ${isLocked ? 'text-slate-700' : isCompleted ? 'text-emerald-400' : 'text-slate-300'}
                `}>
                  <div>{region.name}</div>
                  {isLocked && (
                    <div className="text-[8px] text-slate-700 mt-0.5">Level {region.unlockLevel}</div>
                  )}
                  {isActive && !isCompleted && (
                    <div className="text-[8px] mt-0.5" style={{ color: region.color }}>
                      {questsDone}/{region.quests?.length || 5} quests
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend bar */}
      <div className="px-4 py-2.5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/50"></div>
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-3 h-3 text-emerald-400" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-700" />
            Locked
          </span>
        </div>
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">World Map</span>
      </div>
    </div>
  );
}
