import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDecks } from '@/hooks/useDecks'
import DeckCard from '@/components/DeckCard'

export default function HomePage() {
  const { decks, createDeck, renameDeck, deleteDeck } = useDecks()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  function handleAdd() {
    if (newName.trim()) {
      createDeck(newName.trim())
      setNewName('')
      setAdding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 shadow-sm z-10">
        <h1 className="text-xl font-bold text-gray-900 text-center">Flashcards</h1>
      </header>

      <main className="px-4 py-4 pb-28 space-y-3 max-w-lg mx-auto">
        {adding && (
          <div className="flex gap-2 items-center p-3 bg-white rounded-xl shadow-sm border border-indigo-200">
            <input
              className="flex-1 outline-none text-base px-1 py-0.5"
              placeholder="Deck name…"
              value={newName}
              autoFocus
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') { setAdding(false); setNewName('') }
              }}
            />
            <button onClick={handleAdd} className="text-sm text-white bg-indigo-500 px-3 py-1.5 rounded-lg">Add</button>
            <button onClick={() => { setAdding(false); setNewName('') }} className="text-sm text-gray-500 px-2 py-1.5 rounded-lg">✕</button>
          </div>
        )}

        {decks.length === 0 && !adding && (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <span className="text-4xl">📚</span>
            <p className="text-gray-500 text-sm">No decks yet.<br/>Tap <strong>+</strong> below to create your first deck.</p>
          </div>
        )}

        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onClick={() => navigate(`/deck/${deck.id}`)}
            onRename={renameDeck}
            onDelete={deleteDeck}
          />
        ))}
      </main>

      {/* Centered FAB */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
        <button
          aria-label="New deck"
          onClick={() => setAdding(true)}
          className="pointer-events-auto w-14 h-14 flex items-center justify-center rounded-full bg-indigo-500 text-white text-3xl shadow-lg hover:bg-indigo-600 active:bg-indigo-700 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  )
}
