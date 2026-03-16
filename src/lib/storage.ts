import type { Card, Deck, ReviewState, StorageResult } from './types'
import { today } from './sm2'

// ─── Key schema ──────────────────────────────────────────────────────────────
const KEYS = {
  decks: 'flashcard_v1_decks',
  cards: (deckId: string) => `flashcard_v1_cards_${deckId}`,
  reviewStates: 'flashcard_v1_review_states',
} as const

// ─── Internal helpers ────────────────────────────────────────────────────────

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown): StorageResult<void> {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return { ok: true, value: undefined }
  } catch {
    return { ok: false, error: 'quota_exceeded' }
  }
}

// ─── Public adapter ──────────────────────────────────────────────────────────

export const StorageAdapter = {
  // Decks
  getDecks(): Deck[] {
    return safeGet<Deck[]>(KEYS.decks, [])
  },
  saveDecks(decks: Deck[]): StorageResult<void> {
    return safeSet(KEYS.decks, decks)
  },

  // Cards
  getCards(deckId: string): Card[] {
    return safeGet<Card[]>(KEYS.cards(deckId), [])
  },
  saveCards(deckId: string, cards: Card[]): StorageResult<void> {
    return safeSet(KEYS.cards(deckId), cards)
  },

  // ReviewStates
  getReviewStates(): Record<string, ReviewState> {
    return safeGet<Record<string, ReviewState>>(KEYS.reviewStates, {})
  },
  saveReviewStates(states: Record<string, ReviewState>): StorageResult<void> {
    return safeSet(KEYS.reviewStates, states)
  },

  // Due count helper
  getDueCount(deckId: string, asOf: string = today()): number {
    const cards = this.getCards(deckId)
    const states = this.getReviewStates()
    return cards.filter((c) => {
      const rs = states[c.id]
      if (!rs) return true // new card, always due
      return rs.dueDate <= asOf
    }).length
  },


} as const
