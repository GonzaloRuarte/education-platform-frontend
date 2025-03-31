'use client'

import { I_EvaluationToResolve, I_ResolutionState } from '@/mta_resolutions/types'
import { StateCreator } from 'zustand'

interface I_ResolutionsSlice {
  resolution_evaluation: I_EvaluationToResolve | null
  resolution_storeEvaluation: (resolution_evaluation: I_EvaluationToResolve) => void
  resolution_clearEvaluation: () => void

  resolution_currentPage: number
  resolution_storeCurrentPage: (resolution_currentPage: number) => void

  resolution_state: I_ResolutionState | null
  resolution_storeState: (resolutionState: I_ResolutionState | null) => void

  resolution_lastUpload: string | null
  resolution_storeLastUpload: (lastUpload: string) => void

  resolution_startedAt: string | null
  resolution_maxDurationMinutes: string | null
  resolution_storeMetadata: (args: { resolution_startedAt: string; resolution_maxDurationMinutes: string }) => void
}

const createResolutionsSlice: StateCreator<I_ResolutionsSlice, [], [], I_ResolutionsSlice> = (set) => ({
  resolution_evaluation: null,
  resolution_storeEvaluation: (resolution_evaluation) => set(() => ({ resolution_evaluation })),
  resolution_clearEvaluation: () => set(() => ({ resolution_evaluation: null })),

  resolution_currentPage: 1,
  resolution_storeCurrentPage: (resolution_currentPage) => () => set(() => ({ resolution_currentPage })),

  resolution_state: null,
  resolution_storeState: (resolution_state) => set(() => ({ resolution_state })),

  resolution_lastUpload: null,
  resolution_storeLastUpload: (resolution_lastUpload) => set(() => ({ resolution_lastUpload })),

  resolution_startedAt: null,
  resolution_maxDurationMinutes: null,
  resolution_storeMetadata: (args: { resolution_startedAt: string; resolution_maxDurationMinutes: string }) =>
    set(() => ({ ...args })),
})

export { createResolutionsSlice }
export type { I_ResolutionsSlice }
