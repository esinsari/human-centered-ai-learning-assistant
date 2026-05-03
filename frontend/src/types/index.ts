// ─── Enums ────────────────────────────────────────────────────────────────────

export type GuidanceLevel = 'minimal' | 'moderate' | 'high'

export type ScaffoldStage = 'none' | 'strategy_cue' | 'partial_hint' | 'full_solution'

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface Problem {
  id: number
  title: string
  subject: string
  difficulty: string
  statement: string
  correct_option?: string | null
  option_a?: string | null
  option_b?: string | null
  option_c?: string | null
  option_d?: string | null
  created_at: string
}

export interface LearningSession {
  id: number
  session_token: string
  problem_id: number
  guidance_level: GuidanceLevel
  scaffold_stage: ScaffoldStage
  attempt_count: number
  reflection_done: boolean
  completed: boolean
  created_at: string
}

export interface Attempt {
  id: number
  session_id: number
  answer_text: string
  is_correct: boolean | null
  submitted_at: string
}

export interface AttemptResponse {
  attempt: Attempt
  session: LearningSession
  feedback: 'correct' | 'incorrect' | 'needs_reflection'
  next_action: 'correct' | 'reflect' | 'request_guidance'
  solution?: string | null
}

export interface Reflection {
  id: number
  session_id: number
  prompt_text: string
  response_text: string
  stage: ScaffoldStage
  submitted_at: string
}

export interface ReflectionResponse {
  accepted: boolean
  nudge?: string | null
  reflection?: Reflection | null
}

export interface GuidanceResponse {
  stage: ScaffoldStage
  content: string
  reflection_required: boolean
  reflection_prompt?: string
  effort_gate: boolean
  timer_seconds?: number
}

export interface AlternativeExplanationResponse {
  explanation: string
  disclaimer: string
}

export interface TransparencyInfo {
  disclaimer: string
  caveats: string[]
}
