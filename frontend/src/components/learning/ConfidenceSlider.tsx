/**
 * ConfidenceSlider
 * Collected before full solution is revealed (proposal Section 3.2).
 * Rating stored on session in DB.
 */
import { useState } from 'react'
import Button from '@/components/ui/Button'

const LABELS = ['Not at all', 'Slightly', 'Somewhat', 'Fairly', 'Very']

interface Props {
  onSubmit: (rating: number) => Promise<void>
}

export default function ConfidenceSlider({ onSubmit }: Props) {
  const [value, setValue] = useState(0.5)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const labelIndex = Math.round(value * (LABELS.length - 1))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onSubmit(value)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <p className="text-sm text-green-700 font-medium">
        ✓ Confidence recorded — {LABELS[labelIndex]} confident
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">
        How confident are you in your answer before seeing the solution?
      </p>
      <div className="space-y-1">
        <input
          type="range"
          min={0} max={1} step={0.01}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="flex justify-between text-xs text-gray-400">
          {LABELS.map((l) => <span key={l}>{l}</span>)}
        </div>
        <p className="text-center text-sm font-semibold text-brand-600">
          {LABELS[labelIndex]}
        </p>
      </div>
      <Button size="sm" onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? 'Saving…' : 'Submit Confidence Rating'}
      </Button>
    </div>
  )
}
