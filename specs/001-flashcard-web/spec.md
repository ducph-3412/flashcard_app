# Feature Specification: Flashcard Learning App (Spaced Repetition)

**Feature Branch**: `001-flashcard-web`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "Xây dựng app học Flashcards với lịch ôn theo spaced repetition. Người dùng tạo Deck và Card, luyện tập theo phiên (session), chấm mức độ nhớ (Again/Hard/Good/Easy) để hệ thống lên lịch ôn tự động. Lưu data vào browser local storage. UI minimalist + modern using TailwindCSS. Mobile first layout."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Create and Manage Decks (Priority: P1)

A user opens the app and creates a new Deck (e.g., "English Vocabulary"). They can rename and delete decks. The deck list is shown on the home screen.

**Why this priority**: Decks are the top-level container for all content; nothing else can work without them.

**Independent Test**: Navigate to the home screen → create a deck → confirm it appears in the list → delete it → confirm it is removed.

**Acceptance Scenarios**:

1. **Given** no decks exist, **When** the user taps "New Deck" and enters a name, **Then** the deck appears in the deck list with a card count of 0.
2. **Given** a deck exists, **When** the user renames it, **Then** the new name is shown everywhere the deck appears.
3. **Given** a deck exists, **When** the user deletes it, **Then** the deck and all its cards are removed and are no longer accessible.

---

### User Story 2 – Create and Manage Cards inside a Deck (Priority: P1)

A user opens a deck and adds flashcards, each with a Front (question/prompt) and Back (answer). They can edit and delete individual cards.

**Why this priority**: Cards are the atomic learning unit; the practice flow depends on them.

**Independent Test**: Open a deck → add a card with front "Hello" and back "Xin chào" → confirm it appears → edit the front text → confirm the edit persists after page refresh.

**Acceptance Scenarios**:

1. **Given** an open deck, **When** the user taps "Add Card" and fills in front/back, **Then** the card is saved and listed in the deck.
2. **Given** an existing card, **When** the user edits front or back, **Then** the updated text persists in localStorage after a page refresh.
3. **Given** an existing card, **When** the user deletes it, **Then** it is removed from the deck and no longer scheduled.

---

### User Story 3 – Practice Session (Spaced Repetition Review) (Priority: P1)

A user starts a study session for a deck. Cards due today (or new cards) are shown one at a time — Front first, then Back on reveal. The user rates their recall: **Again / Hard / Good / Easy**. The system reschedules each card using a spaced repetition algorithm (SM-2 or similar). The session ends when all due cards have been rated.

**Why this priority**: This is the core learning loop; it is the main value proposition of the app.

**Independent Test**: Add 3 cards to a deck → start a session → reveal and rate each card → confirm each card receives a future due date consistent with the rating → confirm session ends with a summary screen.

**Acceptance Scenarios**:

1. **Given** a deck with due cards, **When** the user starts a session, **Then** only due/new cards are shown, in a queue.
2. **Given** a card is shown front-side up, **When** the user taps "Show Answer", **Then** the back is revealed along with the four rating buttons.
3. **Given** the user rates a card "Again", **Then** it is re-queued in the current session (due again shortly).
4. **Given** the user rates a card "Good", **Then** its next review date is extended according to the SM-2 interval.
5. **Given** the user rates a card "Easy", **Then** its interval is increased more aggressively.
6. **Given** all cards have been rated, **Then** a session-complete screen shows the count of cards reviewed and their breakdown by rating.

---

### User Story 4 – Due Count & Home Screen Overview (Priority: P2)

On the home screen each deck shows how many cards are due for review today, giving the user an at-a-glance study agenda.

**Why this priority**: Motivates daily usage; users need to know what needs attention without opening each deck.

**Independent Test**: Create a deck and add 5 cards → advance the simulated date by 1 day → confirm the home screen shows "5 due" for that deck.

**Acceptance Scenarios**:

1. **Given** a deck has cards with today's due date, **When** the home screen loads, **Then** the due count is shown next to the deck name.
2. **Given** a deck has no cards due, **Then** the due count shows 0 (or is hidden).

---

### User Story 5 – Data Persistence via localStorage (Priority: P1)

All decks, cards, and scheduling data are stored in the browser's localStorage; no server is required. Data survives page refresh and browser restart.

**Why this priority**: Foundational non-functional requirement; without it nothing survives a reload.

**Independent Test**: Create a deck and cards, rate some cards in a session → refresh the page → confirm all data (decks, cards, intervals, due dates) is intact.

**Acceptance Scenarios**:

1. **Given** the user creates decks/cards and completes a session, **When** they refresh the page, **Then** all data is restored correctly.
2. **Given** the app is opened in the same browser after being closed, **Then** all previously saved data is available.

---

### Edge Cases

- What happens when a deck has 0 cards and the user tries to start a session? → Show a friendly empty-state message, no session starts.
- What happens when localStorage is full or unavailable? → Display a non-blocking warning; app degrades gracefully.
- What happens when the user navigates away mid-session? → Session progress is preserved in state; re-entering the session resumes from where they left off (or restarts, clearly communicated).
- What happens to cards that are never rated "Good/Easy" (perpetual "Again")? → They stay in the session queue with a short retry interval (e.g., 1 minute) and are never silently dropped.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create, rename, and delete Decks.
- **FR-002**: System MUST allow users to create, edit, and delete Cards (front + back) within a Deck.
- **FR-003**: System MUST present a study session showing only cards that are due (new or past due date).
- **FR-004**: System MUST reveal the card Back only after the user explicitly requests it ("Show Answer").
- **FR-005**: System MUST accept a rating (Again / Hard / Good / Easy) for each reviewed card.
- **FR-006**: System MUST compute the next review interval and due date using the SM-2 spaced repetition algorithm.
- **FR-007**: System MUST persist all data (decks, cards, scheduling state) to browser localStorage.
- **FR-008**: System MUST display the number of due cards per deck on the home screen.
- **FR-009**: System MUST show a session-complete summary upon finishing all due cards.
- **FR-010**: System MUST requeue "Again"-rated cards within the current session.
- **FR-011**: UI MUST be mobile-first, responsive, minimalist, and built with TailwindCSS.

### Key Entities

- **Deck**: Represents a study collection. Fields: `id`, `name`, `createdAt`.
- **Card**: Belongs to one Deck. Fields: `id`, `deckId`, `front`, `back`, `createdAt`, `updatedAt`.
- **ReviewState**: Scheduling metadata per Card. Fields: `cardId`, `interval` (days), `easeFactor`, `repetitions`, `dueDate`, `lapses`.
- **Session**: Transient runtime state. Fields: `deckId`, `queue` (ordered card ids), `currentIndex`, `ratings` (map cardId → rating).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create a deck and add their first card in under 30 seconds on a mobile device.
- **SC-002**: A practice session for 20 due cards completes with no UI errors or data loss.
- **SC-003**: After 5 consecutive daily sessions, the due dates for "Good"-rated cards visibly increase (demonstrating the spaced repetition schedule is working).
- **SC-004**: All data survives 10 consecutive page refreshes with no corruption.
- **SC-005**: The home screen loads and renders in under 500 ms with 50 decks in localStorage.
- **SC-006**: The app is fully functional on Chrome/Firefox/Safari on a 375 px viewport (iPhone SE-class screen).
