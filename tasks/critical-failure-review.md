---
title: Critical Failure Review - AeroPython
tags:
  - project
  - review
  - risk
  - aeropython
status: reviewed
date: 2026-04-12
---

# Critical Failure Review — AeroPython

> [!danger] Purpose
> This document identifies every way this project could fail catastrophically, rates the risk, and provides the mitigation. Read this BEFORE starting Phase A.

---

## Risk 1: Pyodide Fails to Load or Execute in Next.js

**Severity:** 🔴 SHOWSTOPPER — If this fails, the entire game is dead.

**What could go wrong:**
- Pyodide WASM binary is ~15MB. Slow connections = long load, user bounces
- Next.js SSR tries to execute Pyodide on server → crashes (Pyodide is browser-only)
- Web Worker + Pyodide CDN may have CORS issues depending on deployment
- Pyodide version mismatch between CDN and worker code

**Mitigation:**
1. Build Phase B (Pyodide) FIRST before any game features. Prove it works Day 1
2. Use `"use client"` directive on ALL components that touch Pyodide — no SSR
3. Load Pyodide lazily with a progress bar (show "Loading Python Engine... 45%")
4. Pin Pyodide to exact version (v0.27.0) in worker file — never use "latest"
5. Add a fallback: if Pyodide fails to load after 30 seconds, show "Try refreshing" message
6. Test on Vercel deployment early — don't wait until Phase H

**Verdict:** ✅ MANAGEABLE if Phase B is done first and tested on Vercel immediately.

---

## Risk 2: Infinite Loops Freeze the Browser

**Severity:** 🟡 HIGH — Total beginners WILL write `while True:` and similar loops.

**What could go wrong:**
- User writes infinite loop → Web Worker runs forever → memory spikes → tab crashes
- Even with Web Worker, the worker thread consumes CPU indefinitely

**Mitigation:**
1. **Hard 5-second timeout** on every code execution. Worker sends no response → main thread kills and restarts worker
2. Inject loop counter into user code before execution: `_loop_count = 0` at top, increment in every loop body, raise error at 10,000 iterations
3. Show friendly message: "Your loop ran too long! Check your loop condition."
4. Pre-check for common patterns (`while True` without break) before execution

**Verdict:** ✅ SOLVED with timeout + loop injection. Standard approach used by CodeCombat.

---

## Risk 3: Code Validation is Too Strict or Too Loose

**Severity:** 🟡 HIGH — Wrong validation = player stuck or learning wrong things.

**What could go wrong:**
- Player writes correct code but with different whitespace/formatting → marked wrong
- Player writes `print("hello")` but expected output is `"Hello"` (case mismatch)
- Output comparison fails on trailing newlines, extra spaces

**Mitigation:**
1. **Strip and normalize** all output before comparison (trim whitespace, normalize newlines)
2. Use **regex patterns** for flexible matching where appropriate (not just exact string match)
3. For each challenge, define both `expected_output` (exact) and `validation_type` (exact, contains, regex, function_exists)
4. Playtest every single challenge before shipping. No untested challenges.
5. Include "Show Expected Output" button so player can self-diagnose

**Verdict:** ✅ MANAGEABLE with flexible validation types per challenge.

---

## Risk 4: Monaco Editor Doesn't Work Well on All Browsers

**Severity:** 🟡 MEDIUM — Monaco is heavy and has known issues.

**What could go wrong:**
- Monaco is ~2MB bundle. Combined with Pyodide 15MB = very heavy initial load
- Safari has Web Worker inconsistencies
- Firefox + Monaco occasionally has cursor positioning bugs

**Mitigation:**
1. Lazy-load Monaco (dynamic import with `next/dynamic`, ssr: false)
2. Show skeleton/placeholder while Monaco loads
3. Test on Chrome, Firefox, Safari before Phase H deploy
4. If Monaco proves too heavy: fallback to CodeMirror 6 (lighter, same features)

**Verdict:** ✅ MANAGEABLE. Monaco is used by millions. Known issues have workarounds.

---

## Risk 5: Game Content is Boring / Bad Pedagogy

**Severity:** 🟡 MEDIUM — Great tech + bad content = nobody plays.

**What could go wrong:**
- Challenges too easy → boring. Too hard → frustrating
- Story feels forced or cringey
- Curriculum doesn't build properly (gaps between concepts)

**Mitigation:**
1. Target **70% success rate** per challenge (research-backed sweet spot)
2. Each challenge gets **3 progressive hints** (nudge → bigger hint → near-solution)
3. Follow proven curriculum order: variables → operators → conditionals → loops → functions → lists → dicts → classes
4. Write story first, then map challenges to story beats (not the reverse)
5. Get 3 non-programmer friends to playtest Region 1-2 before writing remaining content

**Verdict:** ✅ MANAGEABLE with playtesting and hint system.

---

## Risk 6: LocalStorage Data Loss

**Severity:** 🟢 LOW-MEDIUM — Player loses progress, gets frustrated.

**What could go wrong:**
- User clears browser data → all progress gone
- Private/incognito mode → no persistence at all
- LocalStorage has 5-10MB limit (should be fine for game state, but watch challenge content size)

**Mitigation:**
1. Show warning on first visit: "Your progress saves in this browser. Don't clear browser data!"
2. Add "Export Save" button that downloads progress as JSON file
3. Add "Import Save" button to restore from file
4. V2: Add Supabase cloud saves with user accounts

**Verdict:** ✅ ACCEPTABLE for V1. Export/import is cheap insurance.

---

## Risk 7: Scope Creep Kills the Project

**Severity:** 🟡 HIGH — The #1 killer of vibe-coding projects.

**What could go wrong:**
- "Just one more feature" before launch → never launches
- Trying to build all 8 regions before testing Region 1
- Polishing visuals before core gameplay works

**Mitigation:**
1. **V1 launch = Regions 1-4 only** (20 challenges). Regions 5-8 are V1.5
2. Phase B (Pyodide) MUST work before ANY game features
3. Phase E (core loop) MUST work before story, polish, or content
4. Stick to the phase plan. One phase per session. Fresh context each time
5. "Is this needed for someone to play Region 1?" — if no, it's V2

**Verdict:** ✅ CONTROLLED by ruthless scoping and phase discipline.

---

## Risk 8: Pyodide + Monaco Bundle Size

**Severity:** 🟢 LOW-MEDIUM — Slow initial load but manageable.

**Total estimated initial load:**
- Next.js app: ~200KB
- Monaco Editor: ~2MB
- Pyodide WASM: ~15MB
- **Total: ~17MB first load**

**Mitigation:**
1. Pyodide loads in background Web Worker (doesn't block UI)
2. Monaco lazy-loaded (only when quest page opens)
3. Show engaging loading screen with tips: "Did you know? Python was named after Monty Python!"
4. Pyodide caches in browser after first load — subsequent visits are instant
5. Pre-warm Pyodide worker on world map page (before user enters quest)

**Verdict:** ✅ ACCEPTABLE. CodeCombat loads similarly and has 5M+ users.

---

## Summary Matrix (Updated 2026-04-12 — post v2.1 ship)

| Risk | Severity | Status |
|------|----------|--------|
| Pyodide integration | 🔴 Was Showstopper | ✅ **RESOLVED** — works via CDN script tag in Vite (not Next.js). Deployed and tested on Vercel |
| Infinite loops | 🟡 High | ⚠️ **OPEN** — No timeout or loop injection implemented yet. V2 priority #1 |
| Code validation | 🟡 High | ✅ **RESOLVED** — exact/contains/regex validation types implemented per quest |
| Monaco browser compat | 🟡 Medium | ✅ **RESOLVED** — Monaco works in production. Bundle: 179.99 KB total (gzip: 53.53 KB) |
| Bad content/pedagogy | 🟡 Medium | ⚠️ **IN PROGRESS** — 40 quests written, needs playtesting with real beginners |
| LocalStorage loss | 🟢 Low-Medium | ⚠️ **OPEN** — No export/import yet. Auth added but still localStorage-based |
| Scope creep | 🟡 High | ✅ **CONTROLLED** — Shipped 8 regions, auth, dual modes. V2 features clearly separated |
| Bundle size | 🟢 Low-Medium | ✅ **RESOLVED** — PWA caching via vite-plugin-pwa. Pyodide cached after first load |

> [!success] Overall Verdict (Post-Ship)
> **V2.1 is live and playable.** The original showstopper (Pyodide) was resolved by building on the existing Vite codebase. Two remaining open risks: infinite loop protection (V2 priority) and localStorage data loss (mitigated by future Supabase migration). Content quality needs real-user playtesting.

---

## The One Rule That Prevents 90% of Failures

> [!important] The Golden Rule
> **Get the code editor running real Python in the browser BEFORE building anything else.** If that works, everything else is UI and content. If it doesn't, you've found out in 1 hour instead of 20.
