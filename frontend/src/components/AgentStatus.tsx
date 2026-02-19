import type { AgentCapability } from '../services/api'

interface AgentStatusProps {
    capabilities: AgentCapability[]
    isOnline: boolean
    emailConfigured: boolean
}

export default function AgentStatus({
    capabilities,
    isOnline,
    emailConfigured,
}: AgentStatusProps) {
    return (
        <div className="agent-status">
            <div className="status-header">
                <div className="status-indicator-container">
                    <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
                    <span className="status-text">
                        {isOnline ? 'Agent Online' : 'Agent Offline'}
                    </span>
                </div>
                {!emailConfigured && isOnline && (
                    <div className="config-warning">
                        ⚠️ Email not configured — set GMAIL_ADDRESS & GMAIL_APP_PASSWORD in .env
                    </div>
                )}
            </div>

            <div className="capabilities-grid">
                {capabilities.map((cap) => (
                    <div key={cap.id} className="capability-card">
                        <div className="capability-icon">{cap.icon}</div>
                        <div className="capability-info">
                            <h3>{cap.name}</h3>
                            <p>{cap.description}</p>
                            <code className="capability-example">"{cap.example}"</code>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
