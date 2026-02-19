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
        <div className="w-full max-w-[640px] mt-2">
            {/* Only show status section when online */}
            {isOnline && (
                <div className="flex flex-col items-center gap-2 mb-5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                        <span className="text-sm font-medium text-slate-500">
                            Ready to assist
                        </span>
                    </div>
                    {!emailConfigured && (
                        <div className="text-xs text-amber-600 bg-amber-50 px-3.5 py-1.5 rounded-lg border border-amber-200/60">
                            Email not configured — set GMAIL_ADDRESS &
                            GMAIL_APP_PASSWORD in .env
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
                {capabilities.map((cap) => (
                    <div
                        key={cap.id}
                        className="flex items-start gap-3.5 p-5 bg-white border border-slate-200 rounded-2xl text-left shadow-sm transition-all duration-200 hover:border-primary-300 hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-1">
                                {cap.name}
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed mb-2">
                                {cap.description}
                            </p>
                            <code className="text-xs text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md inline-block italic">
                                "{cap.example}"
                            </code>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
