import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

export interface ProcessAudioResponse {
  success: boolean
  transcription: string
  response: string
  message: string
}

export interface TranscribeResponse {
  success: boolean
  transcription: string
  message: string
}

export interface GenerateResponseRequest {
  text: string
}

export interface GenerateResponseResponse {
  success: boolean
  response: string
  message: string
}

export const processAudio = async (
  formData: FormData
): Promise<ProcessAudioResponse> => {
  try {
    const response = await api.post<ProcessAudioResponse>(
      '/api/process-audio',
      formData
    )
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail ||
          error.message ||
          'Failed to process audio'
      )
    }
    throw new Error('Failed to process audio')
  }
}

export const transcribeAudio = async (
  formData: FormData
): Promise<TranscribeResponse> => {
  try {
    const response = await api.post<TranscribeResponse>(
      '/api/transcribe',
      formData
    )
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail ||
          error.message ||
          'Failed to transcribe audio'
      )
    }
    throw new Error('Failed to transcribe audio')
  }
}

export const generateResponse = async (
  text: string
): Promise<GenerateResponseResponse> => {
  try {
    const response = await api.post<GenerateResponseResponse>(
      '/api/generate-response',
      { text } as GenerateResponseRequest
    )
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail ||
          error.message ||
          'Failed to generate response'
      )
    }
    throw new Error('Failed to generate response')
  }
}

