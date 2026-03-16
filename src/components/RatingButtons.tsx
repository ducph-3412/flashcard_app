import type { Rating } from '@/lib/types'

interface Props {
  disabled: boolean
  onRate: (rating: Rating) => void
}

const BUTTONS: { rating: Rating; label: string; key: string; color: string }[] = [
  { rating: 'again', label: 'Again', key: '1', color: 'bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300' },
  { rating: 'hard',  label: 'Hard',  key: '2', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200 active:bg-orange-300' },
  { rating: 'good',  label: 'Good',  key: '3', color: 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300' },
  { rating: 'easy',  label: 'Easy',  key: '4', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300' },
]

export default function RatingButtons({ disabled, onRate }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      {BUTTONS.map(({ rating, label, key, color }) => (
        <button
          key={rating}
          disabled={disabled}
          aria-label={`Rate ${label} (${key})`}
          onClick={() => onRate(rating)}
          className={`py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${color}`}
        >
          <span className="block">{label}</span>
          <span className="block text-xs opacity-60">{key}</span>
        </button>
      ))}
    </div>
  )
}
