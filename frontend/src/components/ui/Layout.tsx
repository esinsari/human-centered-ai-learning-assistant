import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { getProblems, createSession } from '@/services/api'
import type { Problem, GuidanceLevel } from '@/types'

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [problems, setProblems] = useState<Problem[]>([])
  const [starting, setStarting] = useState<number | null>(null)

  useEffect(() => {
    getProblems().then(setProblems).catch(() => [])
  }, [])

  const handleProblemClick = async (id: number) => {
    setStarting(id)
    try {
      const session = await createSession(id, 'moderate' as GuidanceLevel)
      navigate(`/session/${session.session_token}`)
    } finally {
      setStarting(null)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#111' }}>

      {/* ── Dark navy sidebar ── */}
      <aside
        className="w-52 flex-shrink-0 flex flex-col"
        style={{ background: '#1e2060', minHeight: '100vh' }}
      >
        {/* Sidebar header */}
        <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <Link to="/" className="text-white font-bold text-base leading-tight block">
            Learning Session
          </Link>
        </div>

        {/* Top nav */}
        <div className="px-5 pt-4 pb-2">
          <Link
            to="/problems"
            className="block text-sm py-1 transition-colors"
            style={{
              color: location.pathname === '/problems' ? '#fff' : '#93c5fd',
            }}
          >
            Problems
          </Link>
        </div>

        {/* Problem list */}
        <div className="px-5 pt-1 flex flex-col gap-0.5">
          {problems.map((p) => {
            const isActive = location.pathname.includes('session') && false // highlight active session
            return (
              <button
                key={p.id}
                onClick={() => handleProblemClick(p.id)}
                disabled={starting === p.id}
                className="text-left text-xs py-1.5 w-full transition-colors"
                style={{
                  color: isActive ? '#fff' : '#94a3b8',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {starting === p.id ? 'Starting…' : p.title}
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col bg-white">
        <main className="flex-1 overflow-hidden">
          {children}
        </main>

        {/* Footer */}
        <footer
          className="px-6 py-2.5 text-xs border-t"
          style={{ background: '#e8e8e8', color: '#888', borderColor: '#ddd' }}
        >
          AI responses may contain inaccuracies. Verify independently.
        </footer>
      </div>
    </div>
  )
}
