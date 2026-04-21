import React, { useState, useEffect } from 'react';
import {
  Rocket, BookOpen, Terminal, Award, Cpu, Zap, ChevronRight,
  MessageSquare, Sparkles, Volume2, X, ShieldCheck, Code2,
  Brain, Flame, AlertTriangle, Trophy, BarChart3, ExternalLink,
  ChevronDown, GraduationCap, Lightbulb, Target, Swords, Map,
  Home, LogOut
} from 'lucide-react';

// Data
import roadmap from './data/roadmap';
import quizzes from './data/quizzes';
import dailyChallenges from './data/dailyChallenges';
import commonMistakes from './data/commonMistakes';

// Components
import QuizPanel from './components/QuizPanel';
import CodePlayground from './components/CodePlayground';
import DailyChallenge from './components/DailyChallenge';
import MistakesPanel from './components/MistakesPanel';
import RPGGame from './components/rpg/RPGGame';
import ModePicker from './components/ModePicker';
import AuthModal, { getStoredUser, clearStoredUser } from './components/AuthModal';

// Hooks & Utils
import { useProgress } from './hooks/useProgress';
import { getApiKey, askGemini, generateBadge as generateBadgeApi, speakText } from './utils/gemini';

const apiKey = getApiKey();

// --- Tab config for mission content ---
const TABS = [
  { id: 'mission', label: 'Mission', icon: Target },
  { id: 'code', label: 'Code Lab', icon: Code2 },
  { id: 'quiz', label: 'Quiz', icon: Brain },
  { id: 'mistakes', label: 'Gotchas', icon: AlertTriangle },
];

const App = () => {
  // 'picker' = landing page, 'academy' = curriculum, 'rpg' = game
  const [gameMode, setGameMode] = useState('picker');
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeTab, setActiveTab] = useState('mission');
  const [showTutor, setShowTutor] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorResponse, setTutorResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [badgeUrl, setBadgeUrl] = useState(null);
  const [isGeneratingBadge, setIsGeneratingBadge] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());
  const [showAuth, setShowAuth] = useState(false);

  // ALL hooks must be called before any conditional return (React Rules of Hooks)
  const { progress, stats, completeModule, recordQuizScore, completeDailyChallenge, addBadge, addXP, resetProgress } = useProgress();

  const currentModule = roadmap[activeWeek - 1];

  // Reset transient state on module change
  useEffect(() => {
    setTutorResponse('');
    setBadgeUrl(null);
    setShowTutor(false);
    setActiveTab('mission');
    if (window.innerWidth < 1024) {
      setShowMobileNav(false);
      const el = document.getElementById('mission-content');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeWeek]);

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    setGameMode('picker');
  };

  // ── Landing page (mode picker) ──
  if (gameMode === 'picker') {
    return (
      <>
        <ModePicker
          onSelectMode={setGameMode}
          stats={stats}
          user={user}
          onLoginClick={() => setShowAuth(true)}
        />
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onLogin={(u) => { setUser(u); setShowAuth(false); }}
          />
        )}
      </>
    );
  }

  // ── RPG mode ──
  if (gameMode === 'rpg') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative isolate">
        <div className="fixed inset-0 pointer-events-none opacity-20 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600 rounded-full blur-[100px] md:blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600 rounded-full blur-[100px] md:blur-[150px] animate-pulse delay-1000"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
          <RPGGame onExit={() => setGameMode('picker')} />
        </div>
      </div>
    );
  }

  // --- AI Tutor ---
  const askAITutor = async () => {
    if (!tutorQuery) return;
    setIsLoading(true);
    setTutorResponse('');
    const response = await askGemini(tutorQuery, `Module ${activeWeek}: ${currentModule.topic}`);
    setTutorResponse(response);
    setIsLoading(false);
  };

  // --- Badge Generation ---
  const handleBadge = async () => {
    if (!apiKey) return;
    setIsGeneratingBadge(true);
    const url = await generateBadgeApi(currentModule.topic);
    if (url) {
      setBadgeUrl(url);
      addBadge(activeWeek, currentModule.topic, url);
    }
    setIsGeneratingBadge(false);
  };

  // --- Quiz Completion ---
  const handleQuizComplete = (score, total) => {
    recordQuizScore(activeWeek, score, total);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative isolate">
      {/* BG DECOR */}
      <div className="fixed inset-0 pointer-events-none opacity-20 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600 rounded-full blur-[100px] md:blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600 rounded-full blur-[100px] md:blur-[150px] animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10 flex flex-col min-h-screen">
        {/* ============ HEADER ============ */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6 relative z-50">
          <div className="flex items-center gap-4">
            <div
              className="flex-shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/20 ring-1 ring-white/10 bg-slate-900 flex items-center justify-center aspect-square"
              style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px' }}
            >
              <img
                src="/logo.png" alt="AeroPython"
                className="w-full h-full object-contain block"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-slate-800"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>';
                }}
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black italic tracking-tighter leading-none uppercase">
                Aero<span className="text-cyan-400">Python</span>
              </h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Antigravity Academy</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* XP */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-sm font-black">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 tabular-nums">{stats.totalXP}</span>
              <span className="text-slate-600">XP</span>
            </div>
            {/* Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-sm font-black">
              <Flame className={`w-3 h-3 ${stats.currentStreak > 0 ? 'text-orange-400' : 'text-slate-600'}`} />
              <span className={stats.currentStreak > 0 ? 'text-orange-400' : 'text-slate-600'}>{stats.currentStreak}</span>
            </div>
            {/* Modules done */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-sm font-black">
              <Trophy className="w-3 h-3 text-cyan-400" />
              <span className="text-cyan-400 tabular-nums">{stats.modulesCompleted}/40</span>
            </div>
            {/* API status */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border rounded-full text-sm font-black transition-all ${apiKey ? 'border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)]' : 'border-red-500/50 text-red-400'}`}>
              <ShieldCheck className="w-3 h-3" />
              <span className="hidden sm:inline">{apiKey ? 'API ONLINE' : 'API OFFLINE'}</span>
            </div>
            {/* Home button */}
            <button
              onClick={() => setGameMode('picker')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm font-black text-slate-300 transition-all hover:scale-105 active:scale-95 hover:border-slate-600"
            >
              <Home className="w-3 h-3" />
              <span className="hidden sm:inline">Home</span>
            </button>
            {/* User / Auth */}
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-sm font-black text-slate-400 transition-all hover:scale-105 active:scale-95 hover:text-red-400 hover:border-red-500/30"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm font-black text-cyan-400 transition-all hover:scale-105 active:scale-95"
              >
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
            {/* Daily challenge shortcut */}
            <button
              onClick={() => setShowDaily(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black transition-all hover:scale-105 active:scale-95 ${
                stats.hasDoneToday
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-orange-500/10 border border-orange-500/30 text-orange-400 animate-pulse'
              }`}
            >
              <Flame className="w-3 h-3" />
              {stats.hasDoneToday ? 'Done' : 'Daily'}
            </button>
          </div>
        </header>

        {/* ============ MAIN GRID ============ */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-grow relative z-20">

          {/* --- NAV SIDEBAR --- */}
          <nav className="lg:col-span-3 space-y-3 relative z-30">
            {/* Mobile toggle */}
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="lg:hidden w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-2xl"
            >
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                Mission {activeWeek}: {currentModule.title}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showMobileNav ? 'rotate-180' : ''}`} />
            </button>

            <div className={`space-y-1.5 ${showMobileNav ? 'block' : 'hidden'} lg:block`}>
              <div className="flex items-center justify-between px-2 mb-2">
                <h2 className="text-sm font-black text-slate-600 uppercase tracking-[0.2em]">Mission Map</h2>
                <span className="text-sm font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full tabular-nums">
                  {stats.percentComplete}%
                </span>
              </div>
              <div className="space-y-1.5 max-h-[40vh] lg:max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                {roadmap.map((step) => {
                  const isCompleted = progress.completedModules.includes(step.id);
                  const quizScore = progress.quizScores[step.id];

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveWeek(step.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center gap-3 cursor-pointer hover:bg-slate-900/80 active:scale-[0.97] touch-manipulation relative ${
                        activeWeek === step.id
                          ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20'
                          : isCompleted
                            ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80 hover:opacity-100'
                            : 'bg-slate-900/20 border-slate-800/50 hover:border-slate-700 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-sm ${
                        activeWeek === step.id
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isCompleted ? '✓' : step.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xs leading-tight truncate">{step.title}</h3>
                        <p className="text-xs text-slate-600 uppercase font-black tracking-wider truncate">{step.topic}</p>
                      </div>
                      {quizScore && (
                        <span className="text-xs font-bold text-slate-600 tabular-nums">{quizScore.best}/{quizScore.total}</span>
                      )}
                      {activeWeek === step.id && <Zap className="w-3 h-3 text-cyan-400 animate-pulse flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Reset button */}
              <button
                onClick={resetProgress}
                className="w-full mt-3 py-2 text-sm font-bold text-slate-700 hover:text-red-400 uppercase tracking-widest transition-colors"
              >
                Reset All Progress
              </button>
            </div>
          </nav>

          {/* --- MISSION CONTENT --- */}
          <section className="lg:col-span-9 relative z-10 space-y-5" id="mission-content">

            {/* Tab bar */}
            <div className="flex gap-1 bg-slate-900/50 p-1 rounded-2xl border border-slate-800/50">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === tab.id
                        ? 'bg-slate-800 text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content card */}
            <div
              key={`${activeWeek}-${activeTab}`}
              className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 md:p-8 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-[60px] -mr-24 -mt-24"></div>

              {/* ===== MISSION TAB ===== */}
              {activeTab === 'mission' && (
                <div className="relative z-10 space-y-6">
                  {/* Module header */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-4 h-[1px] bg-cyan-500"></span>
                      <span className="text-sm font-black text-cyan-500 uppercase tracking-[0.4em]">Mission {activeWeek}</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter leading-tight">{currentModule.title}</h2>
                    <p className="text-slate-400 text-xs mt-1 uppercase font-bold tracking-widest">{currentModule.topic}</p>
                  </div>

                  {/* Objectives */}
                  <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <h4 className="text-sm font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-500" /> Learning Objectives
                    </h4>
                    <ul className="space-y-2">
                      {currentModule.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <ChevronRight className="w-3 h-3 text-cyan-500 mt-1 flex-shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenge */}
                  <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <h4 className="text-sm font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
                      <Terminal className="w-3 h-3 text-cyan-500" /> Mission Objective
                    </h4>
                    <p className="text-base md:text-lg font-medium text-slate-200 leading-relaxed">
                      {currentModule.challenge}
                    </p>
                  </div>

                  {/* Key Concepts */}
                  <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <h4 className="text-sm font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Key Concepts
                    </h4>
                    <div className="grid gap-2">
                      {currentModule.keyConcepts.map((kc, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <code className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 rounded text-xs font-mono flex-shrink-0 mt-0.5">{kc.term}</code>
                          <span className="text-slate-400 text-xs leading-relaxed">{kc.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowTutor(true)}
                      className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-wider"
                    >
                      <MessageSquare className="w-4 h-4 text-cyan-400" /> AI Mentor
                    </button>
                    <button
                      onClick={handleBadge}
                      className="flex-1 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-600/20 hover:scale-[1.02] active:scale-95 uppercase tracking-wider"
                    >
                      <Award className="w-4 h-4" /> Claim Badge
                    </button>
                    {currentModule.resources?.[0] && (
                      <a
                        href={currentModule.resources[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-wider"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-400" /> Docs
                      </a>
                    )}
                  </div>

                  {/* Badge display */}
                  {(isGeneratingBadge || badgeUrl) && (
                    <div className="w-full h-48 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-4 overflow-hidden">
                      {isGeneratingBadge ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-black text-slate-600 uppercase tracking-widest animate-pulse">Minting Reward...</span>
                        </div>
                      ) : badgeUrl ? (
                        <img src={badgeUrl} alt="Badge" className="h-full object-contain" />
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* ===== CODE LAB TAB ===== */}
              {activeTab === 'code' && (
                <div className="relative z-10 space-y-4">
                  <div>
                    <h3 className="text-lg font-black mb-1">Code Lab — {currentModule.topic}</h3>
                    <p className="text-xs text-slate-500">{currentModule.details}</p>
                  </div>
                  <CodePlayground
                    starterCode={currentModule.starterCode}
                    moduleId={activeWeek}
                  />
                </div>
              )}

              {/* ===== QUIZ TAB ===== */}
              {activeTab === 'quiz' && (
                <div className="relative z-10">
                  <div className="mb-5">
                    <h3 className="text-lg font-black mb-1">Knowledge Check — {currentModule.topic}</h3>
                    {progress.quizScores[activeWeek] && (
                      <p className="text-xs text-slate-500">
                        Best: {progress.quizScores[activeWeek].best}/{progress.quizScores[activeWeek].total} •
                        Attempts: {progress.quizScores[activeWeek].attempts}
                      </p>
                    )}
                  </div>
                  <QuizPanel
                    key={activeWeek}
                    moduleId={activeWeek}
                    quizData={quizzes[activeWeek] || []}
                    onComplete={handleQuizComplete}
                  />
                </div>
              )}

              {/* ===== GOTCHAS TAB ===== */}
              {activeTab === 'mistakes' && (
                <div className="relative z-10">
                  <div className="mb-5">
                    <h3 className="text-lg font-black mb-1">Common Gotchas — {currentModule.topic}</h3>
                    <p className="text-xs text-slate-500">Mistakes every beginner makes. Learn to spot them early.</p>
                  </div>
                  <MistakesPanel mistakes={commonMistakes[activeWeek] || []} />
                </div>
              )}
            </div>

            {/* ===== AI TUTOR PANEL ===== */}
            {showTutor && (
              <div className="bg-slate-900 border border-cyan-500/20 rounded-[2rem] p-5 shadow-2xl animate-in slide-in-from-top-4 duration-300 relative z-50">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <span className="text-sm font-black text-cyan-500 tracking-[0.3em] uppercase">AI Mentor — {currentModule.topic}</span>
                  </div>
                  <button onClick={() => setShowTutor(false)} className="cursor-pointer p-2 hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-4 h-4 text-slate-600 hover:text-white" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tutorQuery}
                    onChange={(e) => setTutorQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && askAITutor()}
                    placeholder={`Ask about ${currentModule.topic}...`}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 outline-none text-white transition-all placeholder:text-slate-700"
                  />
                  <button
                    onClick={askAITutor}
                    className="px-5 bg-cyan-600 text-slate-950 rounded-xl font-black hover:bg-cyan-500 transition-all active:scale-95 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mx-auto"></div> : <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
                {tutorResponse && (
                  <div className="mt-5 p-5 bg-slate-950/80 rounded-xl border border-slate-800/50 group relative animate-in fade-in zoom-in-95 duration-500">
                    <div className="absolute -top-2.5 left-5 px-2 bg-slate-950 text-xs font-black text-cyan-500 uppercase tracking-widest border border-slate-800 rounded">AERO says</div>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{tutorResponse}</p>
                    <button
                      onClick={() => speakText(tutorResponse)}
                      className="absolute bottom-3 right-3 p-2 rounded-full bg-slate-800 text-cyan-400 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-slate-700"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>

        {/* ===== DAILY CHALLENGE MODAL ===== */}
        {showDaily && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowDaily(false)}>
            <div
              className="bg-slate-900 border border-slate-700 rounded-[2rem] p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-black flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" /> Daily Challenge
                </h3>
                <button onClick={() => setShowDaily(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <DailyChallenge
                challenges={dailyChallenges}
                streak={stats.currentStreak}
                hasDoneToday={stats.hasDoneToday}
                onComplete={completeDailyChallenge}
              />
            </div>
          </div>
        )}

        {/* ============ FOOTER ============ */}
        <footer className="mt-auto py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-black text-slate-700 uppercase tracking-[0.3em]">
          <div className="flex items-center gap-4">
            <span>AeroPython Protocol v2.0</span>
            <span className="h-3 w-px bg-slate-900"></span>
            <span>Mastery Engine Active</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              Core Stable
            </span>
            <span className="text-cyan-800">Antigravity Ready</span>
          </div>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .touch-manipulation { touch-action: manipulation; }
        @keyframes animate-in { from { opacity: 0; transform: translateY(-4px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-in { animation: animate-in 0.3s ease-out; }
      `}</style>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={(u) => { setUser(u); setShowAuth(false); }}
        />
      )}
    </div>
  );
};

export default App;
