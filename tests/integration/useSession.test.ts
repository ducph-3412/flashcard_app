import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSession } from '@/hooks/useSession'
import { StorageAdapter } from '@/lib/storage'
import { today } from '@/lib/sm2'
import type { Card, ReviewState } from '@/lib/types'

function makeCard(id: string, deckId = 'd1'): Card {
  return {
    id, deckId,
    front: `Front ${id}`, back: `Back ${id}`,
    createdAt: '2026-03-16T00:00:00Z',
    updatedAt: '2026-03-16T00:00:00Z',
  }
}

function makeState(cardId: string, dueDate = today()): ReviewState {
  return { cardId, interval: 4, easeFactor: 2.5, repetitions: 2, dueDate, lapses: 0 }
}

beforeEach(() => localStorage.clear())

describe('useSession — buildQueue', () => {
  it('only includes cards with dueDate <= today', () => {
    const cards = [makeCard('c1'), makeCard('c2')]
    StorageAdapter.saveCards('d1', cards)
    StorageAdapter.saveReviewStates({
      c1: makeState('c1', today()),
      c2: makeState('c2', '2099-01-01'),
    })
    const { result } = renderHook(() => useSession('d1'))
    act(() => { result.current.startSession() })
    expect(result.current.queue).toHaveLength(1)
    expect(result.current.queue[0]).toBe('c1')
  })

  it('includes new cards with no review state', () => {
    StorageAdapter.saveCards('d1', [makeCard('c1')])
    // No review state saved for c1
    const { result } = renderHook(() => useSession('d1'))
    act(() => { result.current.startSession() })
    expect(result.current.queue).toHaveLength(1)
  })

  it('phase starts as front', () => {
    StorageAdapter.saveCards('d1', [makeCard('c1')])
    StorageAdapter.saveReviewStates({ c1: makeState('c1') })
    const { result } = renderHook(() => useSession('d1'))
    act(() => { result.current.startSession() })
    expect(result.current.phase).toBe('front')
  })
})

describe('useSession — revealAnswer', () => {
  it('transitions phase from front to revealed', () => {
    StorageAdapter.saveCards('d1', [makeCard('c1')])
    StorageAdapter.saveReviewStates({ c1: makeState('c1') })
    const { result } = renderHook(() => useSession('d1'))
    act(() => { result.current.startSession() })
    act(() => { result.current.revealAnswer() })
    expect(result.current.phase).toBe('revealed')
  })
})

describe('useSession — rateCard', () => {
  it('advances to next card and returns phase to front', () => {
    const cards = [makeCard('c1'), makeCard('c2')]
    StorageAdapter.saveCards('d1', cards)
    StorageAdapter.saveReviewStates({
      c1: makeState('c1'),
      c2: makeState('c2'),
    })
    const { result } = renderHook(() => useSession('d1'))
    act(() => { result.current.startSession() })
    act(() => { result.current.revealAnswer() })
    act(() => { result.current.rateCard('good') })
    expect(result.current.phase).toBe('front')
    expect(result.current.currentCardId).toBe('c2')
  })

  it('saves updated ReviewState to localStorage', () => {
    StorageAdapter.saveCards('d1', [makeCard('c1')])
    StorageAdapter.saveReviewStates({ c1: makeState('c1') })
    const { result } = renderHook(() => useSession('d1'))
    act(() => { result.current.startSession() })
    act(() => { result.current.revealAnswer() })
    act(() => { result.current.rateCard('easy') })
    const states = StorageAdapter.getReviewStates()
    expect(states['c1'].interval).toBeGreaterThan(4)
  })

  it('again re-queues card at end of session', () => {
    const cards = [makeCard('c1'), makeCard('c2')]
    StorageAdapter.saveCards('d1', cards)
    StorageAdapter.saveReviewStates({
      c1: makeState('c1'),
      c2: makeState('c2'),
    })
    const { result } = renderHook(() => useSession('d1'))
    act(() => { result.current.startSession() })
    act(() => { result.current.revealAnswer() })
    act(() => { result.current.rateCard('again') })
    // c1 should be re-queued; current should now be c2
    expect(result.current.currentCardId).toBe('c2')
    // and queue should still contain c1 at end
    expect(result.current.queue).toContain('c1')
  })
})

describe('useSession — session end', () => {
  it('phase transitions to done when all cards rated (no again)', () => {
    StorageAdapter.saveCards('d1', [makeCard('c1')])
    StorageAdapter.saveReviewStates({ c1: makeState('c1') })
    const { result } = renderHook(() => useSession('d1'))
    act(() => { result.current.startSession() })
    act(() => { result.current.revealAnswer() })
    act(() => { result.current.rateCard('good') })
    expect(result.current.phase).toBe('done')
  })

  it('summary contains correct per-rating counts', () => {
    const cards = [makeCard('c1'), makeCard('c2'), makeCard('c3')]
    StorageAdapter.saveCards('d1', cards)
    StorageAdapter.saveReviewStates({
      c1: makeState('c1'),
      c2: makeState('c2'),
      c3: makeState('c3'),
    })
    const { result } = renderHook(() => useSession('d1'))
    act(() => { result.current.startSession() })
    // rate c1 good
    act(() => { result.current.revealAnswer() })
    act(() => { result.current.rateCard('good') })
    // rate c2 easy
    act(() => { result.current.revealAnswer() })
    act(() => { result.current.rateCard('easy') })
    // rate c3 hard
    act(() => { result.current.revealAnswer() })
    act(() => { result.current.rateCard('hard') })
    expect(result.current.summary.good).toBe(1)
    expect(result.current.summary.easy).toBe(1)
    expect(result.current.summary.hard).toBe(1)
    expect(result.current.summary.total).toBe(3)
  })
})
