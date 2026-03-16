import { describe, it, expect } from 'vitest'
import { schedule } from '@/lib/sm2'
import type { ReviewState } from '@/lib/types'

const TODAY = '2026-03-16'

function newState(cardId = 'c1'): ReviewState {
  return {
    cardId,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    dueDate: TODAY,
    lapses: 0,
  }
}

function learnedState(cardId = 'c1'): ReviewState {
  return {
    cardId,
    interval: 4,
    easeFactor: 2.5,
    repetitions: 2,
    dueDate: TODAY,
    lapses: 0,
  }
}

describe('schedule — new card (first review)', () => {
  it('again → interval=1, repetitions=0, lapses=1, ef decreases', () => {
    const result = schedule(newState(), 'again')
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(0)
    expect(result.lapses).toBe(1)
    expect(result.easeFactor).toBeLessThan(2.5)
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('hard → interval=1, ef decreases slightly', () => {
    const result = schedule(newState(), 'hard')
    expect(result.interval).toBe(1)
    expect(result.easeFactor).toBeLessThan(2.5)
  })

  it('good → interval=4', () => {
    const result = schedule(newState(), 'good')
    expect(result.interval).toBe(4)
    expect(result.repetitions).toBe(1)
  })

  it('easy → interval=7, ef increases', () => {
    const result = schedule(newState(), 'easy')
    expect(result.interval).toBe(7)
    expect(result.easeFactor).toBeGreaterThan(2.5)
    expect(result.repetitions).toBe(1)
  })
})

describe('schedule — learned card', () => {
  it('again → interval=1, repetitions reset, lapses++, ef floor at 1.3', () => {
    const state = learnedState()
    const result = schedule(state, 'again')
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(0)
    expect(result.lapses).toBe(1)
    expect(result.easeFactor).toBeLessThan(2.5)
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('hard → interval = interval × 1.2 (rounded), ef decreases', () => {
    const state = learnedState()
    const result = schedule(state, 'hard')
    expect(result.interval).toBe(Math.round(4 * 1.2))
    expect(result.easeFactor).toBeLessThan(2.5)
    expect(result.repetitions).toBe(3)
  })

  it('good → interval = interval × ef (rounded)', () => {
    const state = learnedState()
    const result = schedule(state, 'good')
    expect(result.interval).toBe(Math.round(4 * 2.5))
    expect(result.repetitions).toBe(3)
    expect(result.easeFactor).toBeCloseTo(2.5)
  })

  it('easy → interval = interval × ef × 1.3, ef increases', () => {
    const state = learnedState()
    const result = schedule(state, 'easy')
    expect(result.interval).toBe(Math.round(4 * 2.5 * 1.3))
    expect(result.easeFactor).toBeCloseTo(2.65)
    expect(result.repetitions).toBe(3)
  })

  it('ef never drops below 1.3 after multiple again ratings', () => {
    let state = learnedState()
    for (let i = 0; i < 10; i++) {
      state = schedule(state, 'again')
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3)
  })
})

describe('schedule — dueDate', () => {
  it('dueDate is set to today + interval days', () => {
    const result = schedule(newState(), 'good')
    const due = new Date(result.dueDate)
    const today = new Date(TODAY)
    const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
    expect(diff).toBe(result.interval)
  })
})
