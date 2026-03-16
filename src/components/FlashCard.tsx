interface Props {
  front: string
  back: string
  revealed: boolean
}

export default function FlashCard({ front, back, revealed }: Props) {
  return (
    <div className="w-full min-h-48 flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-md border border-gray-100 text-center transition-all duration-300">
      <p className="text-xl font-semibold text-gray-900 leading-relaxed">{front}</p>
      {revealed && (
        <>
          <hr className="w-16 border-gray-200 my-4" />
          <p className="text-lg text-gray-600 leading-relaxed">{back}</p>
        </>
      )}
    </div>
  )
}
