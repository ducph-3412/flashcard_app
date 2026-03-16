# 🃏 Flashcards — Spaced Repetition Learning App

A minimalist, mobile-first flashcard app with **SM-2 spaced repetition** scheduling. No server required — everything lives in your browser's `localStorage`.

Built with React 18 · TypeScript · Vite · TailwindCSS · Vitest.

---

## Features

- **Decks & Cards** — create, rename, and delete decks; add, edit, and delete cards (front / back)
- **SM-2 Spaced Repetition** — rate each card Again / Hard / Good / Easy; the algorithm schedules the next review automatically
- **Daily Sessions** — only cards due today are shown; "Again"-rated cards are re-queued within the session
- **Due count badges** — home screen shows how many cards are due per deck at a glance
- **Next review date** — when nothing is due, the app tells you exactly when to come back
- **Offline & zero-backend** — all data persisted to `localStorage`; no account, no server
- **Mobile-first UI** — centered FAB, fixed bottom actions, responsive at 375 px → desktop
- **3 starter decks** — Japanese Vocabulary, Agentic Coding Terms, Inspirational Q&A (30 cards each, seeded on first load)

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
# → http://localhost:5173
```

Open the app in your browser. The three starter decks are created automatically on first load.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check + production bundle → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run all tests (Vitest, single run) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run tsc` | TypeScript type-check only (no emit) |

---

## Project Structure

```
flashcard_web/
├── src/
│   ├── lib/
│   │   ├── types.ts        # Shared TypeScript interfaces
│   │   ├── sm2.ts          # Pure SM-2 scheduling algorithm
│   │   ├── storage.ts      # localStorage adapter
│   │   └── seed.ts         # Default deck / card seed data
│   ├── hooks/
│   │   ├── useDecks.ts     # Deck CRUD + due counts
│   │   ├── useCards.ts     # Card CRUD + ReviewState init
│   │   └── useSession.ts   # Session state machine
│   ├── components/
│   │   ├── DeckCard.tsx
│   │   ├── CardItem.tsx
│   │   ├── FlashCard.tsx
│   │   ├── RatingButtons.tsx
│   │   └── SessionSummary.tsx
│   ├── pages/
│   │   ├── HomePage.tsx    # Deck list
│   │   ├── DeckPage.tsx    # Card list + Start Session
│   │   └── SessionPage.tsx # Study session UI
│   └── App.tsx             # Hash-based router
├── tests/
│   ├── unit/
│   │   ├── sm2.test.ts
│   │   └── storage.test.ts
│   └── integration/
│       ├── useDecks.test.ts
│       └── useSession.test.ts
└── specs/
    └── 001-flashcard-web/
        ├── spec.md   # Feature specification
        ├── plan.md   # Implementation plan & contracts
        └── tasks.md  # Task breakdown
```

---

## SM-2 Scheduling Rules

| Rating | Effect |
|---|---|
| **Again** | interval = 1 day, repetitions reset, ease factor − 0.2 (min 1.3) |
| **Hard** | interval × 1.2, ease factor − 0.15 |
| **Good** | interval × ease factor (standard SM-2) |
| **Easy** | interval × ease factor × 1.3, ease factor + 0.15 |

New cards get intervals of 1 / 1 / 4 / 7 days for Again / Hard / Good / Easy on first review.

---

## Keyboard Shortcuts (Session)

| Key | Action |
|---|---|
| `Space` | Reveal answer |
| `1` | Rate Again |
| `2` | Rate Hard |
| `3` | Rate Good |
| `4` | Rate Easy |

---

## localStorage Schema

All keys are prefixed `flashcard_v1_` to allow future migrations.

| Key | Contents |
|---|---|
| `flashcard_v1_decks` | `Deck[]` |
| `flashcard_v1_cards_<deckId>` | `Card[]` |
| `flashcard_v1_review_states` | `Record<cardId, ReviewState>` |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Language | TypeScript (strict) |
| Build | Vite 6 |
| Styling | TailwindCSS v3 |
| Routing | React Router v6 (hash-based) |
| Testing | Vitest + React Testing Library |
| IDs | uuid v4 |

---

## Spec-Driven Development

This project was built using the [GitHub Spec Kit](https://github.com/github/spec-kit) workflow:

```
/speckit.constitution → /speckit.specify → /speckit.plan → /speckit.tasks → /speckit.implement
```

All specification documents live in [`specs/001-flashcard-web/`](specs/001-flashcard-web/).
