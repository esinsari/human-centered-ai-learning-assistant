/**
 * GuidanceCard
 * Renders the current scaffold stage content:
 *   strategy_cue   → soft nudge
 *   partial_hint   → concrete first step
 *   full_solution  → full solution (after timer + confirmation)
 *
 * Also shows the "Alternative Explanation" button for full_solution stage.
 */
import { useState } from 'react'
import type { GuidanceResponse, ScaffoldStage } from '@/types'
import { getAlternativeExplanation } from '@/services/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const STAGE_LABELS: Record<ScaffoldStage, string> = {
  none:           '',
  strategy_cue:   '💡 Strategy Cue',
  partial_hint:   '🔍 Partial Hint',
  full_solution:  '✅ Full Solution',
}

const DISCLAIMER = "This is a suggested solution. Compare it with your reasoning."

interface Props {
  guidance: GuidanceResponse
  sessionToken: string
}

export default function GuidanceCard({ guidance, sessionToken }: Props) {
  const [altExplanation, setAltExplanation] = useState<string | null>(null)
  const [loadingAlt, setLoadingAlt] = useState(false)

  const handleAltExplanation = async () => {
    setLoadingAlt(true)
    try {
      const res = await getAlternativeExplanation(sessionToken, guidance.content)
      setAltExplanation(res.explanation)
    } finally {
      setLoadingAlt(false)
    }
  }

  if (!guidance.content) return null

  return (
    <div className="space-y-3 animate-fade-in">
      <Card variant={guidance.stage === 'full_solution' ? 'default' : 'highlight'}>
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">
          {STAGE_LABELS[guidance.stage]}
        </p>
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
          {guidance.content}
        </p>

        {guidance.stage === 'full_solution' && (
          <p className="mt-3 text-xs text-gray-500 italic border-t border-gray-100 pt-2">
            {DISCLAIMER}
          </p>
        )}
      </Card>

      {/* Alternative Explanation — full_solution only */}
      {guidance.stage === 'full_solution' && !altExplanation && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAltExplanation}
          disabled={loadingAlt}
        >
          {loadingAlt ? 'Generating…' : 'Show an alternative explanation →'}
        </Button>
      )}

      {altExplanation && (
        <Card className="animate-fade-in">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
            🔄 Alternative Explanation
          </p>
          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
            {altExplanation}
          </p>
          <p className="mt-3 text-xs text-gray-500 italic border-t border-gray-100 pt-2">
            {DISCLAIMER}
          </p>
        </Card>
      )}
    </div>
  )
}
