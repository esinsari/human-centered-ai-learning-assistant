/**
 * AnswerForm
 * Step 1 & 2 of interaction flow:
 *   - Shows problem statement
 *   - Student types answer and submits
 *   - On incorrect, triggers reflection flow
 */
import { useState } from 'react'
import type { Problem } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface Props {
  problem: Problem
  attemptCount: number
  onSubmit: (answer: string) => Promise<void>
  onRequestGuidance: () => void
  disabled?: boolean
}

export default function AnswerForm({ problem, attemptCount, onSubmit, onRequestGuidance, disabled }: Props) {
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setLoading(true)
    try {
      await onSubmit(answer.trim())
      setAnswer('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Problem Statement */}
      <Card>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Problem · {problem.subject} · {problem.difficulty}
        </p>
        <p className="text-gray-900 text-base leading-relaxed font-medium">
          {problem.statement}
        </p>
      </Card>

      {/* Answer Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="answer-input">
          Your Answer
          {attemptCount > 0 && (
            <span className="ml-2 text-xs text-gray-400">({attemptCount} attempt{attemptCount !== 1 ? 's' : ''} so far)</span>
          )}
        </label>
        <textarea
          id="answer-input"
          rows={3}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer or working here…"
          disabled={disabled || loading}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none disabled:opacity-50"
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!answer.trim() || loading || disabled}
          className="flex-1"
        >
          {loading ? 'Submitting…' : 'Submit Answer'}
        </Button>
        <Button
          variant="secondary"
          onClick={onRequestGuidance}
          disabled={disabled}
        >
          Request Guidance
        </Button>
      </div>
    </div>
  )
}
