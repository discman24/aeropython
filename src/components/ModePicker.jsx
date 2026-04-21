import React, { useEffect, useState } from 'react';
import { Swords, BookOpen, Zap, Trophy, Map, Brain, LogIn, Crown, Sparkles, Star, Package, Award, ChevronRight } from 'lucide-react';

// Minimal read of RPG localStorage to show stats preview
function readRPGStats() {
  try {
    const saved = localStorage.getItem('aeropython-rpg');
    if (!saved) return null;
    const data = JSON.parse(saved);
    if (!data.heroName) return null;
    const ar = (data.completedRegions?.length || 0) * 5 + Math.floor((data.completedQuests?.length || 0) / 5);
    return {
      heroName: data.heroName,
      ar,
      level: Math.floor((data.totalXP || 0) / 100) + 1,
      regions: data.completedRegions?.length || 0,
      quests: data.completedQuests?.length || 0,
      companions: data.equippedCompanion ? 1 : 0,
      achievements: data.achievements?.length || 0,
      inventory: data.inventory?.length || 0,
    };
  } catch {
    return null;
  }
}

const ELEMENT_COLORS = ['#22d3ee', '#a78bfa', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#f97316', '#ec4899'];

function FloatingParticle({ index }) {
  const color = ELEMENT_COLORS[index % ELEMENT_COLORS.length];
  const symbols = ['✦', '★', '◆', '✸', '❋', '✺', '❆', '✿'];
  return (
    <div
      className="absolute pointer-events-none text-sm animate-bounce select-none"
      style={{
        color,
        opacity: 0.3,
        top: `${10 + (index * 13.7) % 80}%`,
        left: `${5 + (index * 11.3) % 90}%`,
        animationDelay: `${index * 0.3}s`,
        animationDuration: `${2 + (index % 3)}s`,
        textShadow: `0 0 6px ${color}`,
      }}
    >
      {symbols[index % symbols.length]}
    </div>
  );
}

export default function ModePicker({ onSelectMode, stats, user, onLoginClick }) {
  const [rpgStats, setRpgStats] = useState(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setRpgStats(readRPGStats());
    // Pulse the CTA button
    const t = setTimeout(() => setPulse(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative isolate flex flex-col">
      {/* Animated bg blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-700/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-cyan-700/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-1/2 w-[250px] h-[250px] bg-pink-700/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s' }} />
      </div>

      {/* Floating element particles */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {Array.from({ length: 16 }, (_, i) => <FloatingParticle key={i} index={i} />)}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-14 relative z-10 flex-1 flex flex-col justify-center w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/logo.png" alt=""
              className="w-12 h-12 rounded-xl object-contain bg-slate-900 border border-white/10"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">
              Aero<span className="text-cyan-400">Python</span>
            </h1>
          </div>
          <p className="text-sm font-black text-slate-600 uppercase tracking-[0.3em] mb-4">
            Antigravity Academy
          </p>
          <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Master Python your way — battle monsters in the Coding Realm or study the structured curriculum.
          </p>
        </div>

        {/* Login / User bar */}
        <div className="flex justify-center mb-8">
          {user ? (
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm font-black text-cyan-400">
                {user.email?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="text-xs font-bold text-slate-300">{user.email}</span>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-700 rounded-full text-xs font-bold text-slate-300 hover:border-cyan-500/50 hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In to Save Progress
            </button>
          )}
        </div>

        {/* Academy stats bar */}
        {stats && (
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-sm font-black">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 tabular-nums">{stats.totalXP}</span>
              <span className="text-slate-600">XP</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-sm font-black">
              <Trophy className="w-3 h-3 text-cyan-400" />
              <span className="text-cyan-400 tabular-nums">{stats.modulesCompleted}/12</span>
              <span className="text-slate-600">missions</span>
            </div>
          </div>
        )}

        {/* Mode cards — RPG primary, Academy secondary */}
        <div className="space-y-4">
          {/* ── RPG MODE (featured) ── */}
          <div className="relative group">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-pink-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            <button
              onClick={() => onSelectMode('rpg')}
              className="w-full relative bg-slate-900 border-2 border-purple-500/40 rounded-3xl p-6 md:p-8 text-left transition-all duration-300 hover:border-purple-400/70 hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
              style={{ boxShadow: '0 8px 40px rgba(168,85,247,0.12)' }}
            >
              {/* Inner bg gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none rounded-3xl" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/8 blur-[50px] -mr-16 -mt-16 group-hover:bg-purple-500/15 transition-colors" />

              {/* FEATURED badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-600/80 to-pink-600/80 rounded-full">
                <Star className="w-2.5 h-2.5 text-white" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Featured</span>
              </div>

              <div className="relative z-10">
                {/* Icon + title */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-3xl md:text-4xl">⚔️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">RPG Mode</h2>
                    <p className="text-sm font-black text-purple-400 uppercase tracking-widest">Coding Realm</p>
                  </div>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  Battle monsters, conquer 8 regions, level up your hero. Every Python concept is a weapon —
                  unlock companions, earn achievements, and defeat the final boss!
                </p>

                {/* Returning hero stats */}
                {rpgStats ? (
                  <div className="mb-5 p-3 bg-slate-950/60 rounded-xl border border-purple-500/20">
                    <div className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Your Hero — {rpgStats.heroName}</div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { icon: <Crown className="w-3 h-3 text-purple-400" />, val: `AR ${rpgStats.ar}`, label: 'Rank' },
                        { icon: <Zap className="w-3 h-3 text-amber-400" />, val: `Lv.${rpgStats.level}`, label: 'Level' },
                        { icon: <Map className="w-3 h-3 text-cyan-400" />, val: `${rpgStats.regions}/8`, label: 'Regions' },
                        { icon: <Award className="w-3 h-3 text-amber-400" />, val: rpgStats.achievements, label: 'Awards' },
                      ].map(s => (
                        <div key={s.label} className="text-center">
                          <div className="flex justify-center mb-0.5">{s.icon}</div>
                          <div className="text-xs font-black text-white">{s.val}</div>
                          <div className="text-xs font-bold text-slate-600 uppercase">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {['8 Regions', '40 Quests', 'Boss Battles', '5 Companions', 'Achievements', 'Daily Commissions'].map(f => (
                      <span key={f} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm font-black text-purple-400 uppercase tracking-wider">
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA button */}
                <div
                  className={`w-full py-4 rounded-2xl font-black text-base text-white text-center flex items-center justify-center gap-2 transition-all ${
                    pulse ? 'animate-pulse' : ''
                  }`}
                  style={{
                    background: 'linear-gradient(to right, #7c3aed, #db2777)',
                    boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
                    animationDuration: '2s',
                    animationIterationCount: 3,
                  }}
                >
                  {rpgStats ? '⚔️ Continue Adventure' : '⚔️ Start Adventure'}
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>

          {/* ── ACADEMY MODE (secondary) ── */}
          <button
            onClick={() => onSelectMode('academy')}
            className="w-full group relative bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 text-left transition-all duration-300 hover:border-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/4 blur-[40px] -mr-10 -mt-10 group-hover:bg-cyan-500/8 transition-colors" />

            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black text-white">Academy Mode</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Structured curriculum — code labs, quizzes, AI tutor, daily challenges.
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {['12 Missions', 'Code Lab', 'AI Tutor', 'Quizzes'].map(f => (
                    <span key={f} className="px-2 py-0.5 bg-cyan-500/8 border border-cyan-500/15 rounded-full text-xs font-black text-cyan-500/70 uppercase tracking-wider">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-xs font-black text-slate-700 uppercase tracking-[0.3em]">
            AeroPython Protocol v2.2 — Choose your path
          </p>
        </div>
      </div>
    </div>
  );
}
