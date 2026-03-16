import type { Rating, ReviewState } from './types'

const EF_MIN = 1.3

/** Add `days` to an ISO date string, return new YYYY-MM-DD string */
function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Today as YYYY-MM-DD (UTC) */
export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Pure SM-2 scheduling function.
 * Returns a new ReviewState with updated interval, easeFactor, repetitions,
 * lapses, and dueDate. Does not mutate the input.
 */
export function schedule(state: ReviewState, rating: Rating): ReviewState {
  const isNew = state.repetitions === 0 && state.interval === 0

  let { interval, easeFactor, repetitions, lapses } = state

  switch (rating) {
    case 'again': {
      lapses += 1
      repetitions = 0
      interval = 1
      easeFactor = Math.max(EF_MIN, easeFactor - 0.2)
      break
    }
    case 'hard': {
      if (isNew) {
        interval = 1
      } else {
        interval = Math.round(interval * 1.2)
      }
      easeFactor = Math.max(EF_MIN, easeFactor - 0.15)
      repetitions += 1
      break
    }
    case 'good': {
      if (isNew) {
        interval = 4
      } else {
        interval = Math.round(interval * easeFactor)
      }
      repetitions += 1
      // easeFactor unchanged for good
      break
    }
    case 'easy': {
      if (isNew) {
        interval = 7
      } else {
        interval = Math.round(interval * easeFactor * 1.3)
      }
      easeFactor = easeFactor + 0.15
      repetitions += 1
      break
    }
  }

  const dueDate = addDays(today(), interval)

  return { ...state, interval, easeFactor, repetitions, lapses, dueDate }
}
