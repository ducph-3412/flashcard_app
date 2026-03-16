import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { StorageAdapter } from '@/lib/storage'
import { today } from '@/lib/sm2'
import type { Card, ReviewState } from '@/lib/types'

export function useCards(deckId: string) {
  const [cards, setCards] = useState<Card[]>(() => StorageAdapter.getCards(deckId))

  const refresh = useCallback(
    () => setCards(StorageAdapter.getCards(deckId)),
    [deckId],
  )

  const createCard = useCallback(
    (front: string, back: string) => {
      const now = new Date().toISOString()
      const card: Card = {
        id: uuidv4(),
        deckId,
        front: front.trim(),
        back: back.trim(),
        createdAt: now,
        updatedAt: now,
      }
      const existing = StorageAdapter.getCards(deckId)
      StorageAdapter.saveCards(deckId, [...existing, card])

      // Initialise ReviewState
      const rs: ReviewState = {
        cardId: card.id,
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
        dueDate: today(),
        lapses: 0,
      }
      const states = StorageAdapter.getReviewStates()
      StorageAdapter.saveReviewStates({ ...states, [card.id]: rs })

      refresh()
    },
    [deckId, refresh],
  )

  const updateCard = useCallback(
    (id: string, front: string, back: string) => {
      const updated = StorageAdapter.getCards(deckId).map((c) =>
        c.id === id
          ? { ...c, front: front.trim(), back: back.trim(), updatedAt: new Date().toISOString() }
          : c,
      )
      StorageAdapter.saveCards(deckId, updated)
      refresh()
    },
    [deckId, refresh],
  )

  const deleteCard = useCallback(
    (id: string) => {
      const updated = StorageAdapter.getCards(deckId).filter((c) => c.id !== id)
      StorageAdapter.saveCards(deckId, updated)

      const states = StorageAdapter.getReviewStates()
      delete states[id]
      StorageAdapter.saveReviewStates(states)

      refresh()
    },
    [deckId, refresh],
  )

  return { cards, createCard, updateCard, deleteCard, refresh }
}
