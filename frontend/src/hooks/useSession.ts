/**
 * useSession — main hook for the LearningSessionPage.
 * Wraps all API calls and drives session state transitions.
 */
import { useCallback, useEffect } from 'react'
import { useSessionStore } from '@/context/sessionStore'
import * as api from '@/services/api'
import type { GuidanceLevel, ScaffoldStage } from '@/types'

export function useSession(sessionToken: string) {
  const store = useSessionStore()

  // Load session + problem on mount
  useEffect(() => {
    if (!sessionToken) return
    api.getSession(sessionToken).then((session) => {
      store.setSession(session)
      api.getProblem(session.problem_id).then(store.setProblem)
    })
  }, [sessionToken])

  // ─── Answer submission ────────────────────────────────────────────────────

  const submitAnswer = useCallback(
    async (answerText: string) => {
      const result = await api.submitAttempt(sessionToken, answerText)
      store.setSession(result.session)

      let guidance = undefined
      if (result.next_action === 'reflect') {
        const currentStage = result.session.scaffold_stage
        if (currentStage === 'strategy_cue' || currentStage === 'partial_hint') {
          // Already shown guidance for this stage — advance and generate the next stage's content
          // without requiring a new reflection (uses the /explanation endpoint)
          store.setLoadingGuidance(true)
          try {
            guidance = await api.requestExplanation(sessionToken)
            if (guidance) store.setLatestGuidance(guidance)
            const updated = await api.getSession(sessionToken)
            store.setSession(updated)
          } finally {
            store.setLoadingGuidance(false)
          }
        } else {
          // First attempt wrong — get reflection prompt as usual
          guidance = await handleRequestGuidance()
        }
      }
      return { ...result, guidance }
    },
    [sessionToken],
  )

  // ─── Guidance request ─────────────────────────────────────────────────────

  const handleRequestGuidance = useCallback(async () => {
    store.setLoadingGuidance(true)
    try {
      const guidance = await api.requestGuidance(sessionToken)
      store.setLatestGuidance(guidance)

      if (guidance.reflection_required && guidance.reflection_prompt) {
        store.setCurrentReflectionPrompt(guidance.reflection_prompt)
        store.setShowReflectionForm(true)
      } else if (guidance.stage === 'full_solution' && guidance.timer_seconds) {
        store.setShowCountdownTimer(true)
      }
      return guidance
    } finally {
      store.setLoadingGuidance(false)
    }
  }, [sessionToken])

  // ─── Reflection submission ────────────────────────────────────────────────

  const submitReflection = useCallback(
    async (responseText: string, stage: ScaffoldStage) => {
      const prompt = store.currentReflectionPrompt
      const result = await api.submitReflection(sessionToken, prompt, responseText, stage)

      if (!result.accepted) {
        return { accepted: false, nudge: result.nudge ?? null, guidance: null }
      }

      // Accepted — fetch strategy cue content BEFORE advancing (reflection_done=True bypasses the
      // reflection gate, so get_next_guidance returns strategy_cue content directly)
      const guidance = await api.requestGuidance(sessionToken)

      // Now advance stage (none → strategy_cue) and sync session
      await api.advanceStage(sessionToken)
      const updatedSession = await api.getSession(sessionToken)
      store.setSession(updatedSession)
      store.setShowReflectionForm(false)

      return { accepted: true, nudge: null, guidance }
    },
    [sessionToken, store.currentReflectionPrompt],
  )

  // ─── Timer complete (user confirmed solution view) ────────────────────────

  const confirmSolutionView = useCallback(async () => {
    store.setShowCountdownTimer(false)
    await api.advanceStage(sessionToken)
    const session = await api.getSession(sessionToken)
    store.setSession(session)
  }, [sessionToken])

  // ─── Settings ─────────────────────────────────────────────────────────────

  const updateGuidanceLevel = useCallback(
    async (level: GuidanceLevel) => {
      const updated = await api.updateSession(sessionToken, { guidance_level: level })
      store.setSession(updated)
    },
    [sessionToken],
  )

  const submitConfidence = useCallback(
    async (rating: number) => {
      const updated = await api.updateSession(sessionToken, { confidence_rating: rating })
      store.setSession(updated)
    },
    [sessionToken],
  )

  return {
    session: store.session,
    problem: store.problem,
    latestGuidance: store.latestGuidance,
    isLoadingGuidance: store.isLoadingGuidance,
    showReflectionForm: store.showReflectionForm,
    showCountdownTimer: store.showCountdownTimer,
    currentReflectionPrompt: store.currentReflectionPrompt,
    submitAnswer,
    requestGuidance: handleRequestGuidance,
    submitReflection,
    confirmSolutionView,
    updateGuidanceLevel,
    submitConfidence,
  }
}
