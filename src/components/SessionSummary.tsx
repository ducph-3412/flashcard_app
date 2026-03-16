import type { SessionSummary } from '@/lib/types'

interface Props {
  summary: SessionSummary
  onBack: () => void
}

const ROWS = [
  { key: 'again' as const, label: 'Again', color: 'text-red-600' },
  { key: 'hard'  as const, label: 'Hard',  color: 'text-orange-600' },
  { key: 'good'  as const, label: 'Good',  color: 'text-green-600' },
  { key: 'easy'  as const, label: 'Easy',  color: 'text-blue-600' },
]

export default function SessionSummary({ summary, onBack }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4 max-w-sm mx-auto">
      <div className="text-4xl">🎉</div>
      <h2 className="text-xl font-bold text-gray-900">Session complete!</h2>
      <p className="text-gray-500 text-sm">{summary.total} card{summary.total !== 1 ? 's' : ''} reviewed</p>

      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {ROWS.map(({ key, label, color }) => (
          <div key={key} className="flex justify-between items-center px-5 py-3">
            <span className={`text-sm font-medium ${color}`}>{label}</span>
            <span className="text-sm font-semibold text-gray-700">{summary[key]}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 active:bg-indigo-700 transition-colors"
      >
        Back to Deck
      </button>
    </div>
  )
}
