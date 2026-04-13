/**
 * ScaffoldProgressBar
 * Visual indicator of the 4-stage guidance progression.
 */
import type { ScaffoldStage } from '@/types'
import clsx from 'clsx'

const STAGES: { key: ScaffoldStage; label: string }[] = [
  { key: 'none',          label: 'Attempt' },
  { key: 'strategy_cue',  label: 'Strategy' },
  { key: 'partial_hint',  label: 'Hint' },
  { key: 'full_solution', label: 'Solution' },
]

interface Props {
  currentStage: ScaffoldStage
}

export default function ScaffoldProgressBar({ currentStage }: Props) {
  const currentIdx = STAGES.findIndex((s) => s.key === currentStage)

  return (
    <div className="flex items-center gap-1">
      {STAGES.map((stage, idx) => (
        <div key={stage.key} className="flex items-center gap-1 flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={clsx(
                'w-full h-1.5 rounded-full transition-colors',
                idx <= currentIdx ? 'bg-brand-500' : 'bg-gray-200',
              )}
            />
            <span
              className={clsx(
                'text-xs mt-1 font-medium',
                idx === currentIdx ? 'text-brand-600' : idx < currentIdx ? 'text-gray-500' : 'text-gray-300',
              )}
            >
              {stage.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
