import { useState, useRef, useEffect } from 'react'
import { processAudio } from '../services/api'

interface AudioRecorderProps {
  onProcessingStart: () => void
  onProcessingComplete: (transcription: string, response: string) => void
  onError: (error: string) => void
  isProcessing: boolean
}

export default function AudioRecorder({
  onProcessingStart,
  onProcessingComplete,
  onError,
  isProcessing,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordingTime, setRecordingTime] = useState<number>(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        })

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }

        // Process the audio
        await handleAudioProcessing(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      onError('Failed to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const handleAudioProcessing = async (audioBlob: Blob) => {
    try {
      onProcessingStart()

      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')

      const result = await processAudio(formData)
      
      onProcessingComplete(result.transcription, result.response)
    } catch (error) {
      console.error('Error processing audio:', error)
      onError(
        error instanceof Error
          ? error.message
          : 'Failed to process audio. Please try again.'
      )
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`btn-primary ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {isRecording ? (
            <>
              <svg
                className="w-5 h-5 inline-block mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 9a1 1 0 10-2 0v2a1 1 0 102 0V9z"
                  clipRule="evenodd"
                />
              </svg>
              Stop Recording
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 inline-block mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              Start Recording
            </>
          )}
        </button>

        {isRecording && (
          <div className="flex items-center gap-2 text-red-600 font-semibold">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span>{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {!isRecording && (
        <p className="text-sm text-gray-500 text-center">
          Click "Start Recording" to begin capturing audio from your microphone
        </p>
      )}
    </div>
  )
}

