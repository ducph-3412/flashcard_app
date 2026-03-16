# Tasks: Flashcard Learning App (Spaced Repetition)

**Input**: Design documents from `specs/001-flashcard-web/`  
**Prerequisites**: [plan.md](./plan.md) ✅ | [spec.md](./spec.md) ✅  
**Branch**: `001-flashcard-web`

> **TDD Rule (NON-NEGOTIABLE)**: For every implementation task that has a paired test task, the test task MUST be done first and the test MUST be red (failing) before you write any implementation code.

---

## Phase 1: Project Setup

**Purpose**: Initialize the Vite + React + TypeScript + TailwindCSS project and wire up the dev environment.

- [ ] T001 Scaffold Vite project in `flashcard_web/` using `npm create vite@latest . -- --template react-ts`
- [ ] T002 Install runtime dependencies: `react-router-dom`, `uuid`
- [ ] T003 [P] Install and configure TailwindCSS v3 (`tailwindcss`, `postcss`, `autoprefixer`); create `tailwind.config.ts` + update `vite.config.ts`
- [ ] T004 [P] Install dev/test dependencies: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- [ ] T005 Configure Vitest in `vite.config.ts` (jsdom environment, setupFiles for `@testing-library/jest-dom`)
- [ ] T006 [P] Create `tsconfig.json` with strict mode; add path alias `@/` → `src/`
- [ ] T007 [P] Create `index.html`, `src/main.tsx`, `src/App.tsx` skeleton (empty router shell)
- [ ] T008 Create `src/lib/types.ts` with all shared TypeScript interfaces: `Deck`, `Card`, `ReviewState`, `Rating`, `Session`

**Checkpoint**: `npm run dev` starts without errors; `npm test` runs and reports 0 tests (no failures).

---

## Phase 2: Core Contracts — Tests First, Then Implementation

**Purpose**: Pure-logic modules with no React dependency. Must be test-driven.

### SM-2 Algorithm

- [ ] T009 **[TEST FIRST]** Write `tests/unit/sm2.test.ts` — cover all four rating branches (`again`, `hard`, `good`, `easy`) for a new card and a previously-learned card; assert correct `interval`, `easeFactor`, `repetitions`, `lapses`, `dueDate`. Tests MUST be red before T010.
- [ ] T010 Implement `src/lib/sm2.ts` — pure `schedule(state: ReviewState, rating: Rating): ReviewState` function following SM-2 rules from plan.md. Pass T009.

### Storage Adapter

- [ ] T011 **[TEST FIRST]** Write `tests/unit/storage.test.ts` — round-trip tests for each entity type (decks, cards per deckId, reviewStates); test key naming convention `flashcard_v1_*`; test schema version guard; mock `localStorage` via `jsdom`. Tests MUST be red before T012.
- [ ] T012 Implement `src/lib/storage.ts` — `StorageAdapter` with `getDecks / saveDecks / getCards / saveCards / getReviewStates / saveReviewStates`. Pass T011.

**Checkpoint**: `npm test` is fully green on T009–T012 before any React work begins.

---

## Phase 3: User Story 1 – Create and Manage Decks (Priority: P1) 🎯

**Goal**: Home screen shows a deck list; user can create, rename, and delete decks. Deck + card data in localStorage.

**Independent Test**: Navigate home → create deck → confirm in list → delete → confirm gone (Playwright MCP E2E-01).

### Tests (write first)

- [ ] T013 **[TEST FIRST]** Write `tests/integration/useDecks.test.ts` — test `createDeck`, `renameDeck`, `deleteDeck` operations including cascade-delete of cards and review states; assert localStorage state after each operation; test hook re-renders correctly. Tests MUST be red before T014.

### Implementation

- [ ] T014 [US1] Implement `src/hooks/useDecks.ts` — `createDeck(name)`, `renameDeck(id, name)`, `deleteDeck(id)` backed by `StorageAdapter`. Pass T013.
- [ ] T015 [US1] Implement `src/components/DeckCard.tsx` — deck row showing name + due count badge (due count prop for now); inline rename input; delete button with confirmation.
- [ ] T016 [US1] Implement `src/pages/HomePage.tsx` — render list of `DeckCard` components from `useDecks`; "New Deck" button that prompts for name; navigate to `DeckPage` on deck tap.
- [ ] T017 [US1] Wire `HomePage` into `src/App.tsx` with React Router v6 (`HashRouter`; route `/` → `HomePage`).

**Checkpoint — US1**: App renders home screen with deck list; create/rename/delete persists after page refresh. Playwright MCP E2E-01 passes.

---

## Phase 4: User Story 2 – Create and Manage Cards (Priority: P1) 🎯

**Goal**: Inside a deck the user can add, edit, and delete Cards (front + back fields). Changes survive refresh.

**Independent Test**: Open deck → add card "Hello"/"Xin chào" → refresh → edit front → refresh → confirm change (Playwright MCP E2E-02).

### Tests (write first)

- [ ] T018 **[TEST FIRST]** Extend `tests/integration/useDecks.test.ts` (or new `useCards.test.ts`) — test `createCard`, `updateCard`, `deleteCard`; assert localStorage round-trip; assert `ReviewState` initialised for new cards with `interval=0`, `dueDate=today`. Tests MUST be red before T019.

### Implementation

- [ ] T019 [US2] Implement `src/hooks/useCards.ts` — `createCard(deckId, front, back)`, `updateCard(id, front, back)`, `deleteCard(id)`; on `createCard` initialise a `ReviewState` via `StorageAdapter`. Pass T018.
- [ ] T020 [US2] Implement `src/components/CardItem.tsx` — card row showing truncated front/back; edit button opens inline form; delete button with confirmation.
- [ ] T021 [US2] Implement `src/pages/DeckPage.tsx` — card list from `useCards`; "Add Card" button opens front/back form; "Start Session" CTA (disabled if 0 cards); back navigation to `HomePage`.
- [ ] T022 [US2] Add route `/deck/:deckId` → `DeckPage` in `App.tsx`; update `DeckCard` to navigate on click.

**Checkpoint — US2**: Deck page shows cards; add/edit/delete persists. Playwright MCP E2E-02 passes.

---

## Phase 5: User Story 3 – Practice Session (Priority: P1) 🎯

**Goal**: Start a session for a deck's due/new cards; reveal front→back; rate Again/Hard/Good/Easy; SM-2 reschedules card; summary screen at end.

**Independent Test**: 3 cards → start session → rate all → confirm due dates updated per SM-2 rules → summary shows correct breakdown (Playwright MCP E2E-03, E2E-04).

### Tests (write first)

- [ ] T023 **[TEST FIRST]** Write `tests/integration/useSession.test.ts`:
  - Build session queue from a set of due + new cards
  - `revealAnswer()` transitions state from `front` to `revealed`
  - `rateCard(rating)` applies SM-2 via `schedule()` and saves `ReviewState`
  - Rating `again` requeues card at end of current session queue
  - Session ends when queue is empty; `sessionSummary` contains per-rating counts
  - Tests MUST be red before T024.
- [ ] T024 **[TEST FIRST]** [P] Add unit tests to `tests/unit/sm2.test.ts` for edge cases: card never reviewed (new card first-time intervals), ease factor floor at 1.3, lapse counter increments on `again`.

### Implementation

- [ ] T025 [US3] Implement `src/hooks/useSession.ts` — `buildQueue(deckId)` filters cards by `dueDate ≤ today`; state machine: `{ phase: 'front'|'revealed'|'done', queue, currentIndex, summary }`; `revealAnswer()`, `rateCard(rating)`. Pass T023.
- [ ] T026 [US3] Implement `src/components/FlashCard.tsx` — displays front text; on reveal shows back text; smooth CSS transition (flip or fade).
- [ ] T027 [US3] Implement `src/components/RatingButtons.tsx` — four buttons (Again / Hard / Good / Easy); disabled + hidden until `phase === 'revealed'`; keyboard shortcuts 1–4.
- [ ] T028 [US3] Implement `src/components/SessionSummary.tsx` — shows total reviewed; per-rating count table (Again/Hard/Good/Easy); "Back to Deck" button.
- [ ] T029 [US3] Implement `src/pages/SessionPage.tsx` — progress bar (reviewed/total); renders `FlashCard` + "Show Answer" button + `RatingButtons`; transitions to `SessionSummary` when done. Spacebar = reveal.
- [ ] T030 [US3] Add route `/deck/:deckId/session` → `SessionPage` in `App.tsx`; wire "Start Session" CTA in `DeckPage`.

**Checkpoint — US3**: Full study loop works end-to-end. Playwright MCP E2E-03 and E2E-04 pass. SM-2 rescheduling verified in unit tests.

---

## Phase 6: User Story 4 – Due Count on Home Screen (Priority: P2)

**Goal**: Each deck row on the home screen shows the number of cards due today.

**Independent Test**: Add 5 cards → complete session with Good ratings → return home → due count updates (Playwright MCP E2E-05).

### Implementation

- [ ] T031 [US4] Add `getDueCount(deckId): number` to `src/lib/storage.ts` — counts `ReviewState` entries where `dueDate ≤ today` for given deck. Update `StorageAdapter` interface.
- [ ] T032 [US4] Update `src/hooks/useDecks.ts` to attach `dueCount` to each deck object returned.
- [ ] T033 [US4] Update `src/components/DeckCard.tsx` to render due count badge (e.g., orange pill); hide badge if count is 0.
- [ ] T034 [US4] Update `tests/integration/useDecks.test.ts` to assert `dueCount` is correct after creating cards and after simulating a day advancing.

**Checkpoint — US4**: Home screen reflects live due counts. Playwright MCP E2E-05 passes.

---

## Phase 7: User Story 5 – Data Persistence (Priority: P1)

**Goal**: All data survives hard page refresh and browser re-open. This phase mainly validates that T011–T012 (storage) are wired correctly end-to-end.

### Tests

- [ ] T035 [US5] Add integration test: create deck + 3 cards + complete session → `localStorage` snapshot → clear React state → reload from storage → assert identical state.
- [ ] T036 [US5] Add Vitest test for localStorage quota guard: mock `localStorage.setItem` to throw `QuotaExceededError`; assert `storage.ts` catches it and returns a typed error result.

### Implementation

- [ ] T037 [US5] Implement quota guard in `src/lib/storage.ts` — wrap all `setItem` calls; on `QuotaExceededError` return `{ ok: false, error: 'quota_exceeded' }`.
- [ ] T038 [US5] Add a non-blocking toast/banner component in `src/App.tsx` that surfaces the quota error to the user.

**Checkpoint — US5**: Data round-trip test green. Playwright MCP E2E-07 passes (hard refresh retains all data).

---

## Phase 8: Quality & Polish

**Purpose**: Accessibility, empty states, responsive layout, and Playwright MCP E2E sign-off.

- [ ] T039 [P] Empty state — `HomePage`: "No decks yet. Tap + to create your first deck." illustration/message.
- [ ] T040 [P] Empty state — `DeckPage`: "No cards in this deck yet. Tap + to add your first card."
- [ ] T041 [P] Empty state — `SessionPage` (0 due cards): "Nothing due today! Come back tomorrow." with next due date hint.
- [ ] T042 Add ARIA labels to all interactive elements; ensure keyboard navigability (Tab order, Enter/Space triggers).
- [ ] T043 Responsive smoke-test at 375 px, 768 px, 1280 px viewports manually via Playwright MCP browser resize (E2E-06).
- [ ] T044 [P] Add `<meta name="viewport">`, PWA-friendly `<head>` tags, app title "Flashcards" in `index.html`.
- [ ] T045 Run full Playwright MCP E2E suite (E2E-01 through E2E-07); fix any regressions.
- [ ] T046 Final `npm test` — all unit + integration tests green; no TypeScript errors (`npm run tsc --noEmit`).

**Checkpoint — DONE**: All acceptance scenarios from spec.md verified; all tests green; Playwright MCP E2E-01–07 pass.

---

## Task Summary

| Phase | Tasks | Parallel-eligible | TDD tasks |
|---|---|---|---|
| 1 – Setup | T001–T008 | T003, T004, T006, T007 | — |
| 2 – Core contracts | T009–T012 | T009+T011 (write tests together) | T009, T011 |
| 3 – US1 Decks | T013–T017 | T015 | T013 |
| 4 – US2 Cards | T018–T022 | — | T018 |
| 5 – US3 Session | T023–T030 | T024 | T023, T024 |
| 6 – US4 Due count | T031–T034 | T031 | T034 |
| 7 – US5 Persistence | T035–T038 | T036 | T035, T036 |
| 8 – Polish | T039–T046 | T039, T040, T041, T044 | — |
| **Total** | **46** | **14** | **9** |
