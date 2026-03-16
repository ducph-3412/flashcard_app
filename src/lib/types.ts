// ─── Domain types ────────────────────────────────────────────────────────────

export interface Deck {
  id: string
  name: string
  createdAt: string // ISO 8601
}

export interface Card {
  id: string
  deckId: string
  front: string
  back: string
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

export type Rating = 'again' | 'hard' | 'good' | 'easy'

export interface ReviewState {
  cardId: string
  interval: number   // days until next review; 0 = new
  easeFactor: number // default 2.5
  repetitions: number
  dueDate: string    // ISO 8601 date string (YYYY-MM-DD)
  lapses: number
}

// ─── Session ─────────────────────────────────────────────────────────────────

export type SessionPhase = 'front' | 'revealed' | 'done'

export interface SessionSummary {
  again: number
  hard: number
  good: number
  easy: number
  total: number
}

export interface Session {
  deckId: string
  queue: string[]       // ordered cardIds still to review
  currentIndex: number
  ratings: Record<string, Rating>
  phase: SessionPhase
  summary: SessionSummary
}

// ─── Storage result ──────────────────────────────────────────────────────────

export type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: 'quota_exceeded' | 'parse_error' }
