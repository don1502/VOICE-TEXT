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
        if (!agentData) {
            // Default agent icon — sparkle
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                    <path d="M12 3v1m0 16v1m-7.07-2.93l.71-.71M4.22 4.93l.71.71M3 12h1m16 0h1m-2.93 7.07l-.71-.71M19.78 4.93l-.71.71M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
            )
        }
        switch (agentData.action) {
            case 'email_sent':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                )
            case 'email_failed':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                )
            case 'need_more_info':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                )
            case 'chat_response':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )
            default:
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                        <path d="M12 3v1m0 16v1m-7.07-2.93l.71-.71M4.22 4.93l.71.71M3 12h1m16 0h1m-2.93 7.07l-.71-.71M19.78 4.93l-.71.71M12 7a5 5 0 100 10 5 5 0 000-10z" />
                    </svg>
                )
        }
    }

    const getActionBadge = () => {
        if (!agentData) return null
        switch (agentData.action) {
            case 'email_sent':
                return (
                    <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide bg-emerald-50 text-emerald-600">
                        Email Sent
                    </span>
                )
            case 'email_failed':
                return (
                    <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide bg-red-50 text-red-500">
                        Failed
                    </span>
                )
            case 'need_more_info':
                return (
                    <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide bg-blue-50 text-blue-500">
                        More Info Needed
                    </span>
                )
            default:
                return null
        }
    }

    return (
        <div
            className={`flex gap-3 animate-slide-in ${!isAgent ? 'flex-row-reverse' : ''
                }`}
        >
            <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isAgent
                        ? 'bg-slate-100 border border-slate-200'
                        : 'bg-gradient-to-br from-primary-600 to-violet-600'
                    }`}
            >
                {isAgent ? (
                    getActionIcon()
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                )}
            </div>
            <div
                className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${isAgent
                        ? 'bg-white border border-slate-200'
                        : 'bg-gradient-to-br from-primary-50 to-violet-50 border border-primary-200/50'
                    }`}
            >
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-slate-500">
                        {isAgent ? 'Agent' : 'You'}
                    </span>
                    {getActionBadge()}
                    <span className="text-[0.68rem] text-slate-400 ml-auto">
                        {timestamp}
                    </span>
                </div>
                <div className="text-sm leading-relaxed text-slate-700">
                    {text}
                </div>

                {/* Email Details Card */}
                {agentData?.action === 'email_sent' && agentData.parsed && (
                    <div className="mt-3 p-3.5 bg-primary-50/50 border border-primary-100 rounded-xl">
                        <div className="flex gap-2 py-1 text-sm border-b border-slate-100 pb-2 mb-1">
                            <span className="text-slate-400 font-semibold shrink-0 min-w-[60px]">
                                To:
                            </span>
                            <span className="text-slate-600">
                                {agentData.parsed.to}
                            </span>
                        </div>
                        <div className="flex gap-2 py-1 text-sm border-b border-slate-100 pb-2 mb-1">
                            <span className="text-slate-400 font-semibold shrink-0 min-w-[60px]">
                                Subject:
                            </span>
                            <span className="text-slate-600">
                                {agentData.parsed.subject}
                            </span>
                        </div>
                        <div className="flex gap-2 py-1 text-sm">
                            <span className="text-slate-400 font-semibold shrink-0 min-w-[60px]">
                                Body:
                            </span>
                            <span className="text-slate-600 italic leading-relaxed">
                                {agentData.parsed.body}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
