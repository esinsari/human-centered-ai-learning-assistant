/**
 * GuidanceLevelSelector
 * Allows user to pick minimal / moderate / high guidance.
 * Adjusts how quickly hints appear and whether reflection is mandatory.
 */
import type { GuidanceLevel } from '@/types'

const OPTIONS: { value: GuidanceLevel; label: string; description: string }[] = [
  { value: 'minimal',  label: 'Minimal',  description: 'Less scaffolding, more independence' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced guidance with reflection' },
  { value: 'high',     label: 'High',     description: 'Full scaffolding, all prompts active' },
]

interface Props {
  value: GuidanceLevel
  onChange: (level: GuidanceLevel) => void
  disabled?: boolean
}

export default function GuidanceLevelSelector({ value, onChange, disabled }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Guidance Level
      </p>
      <div className="flex gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            title={opt.description}
            className={`flex-1 py-1.5 px-2 rounded-lg border text-sm font-medium transition-colors
              ${value === opt.value
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
