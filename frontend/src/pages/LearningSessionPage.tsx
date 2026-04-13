/**
 * LearningSessionPage — matches Figma design:
 *   Left:  problem statement, A/B/C/D multiple-choice grid, action buttons
 *   Right: dark panel — idle / correct (green) / chat (incorrect + guidance flow)
 */
import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useSession } from '@/hooks/useSession'
import { getAlternativeExplanation, advanceStage } from '@/services/api'
import type { GuidanceLevel } from '@/types'

type PanelState = 'idle' | 'correct' | 'incorrect' | 'guidance_requested'
type ChatMessage = { role: 'ai' | 'user'; text: string }

export default function LearningSessionPage() {
  const { sessionToken } = useParams<{ sessionToken: string }>()

  const {
    session,
    problem,
    isLoadingGuidance,
    submitAnswer,
    requestGuidance,
    submitReflection,
    updateGuidanceLevel,
  } = useSession(sessionToken ?? '')

  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [panelState, setPanelState] = useState<PanelState>('idle')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [solutionContent, setSolutionContent] = useState('')
  const [altExplanation, setAltExplanation] = useState('')
  const [loadingAlt, setLoadingAlt] = useState(false)
  const [solutionShownInChat, setSolutionShownInChat] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Reset all local state when navigating to a different session
  useEffect(() => {
    setSelectedOption(null)
    setPanelState('idle')
    setChatMessages([])
    setChatInput('')
    setSolutionContent('')
    setAltExplanation('')
    setLoadingAlt(false)
    setSolutionShownInChat(false)
  }, [sessionToken])

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  if (!session || !problem) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading session…
      </div>
    )
  }

  const options = [
    { key: 'A', label: problem.option_a || extractOption(problem.statement, 'A') || 'Option A' },
    { key: 'B', label: problem.option_b || extractOption(problem.statement, 'B') || 'Option B' },
    { key: 'C', label: problem.option_c || extractOption(problem.statement, 'C') || 'Option C' },
    { key: 'D', label: problem.option_d || extractOption(problem.statement, 'D') || 'Option D' },
  ]
  const correctOption = problem.correct_option

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSubmitAnswer = async () => {
    if (!selectedOption) return
    const isCorrect = correctOption ? selectedOption === correctOption : false
    const result = await submitAnswer(selectedOption)
    if (result.feedback === 'correct' || isCorrect) {
      setSolutionContent(result.solution ?? '')
      setPanelState('correct')
      await advanceStage(sessionToken ?? '')
      await advanceStage(sessionToken ?? '')
    } else {
      setPanelState('incorrect')
      // result.guidance is returned directly from submitAnswer — no stale closure issue
      const guidance = result.guidance
      if (guidance?.reflection_prompt) {
        setChatMessages([{ role: 'ai', text: guidance.reflection_prompt }])
      } else if (guidance?.content) {
        setChatMessages([{ role: 'ai', text: guidance.content }])
      } else {
        setChatMessages([{ role: 'ai', text: 'Which concept do you think applies here? What pattern did you notice in the expression?' }])
      }
    }
  }

  const handleRequestGuidance = async () => {
    setPanelState('guidance_requested')
    const guidance = await requestGuidance()
    if (!guidance) return
    if (guidance.effort_gate) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "Good thinking! Before I walk you through the full solution, try submitting another answer. Give it one more go!" }])
    } else if (guidance.reflection_prompt) {
      setChatMessages(prev => [...prev, { role: 'ai', text: guidance.reflection_prompt! }])
    } else if (guidance.content) {
      setChatMessages(prev => [...prev, { role: 'ai', text: guidance.content }])
      if (guidance.stage === 'full_solution') {
        setSolutionContent(guidance.content)
        setSolutionShownInChat(true)
      }
    }
  }

  const handleChatSend = async () => {
    const text = chatInput.trim()
    if (!text || isLoadingGuidance) return
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text }])

    const guidance = await submitReflection(text, session.scaffold_stage ?? 'strategy_cue')
    if (!guidance) return

    if (guidance.effort_gate) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "Good thinking! Before I walk you through the full solution, try submitting another answer. Give it one more go!" }])
    } else if (guidance.reflection_required && guidance.reflection_prompt) {
      setChatMessages(prev => [...prev, { role: 'ai', text: guidance.reflection_prompt! }])
    } else if (guidance.content) {
      setChatMessages(prev => [...prev, { role: 'ai', text: guidance.content }])
      if (guidance.stage === 'full_solution') {
        setSolutionContent(guidance.content)
        setSolutionShownInChat(true)
      }
    }
  }

  const handleAltExplanation = async () => {
    if (!sessionToken || !solutionContent) return
    setLoadingAlt(true)
    try {
      const res = await getAlternativeExplanation(sessionToken, solutionContent)
      setAltExplanation(res.explanation)
    } finally {
      setLoadingAlt(false)
    }
  }

  const isChatPanel = panelState === 'incorrect' || panelState === 'guidance_requested'

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 49px)' }}>
      {/* Page header */}
      <div className="px-8 pt-6 pb-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-semibold text-gray-900">
          {problem.title || 'Problem 1: Algebra'}
        </h1>
      </div>

      {/* Two-column body */}
      <div className="flex flex-1 gap-0 px-8 pt-6 pb-6 overflow-hidden">

        {/* ──────────── LEFT COLUMN ──────────── */}
        <div className="flex-1 flex flex-col gap-5 pr-6 overflow-y-auto">

          {/* Attempt badge */}
          <div className="flex justify-end">
            <span
              className="text-sm px-4 py-1.5 rounded font-medium"
              style={{ background: '#e8e8e8', color: '#444' }}
            >
              Attempt: {session.attempt_count + 1}
            </span>
          </div>

          {/* Problem text */}
          <div>
            <p className="text-gray-800 text-sm leading-relaxed font-medium">
              {getCleanStatement(problem.statement)}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Select the fully factored form of the expression below.
            </p>
          </div>

          {/* 2×2 Multiple choice grid */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((opt) => {
              const isSelected = selectedOption === opt.key
              const isCorrectSelected = isSelected && panelState === 'correct'
              const isWrongSelected = isSelected && isChatPanel

              return (
                <button
                  key={opt.key}
                  onClick={() => setSelectedOption(opt.key)}
                  className="px-4 py-3 rounded text-left text-sm font-medium transition-all border"
                  style={{
                    background: isCorrectSelected
                      ? '#86efac'
                      : isWrongSelected
                      ? '#fca5a5'
                      : isSelected
                      ? '#dbeafe'
                      : '#f5f5f5',
                    borderColor: isCorrectSelected
                      ? '#16a34a'
                      : isWrongSelected
                      ? '#dc2626'
                      : isSelected
                      ? '#3b82f6'
                      : '#e0e0e0',
                    color: '#111',
                  }}
                >
                  {opt.key}) {opt.label}
                </button>
              )
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleRequestGuidance}
              disabled={isLoadingGuidance}
              className="px-5 py-2.5 rounded text-sm font-medium border transition-colors"
              style={{
                background: panelState === 'guidance_requested' ? '#7c3aed' : '#e8e8e8',
                color: panelState === 'guidance_requested' ? '#fff' : '#333',
                borderColor: panelState === 'guidance_requested' ? '#7c3aed' : '#ccc',
              }}
            >
              Request Guidance
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption || isLoadingGuidance}
              className="px-5 py-2.5 rounded text-sm font-semibold text-white transition-colors"
              style={{
                background: selectedOption ? '#22c55e' : '#86efac',
                cursor: selectedOption ? 'pointer' : 'not-allowed',
              }}
            >
              Submit Answer
            </button>
          </div>

          {/* Guidance level selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Guidance:</span>
            {(['minimal', 'moderate', 'high'] as GuidanceLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => updateGuidanceLevel(lvl)}
                className="text-xs px-2 py-0.5 rounded border capitalize transition-colors"
                style={{
                  background: session.guidance_level === lvl ? '#1e2060' : '#f5f5f5',
                  color: session.guidance_level === lvl ? '#fff' : '#666',
                  borderColor: session.guidance_level === lvl ? '#1e2060' : '#ddd',
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* ──────────── RIGHT COLUMN: dark panel ──────────── */}
        <div
          className="w-72 flex-shrink-0 rounded-lg flex flex-col overflow-hidden"
          style={{ background: '#2d2d2d', minHeight: '360px', maxHeight: '100%' }}
        >

          {/* IDLE */}
          {panelState === 'idle' && !isLoadingGuidance && (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm px-4 text-center leading-relaxed">
              Select an answer or request guidance to begin.
            </div>
          )}

          {/* LOADING (initial) */}
          {panelState === 'idle' && isLoadingGuidance && (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-gray-400 text-sm animate-pulse">Generating guidance…</span>
            </div>
          )}

          {/* ── CORRECT ── */}
          {panelState === 'correct' && (
            <div className="flex flex-col h-full">
              <div className="px-4 py-2.5 text-white text-sm font-semibold" style={{ background: '#22c55e' }}>
                Correct answer submitted
              </div>
              <div className="flex-1 px-4 py-4 overflow-y-auto text-sm">
                {solutionContent ? (
                  <>
                    <p className="font-semibold text-white mb-2">Full explanation:</p>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{solutionContent}</p>
                    {altExplanation && (
                      <div className="mt-4 pt-3 border-t border-gray-600">
                        <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1">Alternative explanation</p>
                        <p className="text-gray-300 leading-relaxed">{altExplanation}</p>
                      </div>
                    )}
                    {!altExplanation && (
                      <button
                        onClick={handleAltExplanation}
                        disabled={loadingAlt}
                        className="mt-4 text-xs px-3 py-1.5 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors"
                      >
                        {loadingAlt ? 'Generating…' : 'Show an alternative answer'}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm animate-pulse">Loading explanation…</p>
                )}
              </div>
              <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-700">
                This is a suggested solution. Compare it with your own reasoning.
              </div>
            </div>
          )}

          {/* ── CHAT PANEL (incorrect or guidance_requested) ── */}
          {isChatPanel && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div
                className="px-4 py-2.5 text-white text-sm font-semibold flex-shrink-0"
                style={{ background: panelState === 'incorrect' ? '#ef4444' : '#7c3aed' }}
              >
                {panelState === 'incorrect' ? 'Incorrect answer submitted' : 'Guidance Requested'}
              </div>

              {/* Messages */}
              <div className="flex-1 px-3 py-3 overflow-y-auto flex flex-col gap-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-500 px-1">
                      {msg.role === 'ai' ? 'AI Learning Assistant' : 'You'}
                    </span>
                    <div
                      className="px-3 py-2 rounded-lg text-sm leading-relaxed max-w-[90%] whitespace-pre-wrap"
                      style={{
                        background: msg.role === 'ai' ? '#7c3aed' : '#4b4b6b',
                        color: '#fff',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Inline loading indicator */}
                {isLoadingGuidance && (
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-xs text-gray-500 px-1">AI Learning Assistant</span>
                    <div
                      className="px-3 py-2 rounded-lg text-sm animate-pulse"
                      style={{ background: '#7c3aed', color: '#fff' }}
                    >
                      Thinking…
                    </div>
                  </div>
                )}

                {/* Alternative explanation (after full solution) */}
                {solutionShownInChat && (
                  <div className="mt-1">
                    {altExplanation ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-xs text-gray-500 px-1">AI Learning Assistant</span>
                        <div
                          className="px-3 py-2 rounded-lg text-sm leading-relaxed max-w-[90%] whitespace-pre-wrap"
                          style={{ background: '#5b21b6', color: '#fff' }}
                        >
                          {altExplanation}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleAltExplanation}
                        disabled={loadingAlt}
                        className="text-xs px-3 py-1.5 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors"
                      >
                        {loadingAlt ? 'Generating…' : 'Show an alternative answer'}
                      </button>
                    )}
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              {!solutionShownInChat && (
                <div className="flex-shrink-0 px-3 py-3 border-t border-gray-700 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend() } }}
                    placeholder="Type your response…"
                    disabled={isLoadingGuidance}
                    className="flex-1 rounded-full px-4 py-2 text-sm focus:outline-none"
                    style={{ background: '#f0f0f0', color: '#222' }}
                  />
                  <button
                    onClick={handleChatSend}
                    disabled={!chatInput.trim() || isLoadingGuidance}
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      background: chatInput.trim() ? '#7c3aed' : '#444',
                      color: '#fff',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-700 flex-shrink-0">
                AI responses may contain inaccuracies. Verify independently.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCleanStatement(statement: string): string {
  return statement
}

function extractOption(statement: string, key: string): string | null {
  const match = statement.match(new RegExp(`${key}\\)\\s*([^A-D\n]{2,40})`))
  return match ? match[1].trim() : null
}
