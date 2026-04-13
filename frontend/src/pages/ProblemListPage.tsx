import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProblems, createSession } from '@/services/api'
import type { Problem, GuidanceLevel } from '@/types'

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  easy:   { bg: '#dcfce7', text: '#15803d' },
  medium: { bg: '#fef9c3', text: '#a16207' },
  hard:   { bg: '#fee2e2', text: '#dc2626' },
}

export default function ProblemListPage() {
  const navigate = useNavigate()
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [guidanceLevel, setGuidanceLevel] = useState<GuidanceLevel>('moderate')
  const [starting, setStarting] = useState<number | null>(null)

  useEffect(() => {
    getProblems().then(setProblems).finally(() => setLoading(false))
  }, [])

  const handleStart = async (id: number) => {
    setStarting(id)
    try {
      const session = await createSession(id, guidanceLevel)
      navigate(`/session/${session.session_token}`)
    } finally {
      setStarting(null)
    }
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 49px)' }}>
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Problems</h1>
        {/* Guidance level selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 mr-1">Guidance level:</span>
          {(['minimal', 'moderate', 'high'] as GuidanceLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setGuidanceLevel(lvl)}
              className="text-sm px-3 py-1 rounded border capitalize transition-colors"
              style={{
                background: guidanceLevel === lvl ? '#1e2060' : '#f5f5f5',
                color: guidanceLevel === lvl ? '#fff' : '#555',
                borderColor: guidanceLevel === lvl ? '#1e2060' : '#ddd',
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {loading && <p className="text-gray-400 text-sm">Loading problems…</p>}

        {!loading && problems.length === 0 && (
          <div
            className="rounded-lg p-6 text-sm text-gray-500 border"
            style={{ background: '#f9f9f9', borderColor: '#eee' }}
          >
            No problems found. Run{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
              python seed.py
            </code>{' '}
            in the backend folder to add sample problems.
          </div>
        )}

        <div className="flex flex-col gap-3">
          {problems.map((p) => {
            const dc = DIFFICULTY_COLORS[p.difficulty] ?? { bg: '#f5f5f5', text: '#555' }
            return (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-4 rounded-lg border bg-white"
                style={{ borderColor: '#e8e8e8' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">{p.title}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{ background: dc.bg, color: dc.text }}
                    >
                      {p.difficulty}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{p.subject}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{p.statement}</p>
                </div>
                <button
                  onClick={() => handleStart(p.id)}
                  disabled={starting === p.id}
                  className="ml-4 px-4 py-1.5 rounded text-sm font-semibold text-white flex-shrink-0"
                  style={{ background: '#22c55e' }}
                >
                  {starting === p.id ? 'Starting…' : 'Start'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
