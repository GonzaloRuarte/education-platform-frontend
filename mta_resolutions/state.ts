'use client'

import { I_ResumeResolutionResponse, I_ResolutionState } from '@/mta_resolutions/types'
import { StateCreator } from 'zustand'

interface I_ResolutionsSlice {
  storeEvaluationToResolve: (evaluation: I_ResumeResolutionResponse | undefined) => void
  evaluationToResolve: I_ResumeResolutionResponse | undefined
  resolutionCurrentPage: number
  storeResolutionCurrentPage: (newPage: number) => void
  resolutionState: I_ResolutionState | undefined
  storeResolutionState: (resolutionState: I_ResolutionState | undefined) => void
}

const createResolutionsSlice: StateCreator<I_ResolutionsSlice, [], [], I_ResolutionsSlice> = (set) => ({
  evaluationToResolve: undefined,
  storeEvaluationToResolve: (evaluationToResolve) => set(() => ({ evaluationToResolve })),
  resolutionCurrentPage: 1,
  storeResolutionCurrentPage: (resolutionCurrentPage) => set(() => ({ resolutionCurrentPage })),
  resolutionState: undefined,
  storeResolutionState: (resolutionState) => set(() => ({ resolutionState })),
})

export { createResolutionsSlice }
export type { I_ResolutionsSlice }
