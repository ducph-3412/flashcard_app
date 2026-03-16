import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { StorageAdapter } from '@/lib/storage'
import { today } from '@/lib/sm2'
import type { Deck } from '@/lib/types'

export interface DeckWithCount extends Deck {
  dueCount: number
}

function loadDecks(): DeckWithCount[] {
  const decks = StorageAdapter.getDecks()
  const asOf = today()
  return decks.map((d) => ({
    ...d,
    dueCount: StorageAdapter.getDueCount(d.id, asOf),
  }))
}

export function useDecks() {
  const [decks, setDecks] = useState<DeckWithCount[]>(loadDecks)

  const refresh = useCallback(() => setDecks(loadDecks()), [])

  const createDeck = useCallback((name: string) => {
    const deck: Deck = {
      id: uuidv4(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    }
    const existing = StorageAdapter.getDecks()
    StorageAdapter.saveDecks([...existing, deck])
    refresh()
  }, [refresh])

  const renameDeck = useCallback((id: string, name: string) => {
    const updated = StorageAdapter.getDecks().map((d) =>
      d.id === id ? { ...d, name: name.trim() } : d,
    )
    StorageAdapter.saveDecks(updated)
    refresh()
  }, [refresh])

  const deleteDeck = useCallback((id: string) => {
    // Cascade: remove cards key and their review states
    const cards = StorageAdapter.getCards(id)
    const states = StorageAdapter.getReviewStates()
    cards.forEach((c) => { delete states[c.id] })
    StorageAdapter.saveReviewStates(states)
    StorageAdapter.saveCards(id, [])

    const updated = StorageAdapter.getDecks().filter((d) => d.id !== id)
    StorageAdapter.saveDecks(updated)
    refresh()
  }, [refresh])

  return { decks, createDeck, renameDeck, deleteDeck, refresh }
}
