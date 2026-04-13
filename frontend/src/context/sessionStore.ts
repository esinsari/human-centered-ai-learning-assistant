/**
 * Global store for the active learning session.
 * Keeps frontend in sync with backend session state.
 */
import { create } from 'zustand'
import type { LearningSession, Problem, GuidanceResponse, ScaffoldStage } from '@/types'

interface SessionStore {
  // Active data
  session: LearningSession | null
  problem: Problem | null
  latestGuidance: GuidanceResponse | null

  // UI state
  isLoadingGuidance: boolean
  showReflectionForm: boolean
  showCountdownTimer: boolean
  currentReflectionPrompt: string

  // Actions
  setSession: (s: LearningSession) => void
  setProblem: (p: Problem) => void
  setLatestGuidance: (g: GuidanceResponse) => void
  setLoadingGuidance: (v: boolean) => void
  setShowReflectionForm: (v: boolean) => void
  setShowCountdownTimer: (v: boolean) => void
  setCurrentReflectionPrompt: (p: string) => void
  updateStage: (stage: ScaffoldStage) => void
  reset: () => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  session: null,
  problem: null,
  latestGuidance: null,
  isLoadingGuidance: false,
  showReflectionForm: false,
  showCountdownTimer: false,
  currentReflectionPrompt: '',

  setSession: (session) => set({ session }),
  setProblem: (problem) => set({ problem }),
  setLatestGuidance: (latestGuidance) => set({ latestGuidance }),
  setLoadingGuidance: (isLoadingGuidance) => set({ isLoadingGuidance }),
  setShowReflectionForm: (showReflectionForm) => set({ showReflectionForm }),
  setShowCountdownTimer: (showCountdownTimer) => set({ showCountdownTimer }),
  setCurrentReflectionPrompt: (currentReflectionPrompt) => set({ currentReflectionPrompt }),
  updateStage: (stage) =>
    set((state) => ({
      session: state.session ? { ...state.session, scaffold_stage: stage } : null,
    })),
  reset: () =>
    set({
      session: null,
      problem: null,
      latestGuidance: null,
      isLoadingGuidance: false,
      showReflectionForm: false,
      showCountdownTimer: false,
      currentReflectionPrompt: '',
    }),
}))
