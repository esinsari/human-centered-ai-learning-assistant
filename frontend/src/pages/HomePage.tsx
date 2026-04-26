import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const FEATURES = [
  {
    title: 'Preserves Cognitive Effort',
    desc: 'Guidance is staged — you must attempt and reflect before receiving hints.',
  },
  {
    title: 'Reflection Before Assistance',
    desc: 'Required reflection prompts activate prior knowledge and metacognitive awareness.',
  },
  {
    title: 'Transparent AI',
    desc: 'Every solution includes disclaimers and an alternative explanation option.',
  },
  {
    title: 'Adjustable Guidance',
    desc: 'Choose minimal, moderate, or high scaffolding to match your learning goals.',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4 pt-6">
        <br/><br/>
        <h1 className="text-4xl font-bold text-gray-900">
          Human-Centered AI Learning Assistant
        </h1>
        <br/><br/>
        <Link to="/problems">
          <Button size="lg" className="mt-2 bg-black text-white hover:bg-gray-900">Start Learning →</Button>
        </Link>
        <br/><br/>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURES.map((f) => (
          <Card key={f.title} className="space-y-1">
            <p className="font-semibold text-gray-900">{f.title}</p>
            <p className="text-sm text-gray-600">{f.desc}</p>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <Card variant="highlight">
        <p className="font-semibold text-brand-700 mb-3">How It Works</p>
        <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
          <li>Read the problem and submit your answer.</li>
          <li>If incorrect, write a brief reflection on your current strategy.</li>
          <li>Receive a strategy cue, no answer yet, just direction.</li>
          <li>Request a partial hint after further attempts.</li>
          <li>After meeting effort thresholds, view the full solution with a 5 second reflection pause.</li>
        </ol>
      </Card>
    </div>
  )
}
