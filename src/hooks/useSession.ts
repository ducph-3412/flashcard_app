import { useState, useCallback } from 'react'
import { StorageAdapter } from '@/lib/storage'
import { schedule, today } from '@/lib/sm2'
import type { Rating, SessionPhase, SessionSummary } from '@/lib/types'

function emptySummary(): SessionSummary {
  return { again: 0, hard: 0, good: 0, easy: 0, total: 0 }
}

export function useSession(deckId: string) {
  const [queue, setQueue] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<SessionPhase>('front')
  const [summary, setSummary] = useState<SessionSummary>(emptySummary)

  const currentCardId = queue[currentIndex] ?? null

  const startSession = useCallback(() => {
    const cards = StorageAdapter.getCards(deckId)
    const states = StorageAdapter.getReviewStates()
    const asOf = today()
    const due = cards
      .filter((c) => {
        const rs = states[c.id]
        if (!rs) return true
        return rs.dueDate <= asOf
      })
      .map((c) => c.id)
    setQueue(due)
    setCurrentIndex(0)
    setPhase(due.length > 0 ? 'front' : 'done')
    setSummary(emptySummary())
  }, [deckId])

  const revealAnswer = useCallback(() => {
    setPhase('revealed')
  }, [])

  const rateCard = useCallback(
    (rating: Rating) => {
      const cardId = queue[currentIndex]
      if (!cardId) return

      // Apply SM-2
      const states = StorageAdapter.getReviewStates()
      const existing = states[cardId] ?? {
        cardId, interval: 0, easeFactor: 2.5, repetitions: 0,
        dueDate: today(), lapses: 0,
      }
      const updated = schedule(existing, rating)
      StorageAdapter.saveReviewStates({ ...states, [cardId]: updated })

      // Update summary
      setSummary((prev) => ({
        ...prev,
        [rating]: prev[rating] + 1,
        total: prev.total + 1,
      }))

      // Build next queue
      setQueue((prevQueue) => {
        let nextQueue = prevQueue.slice() // copy

        if (rating === 'again') {
          // Remove from current position, re-append at end
          nextQueue.splice(currentIndex, 1)
          nextQueue.push(cardId)
        } else {
          nextQueue.splice(currentIndex, 1)
        }

        const nextIndex = currentIndex < nextQueue.length ? currentIndex : 0
        setCurrentIndex(nextIndex)
        setPhase(nextQueue.length === 0 ? 'done' : 'front')

        return nextQueue
      })
    },
    [queue, currentIndex],
  )

  return {
    queue,
    currentCardId,
    currentIndex,
    phase,
    summary,
    startSession,
    revealAnswer,
    rateCard,
  }
}
