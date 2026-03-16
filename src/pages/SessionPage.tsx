import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { StorageAdapter } from '@/lib/storage'
import FlashCard from '@/components/FlashCard'
import RatingButtons from '@/components/RatingButtons'
import SessionSummaryComponent from '@/components/SessionSummary'

export default function SessionPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const navigate = useNavigate()
  const { queue, currentCardId, phase, summary, startSession, revealAnswer, rateCard } = useSession(deckId ?? '')

  useEffect(() => {
    startSession()
  }, [startSession])

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase === 'front' && e.code === 'Space') { e.preventDefault(); revealAnswer() }
      if (phase === 'revealed') {
        if (e.key === '1') rateCard('again')
        if (e.key === '2') rateCard('hard')
        if (e.key === '3') rateCard('good')
        if (e.key === '4') rateCard('easy')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, revealAnswer, rateCard])

  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 shadow-sm z-10">
          <h1 className="text-xl font-bold text-gray-900 text-center">Done!</h1>
        </header>
        <SessionSummaryComponent summary={summary} onBack={() => navigate(`/deck/${deckId}`)} />
      </div>
    )
  }

  // No cards due — compute next due date
  if (!currentCardId && phase === 'front') {
    const allCards = StorageAdapter.getCards(deckId ?? '')
    const states = StorageAdapter.getReviewStates()
    const futureDates = allCards
      .map((c) => states[c.id]?.dueDate)
      .filter((d): d is string => !!d)
      .sort()
    const nextDue = futureDates[0]

    function formatNextDue(dateStr: string) {
      const due = new Date(dateStr)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      due.setHours(0, 0, 0, 0)
      const diffMs = due.getTime() - today.getTime()
      const diffDays = Math.round(diffMs / 86400000)
      if (diffDays === 1) return 'tomorrow'
      if (diffDays <= 7) return `in ${diffDays} days`
      return due.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <span className="text-5xl">🌟</span>
        <p className="text-gray-700 font-semibold text-lg text-center">Nothing due today!</p>
        {nextDue ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Next review</p>
            <p className="text-indigo-600 font-bold text-base">{formatNextDue(nextDue)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(nextDue).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center">Come back tomorrow to keep your streak.</p>
        )}
        <button onClick={() => navigate(`/deck/${deckId}`)} className="mt-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold">Back to Deck</button>
      </div>
    )
  }

  const cards = StorageAdapter.getCards(deckId ?? '')
  const currentCard = cards.find((c) => c.id === currentCardId)
  const reviewed = summary.total
  const total = queue.length + reviewed - (phase === 'revealed' ? 0 : 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 shadow-sm z-10">
        <button onClick={() => navigate(`/deck/${deckId}`)} aria-label="Back" className="text-indigo-500 text-2xl leading-none">✕</button>
        <div className="flex-1">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-400 rounded-full transition-all duration-300"
              style={{ width: total > 0 ? `${(reviewed / (total + reviewed)) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">{reviewed} / {reviewed + queue.length} reviewed</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-5 px-4 py-6 max-w-lg mx-auto w-full">
        {currentCard && (
          <FlashCard front={currentCard.front} back={currentCard.back} revealed={phase === 'revealed'} />
        )}

        {phase === 'front' ? (
          <button
            onClick={revealAnswer}
            className="w-full py-4 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-base shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            Show Answer <span className="text-xs text-gray-400 ml-1">(Space)</span>
          </button>
        ) : (
          <RatingButtons disabled={phase !== 'revealed'} onRate={rateCard} />
        )}
      </main>
    </div>
  )
}
