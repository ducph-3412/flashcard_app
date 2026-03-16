import { describe, it, expect, beforeEach } from 'vitest'
import { StorageAdapter } from '@/lib/storage'
import type { Deck, Card, ReviewState } from '@/lib/types'

const deck1: Deck = { id: 'd1', name: 'English', createdAt: '2026-03-16T00:00:00Z' }
const deck2: Deck = { id: 'd2', name: 'Math', createdAt: '2026-03-16T00:00:00Z' }

const card1: Card = {
  id: 'c1', deckId: 'd1',
  front: 'Hello', back: 'Xin chào',
  createdAt: '2026-03-16T00:00:00Z', updatedAt: '2026-03-16T00:00:00Z',
}

const rs1: ReviewState = {
  cardId: 'c1', interval: 4, easeFactor: 2.5,
  repetitions: 2, dueDate: '2026-03-20', lapses: 0,
}

describe('StorageAdapter — decks', () => {
  beforeEach(() => localStorage.clear())

  it('getDecks returns [] when storage is empty', () => {
    expect(StorageAdapter.getDecks()).toEqual([])
  })

  it('saveDecks + getDecks round-trips correctly', () => {
    StorageAdapter.saveDecks([deck1, deck2])
    expect(StorageAdapter.getDecks()).toEqual([deck1, deck2])
  })

  it('uses key flashcard_v1_decks', () => {
    StorageAdapter.saveDecks([deck1])
    expect(localStorage.getItem('flashcard_v1_decks')).not.toBeNull()
  })

  it('overwrites on second save', () => {
    StorageAdapter.saveDecks([deck1, deck2])
    StorageAdapter.saveDecks([deck1])
    expect(StorageAdapter.getDecks()).toHaveLength(1)
  })
})

describe('StorageAdapter — cards', () => {
  beforeEach(() => localStorage.clear())

  it('getCards returns [] for unknown deckId', () => {
    expect(StorageAdapter.getCards('d999')).toEqual([])
  })

  it('saveCards + getCards round-trips per deckId', () => {
    StorageAdapter.saveCards('d1', [card1])
    expect(StorageAdapter.getCards('d1')).toEqual([card1])
  })

  it('uses key flashcard_v1_cards_<deckId>', () => {
    StorageAdapter.saveCards('d1', [card1])
    expect(localStorage.getItem('flashcard_v1_cards_d1')).not.toBeNull()
  })

  it('different deckIds are isolated', () => {
    StorageAdapter.saveCards('d1', [card1])
    expect(StorageAdapter.getCards('d2')).toEqual([])
  })
})

describe('StorageAdapter — reviewStates', () => {
  beforeEach(() => localStorage.clear())

  it('getReviewStates returns {} when empty', () => {
    expect(StorageAdapter.getReviewStates()).toEqual({})
  })

  it('saveReviewStates + getReviewStates round-trips', () => {
    StorageAdapter.saveReviewStates({ c1: rs1 })
    expect(StorageAdapter.getReviewStates()).toEqual({ c1: rs1 })
  })

  it('uses key flashcard_v1_review_states', () => {
    StorageAdapter.saveReviewStates({ c1: rs1 })
    expect(localStorage.getItem('flashcard_v1_review_states')).not.toBeNull()
  })
})

describe('StorageAdapter — getDueCount', () => {
  beforeEach(() => localStorage.clear())

  it('returns 0 when no cards exist', () => {
    expect(StorageAdapter.getDueCount('d1', '2026-03-16')).toBe(0)
  })

  it('counts cards with dueDate <= today', () => {
    StorageAdapter.saveCards('d1', [card1])
    StorageAdapter.saveReviewStates({
      c1: { ...rs1, dueDate: '2026-03-16' },
    })
    expect(StorageAdapter.getDueCount('d1', '2026-03-16')).toBe(1)
  })

  it('does not count cards due in the future', () => {
    StorageAdapter.saveCards('d1', [card1])
    StorageAdapter.saveReviewStates({
      c1: { ...rs1, dueDate: '2026-03-20' },
    })
    expect(StorageAdapter.getDueCount('d1', '2026-03-16')).toBe(0)
  })
})

describe('StorageAdapter — quota guard', () => {
  it('returns ok:false on QuotaExceededError', () => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => { throw new DOMException('QuotaExceededError') }
    const result = StorageAdapter.saveDecks([deck1])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('quota_exceeded')
    Storage.prototype.setItem = original
  })
})
