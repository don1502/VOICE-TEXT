import type { AgentResponse } from '../services/api'

interface ChatMessageProps {
    type: 'user' | 'agent'
    text: string
    agentData?: AgentResponse
    timestamp: string
}

export default function ChatMessage({
    type,
    text,
    agentData,
    timestamp,
}: ChatMessageProps) {
    const isAgent = type === 'agent'

    const getActionIcon = () => {
        if (!agentData) return '🤖'
        switch (agentData.action) {
            case 'email_sent':
                return '📧'
            case 'email_failed':
                return '❌'
            case 'need_more_info':
                return '❓'
            case 'chat_response':
                return '💬'
            default:
                return '🤖'
        }
    }

    const getActionBadge = () => {
        if (!agentData) return null
        switch (agentData.action) {
            case 'email_sent':
                return <span className="action-badge success">Email Sent</span>
            case 'email_failed':
                return <span className="action-badge error">Failed</span>
            case 'need_more_info':
                return <span className="action-badge info">More Info Needed</span>
            default:
                return null
        }
    }

    return (
        <div className={`chat-message ${isAgent ? 'agent' : 'user'}`}>
            <div className="message-avatar">
                {isAgent ? getActionIcon() : '🎤'}
            </div>
            <div className="message-content">
                <div className="message-header">
                    <span className="message-sender">
                        {isAgent ? 'Agent' : 'You'}
                    </span>
                    {getActionBadge()}
                    <span className="message-time">{timestamp}</span>
                </div>
                <div className="message-text">{text}</div>

                {/* Email Details Card */}
                {agentData?.action === 'email_sent' && agentData.parsed && (
                    <div className="email-details-card">
                        <div className="email-detail">
                            <span className="email-label">To:</span>
                            <span className="email-value">{agentData.parsed.to}</span>
                        </div>
                        <div className="email-detail">
                            <span className="email-label">Subject:</span>
                            <span className="email-value">
                                {agentData.parsed.subject}
                            </span>
                        </div>
                        <div className="email-detail">
                            <span className="email-label">Body:</span>
                            <span className="email-value email-body">
                                {agentData.parsed.body}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
