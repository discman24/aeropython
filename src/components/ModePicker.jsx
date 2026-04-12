import React from 'react';
import { Swords, BookOpen, Zap, Trophy, Map, Brain, LogIn } from 'lucide-react';

export default function ModePicker({ onSelectMode, stats, user, onLoginClick }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative isolate flex flex-col">
      {/* BG */}
      <div className="fixed inset-0 pointer-events-none opacity-20 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600 rounded-full blur-[100px] md:blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600 rounded-full blur-[100px] md:blur-[150px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16 relative z-10 flex-1 flex flex-col justify-center w-full">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
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
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">
            Antigravity Academy
          </p>
          <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Master Python your way. Study the curriculum or battle your way through the Coding Realm.
          </p>
        </div>

        {/* Login / User bar */}
        <div className="flex justify-center mb-8">
          {user ? (
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] font-black text-cyan-400">
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

        {/* Stats bar */}
        {stats && (
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 tabular-nums">{stats.totalXP}</span>
              <span className="text-slate-600">XP</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black">
              <Trophy className="w-3 h-3 text-cyan-400" />
              <span className="text-cyan-400 tabular-nums">{stats.modulesCompleted}/12</span>
              <span className="text-slate-600">missions</span>
            </div>
          </div>
        )}

        {/* Mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* RPG Mode */}
          <button
            onClick={() => onSelectMode('rpg')}
            className="group relative bg-slate-900 border-2 border-purple-500/30 rounded-3xl p-6 md:p-8 text-left transition-all duration-300 hover:border-purple-500 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[40px] -mr-10 -mt-10 group-hover:bg-purple-500/10 transition-colors" />
            <div className="relative z-10">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Swords className="w-7 h-7 md:w-8 md:h-8 text-purple-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-black mb-2 text-white">RPG Mode</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Battle monsters, solve quests, level up your hero. Learn Python through adventure.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-black text-purple-400 uppercase tracking-wider">
                  4 Regions
                </span>
                <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-black text-purple-400 uppercase tracking-wider">
                  20 Quests
                </span>
                <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-black text-purple-400 uppercase tracking-wider">
                  Boss Battles
                </span>
              </div>
            </div>
          </button>

          {/* Academy Mode */}
          <button
            onClick={() => onSelectMode('academy')}
            className="group relative bg-slate-900 border-2 border-cyan-500/30 rounded-3xl p-6 md:p-8 text-left transition-all duration-300 hover:border-cyan-500 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[40px] -mr-10 -mt-10 group-hover:bg-cyan-500/10 transition-colors" />
            <div className="relative z-10">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-cyan-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-black mb-2 text-white">Academy Mode</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Structured curriculum with code labs, quizzes, AI tutor, and daily challenges.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[9px] font-black text-cyan-400 uppercase tracking-wider">
                  12 Missions
                </span>
                <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[9px] font-black text-cyan-400 uppercase tracking-wider">
                  Code Lab
                </span>
                <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[9px] font-black text-cyan-400 uppercase tracking-wider">
                  AI Tutor
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">
            AeroPython Protocol v2.1 — Choose your path
          </p>
        </div>
      </div>
    </div>
  );
}
