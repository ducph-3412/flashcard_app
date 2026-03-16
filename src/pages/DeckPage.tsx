import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCards } from '@/hooks/useCards'
import { StorageAdapter } from '@/lib/storage'
import CardItem from '@/components/CardItem'

export default function DeckPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const navigate = useNavigate()
  const { cards, createCard, updateCard, deleteCard } = useCards(deckId ?? '')

  const [adding, setAdding] = useState(false)
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')

  // Get deck name for header
  const deck = StorageAdapter.getDecks().find((d) => d.id === deckId)

  function handleAdd() {
    if (front.trim() && back.trim()) {
      createCard(front.trim(), back.trim())
      setFront('')
      setBack('')
      setAdding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 shadow-sm z-10">
        <button onClick={() => navigate('/')} aria-label="Back" className="text-indigo-500 text-2xl leading-none">‹</button>
        <h1 className="flex-1 text-xl font-bold text-gray-900 text-center truncate">{deck?.name ?? 'Deck'}</h1>
        {/* spacer to balance the back button */}
        <div className="w-6" />
      </header>

      <main className="px-4 py-4 pb-36 space-y-3 max-w-lg mx-auto">
        {adding && (
          <div className="p-4 bg-white rounded-xl shadow-sm border border-indigo-200 space-y-2">
            <input
              className="w-full border-b border-gray-300 outline-none text-sm px-1 py-0.5"
              placeholder="Front (question)"
              value={front}
              autoFocus
              onChange={(e) => setFront(e.target.value)}
            />
            <input
              className="w-full border-b border-gray-300 outline-none text-sm px-1 py-0.5"
              placeholder="Back (answer)"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => { setAdding(false); setFront(''); setBack('') }} className="text-xs text-gray-500 px-3 py-1 rounded-lg border">Cancel</button>
              <button onClick={handleAdd} className="text-xs text-white bg-indigo-500 px-3 py-1 rounded-lg">Add Card</button>
            </div>
          </div>
        )}

        {cards.length === 0 && !adding ? (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <span className="text-4xl">🃏</span>
            <p className="text-gray-500 text-sm">No cards yet.<br/>Tap <strong>+</strong> below to add your first card.</p>
          </div>
        ) : (
          cards.map((card) => (
            <CardItem key={card.id} card={card} onEdit={updateCard} onDelete={deleteCard} />
          ))
        )}
      </main>

      {cards.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => navigate(`/deck/${deckId}/session`)}
              className="w-full py-3.5 rounded-xl bg-indigo-500 text-white font-semibold text-base hover:bg-indigo-600 active:bg-indigo-700 transition-colors shadow"
            >
              Start Session
            </button>
          </div>
        </div>
      )}

      {/* Centered FAB */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
        <button
          aria-label="Add card"
          onClick={() => setAdding(true)}
          className="pointer-events-auto w-14 h-14 flex items-center justify-center rounded-full bg-indigo-500 text-white text-3xl shadow-lg hover:bg-indigo-600 active:bg-indigo-700 transition-colors"
          style={{ marginBottom: cards.length > 0 ? '72px' : '0' }}
        >
          +
        </button>
      </div>
    </div>
  )
}
