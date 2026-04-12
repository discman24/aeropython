---
title: AeroPython - Master Work Plan
tags:
  - project
  - plan
  - aeropython
status: active
date: 2026-04-12
---

# AeroPython - Master Work Plan

> [!tip] Product Definition
> **AeroPython** is a web-based RPG adventure game that teaches Python programming to total beginners by letting them write real Python code to control a hero character, solve quests, and battle coding monsters. Unlike Codecademy (boring drills) or CodeCombat (plateaus fast), AeroPython combines tight narrative coupling with real browser-based code execution — your code literally changes the story.

---

## V1 MVP Features — SHIPPED ✅

- [x] **Real Python Code Editor** — Monaco editor with syntax highlighting and instant Pyodide (v0.27.4) execution via CDN script tag (not Web Worker). This IS the game.
- [x] **RPG Overworld Map** — Visual world map with 8 regions (each = a Python topic). Locked regions unlock as you level up. Starfield background with animated path.
- [x] **Quest/Challenge System** — ~40 coding challenges across 8 Python topics. Each quest has narrative context, enemy battles, guided instructions, expected output, 3 progressive hints.
- [x] **Character & XP System** — Player creates hero name. XP awarded for completing challenges. XP_PER_LEVEL = 100. Leveling unlocks new regions.
- [x] **Story Engine** — DialogueBox with typewriter effect (25ms/char). Portrait mapping for NPCs (elder, guardian, keeper, forgemaster). Story beats between quests.
- [x] **Instant Feedback Console** — Output panel shows code results, friendly error translation (translateError()), success/failure states with animations.
- [x] **Progress Persistence** — LocalStorage saves RPG state + Academy progress. Auth system (V1 local, V2 Supabase) for user identity.
- [x] **Dual Game Modes** — RPG Mode (adventure) + Academy Mode (structured curriculum). Landing page (ModePicker) lets user choose.
- [x] **Login System** — Local auth with SHA-256 hashed passwords. Sign in / sign up modal. User avatar in UI.
- [x] **Difficulty Indicators** — Quests show Easy/Medium/Hard/Boss badges derived from enemy HP.
- [x] **Mobile-Friendly Landing** — Two large mode selection cards that work well on all screen sizes.

## V2 Parking Lot (Build Later)

- Supabase auth + cloud saves (replace local auth)
- 5-second execution timeout (identified in critical review, not yet coded)
- Infinite loop protection (loop counter injection)
- Leaderboards & social features (requires backend)
- Daily streak system with spaced repetition review
- Multiplayer coding duels
- Achievement/badge system
- Advanced topics: APIs, file I/O, libraries
- Custom character art/skins
- Sound effects & music
- Export/import save data as JSON backup

## Complexity Rating

> [!warning] Moderate-Complex (5-8 sessions)
> This is NOT a weekend project. The code editor + Pyodide integration is the hard part. But with phased execution, each session is manageable. Estimated total: **15-25 hours of focused building**.

---

## Tech Stack (Actual — differs from original plan)

| Component | Choice | Why |
|-----------|--------|-----|
| Framework | **Vite + React (JSX)** | Built on existing working codebase. NOT Next.js — adapted plan to reality |
| Styling | **Tailwind CSS** | Fast to build, utility-first, great for game UI |
| Code Editor | **Monaco Editor** (via `@monaco-editor/react`) | Same editor as VS Code — syntax highlighting, autocomplete |
| Python Execution | **Pyodide v0.27.4** (CDN script tag) | Real CPython in browser via WASM. No server needed. NOT Web Worker (yet) |
| Auth | **LocalStorage** (V1) → Supabase (V2) | SHA-256 hashed passwords locally. Zero setup for V1 |
| State Management | **React useState + custom hooks** | useProgress hook for Academy, localStorage for RPG |
| Deployment | **Vercel** (free tier) | Seamless deploy from GitHub |
| PWA | **vite-plugin-pwa** | Offline caching including Pyodide CDN resources |
| Package Manager | **npm** | Fewest issues for beginners |

---

## Python Curriculum Map (8 Regions) — IMPLEMENTED ✅

### Region 1: Village of Variables (Unlock: Level 1) 🏘️
- 5 quests: print(), variables, f-strings, string operations, boss battle
- Concepts: First output, variable assignment, string formatting
- Difficulty: Easy → Medium → Boss

### Region 2: Crossroads of Conditions (Unlock: Level 3) ⚔️
- 5 quests: if/else, elif chains, logical operators, nested conditions, boss
- Concepts: Boolean logic, branching, comparison operators
- Difficulty: Easy → Medium → Hard → Boss

### Region 3: List Labyrinth (Unlock: Level 5) 📜
- 5 quests: list creation, indexing, methods, iteration, boss
- Concepts: Lists, append/remove, for loops over lists, list comprehensions
- Difficulty: Medium → Hard → Boss

### Region 4: Function Forge (Unlock: Level 8) 🔨
- 5 quests: def statements, parameters, return values, multiple functions, boss
- Concepts: Functions, arguments, return, function composition
- Difficulty: Medium → Hard → Boss

### Region 5: String Sanctum (Unlock: Level 11) ✨
- 5 quests: string methods, slicing, split/join, formatting, boss
- Concepts: String manipulation, slicing syntax, method chaining
- Difficulty: Medium → Hard → Boss

### Region 6: Error Swamps (Unlock: Level 14) 🐊
- 5 quests: try/except, error types, raise, custom messages, boss
- Concepts: Exception handling, error types, defensive programming
- Difficulty: Medium → Hard → Boss

### Region 7: Module Mountains (Unlock: Level 17) ⛰️
- 5 quests: import, math module, random, datetime, boss
- Concepts: Standard library, imports, module usage
- Difficulty: Hard → Boss

### Region 8: Tower of Mastery (Unlock: Level 20) 👑
- 5 quests: classes, __init__/self, methods, inheritance, final boss
- Concepts: OOP, classes, objects, inheritance — combines ALL prior knowledge
- Difficulty: Hard → Boss (Final Boss combines everything)

---

## Architecture & File Structure (Actual)

```
aeropython/
├── index.html                       # Vite entry point (loads Pyodide CDN script)
├── package.json
├── vite.config.js                   # Vite + React + PWA config
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── logo.png                    # App logo
├── src/
│   ├── App.jsx                     # Main orchestrator — 3 modes: picker/rpg/academy
│   ├── main.jsx                    # React entry point
│   ├── index.css                   # Tailwind imports + global styles
│   ├── components/
│   │   ├── ModePicker.jsx         # Landing page — two big mode selection cards
│   │   ├── AuthModal.jsx          # Login/signup modal (local auth V1)
│   │   ├── CodePlayground.jsx     # Monaco editor + Pyodide execution (Academy)
│   │   ├── MissionCard.jsx        # Academy mission card
│   │   ├── QuizEngine.jsx         # Academy quiz system
│   │   └── rpg/
│   │       ├── RPGGame.jsx        # RPG orchestrator (title→map→region→battle)
│   │       ├── WorldMap.jsx       # Interactive 8-region starfield map
│   │       ├── BattleScreen.jsx   # Quest gameplay — code editor + enemy battle
│   │       └── DialogueBox.jsx    # Typewriter dialogue with NPC portraits
│   ├── data/
│   │   ├── rpgQuests.js           # All 8 regions, ~40 quests, enemies, stories
│   │   └── roadmap.js             # Academy: 12 missions with full curriculum
│   ├── hooks/
│   │   └── useProgress.js         # Academy progress tracking (XP, streaks, modules)
│   └── utils/
│       └── gemini.js              # AI tutor via Gemini API (optional)
├── tasks/                           # Obsidian documentation
│   ├── todo.md                     # This file — master work plan
│   ├── lessons.md                  # Lessons learned
│   ├── critical-failure-review.md  # Risk analysis
│   ├── CLAUDE.md                   # AI memory template
│   └── DEPLOY-GUIDE.md            # Step-by-step deployment for beginners
└── dist/                           # Vite build output (179.99 KB gzipped: 53.53 KB)
```

---

## Implementation History

### Phase 1: Discovery & Adaptation ✅
- Discovered existing Vite + React + Pyodide codebase with Academy mode already working
- Pivoted from Next.js plan to building on existing codebase (saved days of work)
- Confirmed Pyodide v0.27.4 loads via CDN script tag and executes Python correctly

### Phase 2: RPG Layer (v2.0) ✅
- Built RPGGame.jsx orchestrator (title → map → region → battle flow)
- Created WorldMap.jsx with 4 initial regions and visual node map
- Built BattleScreen.jsx with Monaco code editor + Pyodide execution
- Created DialogueBox.jsx with typewriter effect and NPC portraits
- Wrote rpgQuests.js with Regions 1-4 (20 quests)
- Integrated XP system (XP_PER_LEVEL = 100) and level-based region unlocking
- Added translateError() for beginner-friendly error messages
- Deployed to Vercel via GitHub

### Phase 3: Expansion & Polish (v2.1) ✅
- Added Regions 5-8 (20 more quests — total ~40 quests across 8 regions)
- Created ModePicker.jsx landing page with two large mode selection cards
- Built AuthModal.jsx with local SHA-256 auth (login + signup)
- Rewired App.jsx from 2-mode to 3-mode system (picker → rpg/academy)
- Added difficulty indicators (Easy/Medium/Hard/Boss) to BattleScreen
- Updated WorldMap for 8 regions with new SVG path connections
- Added Home button + user controls to Academy header
- Build verified: 179.99 KB (gzip: 53.53 KB)

---

## Key Architecture Decisions (Updated)

1. **Pyodide over server-side execution** — No backend needed. Code runs entirely in browser. Zero hosting costs.
2. **CDN script tag over Web Worker** — Current implementation loads Pyodide via script tag for simplicity. V2 should move to Web Worker to prevent UI freezing on heavy execution.
3. **Vite + React over Next.js** — Built on existing working codebase. SSR not needed for a client-side game. Faster builds, simpler config.
4. **LocalStorage for everything (V1)** — RPG state, Academy progress, user auth all in localStorage. Clear upgrade path to Supabase for V2.
5. **rpgQuests.js as JS module** — Quest data as JavaScript objects (not JSON) allows richer structure. Imported at build time.
6. **Monaco over CodeMirror** — Better autocomplete, VS Code familiarity, excellent React wrapper.
7. **Three-mode architecture** — ModePicker → RPG or Academy. Clean separation of concerns. Each mode manages its own state.
8. **Difficulty from enemy HP** — ≤50=Easy, ≤70=Medium, >70=Hard, isBoss=Boss. Simple, data-driven, no extra fields needed.

---

## Recovery Prompt (Use When Something Breaks)

> [!info] Copy-paste this when reporting a bug
> Something broke. Here's what happened:
> 
> Error: [paste error]
> What I was doing: [describe task]
> What was working: [describe what worked]
> 
> Fix this specific error without changing anything else that's currently working.

---

## V2 Roadmap Priority

1. **Execution safety** — 5-second timeout + infinite loop protection (highest priority)
2. **Supabase auth** — Replace local auth, enable cloud saves across devices
3. **More quest content** — Each region has 5 quests, could expand to 8-10
4. **Achievement system** — Badges for streaks, speed, first-try completions
5. **Sound effects** — Battle sounds, victory fanfare, typing clicks
6. **Daily challenges** — Rotating challenge for returning players
