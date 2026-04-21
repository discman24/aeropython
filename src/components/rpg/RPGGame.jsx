import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Zap, Heart, Swords, Shield, Star, Map, User, ArrowLeft,
  Flame, Trophy, Crown, Package, BookOpen, Award, Sparkles,
  CheckCircle2, Lock, ChevronRight, Bell
} from 'lucide-react';
import rpgQuests, { ELEMENTS, COMPANIONS, PORTRAITS, REGION_ELEMENTS } from '../../data/rpgQuests';
import WorldMap from './WorldMap';
import BattleScreen from './BattleScreen';
import DialogueBox from './DialogueBox';

const STORAGE_KEY = 'aeropython-rpg';
const XP_PER_LEVEL = 100;
const AR_PER_REGION = 5; // Adventure Rank gained per completed region

function calculateLevel(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function calculateAR(completedRegions, completedQuests) {
  // AR = regions * 5 + every 5 quests = 1 AR
  return completedRegions.length * AR_PER_REGION + Math.floor(completedQuests.length / 5);
}

const ACHIEVEMENTS = [
  { id: 'first_blood', icon: '⚔️', name: 'First Strike', desc: 'Complete your first quest', condition: (s) => s.completedQuests.length >= 1 },
  { id: 'boss_slayer', icon: '👑', name: 'Boss Slayer', desc: 'Defeat your first boss', condition: (s) => s.bossesDefeated >= 1 },
  { id: 'region_one', icon: '🏘️', name: 'Village Hero', desc: 'Clear Region 1', condition: (s) => s.completedRegions.includes(1) },
  { id: 'ten_quests', icon: '🌟', name: 'Quest Veteran', desc: 'Complete 10 quests', condition: (s) => s.completedQuests.length >= 10 },
  { id: 'no_hints', icon: '🧠', name: 'Pure Mind', desc: 'Win a battle without using hints', condition: (s) => s.noHintWins >= 1 },
  { id: 'speedrun', icon: '⚡', name: 'Lightning Coder', desc: 'Solve a quest on the first try', condition: (s) => s.firstTryWins >= 1 },
  { id: 'half_map', icon: '🗺️', name: 'Explorer', desc: 'Clear 4 regions', condition: (s) => s.completedRegions.length >= 4 },
  { id: 'full_map', icon: '🏆', name: 'Python Master', desc: 'Clear all 8 regions', condition: (s) => s.completedRegions.length >= 8 },
];

const DAILY_CHALLENGES = [
  { id: 'dc1', title: 'Print Challenge', desc: 'Print your name 3 times in a loop', xp: 15 },
  { id: 'dc2', title: 'Math Mastery', desc: 'Calculate 7 * 8 + 12 and print it', xp: 15 },
  { id: 'dc3', title: 'String Ninja', desc: 'Reverse the word "python" using slicing', xp: 20 },
];

const defaultRpgState = {
  heroName: '',
  totalXP: 0,
  completedQuests: [],
  completedRegions: [],
  bossesDefeated: 0,
  noHintWins: 0,
  firstTryWins: 0,
  hasSeenIntro: {},
  achievements: [],
  inventory: [],
  equippedCompanion: null,
  dailyCommissions: {},
  createdAt: null,
};

export default function RPGGame({ onExit }) {
  const [rpgState, setRpgState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultRpgState, ...JSON.parse(saved) };
    } catch (e) {}
    return { ...defaultRpgState };
  });

  const [gameScreen, setGameScreen] = useState(rpgState.heroName ? 'map' : 'title');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [currentQuest, setCurrentQuest] = useState(null);
  const [showDialogue, setShowDialogue] = useState(null);
  const [showPanel, setShowPanel] = useState('stats'); // stats | inventory | companions | achievements | daily
  const [newAchievements, setNewAchievements] = useState([]);
  const [xpPopup, setXpPopup] = useState(null);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rpgState));
    } catch (e) {}
  }, [rpgState]);

  const playerLevel = calculateLevel(rpgState.totalXP);
  const playerAR = calculateAR(rpgState.completedRegions, rpgState.completedQuests);

  const regions = Object.values(rpgQuests).map(r => ({ ...r }));

  // Check and award achievements
  const checkAchievements = useCallback((newState) => {
    const earned = [];
    for (const ach of ACHIEVEMENTS) {
      if (!newState.achievements.includes(ach.id) && ach.condition(newState)) {
        earned.push(ach);
      }
    }
    return earned;
  }, []);

  // ─── Title Screen ───
  const TitleScreen = () => {
    const [name, setName] = useState('');
    const existingHero = rpgState.heroName;

    const startGame = () => {
      if (!name.trim()) return;
      setRpgState(prev => ({
        ...defaultRpgState,
        heroName: name.trim(),
        createdAt: new Date().toISOString(),
      }));
      setGameScreen('map');
    };

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 py-10">
        {/* Animated logo */}
        <div className="relative">
          <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full scale-150" />
          <div className="relative space-y-3">
            <div className="text-7xl mb-2 animate-bounce" style={{ animationDuration: '3s' }}>🐍</div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
              Aero<span className="text-cyan-400">Python</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-px bg-slate-700" />
              <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">
                Coding Realm RPG
              </p>
              <div className="w-8 h-px bg-slate-700" />
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm">
          {['8 Regions', '40 Quests', 'Boss Battles', '5 Companions', 'Achievements'].map(f => (
            <span key={f} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-sm font-black text-slate-500 uppercase tracking-wider">
              {f}
            </span>
          ))}
        </div>

        {/* Name input */}
        <div className="space-y-4 w-full max-w-xs">
          <div>
            <label className="text-sm font-black text-slate-600 uppercase tracking-widest block mb-2">
              Name Your Hero
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startGame()}
              placeholder="Enter hero name..."
              maxLength={20}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-bold text-white placeholder:text-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all"
              autoFocus
            />
          </div>
          <button
            onClick={startGame}
            disabled={!name.trim()}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 uppercase tracking-wider shadow-lg shadow-cyan-600/20"
          >
            ⚔️ Start Adventure
          </button>
        </div>

        {existingHero && (
          <button
            onClick={() => setGameScreen('map')}
            className="text-sm font-bold text-cyan-500 hover:text-cyan-400 uppercase tracking-widest"
          >
            Continue as {existingHero} (AR {playerAR}) →
          </button>
        )}
      </div>
    );
  };

  // ─── Character Panel ───
  const CharacterPanel = () => {
    const xpInLevel = rpgState.totalXP % XP_PER_LEVEL;
    const xpPercent = (xpInLevel / XP_PER_LEVEL) * 100;
    const arPercent = Math.min(100, (playerAR % 10) * 10);
    const questsDone = rpgState.completedQuests.length;
    const regionsDone = rpgState.completedRegions.length;
    const equippedComp = COMPANIONS.find(c => c.id === rpgState.equippedCompanion);
    const unlockedCompanions = COMPANIONS.filter(c => playerAR >= c.unlockAR);
    const earnedAchievements = ACHIEVEMENTS.filter(a => rpgState.achievements.includes(a.id));

    // Elemental affinities from completed regions
    const affinities = rpgState.completedRegions.map(rid => {
      const key = REGION_ELEMENTS[rid];
      return ELEMENTS[key];
    }).filter(Boolean);

    // Today's daily commissions
    const today = new Date().toDateString();
    const todayDone = DAILY_CHALLENGES.filter(dc => rpgState.dailyCommissions[`${today}-${dc.id}`]);

    const tabs = [
      { id: 'stats', icon: <User className="w-3 h-3" />, label: 'Stats' },
      { id: 'companions', icon: <Sparkles className="w-3 h-3" />, label: 'Party' },
      { id: 'achievements', icon: <Award className="w-3 h-3" />, label: 'Awards' },
      { id: 'daily', icon: <Bell className="w-3 h-3" />, label: 'Daily' },
      { id: 'inventory', icon: <Package className="w-3 h-3" />, label: 'Items' },
    ];

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Hero header */}
        <div className="p-4 bg-gradient-to-b from-slate-800/60 to-transparent border-b border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl">
                {equippedComp ? equippedComp.icon : '⚔️'}
              </div>
              {equippedComp && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-sm">
                  {equippedComp.icon}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-sm text-white truncate">{rpgState.heroName}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-cyan-500 uppercase tracking-wider">Lv.{playerLevel}</span>
                <span className="text-sm text-slate-700">•</span>
                <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">AR {playerAR}</span>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Character XP</span>
              <span className="text-xs font-bold text-amber-400 tabular-nums">{xpInLevel}/{XP_PER_LEVEL}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>

          {/* AR bar */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Adventure Rank</span>
              <span className="text-xs font-bold text-purple-400 tabular-nums">AR {playerAR}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-700" style={{ width: `${arPercent}%` }} />
            </div>
          </div>

          {/* Elemental affinities */}
          {affinities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {affinities.map((el, i) => (
                <span
                  key={i}
                  className="text-sm px-1.5 py-0.5 rounded-md font-bold"
                  style={{ backgroundColor: el.bg, color: el.color, border: `1px solid ${el.border}` }}
                  title={el.name}
                >
                  {el.icon}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Panel tabs */}
        <div className="flex border-b border-slate-800">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setShowPanel(t.id)}
              className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-colors text-xs font-black uppercase tracking-wider ${
                showPanel === t.id ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {t.icon}
              <span className="hidden sm:block">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="p-3 space-y-2">
          {/* ── Stats ── */}
          {showPanel === 'stats' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Quests', value: questsDone, icon: <Swords className="w-3 h-3 text-red-400" /> },
                  { label: 'Regions', value: `${regionsDone}/8`, icon: <Map className="w-3 h-3 text-emerald-400" /> },
                  { label: 'Total XP', value: rpgState.totalXP, icon: <Zap className="w-3 h-3 text-amber-400" /> },
                  { label: 'Bosses', value: rpgState.bossesDefeated || 0, icon: <Crown className="w-3 h-3 text-purple-400" /> },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-950 rounded-lg p-2.5 text-center">
                    <div className="flex justify-center mb-1">{stat.icon}</div>
                    <div className="text-xs font-black text-white">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
              {equippedComp && (
                <div className="bg-slate-950 rounded-lg p-2.5 flex items-center gap-2">
                  <span className="text-lg">{equippedComp.icon}</span>
                  <div>
                    <div className="text-sm font-black text-white">{equippedComp.name}</div>
                    <div className="text-xs text-slate-500">{equippedComp.bonus}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Companions ── */}
          {showPanel === 'companions' && (
            <div className="space-y-1.5">
              {COMPANIONS.map(comp => {
                const unlocked = playerAR >= comp.unlockAR;
                const equipped = rpgState.equippedCompanion === comp.id;
                const el = ELEMENTS[comp.element];
                return (
                  <button
                    key={comp.id}
                    disabled={!unlocked}
                    onClick={() => {
                      if (!unlocked) return;
                      setRpgState(prev => ({
                        ...prev,
                        equippedCompanion: equipped ? null : comp.id,
                      }));
                    }}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left ${
                      equipped
                        ? 'border-cyan-500/50 bg-cyan-500/5'
                        : unlocked
                          ? 'border-slate-800 bg-slate-950 hover:border-slate-700'
                          : 'border-slate-800/50 bg-slate-950/50 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-xl">{comp.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black text-white">{comp.name}</div>
                      <div className="text-xs text-slate-500 truncate">{unlocked ? comp.bonus : `AR ${comp.unlockAR} to unlock`}</div>
                    </div>
                    {equipped && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                    {!unlocked && <Lock className="w-3 h-3 text-slate-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Achievements ── */}
          {showPanel === 'achievements' && (
            <div className="space-y-1.5">
              {ACHIEVEMENTS.map(ach => {
                const earned = rpgState.achievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
                      earned ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800/50 bg-slate-950 opacity-50'
                    }`}
                  >
                    <span className="text-lg">{ach.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-black ${earned ? 'text-amber-400' : 'text-slate-500'}`}>{ach.name}</div>
                      <div className="text-xs text-slate-600 truncate">{ach.desc}</div>
                    </div>
                    {earned && <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Daily Commissions ── */}
          {showPanel === 'daily' && (
            <div className="space-y-1.5">
              <div className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2">
                {todayDone.length}/{DAILY_CHALLENGES.length} completed today
              </div>
              {DAILY_CHALLENGES.map(dc => {
                const doneKey = `${today}-${dc.id}`;
                const done = !!rpgState.dailyCommissions[doneKey];
                return (
                  <div
                    key={dc.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
                      done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-950'
                    }`}
                  >
                    <span className="text-lg">{done ? '✅' : '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black text-white">{dc.title}</div>
                      <div className="text-xs text-slate-500 leading-relaxed">{dc.desc}</div>
                    </div>
                    {!done && (
                      <button
                        onClick={() => {
                          setRpgState(prev => ({
                            ...prev,
                            totalXP: prev.totalXP + dc.xp,
                            dailyCommissions: { ...prev.dailyCommissions, [doneKey]: true },
                            inventory: [...prev.inventory, { id: Date.now(), name: 'XP Scroll', icon: '📜' }],
                          }));
                          setXpPopup(`+${dc.xp} XP`);
                          setTimeout(() => setXpPopup(null), 2000);
                        }}
                        className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-black text-amber-400 hover:bg-amber-500/20 transition-colors"
                      >
                        +{dc.xp}XP
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Inventory ── */}
          {showPanel === 'inventory' && (
            <div className="space-y-1">
              {rpgState.inventory.length === 0 ? (
                <div className="text-center py-4 text-sm text-slate-700 font-bold">
                  No items yet. Complete quests to earn rewards!
                </div>
              ) : (
                <>
                  <div className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2">
                    {rpgState.inventory.length} items
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {rpgState.inventory.slice(0, 20).map((item, i) => (
                      <div key={i} className="aspect-square bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center text-lg" title={item.name}>
                        {item.icon}
                      </div>
                    ))}
                    {rpgState.inventory.length > 20 && (
                      <div className="aspect-square bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center text-sm font-black text-slate-600">
                        +{rpgState.inventory.length - 20}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Region Quest List ───
  const RegionScreen = () => {
    const region = selectedRegion;
    if (!region) return null;

    const elementKey = REGION_ELEMENTS[region.id];
    const element = ELEMENTS[elementKey] || ELEMENTS.variables;

    if (!rpgState.hasSeenIntro[region.id] && !showDialogue) {
      setShowDialogue({ type: 'intro', dialogues: region.intro });
      return null;
    }

    const handleQuestSelect = (quest) => {
      if (rpgState.completedQuests.includes(quest.id)) return;
      setCurrentQuest(quest);
      setGameScreen('battle');
    };

    const questsCompleted = region.quests.filter(q => rpgState.completedQuests.includes(q.id)).length;

    return (
      <div className="space-y-5">
        {showDialogue && (
          <DialogueBox
            dialogues={showDialogue.dialogues}
            onComplete={() => {
              if (showDialogue.type === 'intro') {
                setRpgState(prev => ({
                  ...prev,
                  hasSeenIntro: { ...prev.hasSeenIntro, [region.id]: true },
                }));
              }
              setShowDialogue(null);
            }}
          />
        )}

        {!showDialogue && (
          <>
            {/* Region header */}
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => { setSelectedRegion(null); setGameScreen('map'); }}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black" style={{ color: element.color }}>
                    {region.icon} {region.name}
                  </h2>
                  <span className="text-sm" title={element.name}>{element.icon}</span>
                </div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">{region.description}</p>
              </div>
              {/* Progress ring text */}
              <div className="text-right">
                <div className="text-sm font-black" style={{ color: element.color }}>{questsCompleted}/{region.quests.length}</div>
                <div className="text-xs font-bold text-slate-600 uppercase">Complete</div>
              </div>
            </div>

            {/* Progress bar for region */}
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(questsCompleted / region.quests.length) * 100}%`, backgroundColor: element.color }}
              />
            </div>

            {/* Quest list */}
            <div className="space-y-2">
              {region.quests.map((quest, index) => {
                const isCompleted = rpgState.completedQuests.includes(quest.id);
                const prevCompleted = index === 0 || rpgState.completedQuests.includes(region.quests[index - 1].id);
                const isLocked = !prevCompleted;

                return (
                  <button
                    key={quest.id}
                    onClick={() => !isLocked && !isCompleted && handleQuestSelect(quest)}
                    disabled={isLocked || isCompleted}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4
                      ${isCompleted
                        ? 'bg-emerald-500/5 border-emerald-500/20 opacity-75'
                        : isLocked
                          ? 'bg-slate-900/30 border-slate-800/50 opacity-30 cursor-not-allowed'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-600 cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                      }
                    `}
                    style={!isLocked && !isCompleted ? { boxShadow: `inset 0 0 0 1px ${element.color}22` } : {}}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                      isCompleted ? 'bg-emerald-500/10' : quest.enemy.isBoss ? 'bg-amber-500/10' : 'bg-slate-800'
                    }`}
                    style={quest.enemy.isBoss && !isCompleted ? { border: `1px solid ${element.color}55` } : {}}>
                      {isCompleted ? <Star className="w-5 h-5 text-emerald-400" /> : quest.enemy.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-black text-sm ${isCompleted ? 'text-emerald-400' : quest.enemy.isBoss ? 'text-amber-400' : 'text-white'}`}>
                        {quest.title}
                      </h4>
                      <p className="text-sm text-slate-500 truncate mt-0.5">{quest.story.slice(0, 65)}...</p>
                      <span className="text-sm font-bold px-1.5 py-0.5 rounded mt-1 inline-block" style={{ color: element.color, backgroundColor: element.bg }}>
                        {quest.concept}
                      </span>
                    </div>

                    <div className="flex-shrink-0 text-right space-y-1">
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-600">
                        <Heart className="w-3 h-3 text-red-400" />
                        <span>{quest.enemy.hp} HP</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                        <Zap className="w-3 h-3" />
                        <span>+{quest.xpReward} XP</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  // ─── Handle quest victory ───
  const handleVictory = useCallback((quest, battleStats) => {
    const region = selectedRegion;
    if (!region || !region.quests) {
      setCurrentQuest(null);
      setGameScreen('map');
      return;
    }

    const newCompletedQuests = [...rpgState.completedQuests, quest.id];
    const allQuestsDone = region.quests.every(q => newCompletedQuests.includes(q.id));
    const isBoss = quest.enemy?.isBoss;

    // Inventory item rewards
    const newItems = [
      { id: Date.now(), name: isBoss ? 'Boss Trophy' : 'Victory Shard', icon: isBoss ? '🏆' : '💎' },
    ];
    if (Math.random() > 0.5) newItems.push({ id: Date.now() + 1, name: 'XP Scroll', icon: '📜' });

    const updatedState = {
      ...rpgState,
      totalXP: rpgState.totalXP + quest.xpReward,
      completedQuests: newCompletedQuests,
      completedRegions: allQuestsDone
        ? [...new Set([...rpgState.completedRegions, region.id])]
        : rpgState.completedRegions,
      bossesDefeated: isBoss ? (rpgState.bossesDefeated || 0) + 1 : (rpgState.bossesDefeated || 0),
      noHintWins: battleStats?.usedHints === 0 ? (rpgState.noHintWins || 0) + 1 : (rpgState.noHintWins || 0),
      firstTryWins: battleStats?.attempts === 1 ? (rpgState.firstTryWins || 0) + 1 : (rpgState.firstTryWins || 0),
      inventory: [...rpgState.inventory, ...newItems],
    };

    // Check achievements
    const earned = checkAchievements(updatedState);
    if (earned.length > 0) {
      updatedState.achievements = [...updatedState.achievements, ...earned.map(a => a.id)];
      setNewAchievements(earned);
      setTimeout(() => setNewAchievements([]), 4000);
    }

    setRpgState(updatedState);
    setCurrentQuest(null);
    setXpPopup(`+${quest.xpReward} XP`);
    setTimeout(() => setXpPopup(null), 2500);

    if (allQuestsDone && region.completion) {
      setShowDialogue({ type: 'completion', dialogues: region.completion });
    }

    setGameScreen('region');
  }, [rpgState, selectedRegion, checkAchievements]);

  const handleRetreat = () => {
    setCurrentQuest(null);
    setGameScreen('region');
  };

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    setGameScreen('region');
  };

  // ─── Render ───
  return (
    <div className="space-y-5 relative">
      {/* Achievement toast */}
      {newAchievements.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 animate-in slide-in-from-right-4">
          {newAchievements.map(ach => (
            <div key={ach.id} className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/40 rounded-xl shadow-xl">
              <span className="text-2xl">{ach.icon}</span>
              <div>
                <div className="text-sm font-black text-amber-400 uppercase tracking-wider">Achievement Unlocked!</div>
                <div className="text-xs font-bold text-white">{ach.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* XP popup */}
      {xpPopup && (
        <div className="fixed top-16 right-4 z-50 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-full text-sm font-black text-amber-400 animate-bounce">
          {xpPopup}
        </div>
      )}

      {/* RPG Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {gameScreen !== 'title' && (
            <button
              onClick={onExit}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              title="Exit RPG mode"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
            {gameScreen === 'title' ? '' : gameScreen === 'map' ? '🗺️ World Map' : gameScreen === 'region' ? '📜 Quests' : '⚔️ Battle'}
          </h2>
        </div>
        {rpgState.heroName && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-sm font-black">
              <Crown className="w-3 h-3 text-purple-400" />
              <span className="text-purple-400">AR {playerAR}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-sm font-black">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 tabular-nums">{rpgState.totalXP} XP</span>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`${gameScreen === 'title' ? 'lg:col-span-12' : 'lg:col-span-9'}`}>
          {gameScreen === 'title' && <TitleScreen />}

          {gameScreen === 'map' && (
            <WorldMap
              regions={regions}
              playerAR={playerAR}
              playerLevel={playerLevel}
              completedRegions={rpgState.completedRegions}
              completedQuests={rpgState.completedQuests}
              onSelectRegion={handleSelectRegion}
            />
          )}

          {gameScreen === 'region' && <RegionScreen />}

          {gameScreen === 'battle' && currentQuest && (
            <BattleScreen
              quest={currentQuest}
              onVictory={handleVictory}
              onRetreat={handleRetreat}
              playerStats={{ level: playerLevel, ar: playerAR, name: rpgState.heroName }}
              regionElement={REGION_ELEMENTS[selectedRegion?.id]}
            />
          )}
        </div>

        {gameScreen !== 'title' && rpgState.heroName && (
          <div className="lg:col-span-3">
            <CharacterPanel />
          </div>
        )}
      </div>
    </div>
  );
}
