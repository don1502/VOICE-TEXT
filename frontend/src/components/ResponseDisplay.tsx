interface ResponseDisplayProps {
  response: string
}

export default function ResponseDisplay({ response }: ResponseDisplayProps) {
  return (
    <div className="card bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg
          className="w-6 h-6 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        AI Response
      </h2>
      <div className="bg-white/70 rounded-lg p-4 border border-primary-100">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
          {response}
        </p>
      </div>
    </div>
  )
}

