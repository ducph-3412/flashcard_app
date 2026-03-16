import { useState } from 'react'
import type { DeckWithCount } from '@/hooks/useDecks'

interface Props {
  deck: DeckWithCount
  onClick: () => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export default function DeckCard({ deck, onClick, onRename, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(deck.name)

  function handleRename() {
    if (name.trim() && name.trim() !== deck.name) {
      onRename(deck.id, name.trim())
    }
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors">
      {editing ? (
        <input
          className="flex-1 border-b border-indigo-400 outline-none text-base font-medium mr-2 px-1"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
        />
      ) : (
        <button
          className="flex-1 text-left"
          onClick={onClick}
        >
          <span className="text-base font-medium text-gray-900">{deck.name}</span>
        </button>
      )}

      <div className="flex items-center gap-2 ml-2 shrink-0">
        {deck.dueCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
            {deck.dueCount} due
          </span>
        )}
        <button
          aria-label="Rename deck"
          className="p-1.5 text-gray-400 hover:text-indigo-500 rounded-lg"
          onClick={() => { setName(deck.name); setEditing(true) }}
        >
          ✏️
        </button>
        <button
          aria-label="Delete deck"
          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
          onClick={() => {
            if (confirm(`Delete "${deck.name}" and all its cards?`)) {
              onDelete(deck.id)
            }
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
