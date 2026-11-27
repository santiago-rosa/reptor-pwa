# Reptor PWA — MVP 1 User Stories & Progress

Progress: **6 / 17 stories completed** (35%)

---

## Checklist

### Epic 9 — Progress Tracking UI
- [ ] **Story P9.1 — Progress Page & Exercise Filter**
- [ ] **Story P9.2 — Recharts Line Visualization**

### Epic 11 — Custom Exercises
- [ ] **Story P11.1 — Custom Exercise Domain & Schema Migration**
- [ ] **Story P11.2 — Custom Exercise Form & Management UI**

### Epic 12 — AI Progress Analysis (Gemini)
- [ ] **Story P12.1 — Supabase Edge Function for Gemini API**
- [ ] **Story P12.2 — AI Analysis UI on Progress Page**

### Epic 13 — Real Offline Sync & Queue
- [x] **Story P13.1 — Active Workout Session Persistence & Resume Recovery**
- [ ] **Story P13.2 — Offline Read Cache & Offline-Safe Auth**
- [ ] **Story P13.3 — Offline Workout Queue (Finish Offline)**
- [ ] **Story P13.4 — Auto-Sync Engine & Idempotent Retries**
- [ ] **Story P13.5 — Offline Status Indicator & Sync Feedback UI**
- [ ] **Story P13.6 — PWA Offline App Shell & Route Verification**

### Epic 14 — AI-Assisted JSON Workout Import
- [x] **Story P14.1 — AI Exercise Catalog & JSON Schema Endpoint / Prompt**
- [x] **Story P14.2 — JSON Workout / Routine Importer & Validation UI**

### Epic 15 — Enhanced Workout Input (RPE, Rep Ranges & Previous Performance)
- [x] **Story P15.1 — RPE Input & Interactive Guide UI**
- [x] **Story P15.2 — Single & Range Rep Targets (Schema & UI Check)**
- [x] **Story P15.3 — Previous Set Performance Hints**

---

## Epic 9 — Progress Tracking UI

### Story P9.1 — Progress Page & Exercise Filter
**Status**: 🔲 TODO  
**Goal**: Build `/progress` allowing user to select an exercise with logged historical data.

#### File
- `src/presentation/pages/ProgressPage.tsx`
  - Extracts unique exercises from `workoutHistoryStore.sessions`.
  - Search filter.
  - Exercise selection pills/list.

#### Acceptance Criteria
- [ ] Only exercises with logged data are listed.

---

### Story P9.2 — Recharts Line Visualization
**Status**: 🔲 TODO  
**Goal**: Render interactive chart showing Max Weight or Total Volume over time.

#### Steps
1. Install Recharts:
   ```bash
   npm install recharts
   ```
2. Create `src/presentation/components/ProgressChart.tsx`:
   - Computes max weight and volume per session date for selected exercise.
   - Renders responsive `LineChart` with tooltip.
3. Add metric toggle (`Max Weight` vs `Total Volume`) in `ProgressPage`.

#### Acceptance Criteria
- [ ] Chart updates reactively when selecting an exercise or switching metric.

---

## Epic 11 — Custom Exercises

### Story P11.1 — Custom Exercise Domain & Schema Migration
**Status**: 🔲 TODO  
**Goal**: Database column and domain methods for user-created exercises.

#### Steps
1. Run SQL migration in Supabase SQL editor:
   ```sql
   ALTER TABLE exercises ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
   ```
2. Extend `IExerciseRepository` with `createCustom`, `updateCustom`, `deleteCustom`.
3. Implement in `SupabaseExerciseRepository`.

#### Acceptance Criteria
- [ ] User custom exercises supported in domain layer.

---

### Story P11.2 — Custom Exercise Form & Management UI
**Status**: 🔲 TODO  
**Goal**: Dedicated interface for managing custom exercises.

#### Files
- `src/presentation/components/CustomExerciseModal.tsx`
- `src/presentation/pages/CustomExercisesPage.tsx`

#### Acceptance Criteria
- [ ] User can create, edit, and delete their own custom exercises.
- [ ] Custom exercises appear in the exercise picker.

---

## Epic 12 — AI Progress Analysis (Gemini)

### Story P12.1 — Supabase Edge Function for Gemini API
**Status**: 🔲 TODO  
**Goal**: Serverless function that securely calls Google Gemini API without exposing API key to the client.

#### Steps
1. Create Supabase Edge Function `analyze-progress`:
   ```typescript
   // supabase/functions/analyze-progress/index.ts
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
   import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

   serve(async (req) => {
     const { sessions } = await req.json()
     const apiKey = Deno.env.get('GEMINI_API_KEY')!
     const genAI = new GoogleGenerativeAI(apiKey)
     const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

     const prompt = `Analyze this workout history and identify: 1) plateaus, 2) muscle imbalances, 3) suggestions:\n${JSON.stringify(sessions)}`
     const result = await model.generateContent(prompt)

     return new Response(JSON.stringify({ analysis: result.response.text() }), {
       headers: { 'Content-Type': 'application/json' },
     })
   })
   ```
2. Set secret: `supabase secrets set GEMINI_API_KEY=...`

#### Acceptance Criteria
- [ ] Function securely generates AI analysis from session history.

---

### Story P12.2 — AI Analysis UI on Progress Page
**Status**: 🔲 TODO  
**Goal**: "✨ Analyze My Progress" button and markdown result viewer on Progress page.

#### Changes
- Add "Analyze My Progress" button to `ProgressPage`.
- Calls `supabase.functions.invoke('analyze-progress', { body: { sessions } })`.
- Displays formatted analysis card.

#### Acceptance Criteria
- [ ] Displays loading state during generation.
- [ ] Displays actionable personal trainer feedback.

---

## Epic 13 — Real Offline Sync & Queue

### Story P13.1 — Active Workout Session Persistence & Resume Recovery
**Status**: ✅ DONE  
**Goal**: Ensure an in-progress workout is never lost when closing/reopening the browser tab or PWA, and can always be resumed from anywhere in the app.

#### Scope
- Track hydration state (`_hasHydrated`) on `useWorkoutSessionStore` (`persist` `onRehydrateStorage`) so `WorkoutSessionPage` waits for `idbStorage` rehydration before redirecting when `activeSession` is `null`.
- Add a persistent **"Workout in progress — Resume"** banner in `AppLayout` whenever `activeSession` is present, allowing the user to jump back into `/session` with all weights, reps, RPE, and timer intact.

#### Acceptance Criteria
- [x] Reloading or closing/reopening `/session` restores the active workout without redirecting to `/routines`.
- [x] Reopening the app at `/` or `/routines` while a workout is active shows a visible Resume banner that navigates back to `/session`.

---

### Story P13.2 — Offline Read Cache & Offline-Safe Auth
**Status**: 🔲 TODO  
**Goal**: Allow opening the app offline and viewing/starting existing routines, plans, exercises, and workout history from local cache.

#### Scope
- Persist `routineStore`, `planStore`, `exerciseStore`, and `workoutHistoryStore` via `idbStorage` (IndexedDB with `localStorage` fallback).
- Preserve cached data when network fetches fail offline instead of wiping state or blocking the UI.
- Ensure `authStore` / `RequireAuth` preserves the cached user session when offline so the user is not redirected to `/login` on a network error.

#### Acceptance Criteria
- [ ] Opening the app offline displays previously loaded routines, plans, exercises, and workout history.
- [ ] User can start an existing routine and log sets, weights, reps, and RPE while offline.

---

### Story P13.3 — Offline Workout Queue (Finish Offline)
**Status**: 🔲 TODO  
**Goal**: Allow finishing a workout while offline, saving it locally in a pending queue and showing it immediately in workout history.

#### Scope
- Create `offlineQueueStore` (persisted via `idbStorage`) storing completed `WorkoutSession` items awaiting upload.
- Update `workoutSessionStore.finishSession()` so that if offline (`!navigator.onLine`) or if saving fails due to a network error, the session (with `finishedAt` set) is queued locally, `activeSession` is cleared, and navigation proceeds normally.
- Merge queued sessions into `WorkoutHistoryPage`, `SessionDetailPage`, and previous-performance hints immediately.

#### Acceptance Criteria
- [ ] Finishing a workout offline succeeds locally without losing data or getting stuck on `/session`.
- [ ] Queued workouts appear immediately in History and contribute to Previous Performance hints.

---

### Story P13.4 — Auto-Sync Engine & Idempotent Retries
**Status**: 🔲 TODO  
**Goal**: Automatically sync queued workouts to Supabase when connectivity returns, without creating duplicates.

#### Scope
- Flush pending sessions sequentially to `SupabaseWorkoutSessionRepository.save()` on `window` `online` events, on app startup (when online and authenticated), and on manual trigger.
- Ensure idempotent upserts (no duplicate sessions/exercises/sets on retry) and remove each item from the queue once confirmed saved.
- Refresh `workoutHistoryStore` after syncing.

#### Acceptance Criteria
- [ ] Pending workouts automatically upload to Supabase once connection is restored.
- [ ] Retrying a failed sync never creates duplicate database rows.

---

### Story P13.5 — Offline Status Indicator & Sync Feedback UI
**Status**: 🔲 TODO  
**Goal**: Give clear visual feedback when the app is offline, when workouts are queued locally, and when syncing completes or fails.

#### Scope
- Add `useOnlineStatus` / global status pill or banner in `AppLayout` showing offline mode, syncing progress, and pending sync count.
- Show a `"Pending sync"` badge on locally queued sessions in `WorkoutHistoryPage` and `SessionDetailPage`.
- Add a manual `"Sync now"` retry button if a sync failed.

#### Acceptance Criteria
- [ ] User can clearly see offline status and pending sync count.
- [ ] Failed syncs surface a `"Sync now"` retry action.

---

### Story P13.6 — PWA Offline App Shell & Route Verification
**Status**: 🔲 TODO  
**Goal**: Ensure the installed PWA loads its app shell and any SPA route cleanly when launched offline.

#### Scope
- Verify `vite-plugin-pwa` Workbox configuration (`navigateFallback`, precache patterns) for offline SPA routing.
- Verify production build (`npm run build`) generates the service worker with expected assets.

#### Acceptance Criteria
- [ ] Production build precaches app shell assets and supports offline navigation fallback.

---

## Epic 14 — AI-Assisted JSON Workout Import

### Story P14.1 — AI Exercise Catalog & JSON Schema Endpoint / Prompt
**Status**: ✅ DONE  
**Goal**: Provide a machine-readable endpoint (or copyable AI prompt + live exercise catalog) so any external AI knows exact exercise IDs/names and the expected JSON schema.

#### Scope
- Public/authenticated API endpoint (e.g., Supabase Edge Function) returning instructions, JSON schema, and the current exercise list (`id`, `name`, `muscle_groups`, `equipment`).
- Optional in-app "Copy AI Prompt" helper that bundles the schema + exercise list for quick pasting into any AI chat.

#### Acceptance Criteria
- [x] External AI can fetch or receive the exact JSON format and valid exercise names/IDs.
- [x] Schema supports routine/workout name, exercises, sets, and rep targets (single or range).

---

### Story P14.2 — JSON Workout / Routine Importer & Validation UI
**Status**: ✅ DONE  
**Goal**: Allow pasting or uploading a JSON workout/routine generated by AI, validating exercises against the catalog, and saving it into the app.

#### Scope
- Import modal/page accepting pasted JSON or `.json` file upload.
- Strict schema validation with clear error messages and fuzzy/fallback matching if an exercise name slightly differs.
- Preview of exercises, sets, and reps before saving as a routine (or starting directly as a session).

#### Acceptance Criteria
- [x] Valid JSON imports cleanly into a routine (or active session).
- [x] Invalid JSON or unknown exercises show actionable validation errors before saving.

---

## Epic 15 — Enhanced Workout Input (RPE, Rep Ranges & Previous Performance)

### Story P15.1 — RPE Input & Interactive Guide UI
**Status**: ✅ DONE  
**Goal**: Add optional RPE (Rate of Perceived Exertion, e.g., 6–10) logging per set with a friendly UI explaining what each RPE value means.

#### Scope
- Check/update DB schema (`session_sets.rpe`), domain entity (`SessionSet`), and repository mapping.
- Add compact RPE selector/input on `SessionSetRow`.
- Interactive RPE picker/popover with plain-language descriptions (e.g., `10 = Max effort / 0 RIR`, `8 = 2 reps left in tank`, `7 = Moderate-hard / 3 RIR`).

#### Acceptance Criteria
- [ ] Users can log RPE per set and see plain-language effort descriptions in the picker.
- [ ] Logged RPE persists to Supabase and displays in workout history / session detail.

---

### Story P15.2 — Single & Range Rep Targets (Schema & UI Check)
**Status**: ✅ DONE  

#### Scope
- Audit existing DB columns (`routine_exercises.reps_min`, `reps_max`, or equivalent) and domain types to verify whether schema changes are needed.
- Update routine builder/editor UI (`SelectedExerciseRow`) to smoothly toggle or enter either a single rep count or a `min–max` range.

#### Acceptance Criteria
- [ ] Users can specify either a single rep target or a min–max range without friction.
- [ ] Single targets display cleanly (e.g., `8 reps`, not `8-8 reps`).

---

### Story P15.3 — Previous Set Performance Hints
**Status**: ✅ DONE  
**Goal**: Show the previous logged performance inline on each set (e.g., greyed `80kg@6rep@rpe7`) so the user knows what to aim for.

#### Scope
- Query/derive the most recent completed session containing each exercise in the current workout.
- Display previous performance per set index in muted/greyed text on `SessionSetRow` (e.g., `80kg × 6 @ RPE 7` or `80kg@6rep@rpe7`).
- If the current workout has more sets than the previous session (e.g., a 4th set with no previous 4th set), leave that set's hint empty.

#### Acceptance Criteria
- [ ] Each set displays the matching set number's previous weight, reps, and RPE (when available) in muted text.
- [ ] Extra sets beyond the previous session's set count show no previous performance hint.
