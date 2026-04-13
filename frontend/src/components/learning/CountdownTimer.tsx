/**
 * CountdownTimer
 * Shown before the full solution is revealed (proposal Section 3.2 Step 4).
 * 5-second delay with visual ring. User must confirm they want to view solution.
 */
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const TIMER_SECONDS = 5
const CIRCUMFERENCE = 2 * Math.PI * 25 // r=25

interface Props {
  onConfirm: () => void
}

export default function CountdownTimer({ onConfirm }: Props) {
  const [remaining, setRemaining] = useState(TIMER_SECONDS)
  const [canConfirm, setCanConfirm] = useState(false)

  useEffect(() => {
    if (remaining <= 0) {
      setCanConfirm(true)
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining])

  const progress = ((TIMER_SECONDS - remaining) / TIMER_SECONDS) * CIRCUMFERENCE

  return (
    <Card variant="warning" className="animate-fade-in text-center space-y-4">
      <p className="font-semibold text-amber-900">Take a moment before viewing the solution</p>
      <p className="text-sm text-amber-800">
        Use these few seconds to reflect on your approach before comparing it with the solution.
      </p>

      {/* Countdown ring */}
      <div className="flex justify-center">
        <svg width="70" height="70" viewBox="0 0 60 60">
          {/* Background circle */}
          <circle cx="30" cy="30" r="25" fill="none" stroke="#fde68a" strokeWidth="4" />
          {/* Progress ring */}
          <circle
            cx="30" cy="30" r="25"
            fill="none"
            stroke="#d97706"
            strokeWidth="4"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE - progress}
            strokeLinecap="round"
            transform="rotate(-90 30 30)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
          <text x="30" y="35" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#92400e">
            {remaining > 0 ? remaining : '✓'}
          </text>
        </svg>
      </div>

      <Button
        onClick={onConfirm}
        disabled={!canConfirm}
        className="w-full"
      >
        {canConfirm ? 'View Full Solution' : `Please wait… (${remaining}s)`}
      </Button>
    </Card>
  )
}
