/**
 * ReflectionForm
 * Step 3 of interaction flow.
 * Student MUST submit a reflection before AI assistance progresses.
 * Cannot be skipped (no cancel button per proposal).
 */
import { useState } from 'react'
import type { ScaffoldStage } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface Props {
  prompt: string
  stage: ScaffoldStage
  onSubmit: (responseText: string, stage: ScaffoldStage) => Promise<void>
}

export default function ReflectionForm({ prompt, stage, onSubmit }: Props) {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const MIN_LENGTH = 15 // encourage genuine reflection, not "idk"

  const handleSubmit = async () => {
    if (response.trim().length < MIN_LENGTH) return
    setLoading(true)
    try {
      await onSubmit(response.trim(), stage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card variant="highlight" className="animate-fade-in space-y-4">
      <div>
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">
          Reflection Required
        </p>
        <p className="text-sm text-gray-500">
          Before AI assistance can continue, share your current thinking.
          This helps activate your prior knowledge.
        </p>
      </div>

      <p className="font-medium text-gray-900">{prompt}</p>

      <div className="space-y-1">
        <textarea
          rows={4}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write your response here (at least a few sentences)…"
          disabled={loading}
          className="w-full rounded-lg border border-brand-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        {response.trim().length > 0 && response.trim().length < MIN_LENGTH && (
          <p className="text-xs text-amber-600">Please write a bit more to continue.</p>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={response.trim().length < MIN_LENGTH || loading}
        className="w-full"
      >
        {loading ? 'Saving reflection…' : 'Submit Reflection & Continue'}
      </Button>
    </Card>
  )
}
