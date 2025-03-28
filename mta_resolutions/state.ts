'use client'

import { I_ResumeResolutionResponse, I_ResolutionState } from '@/mta_resolutions/types'
import { StateCreator } from 'zustand'

interface I_ResolutionsSlice {
  storeEvaluationToResolve: (evaluation: I_ResumeResolutionResponse | null) => void
  evaluationToResolve: I_ResumeResolutionResponse | null
  resolutionCurrentPage: number
  storeResolutionCurrentPage: (newPage: number) => void
  resolutionState: I_ResolutionState | null
  storeResolutionState: (resolutionState: I_ResolutionState | null) => void
  lastResolutionStateUpload: string | null
  storeLastResolutionStateUpload: (lastResolutionStateUpload: string) => void
}

const createResolutionsSlice: StateCreator<I_ResolutionsSlice, [], [], I_ResolutionsSlice> = (set) => ({
  evaluationToResolve: null,
  storeEvaluationToResolve: (evaluationToResolve) => set(() => ({ evaluationToResolve })),
  resolutionCurrentPage: 1,
  storeResolutionCurrentPage: (resolutionCurrentPage) => set(() => ({ resolutionCurrentPage })),
  resolutionState: null,
  storeResolutionState: (resolutionState) => set(() => ({ resolutionState })),
  lastResolutionStateUpload: null,
  storeLastResolutionStateUpload: (lastResolutionStateUpload) => set(() => ({ lastResolutionStateUpload })),
})

export { createResolutionsSlice }
export type { I_ResolutionsSlice }
