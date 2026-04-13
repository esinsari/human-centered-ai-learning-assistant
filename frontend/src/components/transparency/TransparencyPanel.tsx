/**
 * TransparencyPanel
 * Collapsible component shown on every learning session.
 * Surfaces AI caveats per proposal Section 3.3.
 */
import { useState, useEffect } from 'react'
import { getTransparencyInfo } from '@/services/api'
import type { TransparencyInfo } from '@/types'

export default function TransparencyPanel() {
  const [open, setOpen] = useState(false)
  const [info, setInfo] = useState<TransparencyInfo | null>(null)

  useEffect(() => {
    getTransparencyInfo().then(setInfo).catch(() => null)
  }, [])

  return (
    <div className="border border-amber-200 rounded-lg bg-amber-50 text-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 font-medium text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
      >
        <span>⚠️ About AI Guidance</span>
        <span className="text-xs">{open ? '▲ Hide' : '▼ Show'}</span>
      </button>

      {open && info && (
        <div className="px-4 pb-4 text-amber-900 animate-fade-in">
          <p className="font-medium mb-2">{info.disclaimer}</p>
          <ul className="space-y-1 list-disc list-inside text-amber-800">
            {info.caveats.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
