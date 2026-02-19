import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface AgentResponse {
  success: boolean
  action: string
  intent: string
  message: string
  details: Record<string, string>
  parsed: {
    to?: string
    subject?: string
    body?: string
  }
}

export interface AgentCapability {
  id: string
  name: string
  description: string
  icon: string
  example: string
}

export interface AgentStatusResponse {
  status: string
  capabilities: AgentCapability[]
  email_configured: boolean
}

export const executeAgent = async (text: string): Promise<AgentResponse> => {
  try {
    const response = await api.post<AgentResponse>('/api/agent/execute', {
      text,
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail ||
          error.message ||
          'Failed to execute agent command'
      )
    }
    throw new Error('Failed to execute agent command')
  }
}

export const getAgentStatus = async (): Promise<AgentStatusResponse> => {
  try {
    const response = await api.get<AgentStatusResponse>('/api/agent/status')
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail ||
          error.message ||
          'Failed to get agent status'
      )
    }
    throw new Error('Failed to get agent status')
  }
}
