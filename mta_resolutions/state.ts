'use client'

import { I_EvaluationToResolve, I_ResolutionState } from '@/mta_resolutions/types'
import { StateCreator } from 'zustand'

interface I_ResolutionsSlice {
  resolution: {
    evaluationToResolve: I_EvaluationToResolve | null
    storeEvaluationToResolve: (evaluationToResolve: I_EvaluationToResolve) => void
    clearEvaluationToResolve: () => void

    currentPage: number
    storeCurrentPage: (newPage: number) => void

    state: I_ResolutionState | null
    storeState: (resolutionState: I_ResolutionState | null) => void

    lastUpload: string | null
    storeLastUpload: (lastUpload: string) => void

    startedAt: string | null
    maxDurationMinutes: string | null
    storeMetadata: (args: { startedAt: string; maxDurationMinutes: string }) => void
  }
}

const createResolutionsSlice: StateCreator<I_ResolutionsSlice, [], [], I_ResolutionsSlice> = (set) => ({
  resolution: {
    evaluationToResolve: null,
    storeEvaluationToResolve: (evaluationToResolve) => {
      set((state) => ({ ...state, resolution: { ...state.resolution, evaluationToResolve } }))
    },
    clearEvaluationToResolve: () => {
      set((state) => ({ ...state, resolution: { ...state.resolution, evaluationToResolve: null } }))
    },

    currentPage: 1,
    storeCurrentPage: (currentPage) => {
      set((state) => ({ ...state, resolution: { ...state.resolution, currentPage } }))
    },

    state: null,
    storeState: (newState) => {
      set((state) => ({ ...state, resolution: { ...state.resolution, state: newState } }))
    },

    lastUpload: null,
    storeLastUpload: (lastUpload) => {
      set((state) => ({ ...state, resolution: { ...state.resolution, lastUpload } }))
    },

    startedAt: null,
    maxDurationMinutes: null,
    storeMetadata: ({ startedAt, maxDurationMinutes }) => {
      set((state) => ({ ...state, resolution: { ...state.resolution, startedAt, maxDurationMinutes } }))
    },
  },
})

export { createResolutionsSlice }
export type { I_ResolutionsSlice }
