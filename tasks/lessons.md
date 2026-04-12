---
title: Lessons Learned - AeroPython
tags:
  - project
  - lessons
  - aeropython
date: 2026-04-12
---

# Lessons Learned — AeroPython

> [!info] Purpose
> Update this file after every correction or insight. Prevents repeating mistakes.

## Planning Phase (2026-04-12)

- **Pyodide is the critical path.** Always validate the hardest technical dependency first before building features on top of it. If the foundation is broken, everything built on it is wasted.
- **70% success rate is the sweet spot** for educational game challenges. Easier = boring. Harder = frustrating. Research-backed.
- **Fresh sessions per phase.** Context pollution causes AI coding tools to degrade after 30-40 minutes. Start clean for each phase.

## Build Phase (2026-04-12)

- **React Rules of Hooks: NEVER put hooks after a conditional return.** All `useState`, `useEffect`, `useCallback`, and custom hooks MUST be called before any `if (...) return`. React tracks hooks by call order — skipping one crashes the entire component silently (blank screen, no error in UI). This caused RPG mode to show a blank screen when toggled.
- **When adding a new "mode" to an existing React component,** put the conditional render AFTER all hooks, never before. Pattern: all useState → all useEffect → all custom hooks → THEN `if (mode === 'x') return <OtherComponent />`.
- **Build on what exists.** The project already had Vite + React + Pyodide working. Switching to Next.js would have wasted days. Adapt the plan to the reality, not the other way around.

## Expansion Phase — v2.1 (2026-04-12)

- **Three-mode architecture > two-mode toggle.** When you have two gameplay modes, don't toggle between them directly — add a landing/picker screen as the third state. This gives users a clear home base and prevents "stuck in one mode" issues. The original two-mode toggle (academy ↔ rpg) was confusing on mobile; the ModePicker landing page fixed it.
- **Mobile-first button sizing.** Small toggle buttons (like a tiny "RPG Mode" link in a header) are invisible on mobile. When a UI element is a primary navigation choice, make it a full-width card/button that's impossible to miss. Test on mobile viewports early.
- **Difficulty should be data-driven, not a separate field.** Instead of adding a `difficulty` field to every quest, derive it from existing data (enemy HP). Less data to maintain, impossible to get out of sync.
- **Auth is a layered problem — start local.** V1 local auth (SHA-256 + localStorage) gets the UX in place without any backend. The modal, forms, and user state management work identically when you swap to Supabase later. The hard part is the UI flow, not the auth provider.
- **handleVictory null guard.** When a callback fires after animation delays, the state it references may have already changed. Always null-check state in delayed callbacks: `if (!selectedRegion || !selectedRegion.quests) return`.
- **Use subagents for parallel content generation.** Writing 20 quests across 4 regions is embarrassingly parallel. Spinning up a subagent to generate regions 5-8 while the main thread works on UI saved significant time.
