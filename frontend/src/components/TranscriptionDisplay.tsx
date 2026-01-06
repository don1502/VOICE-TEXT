interface TranscriptionDisplayProps {
  transcription: string
  onClear: () => void
}

export default function TranscriptionDisplay({
  transcription,
  onClear,
}: TranscriptionDisplayProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Transcription
        </h2>
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear
        </button>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
          {transcription || 'No transcription available'}
        </p>
      </div>
    </div>
  )
}

