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
import './App.css'

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
              ? `❌ Error: ${error.message}`
              : '❌ Something went wrong. Please try again.',
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
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-icon">
              <svg
                width="28"
                height="28"
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
              <h1>Voice AI Agent</h1>
              <p className="header-subtitle">
                Your intelligent voice-powered assistant
              </p>
            </div>
          </div>
          <div className="header-right">
            <div
              className={`status-pill ${isOnline ? 'online' : 'offline'}`}
            >
              <div className="status-pill-dot"></div>
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="chat-area">
        {showWelcome && messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">🤖</div>
            <h2>Hello! I'm your AI Agent</h2>
            <p>
              I can execute tasks for you. Try speaking or typing a command!
            </p>
            <AgentStatus
              capabilities={capabilities}
              isOnline={isOnline}
              emailConfigured={emailConfigured}
            />
          </div>
        ) : (
          <div className="messages-container">
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
              <div className="chat-message agent">
                <div className="message-avatar">⚡</div>
                <div className="message-content">
                  <div className="thinking-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </main>

      {/* Voice Input Bar */}
      <footer className="input-bar">
        <VoiceInput
          onTranscript={handleTranscript}
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
        />
      </footer>
    </div>
  )
}

export default App
