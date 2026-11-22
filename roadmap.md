# Reptor PWA — Migration User Stories (Vite + React SPA)

> **Purpose**: This document is the complete specification for rebuilding *Reptor* as a **Progressive Web App (PWA)** using **Vite + React SPA**. It is tailored for **maximum simplicity and AI coding speed** on a free-tier quota. Every story is granular, self-contained, and doable in a single prompt without running into context or quota limits.

---

## Why Vite + React SPA?

1. **Zero SSR / RSC friction**: No `"use client"` confusion, hydration errors, or server/client boundary bugs.
2. **Fastest AI generation**: Vite + React Router + standard React hooks have the highest volume and accuracy in AI training datasets.
3. **Native tooling**: Vitest and Vite share the exact same configuration and plugins.
4. **Reliable PWA**: `vite-plugin-pwa` is actively maintained, battle-tested, and configures Workbox + web app manifest seamlessly.
5. **Direct portability**: Almost 100% logic and Tailwind class reuse from the original React Native codebase.

---

## Tech Stack Summary

| Concern | Choice | Details |
|---|---|---|
| **Build Tool & Bundler** | **Vite** | `react-ts` template, blazing fast HMR |
| **Framework** | **React 18** | Client-side SPA, zero server complexity |
| **Routing** | **React Router v6** (`react-router-dom`) | Standard SPA routing, nested layouts, `useNavigate`, `useParams`, `useSearchParams` |
| **Styling** | **Tailwind CSS v3** | Identical utility classes to NativeWind |
| **State Management** | **Zustand v5** | Same library & selectors as mobile app |
| **Backend / DB** | **Supabase** (Existing Project) | Project `chxafsotrojcurokygrl` (PostgreSQL + Auth + Storage) |
| **PWA Engine** | **`vite-plugin-pwa`** | Service worker, manifest, offline caching via Workbox |
| **Offline Persist** | **`idb-keyval`** | IndexedDB storage adapter for active workout session |
| **Data Viz** | **Recharts** | Clean, responsive line charts for progress |
| **Testing** | **Vitest + React Testing Library** | Native to Vite, fast ESM execution |
| **AI Analysis** | **Supabase Edge Function** | Serverless Deno function calling Gemini API (API key kept safe) |

---

## Target Project Structure

```
reptor-pwa/
├── public/
│   ├── favicon.ico
│   └── icons/                 # PWA icons (192x192, 512x512)
├── src/
│   ├── domain/                # Pure business logic (Zero external dependencies)
│   │   ├── entities/          # Exercise, Routine, Plan, WorkoutSession
│   │   ├── repositories/      # Repository interfaces (ports)
│   │   └── usecases/          # Granular use cases
│   ├── infrastructure/        # External systems
│   │   └── supabase/
│   │       ├── client.ts      # Supabase JS client
│   │       ├── types/         # Database row interfaces
│   │       └── repositories/  # Implementations of domain repository interfaces
│   ├── presentation/
│   │   ├── components/        # Reusable UI widgets & modals
│   │   ├── layouts/           # AppLayout (with BottomNav)
│   │   ├── pages/             # Page components
│   │   │   ├── RoutineLibraryPage.tsx
│   │   │   ├── CreateRoutinePage.tsx
│   │   │   ├── EditRoutinePage.tsx
│   │   │   ├── ExercisePickerPage.tsx
│   │   │   ├── WorkoutSessionPage.tsx
│   │   │   ├── WorkoutHistoryPage.tsx
│   │   │   ├── SessionDetailPage.tsx
│   │   │   ├── ProgressPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── stores/            # Zustand stores
│   │   └── hooks/             # Utility hooks
│   ├── shared/                # App constants, shared types, formatters
│   ├── App.tsx                # Route definitions
│   ├── main.tsx               # DOM mount + PWA registration
│   └── index.css              # Tailwind base
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── .env.local
```

---

## Session Protocol (for the AI assistant)

1. Check this document for the next story with status `🔲 TODO`.
2. Implement **only** what is specified in that story. Do not add future features early.
3. Verify that `npx tsc --noEmit` and `npm test` pass.
4. Mark the story `✅ Done`.

---

## Epic 1 — Setup, PWA & Foundations

---

### Story P1.1 — Vite + React + Tailwind Initialization
**Status**: ✅ Done  
**Goal**: Initialize Vite with React + TypeScript, configure Tailwind CSS, strict TypeScript, and basic folder structure.

#### Steps
1. Bootstrap with Vite:
   ```bash
   npm create vite@latest reptor-pwa -- --template react-ts
   cd reptor-pwa
   npm install
   ```
2. Install Tailwind CSS v3:
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
3. Configure `tailwind.config.js`:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
     theme: {
       extend: {
         colors: {
           background: "#030712",
         }
       },
     },
     plugins: [],
   }
   ```
4. Update `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   body {
     @apply bg-gray-950 text-white min-h-screen antialiased select-none;
   }
   ```
5. Ensure `tsconfig.json` contains:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "noUncheckedIndexedAccess": true,
       "noImplicitReturns": true,
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"]
       }
     }
   }
   ```
6. Install path resolve support: `npm install -D @types/node` and update `vite.config.ts` to alias `@` to `/src`.
7. Create `.env.local` with empty Supabase keys and add to `.gitignore`.

#### Acceptance Criteria
- [ ] `npm run dev` starts dev server without errors.
- [ ] Tailwind applies dark background (`bg-gray-950`) and text colors.
- [ ] `npx tsc --noEmit` compiles cleanly.

---

### Story P1.2 — PWA Configuration with `vite-plugin-pwa`
**Status**: ✅ Done  
**Depends on**: P1.1  
**Goal**: Configure service worker and manifest so the app is installable and works offline.

#### Steps
1. Install plugin:
   ```bash
   npm install -D vite-plugin-pwa
   ```
2. Update `vite.config.ts`:
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import { VitePWA } from 'vite-plugin-pwa'
   import path from 'path'

   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         includeAssets: ['favicon.ico', 'icons/*.png'],
         manifest: {
           name: 'Reptor Workout Tracker',
           short_name: 'Reptor',
           description: 'Clean gym workout logger and progress tracker',
           theme_color: '#030712',
           background_color: '#030712',
           display: 'standalone',
           icons: [
             {
               src: '/icons/icon-192.png',
               sizes: '192x192',
               type: 'image/png'
             },
             {
               src: '/icons/icon-512.png',
               sizes: '512x512',
               type: 'image/png'
             }
           ]
         }
       })
     ],
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   })
   ```
3. Add placeholder icons in `public/icons/icon-192.png` and `public/icons/icon-512.png`.
4. Add meta viewport to `index.html`:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
   <meta name="theme-color" content="#030712" />
   ```

#### Acceptance Criteria
- [ ] `npm run build` generates service worker and manifest files in `dist/`.
- [ ] Chrome DevTools > Application > Manifest shows manifest details.
- [ ] Chrome DevTools > Application > Service Workers shows registered worker.

---

### Story P1.3 — React Router & Bottom Navigation Shell
**Status**: ✅ Done  
**Depends on**: P1.1  
**Goal**: Configure React Router v6 with a mobile-first `AppLayout` featuring a fixed bottom navigation bar.

#### Steps
1. Install router:
   ```bash
   npm install react-router-dom
   ```
2. Create `src/presentation/components/BottomNav.tsx`:
   - Fixed bottom bar: `fixed bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-gray-800 flex justify-around items-center`
   - Three navigation items with `NavLink`:
     - 📋 **Routines** (`/routines`)
     - 📅 **History** (`/history`)
     - 📈 **Progress** (`/progress`)
   - Active link styling: `text-blue-500 font-medium`, inactive: `text-gray-400`
3. Create `src/presentation/layouts/AppLayout.tsx`:
   ```tsx
   import { Outlet } from 'react-router-dom'
   import { BottomNav } from '../components/BottomNav'

   export function AppLayout() {
     return (
       <div className="flex flex-col min-h-screen bg-gray-950 text-white pb-20">
         <main className="flex-1 max-w-md w-full mx-auto">
           <Outlet />
         </main>
         <BottomNav />
       </div>
     )
   }
   ```
4. Setup routes in `src/App.tsx`:
   - `/` redirects to `/routines`
   - `/routines` → placeholder `<RoutineLibraryPage />`
   - `/history` → placeholder `<WorkoutHistoryPage />`
   - `/progress` → placeholder `<ProgressPage />`
   - `/session` → placeholder `<WorkoutSessionPage />` (full screen, outside `AppLayout`)

#### Acceptance Criteria
- [ ] Bottom tabs persist between Routines, History, and Progress.
- [ ] Active tab highlights properly in blue.
- [ ] Content is constrained gracefully to mobile viewport (`max-w-md w-full mx-auto`).

---

### Story P1.4 — Supabase Client Setup
**Status**: ✅ Done  
**Depends on**: P1.1  
**Goal**: Initialize Supabase client in infrastructure layer with environment variable support.

#### Steps
1. Install client:
   ```bash
   npm install @supabase/supabase-js
   ```
2. Configure `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://chxafsotrojcurokygrl.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
3. Create `src/infrastructure/supabase/client.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js'

   const url = import.meta.env.VITE_SUPABASE_URL as string
   const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

   if (!url || !key) {
     throw new Error('Missing Supabase environment variables')
   }

   export const supabase = createClient(url, key, {
     auth: {
       storage: localStorage,
       autoRefreshToken: true,
       persistSession: true,
       detectSessionInUrl: true,
     },
   })
   ```

#### Acceptance Criteria
- [ ] TypeScript compiles with no errors.
- [ ] `supabase` client is ready to import into infrastructure repositories.
- [ ] Zero Supabase references in presentation or domain layers.

---

### Story P1.5 — Vitest & Testing Environment
**Status**: ✅ Done  
**Depends on**: P1.1  
**Goal**: Configure Vitest + React Testing Library for fast, reliable unit testing.

#### Steps
1. Install testing dependencies:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
   ```
2. Update `vite.config.ts`:
   ```typescript
   /// <reference types="vitest" />
   // add test config inside defineConfig:
   test: {
     globals: true,
     environment: 'jsdom',
     setupFiles: './src/test/setup.ts',
   }
   ```
3. Create `src/test/setup.ts`:
   ```typescript
   import '@testing-library/jest-dom'
   ```
4. Add script to `package.json`: `"test": "vitest run"` and `"test:watch": "vitest"`.
5. Create sample test `src/test/smoke.test.ts` asserting `1 + 1 === 2`.

#### Acceptance Criteria
- [ ] `npm test` runs and passes.
- [ ] DOM matchers like `toBeInTheDocument` available.

---

## Epic 2 — Domain Layer: Exercises

---

### Story P2.1 — Exercise Entity & Repository Interface
**Status**: ✅ Done  
**Goal**: Create pure domain definitions for exercises.

#### Files
- `src/domain/entities/Exercise.ts`
  - Types: `MuscleGroup`, `Equipment`, `ExerciseCategory`
  - Interface `Exercise { id, name, muscleGroups, equipment, category }`
- `src/domain/repositories/IExerciseRepository.ts`
  - Interface `IExerciseRepository { findAll(): Promise<Exercise[]> }`

#### Acceptance Criteria
- [ ] No imports from outside `src/domain/`.
- [ ] `npx tsc --noEmit` passes.

---

### Story P2.2 — GetAllExercises Use Case & Unit Test
**Status**: ✅ Done  
**Depends on**: P2.1, P1.5  
**Goal**: Implement `GetAllExercises` with mock tests.

#### Files
- `src/domain/usecases/GetAllExercises.ts`:
  - Constructor injects `IExerciseRepository`.
  - `execute(): Promise<Exercise[]>`
- `src/domain/usecases/__tests__/GetAllExercises.test.ts`:
  - Test 1: returns exercise list from repository.
  - Test 2: propagates repository rejection.

#### Acceptance Criteria
- [ ] `npm test` passes with 2 tests.

---

### Story P2.3 — Supabase Exercise Repository
**Status**: ✅ Done  
**Depends on**: P2.1, P1.4  
**Goal**: Implement `SupabaseExerciseRepository` mapping database rows to domain entities.

#### Files
- `src/infrastructure/supabase/types/ExerciseRow.ts`
- `src/infrastructure/supabase/repositories/SupabaseExerciseRepository.ts`
  - `findAll()` queries table `exercises` ordered by `name asc`.
  - Private `toDomain(row)` maps snake_case to camelCase.

#### Acceptance Criteria
- [ ] Implements `IExerciseRepository`.
- [ ] TypeScript compiles clean.

---

## Epic 3 — Domain Layer: Routines & Plans

---

### Story P3.1 — Routine & Plan Entities
**Status**: ✅ Done  
**Goal**: Define pure domain entities for routines and plan folders.

#### Files
- `src/domain/entities/Routine.ts` (`Routine`, `RoutineExercise`)
- `src/domain/entities/Plan.ts` (`Plan`)

#### Acceptance Criteria
- [ ] Pure TypeScript, zero external imports.

---

### Story P3.2 — Repository Interfaces & Input Types
**Status**: ✅ Done  
**Depends on**: P3.1  
**Goal**: Define contracts for Routine and Plan persistence.

#### Files
- `src/domain/repositories/IRoutineRepository.ts`:
  - `CreateRoutineInput`, `UpdateRoutineInput`
  - Methods: `findAll()`, `findById()`, `save()`, `update()`, `delete()`, `assignToPlan()`
- `src/domain/repositories/IPlanRepository.ts`:
  - Methods: `findAll()`, `save()`, `update()`, `delete()`

#### Acceptance Criteria
- [ ] Clean type contracts with strict typing.

---

### Story P3.3 — Routine Use Cases & Tests
**Status**: ✅ Done  
**Depends on**: P3.2, P1.5  
**Goal**: Create routine domain operations and unit tests.

#### Files
- `src/domain/usecases/GetAllRoutines.ts`
- `src/domain/usecases/CreateRoutine.ts`
- `src/domain/usecases/UpdateRoutine.ts`
- `src/domain/usecases/DeleteRoutine.ts`
- `src/domain/usecases/AssignRoutineToPlan.ts`
- Tests in `src/domain/usecases/__tests__/`:
  - `CreateRoutine.test.ts`
  - `DeleteRoutine.test.ts`
  - `AssignRoutineToPlan.test.ts`

#### Acceptance Criteria
- [ ] All use case unit tests pass (`npm test`).

---

### Story P3.4 — Plan Use Cases & Tests
**Status**: ✅ Done  
**Depends on**: P3.2, P1.5  
**Goal**: Create plan domain operations and unit tests.

#### Files
- `src/domain/usecases/GetAllPlans.ts`
- `src/domain/usecases/CreatePlan.ts`
- `src/domain/usecases/UpdatePlan.ts`
- `src/domain/usecases/DeletePlan.ts`
- Tests in `src/domain/usecases/__tests__/`:
  - `CreatePlan.test.ts`
  - `DeletePlan.test.ts`

#### Acceptance Criteria
- [ ] All plan unit tests pass.

---

### Story P3.5 — Supabase Routine & Plan Repositories
**Status**: ✅ Done  
**Depends on**: P3.3, P3.4, P1.4  
**Goal**: Concrete Supabase adapters for routines and plans.

#### Files
- `src/infrastructure/supabase/types/RoutineRow.ts`
- `src/infrastructure/supabase/types/PlanRow.ts`
- `src/infrastructure/supabase/repositories/SupabaseRoutineRepository.ts`:
  - Joined fetch with `routine_exercises(*, exercises(name))`
  - Sequential cascading insert with rollback on failure
- `src/infrastructure/supabase/repositories/SupabasePlanRepository.ts`

#### Acceptance Criteria
- [ ] Implements `IRoutineRepository` and `IPlanRepository`.
- [ ] TypeScript compiles cleanly.

---

## Epic 4 — Domain Layer: Workout Session

---

### Story P4.1 — WorkoutSession Entity & Repository Interface
**Status**: ✅ Done  
**Goal**: Pure domain definitions for active and completed sessions.

#### Files
- `src/domain/entities/WorkoutSession.ts` (`WorkoutSession`, `SessionExercise`, `SessionSet`)
- `src/domain/repositories/IWorkoutSessionRepository.ts` (`save()`, `findById()`, `findAll()`)

#### Acceptance Criteria
- [ ] Pure TypeScript, strict types.

---

### Story P4.2 — Session Use Cases & Tests
**Status**: ✅ Done  
**Depends on**: P4.1, P1.5  
**Goal**: Create `StartSession` and `FinishSession` use cases with tests.

#### Files
- `src/domain/usecases/StartSession.ts`:
  - Creates in-memory session with `crypto.randomUUID()`, `startedAt = new Date()`, `finishedAt = null`.
- `src/domain/usecases/FinishSession.ts`:
  - Stamps `finishedAt = new Date()`, calls `repo.save(session)`.
- Tests in `src/domain/usecases/__tests__/`:
  - `StartSession.test.ts`
  - `FinishSession.test.ts`

#### Acceptance Criteria
- [ ] Tests pass in Vitest.

---

### Story P4.3 — Supabase Workout Session Repository
**Status**: ✅ Done  
**Depends on**: P4.2, P1.4  
**Goal**: Persist workout sessions, exercise items, and logged sets to Supabase.

#### Files
- `src/infrastructure/supabase/types/WorkoutSessionRow.ts`
- `src/infrastructure/supabase/repositories/SupabaseWorkoutSessionRepository.ts`
  - Batch saves to `workout_sessions`, `session_exercises`, and `session_sets`.
  - `findAll()` orders by `started_at desc`.

#### Acceptance Criteria
- [ ] Full persistence and query capability.
- [ ] Zero presentation/UI dependencies.

---

## Epic 5 — Zustand State Stores

---

### Story P5.1 — Exercise Store
**Status**: ✅ Done  
**Goal**: Create `useExerciseStore` to fetch and hold the exercise catalog.

#### Steps
1. Install Zustand:
   ```bash
   npm install zustand
   ```
2. Create `src/presentation/stores/exerciseStore.ts`:
   - Instantiates `GetAllExercises` usecase with `SupabaseExerciseRepository`.
   - State: `exercises`, `loading`, `error`.
   - Action: `fetchExercises()`.

#### Acceptance Criteria
- [ ] Store uses proper selector patterns (no `?? []` creating unstable references).

---

### Story P5.2 — Routine & Plan Stores
**Status**: ✅ Done  
**Goal**: Create `useRoutineStore` and `usePlanStore` with full action sets.

#### Files
- `src/presentation/stores/routineStore.ts`
  - Actions: `fetchRoutines`, `createRoutine`, `updateRoutine`, `deleteRoutine`, `assignRoutineToPlan`, `removeFromPlan`
- `src/presentation/stores/planStore.ts`
  - Actions: `fetchPlans`, `createPlan`, `renamePlan`, `deletePlan`
  - Cross-store coordination: `deletePlan` calls `useRoutineStore.getState().fetchRoutines()`.

#### Acceptance Criteria
- [ ] Store state updates trigger UI re-renders cleanly.

---

### Story P5.3 — Routine Draft Store
**Status**: ✅ Done  
**Goal**: Create ephemeral `useRoutineDraftStore` for creating and editing routines.

#### File
- `src/presentation/stores/routineDraftStore.ts`
  - Types: `DraftExercise { exerciseId, exerciseName, order, sets, repsMin, repsMax }`
  - Actions: `setName`, `addExercises`, `removeExercise`, `updateExerciseSets`, `updateExerciseReps`, `loadFromRoutine`, `reset`.

#### Acceptance Criteria
- [ ] Does not persist (resets between creations).
- [ ] Avoids duplicate exercise entries in `addExercises`.

---

### Story P5.4 — Workout Session Store with IndexedDB Persist
**Status**: ✅ Done  
**Goal**: Create persistent `useWorkoutSessionStore` utilizing `idb-keyval` so active sessions survive browser refresh or app close.

#### Steps
1. Install `idb-keyval`:
   ```bash
   npm install idb-keyval
   ```
2. Create storage adapter in `src/presentation/stores/idbStorage.ts`:
   ```typescript
   import { get, set, del } from 'idb-keyval'
   import { StateStorage } from 'zustand/middleware'

   export const idbStorage: StateStorage = {
     getItem: async (name) => (await get(name)) ?? null,
     setItem: async (name, value) => { await set(name, value) },
     removeItem: async (name) => { await del(name) },
   }
   ```
3. Create `src/presentation/stores/workoutSessionStore.ts`:
   - Zustand `persist` with `name: 'workout-session'` and `idbStorage`.
   - Actions: `startFromRoutine`, `startEmpty`, `updateSet`, `toggleSetLogged`, `addSet`, `removeLastSet`, `addExercise`, `finishSession`, `discard`.

#### Acceptance Criteria
- [ ] State persists in IndexedDB upon reload.

---

## Epic 6 — Routine Library UI

---

### Story P6.1 — Routine Library Page & Cards
**Status**: ✅ Done  
**Goal**: Build `/routines` page rendering loose routines and plan folders.

#### Files
- `src/presentation/components/EmptyState.tsx`
- `src/presentation/components/RoutineCard.tsx` (name, exercises & sets count, menu button, start button)
- `src/presentation/components/PlanFolderCard.tsx` (collapsible/folder container with nested routine cards)
- `src/presentation/pages/RoutineLibraryPage.tsx`
  - Fetches routines and plans on mount.
  - Renders plans first, loose routines second.

#### Acceptance Criteria
- [ ] Displays empty state when library has no entries.
- [ ] Renders nested plan folders and loose routines correctly.

---

### Story P6.2 — Create Routine Page
**Status**: ✅ Done  
**Goal**: Build `/routines/new` form wired to `routineDraftStore`.

#### Files
- `src/presentation/components/SelectedExerciseRow.tsx`:
  - Exercise name + remove `✕`
  - Sets counter: `[-] N [+]` (1 to 10)
  - Reps range: `repsMin` and optional `repsMax`
- `src/presentation/pages/CreateRoutinePage.tsx`:
  - Name input
  - List of selected exercises
  - "+ Add Exercises" button (navigates to `/exercises/pick?mode=routine`)
  - "Save Routine" button (calls `routineStore.createRoutine`, resets draft, navigates back)

#### Acceptance Criteria
- [ ] Save button disabled if name is empty or exercise count is 0.
- [ ] Sets counter enforces 1 to 10 limits.

---

### Story P6.3 — Exercise Picker Page
**Status**: ✅ Done  
**Goal**: Build `/exercises/pick` supporting multi-selection and search, supporting both `routine` and `session` modes.

#### Files
- `src/presentation/components/ExerciseListItem.tsx` (name, equipment tag, selection checkmark)
- `src/presentation/pages/ExercisePickerPage.tsx`
  - Reads `?mode=routine` or `?mode=session` from URL search params.
  - Search input filtering exercises by name.
  - Grouped by `muscleGroup`.
  - Floating bottom button: `"Add N exercise(s)"`.
  - Mode dispatch: adds to `routineDraftStore` or `workoutSessionStore` respectively.

#### Acceptance Criteria
- [x] Search input filters list in real-time.
- [x] Already added exercises show "Added" and cannot be duplicated.

---

### Story P6.4 — Edit & Delete Routine
**Status**: ✅ Done  
**Goal**: Enable routine editing at `/routines/:id/edit` and deletion with confirmation.

#### Files
- `src/presentation/components/RoutineContextMenu.tsx` (Edit, Move/Remove plan, Delete)
- `src/presentation/pages/EditRoutinePage.tsx`
  - Reads `:id` from route params.
  - Loads routine into draft store on mount.
  - Submits via `routineStore.updateRoutine`.

#### Acceptance Criteria
- [x] Editing pre-fills existing routine name, exercises, sets, and reps.
- [x] Delete prompts confirmation and removes routine from list.

---

### Story P6.5 — Plan Folders Modals
**Status**: ✅ Done  
**Goal**: Create modals for plan creation, renaming, and assigning routines to plans.

#### Files
- `src/presentation/components/CreatePlanModal.tsx` (New Plan / Rename Plan bottom sheet modal)
- `src/presentation/components/AssignPlanModal.tsx` (Modal list of plans to assign routine)
- Wire into `RoutineLibraryPage` and `PlanFolderCard`.

#### Acceptance Criteria
- [x] User can create, rename, and delete plans.
- [x] User can move routines between plans or back to loose status.

---

## Epic 7 — Active Workout Session UI

---

### Story P7.1 — Start Session & Timer Header
**Status**: ✅ Done  
**Goal**: Wire "Start" button from RoutineCard, setup `/session` page with real-time timer and discard flow.

#### Files
- `src/presentation/pages/WorkoutSessionPage.tsx`
  - Header: Session title, live elapsed timer (`MM:SS`), Discard button.
  - Redirects to `/routines` if active session is null.
  - Discard shows confirm prompt, calls `sessionStore.discard()`.

#### Acceptance Criteria
- [x] Starting routine populates session store and navigates to `/session`.
- [x] Timer ticks accurately every second from `startedAt`.

---

### Story P7.2 — Log Sets UI (Exercise Card & Set Row)
**Status**: ✅ Done  
**Goal**: Build interactive set logging interface inside the active session.

#### Files
- `src/presentation/components/SessionSetRow.tsx`:
  - Set number label
  - Numeric weight input (`placeholder="0 kg"`)
  - Numeric reps input (`placeholder="0"`)
  - Logged check button: toggles green background and status
- `src/presentation/components/SessionExerciseCard.tsx`:
  - Exercise title
  - List of set rows
  - "+ Add Set" button
  - "Remove last set" button (visible when sets > 1)

#### Acceptance Criteria
- [x] Input changes update session store immediately.
- [x] Logged sets show prominent green confirmation styling.

---

### Story P7.3 — Add Exercise Mid-Session
**Status**: ✅ Done  
**Goal**: Allow adding ad-hoc exercises to an ongoing workout.

#### Changes
- Add `+ Add Exercise` button to `WorkoutSessionPage`.
- Navigates to `/exercises/pick?mode=session`.
- Confirming appends new exercise to active session with initial set row.

#### Acceptance Criteria
- [x] Mid-session added exercise renders in workout list immediately.

---

### Story P7.4 — Finish & Save Workout
**Status**: ✅ Done  
**Goal**: Finalize active session, convert logged sets to domain entity, and persist to Supabase.

#### Changes
- "Finish Workout" button on `WorkoutSessionPage`.
- Confirmation dialog.
- Invokes `sessionStore.finishSession()`.
- Shows saving spinner state.
- Stores saved session in ref for optional "Save as Routine" prompt.

#### Acceptance Criteria
- [x] Unlogged sets are filtered out or saved with `is_completed: false`.
- [x] Completed session saved in Supabase database.
- [x] Active session cleared from IndexedDB upon completion.

---

### Story P7.5 — Save Session as Routine Modal
**Status**: 🔲 TODO  
**Goal**: Allow user to save a completed workout as a reusable routine template.

#### Files
- `src/presentation/components/SaveAsRoutineModal.tsx`
  - Name input (auto-focused)
  - "Save Routine" and "Skip" buttons
- Wire flow in `WorkoutSessionPage` post-finish.

#### Acceptance Criteria
- [ ] Maps session exercises and set counts into a new routine.
- [ ] "Skip" returns directly to `/routines`.

---

## Epic 8 — Workout History UI

---

### Story P8.1 — Workout History List Page
**Status**: 🔲 TODO  
**Goal**: Build `/history` showing all logged workouts ordered by date.

#### Files
- `src/presentation/stores/workoutHistoryStore.ts` (`fetchSessions()`)
- `src/presentation/components/SessionSummaryCard.tsx` (Date, Routine name, duration in minutes, total sets count)
- `src/presentation/pages/WorkoutHistoryPage.tsx`

#### Acceptance Criteria
- [ ] Workouts sorted newest first.
- [ ] Clicking a card navigates to `/history/:id`.

---

### Story P8.2 — Session Detail Page
**Status**: 🔲 TODO  
**Goal**: Build `/history/:id` showing breakdown of all exercises and logged weight/reps for that session.

#### File
- `src/presentation/pages/SessionDetailPage.tsx`
  - Exercise cards displaying each set's logged weight × reps.
  - Back button returning to history.

#### Acceptance Criteria
- [ ] Shows accurate weight, reps, and exercise breakdown.

---

## Epic 9 — Progress Tracking UI

---

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

## Epic 10 — Authentication

---

### Story P10.1 — Auth Store & Login/Register Pages
**Status**: 🔲 TODO  
**Goal**: Authentication UI using Supabase Auth.

#### Files
- `src/presentation/stores/authStore.ts` (`user`, `signIn`, `signUp`, `signOut`, `loadSession`)
- `src/presentation/pages/LoginPage.tsx`
- `src/presentation/pages/RegisterPage.tsx`

#### Acceptance Criteria
- [ ] User can register and log in with email/password.
- [ ] Session persists in `localStorage`.

---

### Story P10.2 — Auth Guard & Navigation Profile
**Status**: 🔲 TODO  
**Goal**: Guard private routes and add sign-out option.

#### Files
- `src/presentation/components/ProtectedRoute.tsx`:
  - Redirects unauthenticated users to `/login`.
- Add logout button / profile tab in `BottomNav`.

#### Acceptance Criteria
- [ ] Direct access to `/routines`, `/history`, or `/session` while logged out redirects to `/login`.

---

### Story P10.3 — Link Records with `user_id`
**Status**: 🔲 TODO  
**Goal**: Ensure all created routines, plans, and sessions save the authenticated `user_id`.

#### Changes
- Update Supabase repositories (`save` methods) to include `user_id: supabase.auth.getUser()?.data?.user?.id ?? null`.

#### Acceptance Criteria
- [ ] Created records have valid `user_id` in database.

---

## Epic 11 — Custom Exercises (Post-MVP)

---

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

---

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

*Document finalized. Stack: Vite + React SPA + Tailwind CSS + Zustand + vite-plugin-pwa.*
