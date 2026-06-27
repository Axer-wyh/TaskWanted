# TaskWanted Fluid Cube Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clickable TaskWanted prototype from the approved page-structure spec, centered on a full-screen Fluid Cube interaction system.

**Architecture:** Add one reusable client-side Fluid Cube stage component and compose the Home, Bounty Board, Agent, Profile, and Agent Knowledge Base pages around it. Keep dense product workflows inside active cube faces so the prototype remains usable while matching the approved spatial interaction direction.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Motion, Phosphor icons, Tailwind v4 CSS variables, Vitest and Testing Library.

---

### Task 1: Fluid Cube Stage And Header Navigation

**Files:**
- Create: `src/components/fluid-cube-stage.tsx`
- Modify: `src/components/site-header.tsx`
- Test: `src/app/page.test.tsx`

- [x] Add tests that require Home, Bounty Board, Agent, Ecosystem, About, wallet/login, language/theme, and signed-in avatar navigation.
- [x] Implement `FluidCubeStage` as a client leaf component with face buttons, hash-aware initial face, reduced-motion fallback, and keyboard-accessible controls.
- [x] Update the header to include Ecosystem and About anchor links, plus a signed-in avatar link to `/profile`.
- [x] Run `npm test -- src/app/page.test.tsx`.

### Task 2: Home Page Cube Faces

**Files:**
- Modify: `src/app/home-experience.tsx`
- Modify: `src/app/globals.css`
- Test: `src/app/page.test.tsx`

- [x] Replace the static home sections with cube faces for Hero, Flow, Ecosystem, About, Board CTA, and Trust.
- [x] Keep Home free of live market feeds while linking into `/bounties`.
- [x] Add CSS for cube perspective, fluid surface, face content, and reduced motion.
- [x] Run `npm test -- src/app/page.test.tsx`.

### Task 3: Bounty Board Prototype

**Files:**
- Modify: `src/app/bounties/bounties-experience.tsx`
- Test: `src/app/bounties/page.test.tsx`

- [x] Add tests for Bounty Board heading, Trending/Bounties/Submissions/Mine faces, filtering, create bounty, blind submission, and activity feed.
- [x] Compose the Bounty Board with cube faces for Trending, All Bounties, Submissions, Mine, Create, and Detail.
- [x] Preserve create-funded-bounty and blind-submission flows.
- [x] Run `npm test -- src/app/bounties/page.test.tsx`.

### Task 4: Agent, Profile, And Knowledge Base

**Files:**
- Modify: `src/app/agent/agent-experience.tsx`
- Create: `src/app/profile/page.tsx`
- Create: `src/app/agent/knowledge-base/page.tsx`
- Test: `src/app/agent/page.test.tsx`
- Test: `src/app/profile/page.test.tsx`
- Test: `src/app/agent/knowledge-base/page.test.tsx`

- [x] Add tests for autonomous agent positioning, free create CTA, learn more link, autopilot task creation, watcher sync, and policy blocking.
- [x] Implement Agent cube faces for value proposition, free create, autopilot, sources, passive earnings, and logs.
- [x] Add Profile page for avatar destination and user task/earning/source state.
- [x] Add Agent Knowledge Base page for learn-more destination.
- [x] Run targeted tests for agent, profile, and knowledge base.

### Task 5: Verification, Test Agent, GitHub

**Files:**
- Modify as needed based on verification findings.

- [x] Run `npm run lint`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Start a local dev server and run browser verification with a dedicated test agent across `/`, `/bounties`, `/agent`, `/profile`, and `/agent/knowledge-base`.
- [x] Commit all changes.
- [x] Add or verify GitHub remote `https://github.com/Axer-wyh/TaskWanted.git`.
- [x] Push branch `codex/taskwanted-mvp`.
