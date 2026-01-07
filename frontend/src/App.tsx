import { useState } from 'react'
import AudioRecorder from './components/AudioRecorder'
import TranscriptionDisplay from './components/TranscriptionDisplay'
import ResponseDisplay from './components/ResponseDisplay'
import FileUpload from './components/FileUpload'

function App() {
  const [transcription, setTranscription] = useState<string>('')
  const [response, setResponse] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleProcessingStart = () => {
    setIsProcessing(true)
    setError(null)
    setResponse('')
  }

  const handleProcessingComplete = (transcriptionText: string, aiResponse: string) => {
    setTranscription(transcriptionText)
    setResponse(aiResponse)
    setIsProcessing(false)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setIsProcessing(false)
  }

  const handleClear = () => {
    setTranscription('')
    setResponse('')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Voice-to-Text AI Agent
          </h1>
          <p className="text-gray-600">
            Intelligent voice transcription with AI-powered responses
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Audio Input Section */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Record or Upload Audio
            </h2>
            <div className="space-y-4">
              <AudioRecorder
                onProcessingStart={handleProcessingStart}
                onProcessingComplete={handleProcessingComplete}
                onError={handleError}
                isProcessing={isProcessing}
              />
              <div className="text-center text-gray-500">or</div>
              <FileUpload
                onProcessingStart={handleProcessingStart}
                onProcessingComplete={handleProcessingComplete}
                onError={handleError}
                isProcessing={isProcessing}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="card bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-blue-800 font-medium">
                  Processing audio... This may take a moment.
                </p>
              </div>
            </div>
          )}

          {/* Transcription Display */}
          {transcription && (
            <TranscriptionDisplay
              transcription={transcription}
              onClear={handleClear}
            />
          )}

          {/* AI Response Display */}
          {response && (
            <ResponseDisplay response={response} />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>AI Agent for Voice-to-Text💻</p>
        </footer>
      </div>
    </div>
  )
}

export default App
