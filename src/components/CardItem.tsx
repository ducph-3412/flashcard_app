import { useState } from 'react'
import type { Card } from '@/lib/types'

interface Props {
  card: Card
  onEdit: (id: string, front: string, back: string) => void
  onDelete: (id: string) => void
}

export default function CardItem({ card, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [front, setFront] = useState(card.front)
  const [back, setBack] = useState(card.back)

  function handleSave() {
    if (front.trim() && back.trim()) {
      onEdit(card.id, front.trim(), back.trim())
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="p-4 bg-white rounded-xl shadow-sm border border-indigo-200 space-y-2">
        <input
          className="w-full border-b border-gray-300 outline-none text-sm px-1 py-0.5"
          placeholder="Front"
          value={front}
          autoFocus
          onChange={(e) => setFront(e.target.value)}
        />
        <input
          className="w-full border-b border-gray-300 outline-none text-sm px-1 py-0.5"
          placeholder="Back"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <div className="flex gap-2 justify-end pt-1">
          <button
            className="text-xs text-gray-500 px-3 py-1 rounded-lg border"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
          <button
            className="text-xs text-white bg-indigo-500 px-3 py-1 rounded-lg"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{card.front}</p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{card.back}</p>
      </div>
      <div className="flex gap-1 ml-2 shrink-0">
        <button aria-label="Edit card" className="p-1.5 text-gray-400 hover:text-indigo-500" onClick={() => { setFront(card.front); setBack(card.back); setEditing(true) }}>✏️</button>
        <button aria-label="Delete card" className="p-1.5 text-gray-400 hover:text-red-500" onClick={() => { if (confirm('Delete this card?')) onDelete(card.id) }}>🗑️</button>
      </div>
    </div>
  )
}
