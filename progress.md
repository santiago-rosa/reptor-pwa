# Reptor PWA — Implementation Progress

Overall Progress: **29 / 37 stories completed** (78.4%)

---

## Epic 1 — Setup, PWA & Foundations
- [x] **Story P1.1 — Vite + React + Tailwind Initialization**
  - *Completed*: Vite initialized, Tailwind CSS v3 configured with dark mode base (`#030712`), strict TypeScript with path alias `@/*`, project structure created, `.env.local` created.
- [x] **Story P1.2 — PWA Configuration with `vite-plugin-pwa`**
  - *Completed*: `vite-plugin-pwa` configured with `autoUpdate`, web manifest generated with name, theme/background colors (`#030712`), icons (`icon-192.png`, `icon-512.png`), viewport meta tags added to `index.html`, service worker precaching generated in `dist/`.
- [x] **Story P1.3 — React Router & Bottom Navigation Shell**
  - *Completed*: `react-router-dom` installed, mobile-constrained `AppLayout` with fixed `BottomNav` (`/routines`, `/history`, `/progress`), `/` redirecting to `/routines`, fullscreen `/session` route created outside layout.
- [x] **Story P1.4 — Supabase Client Setup**
  - *Completed*: `@supabase/supabase-js` installed, `.env.local` and `.env.example` configured, initialized `src/infrastructure/supabase/client.ts` with local storage persistence and session handling. Strictly decoupled from domain and presentation layers.
- [x] **Story P1.5 — Vitest & Testing Environment**
  - *Completed*: Vitest, React Testing Library, JSDOM, and `@testing-library/jest-dom` installed and configured. Test setup file, npm test scripts, and smoke tests passing.

---

## Epic 2 — Domain Layer: Exercises
- [x] **Story P2.1 — Exercise Entity & Repository Interface**
  - *Completed*: Pure domain types `MuscleGroup`, `Equipment`, `ExerciseCategory` and interface `Exercise` created in `src/domain/entities/Exercise.ts`. Repository interface `IExerciseRepository` created in `src/domain/repositories/IExerciseRepository.ts`. Zero external dependencies.
- [x] **Story P2.2 — GetAllExercises Use Case & Unit Test**
  - *Completed*: Implemented `GetAllExercises` use case with dependency-injected `IExerciseRepository`. Unit tests written and passing for data retrieval and error propagation.
- [x] **Story P2.3 — Supabase Exercise Repository**
  - *Completed*: Defined `ExerciseRow` interface and implemented `SupabaseExerciseRepository` querying `exercises` ordered by `name asc` with snake_case to camelCase mapping to domain entity. Unit tests written and passing.

---

## Epic 3 — Domain Layer: Routines & Plans
- [x] **Story P3.1 — Routine & Plan Entities**
  - *Completed*: Created pure domain entities `Routine`, `RoutineExercise` in `src/domain/entities/Routine.ts` and `Plan` in `src/domain/entities/Plan.ts`. Zero external imports.
- [x] **Story P3.2 — Repository Interfaces & Input Types**
  - *Completed*: Created `IRoutineRepository` (with `CreateRoutineInput`, `UpdateRoutineInput`, `findAll`, `findById`, `save`, `update`, `delete`, `assignToPlan`) and `IPlanRepository` (with `CreatePlanInput`, `UpdatePlanInput`, `findAll`, `save`, `update`, `delete`). Strict domain contracts.
- [x] **Story P3.3 — Routine Use Cases & Tests**
  - *Completed*: Implemented `GetAllRoutines`, `CreateRoutine`, `UpdateRoutine`, `DeleteRoutine`, and `AssignRoutineToPlan` use cases with input validation and repository dependency injection. Unit test suites created and passing.
- [x] **Story P3.4 — Plan Use Cases & Tests**
  - *Completed*: Implemented `GetAllPlans`, `CreatePlan`, `UpdatePlan`, and `DeletePlan` use cases with validation and repository dependency injection. Unit tests created for plan creation, deletion, and validation.
- [x] **Story P3.5 — Supabase Routine & Plan Repositories**
  - *Completed*: Implemented `PlanRow`, `RoutineRow`, `RoutineExerciseRow`, `SupabasePlanRepository`, and `SupabaseRoutineRepository` with joined child exercise loading, sequential cascading inserts, and rollback on failure. Unit tests written and passing.

---

## Epic 4 — Domain Layer: Workout Session
- [x] **Story P4.1 — WorkoutSession Entity & Repository Interface**
  - *Completed*: Created pure domain entities `WorkoutSession`, `SessionExercise`, `SessionSet` in `src/domain/entities/WorkoutSession.ts` and repository contract `IWorkoutSessionRepository` with `save()`, `findById()`, and `findAll()`. Pure TypeScript, zero external dependencies.
- [x] **Story P4.2 — Session Use Cases & Tests**
  - *Completed*: Implemented `StartSession` (in-memory initialization with UUIDs and optional routine pre-population) and `FinishSession` (stamping `finishedAt` and saving via repository). Full unit test suites created and passing.
- [x] **Story P4.3 — Supabase Workout Session Repository**
  - *Completed*: Implemented `WorkoutSessionRow`, `SessionExerciseRow`, `SessionSetRow`, and `SupabaseWorkoutSessionRepository` supporting batch saves across `workout_sessions`, `session_exercises`, and `session_sets`, and querying ordered by `started_at desc`. Unit tests written and passing.

---

## Epic 5 — Zustand State Stores
- [x] **Story P5.1 — Exercise Store**
  - *Completed*: Installed `zustand`, created `useExerciseStore` wired to `GetAllExercises` and `SupabaseExerciseRepository`. State includes `exercises`, `loading`, `error`, and `fetchExercises(force?)`. Full unit test suite created and passing.
- [x] **Story P5.2 — Routine & Plan Stores**
  - *Completed*: Implemented `useRoutineStore` (fetch, create, update, delete, assign/remove plan) and `usePlanStore` (fetch, create, rename, delete with cross-store routine sync). Full unit test suites created and passing.
- [x] **Story P5.3 — Routine Draft Store**
  - *Completed*: Implemented ephemeral `useRoutineDraftStore` for creating and editing routines with duplicate-prevention, 1-10 set limits, reps configuration, routine loading, and clean reset. Full unit tests passing.
- [x] **Story P5.4 — Workout Session Store with IndexedDB Persist**
  - *Completed*: Installed `idb-keyval`, created `idbStorage` adapter with resilience fallback, and implemented `useWorkoutSessionStore` supporting `startFromRoutine`, `startEmpty`, `updateSet`, `toggleSetLogged`, `addSet`, `removeLastSet`, `addExercise`, `finishSession`, and `discard`. Full unit tests passing.

---

## Epic 6 — Routine Library UI
- [x] **Story P6.1 — Routine Library Page & Cards**
  - *Completed*: Implemented `EmptyState`, `RoutineCard` (exercises/sets summary, start button, menu button), `PlanFolderCard` (collapsible container with nested routines), and interactive `RoutineLibraryPage` wired to stores and navigation. Component tests passing.
- [x] **Story P6.2 — Create Routine Page**
  - *Completed*: Implemented `SelectedExerciseRow` (sets counter with 1-10 boundary limit, reps min/max inputs, remove button), `CreateRoutinePage` wired to `routineDraftStore` and `routineStore`, route `/routines/new` configured. Full component tests passing.
- [x] **Story P6.3 — Exercise Picker Page**
  - *Completed*: Created `ExerciseListItem` (name, equipment tag, selection checkmark, disabled state when already added) and `ExercisePickerPage` at `/exercises/pick` with real-time search, muscle group categorization, floating bottom button (`Add N exercise(s)`), and dual-mode dispatch (`routine` to `routineDraftStore`, `session` to `workoutSessionStore`). Unit and component tests written and passing.
- [x] **Story P6.4 — Edit & Delete Routine**
  - *Completed*: Created `RoutineContextMenu` (bottom sheet with Edit, Remove from Plan / Move to Plan, and Delete confirmation), `EditRoutinePage` at `/routines/:id/edit` (loading routine into draft store on mount, updating via `routineStore.updateRoutine`, with in-page delete confirmation option). Fully wired into `RoutineLibraryPage` and router. Unit and component tests written and passing.
- [x] **Story P6.5 — Plan Folders Modals**
  - *Completed*: Created `CreatePlanModal` (supports creating new plan and renaming existing plan), `AssignPlanModal` (lists available plans, provides option to remove plan association, allows jumping to create new plan), added folder menu to `PlanFolderCard` for inline rename and deletion, and added delete confirmation modal. Epic 6 is now 100% complete. Full unit and component tests passing.

---

## Epic 7 — Active Workout Session UI
- [x] **Story P7.1 — Start Session & Timer Header**
  - *Completed*: Implemented `WorkoutSessionPage` at `/session` featuring full-screen mobile layout, session title, live elapsed timer formatted as `MM:SS` (or `HH:MM:SS`) ticking every second from `startedAt`, auto-redirect to `/routines` when no active session exists, and confirmation modal before discarding active workout. Unit and component tests written and passing.
- [x] **Story P7.2 — Log Sets UI (Exercise Card & Set Row)**
  - *Completed*: Created `SessionSetRow` (weight & reps inputs, set number, completion check button with prominent emerald styling) and `SessionExerciseCard` (header with completed sets tally, column headers, "+ Add Set", and "Remove last set" buttons). Wired into `WorkoutSessionPage` with real-time reactive store updates. Comprehensive unit and component tests written and passing.
- [x] **Story P7.3 — Add Exercise Mid-Session**
  - *Completed*: Wired `+ Add Exercise` button in `WorkoutSessionPage` (both in active session and empty session) directing to `/exercises/pick?mode=session`. Added duplicate prevention in `workoutSessionStore` and UI disabled state in `ExercisePickerPage`. Successfully appends exercise with initial set row immediately. Tests written and passing.
- [x] **Story P7.4 — Finish & Save Workout**
  - *Completed*: Added "Finish" action to header and bottom of `WorkoutSessionPage`. Added warning confirmation modal when incomplete sets remain ("Finish Anyway" vs "Back to Workout"), saving spinner state, immediate submission via `useWorkoutSessionStore.finishSession()`, error banner handling, and automatic navigation to `/history`. Unit and component tests written and passing.
- [x] **Story P7.5 — Save Session as Routine Modal**
  - *Completed*: Created `SaveAsRoutineModal` with routine name input, optional plan selection, exercise summary preview with set counts, min/max reps derivation from logged sets, and "Save Routine" / "Skip" actions. Integrated into `WorkoutSessionPage` upon completing ad-hoc workouts (sessions without a `routineId`). Full unit and integration tests written and passing. Epic 7 is now 100% complete.

---

## Epic 8 — Workout History UI
- [x] **Story P8.1 — Workout History List Page**
  - *Completed*: Created `GetWorkoutHistory` domain use case, `useWorkoutHistoryStore` (sorting newest first by `startedAt`), `SessionSummaryCard` (displaying formatted date, workout title, duration, total sets, total volume, and exercise list), and `WorkoutHistoryPage` with skeleton loader, error retry banner, empty state, and list navigation to `/history/:id`. Unit and component tests written and passing.
- [x] **Story P8.2 — Session Detail Page**
  - *Completed*: Created `GetWorkoutSession` domain usecase, added `fetchSessionById` and `selectedSession` in `workoutHistoryStore`, created `SessionDetailPage` at `/history/:id` (with back button, header metrics for duration, sets, volume, and detailed exercise cards showing set numbers, weights, reps, set volume, and completed/skipped statuses), and wired the route into `App.tsx`. Unit and component tests written and passing. Epic 8 is now 100% complete.

---

## Epic 9 — Progress Tracking UI
- [ ] **Story P9.1 — Progress Page & Exercise Filter**
- [ ] **Story P9.2 — Recharts Line Visualization**

---

## Epic 10 — Authentication
- [x] **Story P10.1 — Auth Store & Login/Register Pages** – *Completed*: Implemented a Zustand auth store with Google OAuth, email/password sign‑in/up, sign‑out, session loading and refresh. Added `LoginPage` (Google + email form) and `RegisterPage` components, integrated `RequireAuth` guard, and verified all related tests pass.
- [ ] **Story P10.2 — Auth Guard & Navigation Profile**
- [ ] **Story P10.3 — Link Records with `user_id`**

---

## Epic 11 — Custom Exercises (Post-MVP)
- [ ] **Story P11.1 — Custom Exercise Domain & Schema Migration**
- [ ] **Story P11.2 — Custom Exercise Form & Management UI**

---

## Epic 12 — AI Progress Analysis (Gemini)
- [ ] **Story P12.1 — Supabase Edge Function for Gemini API**
- [ ] **Story P12.2 — AI Analysis UI on Progress Page**
