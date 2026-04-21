import React, { useEffect, useRef, useState } from 'react';
import { Lock, Star } from 'lucide-react';
import { ELEMENTS, REGION_ELEMENTS } from '../../data/rpgQuests';

// Winding path positions for 8 regions
const regionPositions = [
  { top: '78%', left: '10%' },
  { top: '62%', left: '26%' },
  { top: '48%', left: '44%' },
  { top: '34%', left: '62%' },
  { top: '20%', left: '80%' },
  { top: '22%', left: '58%' },
  { top: '14%', left: '36%' },
  { top: '10%', left: '14%' },
];

// SVG path connecting all region centers
const PATH_D = 'M 10 78 Q 18 70 26 62 Q 35 55 44 48 Q 53 41 62 34 Q 71 27 80 20 Q 69 21 58 22 Q 47 18 36 14 Q 25 12 14 10';

function ElementParticles({ element, count = 6 }) {
  const el = ELEMENTS[element];
  if (!el) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="absolute pointer-events-none text-xs animate-ping select-none"
          style={{
            color: el.color,
            opacity: 0.5,
            top: `${20 + Math.sin(i * 1.1) * 30}%`,
            left: `${20 + Math.cos(i * 1.1) * 30}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${1.5 + i * 0.2}s`,
          }}
        >
          {el.particle}
        </span>
      ))}
    </>
  );
}

function ProgressRing({ percent, color, size = 48 }) {
  const radius = (size - 6) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 -rotate-90"
      style={{ pointerEvents: 'none' }}
    >
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={3} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease', opacity: 0.7 }}
      />
    </svg>
  );
}

export default function WorldMap({ regions, playerAR, playerLevel, completedRegions, completedQuests, onSelectRegion }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Map background */}
      <div className="relative w-full" style={{ paddingBottom: '52%', minHeight: '360px' }}>
        {/* Layered background */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950" />

          {/* Terrain texture blobs */}
          <div className="absolute top-1/3 left-1/2 w-48 h-48 bg-cyan-950/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-purple-950/20 rounded-full blur-3xl" />
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-amber-950/15 rounded-full blur-3xl" />

          {/* Animated star field */}
          {Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: `${Math.random() > 0.8 ? 2 : 1}px`,
                height: `${Math.random() > 0.8 ? 2 : 1}px`,
                top: `${(i * 7.3 + 3) % 100}%`,
                left: `${(i * 11.7 + 5) % 100}%`,
                animationDelay: `${(i * 0.3) % 4}s`,
                animationDuration: `${2 + (i * 0.17) % 2}s`,
                opacity: 0.15 + (i % 5) * 0.08,
              }}
            />
          ))}

          {/* Path SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Glow path (unlocked portion) */}
            {completedRegions.length > 0 && (
              <path
                d={PATH_D}
                fill="none"
                stroke="rgba(34,211,238,0.15)"
                strokeWidth="1"
                filter="blur(2px)"
              />
            )}
            {/* Base dashed path */}
            <path
              d={PATH_D}
              fill="none"
              stroke="rgba(100,116,139,0.25)"
              strokeWidth="0.4"
              strokeDasharray="1.5,1.5"
            />
            {/* Completed path segment */}
            {completedRegions.length > 0 && (
              <path
                d={PATH_D}
                fill="none"
                stroke="rgba(34,211,238,0.45)"
                strokeWidth="0.5"
                strokeDasharray={`${completedRegions.length * 12},999`}
              />
            )}
          </svg>

          {/* Region nodes */}
          {regions.map((region, index) => {
            const pos = regionPositions[index];
            if (!pos) return null;

            const elementKey = REGION_ELEMENTS[region.id];
            const el = ELEMENTS[elementKey] || ELEMENTS.variables;
            const isCompleted = completedRegions.includes(region.id);
            const isLocked = playerAR < (region.unlockLevel || 1);
            const isActive = !isLocked;
            const isHovered = hoveredRegion === region.id;

            const regionQuests = region.quests || [];
            const questsDoneInRegion = regionQuests.filter(q => completedQuests?.includes(q.id)).length;
            const progressPct = regionQuests.length > 0 ? (questsDoneInRegion / regionQuests.length) * 100 : 0;

            const nodeSize = 52;

            return (
              <div
                key={region.id}
                className="absolute"
                style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
              >
                {/* Floating label */}
                <div
                  className={`
                    absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-center
                    transition-all duration-300 pointer-events-none
                    ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-0.5'}
                  `}
                >
                  <div
                    className={`text-sm md:text-sm font-black uppercase tracking-wider px-2 py-0.5 rounded-full`}
                    style={isActive ? { color: el.color, backgroundColor: el.bg } : { color: '#475569' }}
                  >
                    {region.name}
                  </div>
                  {isLocked && (
                    <div className="text-xs text-slate-700 mt-0.5 font-bold">AR {region.unlockLevel} req.</div>
                  )}
                  {isActive && !isCompleted && regionQuests.length > 0 && (
                    <div className="text-xs mt-0.5 font-bold" style={{ color: el.color }}>
                      {questsDoneInRegion}/{regionQuests.length} quests
                    </div>
                  )}
                  {isCompleted && (
                    <div className="text-xs text-emerald-400 mt-0.5 font-bold">★ Complete</div>
                  )}
                </div>

                {/* Node button */}
                <button
                  onClick={() => isActive && onSelectRegion(region)}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  disabled={isLocked}
                  className={`relative flex items-center justify-center transition-all duration-300 ${
                    isLocked ? 'cursor-not-allowed opacity-35' : 'cursor-pointer hover:scale-110 active:scale-95'
                  }`}
                  style={{ width: nodeSize, height: nodeSize }}
                >
                  {/* Pulse ring for active incomplete */}
                  {isActive && !isCompleted && (
                    <div
                      className="absolute inset-0 rounded-2xl animate-ping opacity-15"
                      style={{ backgroundColor: el.color, animationDuration: '2s' }}
                    />
                  )}

                  {/* Progress ring */}
                  {isActive && !isCompleted && progressPct > 0 && (
                    <div className="absolute inset-0">
                      <ProgressRing percent={progressPct} color={el.color} size={nodeSize} />
                    </div>
                  )}

                  {/* Glow shadow */}
                  {isActive && !isLocked && (
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ boxShadow: el.glow }}
                    />
                  )}

                  {/* Node body */}
                  <div
                    className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-lg overflow-hidden"
                    style={isActive && !isCompleted ? {
                      backgroundColor: el.bg,
                      border: `2px solid ${el.color}88`,
                      boxShadow: isHovered ? el.glow : 'none',
                    } : isCompleted ? {
                      backgroundColor: 'rgba(16,185,129,0.12)',
                      border: '2px solid rgba(16,185,129,0.5)',
                      boxShadow: isHovered ? '0 0 20px rgba(16,185,129,0.3)' : 'none',
                    } : {
                      backgroundColor: '#0f172a',
                      border: '2px solid #1e293b',
                    }}
                  >
                    {/* Particle effects inside node */}
                    {isActive && !isCompleted && isHovered && (
                      <div className="absolute inset-0">
                        <ElementParticles element={elementKey} count={4} />
                      </div>
                    )}

                    {isLocked ? (
                      <Lock className="w-4 h-4 text-slate-700" />
                    ) : isCompleted ? (
                      <Star className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <span className="relative z-10">{region.icon}</span>
                    )}
                  </div>

                  {/* Element badge */}
                  {isActive && !isLocked && (
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-sm border border-slate-900"
                      style={{ backgroundColor: el.bg, boxShadow: `0 0 6px ${el.color}44` }}
                    >
                      {el.icon}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 text-xs font-bold text-slate-600 uppercase tracking-wider flex-wrap">
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/50"></div>
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-3 h-3 text-emerald-400" />
            Cleared
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-700" />
            Locked
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-cyan-500/50 rounded-full" />
            Path
          </span>
        </div>

        {/* Element legend */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {Object.entries(ELEMENTS).filter(([k]) => k !== 'variables').map(([, el]) => (
            <span
              key={el.name}
              className="text-sm px-1.5 py-0.5 rounded-md font-bold"
              style={{ color: el.color, backgroundColor: el.bg }}
              title={el.name}
            >
              {el.icon}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
