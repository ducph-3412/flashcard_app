import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDecks } from '@/hooks/useDecks'
import { useCards } from '@/hooks/useCards'
import { StorageAdapter } from '@/lib/storage'

beforeEach(() => localStorage.clear())

describe('useDecks — createDeck', () => {
  it('creates a deck and returns it in the list', () => {
    const { result } = renderHook(() => useDecks())
    act(() => { result.current.createDeck('English') })
    expect(result.current.decks).toHaveLength(1)
    expect(result.current.decks[0].name).toBe('English')
  })

  it('persists deck to localStorage', () => {
    const { result } = renderHook(() => useDecks())
    act(() => { result.current.createDeck('Math') })
    expect(StorageAdapter.getDecks()).toHaveLength(1)
  })

  it('creates deck with dueCount 0', () => {
    const { result } = renderHook(() => useDecks())
    act(() => { result.current.createDeck('English') })
    expect(result.current.decks[0].dueCount).toBe(0)
  })
})

describe('useDecks — renameDeck', () => {
  it('renames an existing deck', () => {
    const { result } = renderHook(() => useDecks())
    act(() => { result.current.createDeck('Old Name') })
    const id = result.current.decks[0].id
    act(() => { result.current.renameDeck(id, 'New Name') })
    expect(result.current.decks[0].name).toBe('New Name')
  })

  it('persists rename to localStorage', () => {
    const { result } = renderHook(() => useDecks())
    act(() => { result.current.createDeck('Old') })
    const id = result.current.decks[0].id
    act(() => { result.current.renameDeck(id, 'New') })
    expect(StorageAdapter.getDecks()[0].name).toBe('New')
  })
})

describe('useDecks — deleteDeck', () => {
  it('removes the deck from the list', () => {
    const { result } = renderHook(() => useDecks())
    act(() => { result.current.createDeck('ToDelete') })
    const id = result.current.decks[0].id
    act(() => { result.current.deleteDeck(id) })
    expect(result.current.decks).toHaveLength(0)
  })

  it('cascade-deletes cards from localStorage', () => {
    const { result } = renderHook(() => useDecks())
    act(() => { result.current.createDeck('WithCards') })
    const deckId = result.current.decks[0].id
    // Add a card
    const { result: cardsResult2 } = renderHook(() => useCards(deckId))
    act(() => { cardsResult2.current.createCard('front', 'back') })
    expect(StorageAdapter.getCards(deckId)).toHaveLength(1)
    // Delete deck
    act(() => { result.current.deleteDeck(deckId) })
    expect(StorageAdapter.getCards(deckId)).toHaveLength(0)
  })
})

describe('useDecks — reloads from localStorage on mount', () => {
  it('new hook instance reads persisted state', () => {
    const { result: r1 } = renderHook(() => useDecks())
    act(() => { r1.current.createDeck('Persistent') })
    const { result: r2 } = renderHook(() => useDecks())
    expect(r2.current.decks[0].name).toBe('Persistent')
  })
})

describe('useCards — createCard', () => {
  it('creates a card in the deck', () => {
    const { result } = renderHook(() => useCards('d1'))
    act(() => { result.current.createCard('Hello', 'Xin chào') })
    expect(result.current.cards).toHaveLength(1)
    expect(result.current.cards[0].front).toBe('Hello')
  })

  it('initialises a ReviewState with dueDate today', () => {
    const { result } = renderHook(() => useCards('d1'))
    act(() => { result.current.createCard('Q', 'A') })
    const states = StorageAdapter.getReviewStates()
    const rs = states[result.current.cards[0].id]
    expect(rs).toBeDefined()
    expect(rs.interval).toBe(0)
  })
})

describe('useCards — updateCard', () => {
  it('updates front and back', () => {
    const { result } = renderHook(() => useCards('d1'))
    act(() => { result.current.createCard('Old Front', 'Old Back') })
    const id = result.current.cards[0].id
    act(() => { result.current.updateCard(id, 'New Front', 'New Back') })
    expect(result.current.cards[0].front).toBe('New Front')
    expect(result.current.cards[0].back).toBe('New Back')
  })
})

describe('useCards — deleteCard', () => {
  it('removes card and its review state', () => {
    const { result } = renderHook(() => useCards('d1'))
    act(() => { result.current.createCard('Q', 'A') })
    const id = result.current.cards[0].id
    act(() => { result.current.deleteCard(id) })
    expect(result.current.cards).toHaveLength(0)
    expect(StorageAdapter.getReviewStates()[id]).toBeUndefined()
  })
})
