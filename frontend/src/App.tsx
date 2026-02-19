import { useState, useEffect, useRef, useCallback } from 'react'
import VoiceInput from './components/VoiceInput'
import ChatMessage from './components/ChatMessage'
import AgentStatus from './components/AgentStatus'
import {
  executeAgent,
  getAgentStatus,
} from './services/api'
import type {
  AgentResponse,
  AgentCapability,
} from './services/api'

interface Message {
  id: string
  type: 'user' | 'agent'
  text: string
  agentData?: AgentResponse
  timestamp: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [capabilities, setCapabilities] = useState<AgentCapability[]>([])
  const [isOnline, setIsOnline] = useState(false)
  const [emailConfigured, setEmailConfigured] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Fetch agent status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getAgentStatus()
        setCapabilities(status.capabilities)
        setIsOnline(status.status === 'online')
        setEmailConfigured(status.email_configured)
      } catch {
        setIsOnline(false)
      }
    }
    fetchStatus()
  }, [])

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSubmit = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return

      setShowWelcome(false)

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        text,
        timestamp: formatTime(),
      }
      setMessages((prev) => [...prev, userMessage])
      setIsProcessing(true)

      try {
        const result = await executeAgent(text)

        // Add agent response
        const agentMessage: Message = {
          id: `agent-${Date.now()}`,
          type: 'agent',
          text: result.message,
          agentData: result,
          timestamp: formatTime(),
        }
        setMessages((prev) => [...prev, agentMessage])
      } catch (error) {
        const errorMessage: Message = {
          id: `agent-${Date.now()}`,
          type: 'agent',
          text:
            error instanceof Error
              ? `Error: ${error.message}`
              : 'Something went wrong. Please try again.',
          timestamp: formatTime(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsProcessing(false)
      }
    },
    [isProcessing]
  )

  const handleTranscript = useCallback((_text: string) => {
    // Live transcript — could be used for UI feedback
  }, [])

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50">
      {/* Header */}
      <header className="px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-primary-600/20">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                Voice AI Agent
              </h1>
              <p className="text-xs text-slate-400 mt-px">
                Your intelligent voice-powered assistant
              </p>
            </div>
          </div>
          {isOnline && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot"></div>
              Online
            </div>
          )}
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto scroll-smooth chat-scroll">
        <div className="max-w-5xl mx-auto px-8 py-6 min-h-full flex flex-col">
          {showWelcome && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center gap-4 animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-violet-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 mb-2 animate-float">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Hello! I'm your AI Agent
              </h2>
              <p className="text-slate-500 text-base mb-2 max-w-md">
                I can execute tasks for you. Try speaking or typing a command!
              </p>
              <AgentStatus
                capabilities={capabilities}
                isOnline={isOnline}
                emailConfigured={emailConfigured}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  type={msg.type}
                  text={msg.text}
                  agentData={msg.agentData}
                  timestamp={msg.timestamp}
                />
              ))}
              {isProcessing && (
                <div className="flex gap-3 animate-slide-in">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary-100 border border-primary-200/60">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <div className="max-w-[75%] bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-sm">
                    <div className="flex gap-1 py-1">
                      <span className="w-2 h-2 rounded-full bg-primary-400 animate-thinking-1"></span>
                      <span className="w-2 h-2 rounded-full bg-primary-400 animate-thinking-2"></span>
                      <span className="w-2 h-2 rounded-full bg-primary-400 animate-thinking-3"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Voice Input Bar */}
      <footer className="border-t border-slate-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-5xl mx-auto px-8 pt-4 pb-6">
          <VoiceInput
            onTranscript={handleTranscript}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
          />
        </div>
      </footer>
    </div>
  )
}

export default App
