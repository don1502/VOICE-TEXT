import { useRef, useState } from 'react'
import { processAudio } from '../services/api'

interface FileUploadProps {
  onProcessingStart: () => void
  onProcessingComplete: (transcription: string, response: string) => void
  onError: (error: string) => void
  isProcessing: boolean
}

export default function FileUpload({
  onProcessingStart,
  onProcessingComplete,
  onError,
  isProcessing,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState<boolean>(false)

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('audio/')) {
      onError('Please select an audio file (MP3, WAV, M4A, etc.)')
      return
    }

    // Validate file size (max 25MB for Whisper API)
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (file.size > maxSize) {
      onError('File size must be less than 25MB')
      return
    }

    try {
      onProcessingStart()

      const formData = new FormData()
      formData.append('file', file)

      const result = await processAudio(formData)
      
      onProcessingComplete(result.transcription, result.response)
    } catch (error) {
      console.error('Error processing file:', error)
      onError(
        error instanceof Error
          ? error.message
          : 'Failed to process audio file. Please try again.'
      )
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 hover:border-primary-400'
      } ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !isProcessing && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleChange}
        className="hidden"
        disabled={isProcessing}
      />

      <svg
        className="w-12 h-12 mx-auto text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>

      <p className="text-gray-600 mb-2">
        <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
      </p>
      <p className="text-sm text-gray-500">
        Audio files only (MP3, WAV, M4A, WEBM, etc.) - Max 25MB
      </p>
    </div>
  )
}

