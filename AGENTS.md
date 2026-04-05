# AGENTS.md

## Project snapshot
- Vite + React 18 + TypeScript single-page app for managing a live Hold'em tournament; there is no backend or API layer (`package.json`, `src/main.tsx`).
- Routing is shallow: `/` timer dashboard, feature pages under the shared shell, and a separate `/remote` display-only route (`src/App.tsx`).
- If `useTournamentStore().tournament` is null, the main app short-circuits to `LandingPage`; most features assume an in-memory tournament already exists (`src/App.tsx`, `src/pages/LandingPage.tsx`).

## Architecture and data flow
- `useTournamentStore` is the domain source of truth: settings, blind structure, players, tables, prize config, payout structure, and saved-tournament lifecycle all live there (`src/store/tournamentStore.ts`).
- `useTimerStore` is intentionally separate runtime state for countdown behavior (`status`, `levelRemainingMs`, elapsed time, warning flags); keep timer mechanics out of the tournament store (`src/store/timerStore.ts`).
- `useTimer()` is the timer engine. It owns the only ticking `setInterval`, advances levels, fires alerts, mirrors status/index changes back into both stores, and exposes the control API used by `TimerPage` (`src/hooks/useTimer.ts`, `src/pages/TimerPage.tsx`).
- `App` wires cross-cutting hooks once at the top: `useTimer()`, `useAutoSave()`, and host-side broadcast registration through `useHostBroadcast()` (`src/App.tsx`).
- Prize totals are derived, not edited directly: player buy-ins/add-ons recalculate `prizeSnapshot` and `payoutStructure` through `calculatePayouts()` inside tournament-store actions (`src/store/tournamentStore.ts`, `src/lib/payoutCalculator.ts`).

## Persistence and remote sync
- Persistence is browser-only `localStorage`: per-tournament records use `holdem_tournament_<id>` and a separate `holdem_index` metadata list (`src/lib/localPersistence.ts`).
- Saved tournaments are loaded/deleted from both `LandingPage` and `SettingsPage` via the shared `SavedTournaments` component (`src/components/settings/SavedTournaments.tsx`).
- Remote sync is same-browser/device-family only: host and viewer communicate over `BroadcastChannel`, not WebSockets. The channel name comes from persisted settings and defaults to `holdem-timer` (`src/hooks/useRemoteSync.ts`, `src/store/settingsStore.ts`).
- The QR code simply opens `${window.location.origin}/remote`; remote clients render from timer-store state and never own tournament mutations (`src/components/remote/RemoteQRCode.tsx`, `src/components/remote/RemoteView.tsx`).

## Repo-specific coding patterns
- Prefer tournament-store actions for domain changes (`addPlayer`, `autoBalanceTables`, `updatePrizeConfig`, etc.) because they also keep derived slices in sync (`src/store/tournamentStore.ts`).
- A notable exception exists in `TournamentSettingsForm`, which updates nested tournament settings through `useTournamentStore.setState(...)`; preserve behavior carefully if refactoring because this bypasses explicit store actions (`src/components/settings/TournamentSettings.tsx`).
- Blind structures are edited as arrays of `BlindLevel` objects and then renumbered so only play levels get sequential `levelNumber`s; breaks keep `levelNumber: 0` (`src/lib/blindPresets.ts`, `src/store/tournamentStore.ts`).
- Table seating changes must update both `tables[].seats` and each affected player's `tableId` / `seatNumber`; follow `assignPlayerToSeat`, `removePlayerFromSeat`, and `autoBalanceTables` as the canonical examples (`src/store/tournamentStore.ts`).
- UI styling is Tailwind-first with a consistent dark theme (`gray-9xx`, green accents, `font-mono` / `.tabular-nums` for timer numerals). Reuse the shell/page patterns in `AppShell`, `Sidebar`, and `TopBar` instead of introducing a new layout system (`src/components/layout/*.tsx`, `tailwind.config.ts`, `src/index.css`).

## Build and debug workflow
- Install and run with the existing package scripts:
  - `npm install`
  - `npm run dev`
  - `npm run build`
  - `npm run preview`
- There are currently no `test` or `lint` scripts in `package.json`; validate changes by building and by manually exercising the relevant route/workflow.
- For timer-related changes, verify both host and `/remote` behavior, especially pause/resume, level transitions, one-minute warning, and BroadcastChannel drift correction (`src/hooks/useTimer.ts`, `src/hooks/useRemoteSync.ts`).

## High-value files to read first
- `src/App.tsx`
- `src/store/tournamentStore.ts`
- `src/hooks/useTimer.ts`
- `src/hooks/useRemoteSync.ts`
- `src/lib/localPersistence.ts`
- `src/components/layout/AppShell.tsx`

