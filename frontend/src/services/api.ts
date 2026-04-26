import axios from 'axios'
import type {
  Problem,
  LearningSession,
  AttemptResponse,
  ReflectionResponse,
  GuidanceResponse,
  AlternativeExplanationResponse,
  TransparencyInfo,
  GuidanceLevel,
  ScaffoldStage,
} from '@/types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

// ─── Problems ────────────────────────────────────────────────────────────────

export const getProblems = (subject?: string, difficulty?: string) =>
  api.get<Problem[]>('/api/problems/', { params: { subject, difficulty } }).then(r => r.data)

export const getProblem = (id: number) =>
  api.get<Problem>(`/api/problems/${id}`).then(r => r.data)

// ─── Sessions ────────────────────────────────────────────────────────────────

export const createSession = (problemId: number, guidanceLevel: GuidanceLevel = 'moderate') =>
  api.post<LearningSession>('/api/sessions/', {
    problem_id: problemId,
    guidance_level: guidanceLevel,
  }).then(r => r.data)

export const getSession = (token: string) =>
  api.get<LearningSession>(`/api/sessions/${token}`).then(r => r.data)

export const updateSession = (token: string, patch: { guidance_level?: GuidanceLevel; confidence_rating?: number }) =>
  api.patch<LearningSession>(`/api/sessions/${token}`, patch).then(r => r.data)

export const submitAttempt = (token: string, answerText: string) =>
  api.post<AttemptResponse>(`/api/sessions/${token}/attempts`, {
    answer_text: answerText,
  }).then(r => r.data)

export const submitReflection = (
  token: string,
  promptText: string,
  responseText: string,
  stage: ScaffoldStage,
) =>
  api.post<ReflectionResponse>(`/api/sessions/${token}/reflections`, {
    prompt_text: promptText,
    response_text: responseText,
    stage,
  }).then(r => r.data)

// ─── Guidance ────────────────────────────────────────────────────────────────

export const requestGuidance = (sessionToken: string) =>
  api.post<GuidanceResponse>('/api/guidance/next', { session_token: sessionToken }).then(r => r.data)

export const requestExplanation = (sessionToken: string) =>
  api.post<GuidanceResponse>('/api/guidance/explanation', { session_token: sessionToken }).then(r => r.data)

export const advanceStage = (sessionToken: string) =>
  api.post<{ stage: ScaffoldStage }>('/api/guidance/advance', { session_token: sessionToken }).then(r => r.data)

// ─── Transparency ─────────────────────────────────────────────────────────────

export const getTransparencyInfo = () =>
  api.get<TransparencyInfo>('/api/transparency/info').then(r => r.data)

export const getAlternativeExplanation = (sessionToken: string, originalSolution: string) =>
  api.post<AlternativeExplanationResponse>('/api/transparency/alternative-explanation', {
    session_token: sessionToken,
    original_solution: originalSolution,
  }).then(r => r.data)
