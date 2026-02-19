import { useState, useRef, useCallback, useEffect } from 'react'

interface VoiceInputProps {
    onTranscript: (text: string) => void
    onSubmit: (text: string) => void
    isProcessing: boolean
}

// Extend the Window interface for webkitSpeechRecognition
interface SpeechRecognitionEvent {
    resultIndex: number
    results: SpeechRecognitionResultList
}

export default function VoiceInput({
    onTranscript,
    onSubmit,
    isProcessing,
}: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [textInput, setTextInput] = useState('')
    const recognitionRef = useRef<any>(null)
    const isListeningRef = useRef(false)

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [])

    const startListening = useCallback(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition

        if (!SpeechRecognition) {
            alert(
                'Speech Recognition is not supported in this browser. Please use Chrome or Edge.'
            )
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => {
            setIsListening(true)
            isListeningRef.current = true
            setTranscript('')
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = ''
            let interimTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i]
                if (result.isFinal) {
                    finalTranscript += result[0].transcript
                } else {
                    interimTranscript += result[0].transcript
                }
            }

            const fullText = finalTranscript || interimTranscript
            setTranscript(fullText)
            onTranscript(fullText)
        }

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error)
            setIsListening(false)
            isListeningRef.current = false
        }

        recognition.onend = () => {
            setIsListening(false)
            isListeningRef.current = false
        }

        recognitionRef.current = recognition
        recognition.start()
    }, [onTranscript])

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
            isListeningRef.current = false

            // Submit the transcript
            if (transcript.trim()) {
                onSubmit(transcript.trim())
                setTranscript('')
            }
        }
    }, [transcript, onSubmit])

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (textInput.trim() && !isProcessing) {
            onSubmit(textInput.trim())
            setTextInput('')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleTextSubmit(e as any)
        }
    }

    return (
        <div className="flex flex-col gap-2.5">
            {/* Text Input */}
            <form
                onSubmit={handleTextSubmit}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-2xl pl-5 pr-1.5 py-1.5 transition-all duration-300 focus-within:border-primary-400 focus-within:ring-[3px] focus-within:ring-primary-500/10"
            >
                <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isListening
                            ? 'Listening...'
                            : 'Type a command or use the mic...'
                    }
                    disabled={isProcessing || isListening}
                    className="flex-1 bg-transparent border-none outline-none text-slate-700 text-sm font-sans placeholder:text-slate-400 disabled:opacity-50"
                    id="command-input"
                />

                {/* Voice Button */}
                <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing}
                    className={`w-10 h-10 border-none rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${isListening
                            ? 'bg-red-50 text-red-500 animate-pulse-border'
                            : 'bg-white text-slate-400 hover:bg-primary-50 hover:text-primary-500 shadow-sm'
                        }`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                    id="voice-btn"
                >
                    {isListening ? (
                        <div className="flex items-center gap-0.5 h-5">
                            <span className="w-[3px] h-[30%] bg-red-500 rounded-sm animate-wave-1"></span>
                            <span className="w-[3px] h-[60%] bg-red-500 rounded-sm animate-wave-2"></span>
                            <span className="w-[3px] h-full bg-red-500 rounded-sm animate-wave-3"></span>
                            <span className="w-[3px] h-[60%] bg-red-500 rounded-sm animate-wave-4"></span>
                            <span className="w-[3px] h-[30%] bg-red-500 rounded-sm animate-wave-5"></span>
                        </div>
                    ) : (
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
                    )}
                </button>

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={isProcessing || !textInput.trim()}
                    className="w-10 h-10 border-none rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 text-white cursor-pointer flex items-center justify-center shrink-0 transition-all duration-300 hover:enabled:scale-105 hover:enabled:shadow-lg hover:enabled:shadow-primary-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Send command"
                    id="send-btn"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="22" x2="11" y1="2" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </form>

            {/* Live Transcript */}
            {isListening && transcript && (
                <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-red-50 border border-red-100/60 rounded-xl animate-fade-in">
                    <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-red-500 uppercase tracking-widest shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-dot"></span>
                        LIVE
                    </div>
                    <p className="text-sm text-slate-500 italic leading-relaxed">
                        {transcript}
                    </p>
                </div>
            )}
        </div>
    )
}
