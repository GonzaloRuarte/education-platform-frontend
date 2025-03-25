'use client'

import { I_EvaluationToResolve } from '@/mta_resolutions/types'
import { StateCreator } from 'zustand'

interface I_ResolutionsSlice {
  storeEvaluationToResolve: (evaluation: I_EvaluationToResolve) => void
  evaluationToResolve: I_EvaluationToResolve | undefined
}

const createResolutionsSlice: StateCreator<I_ResolutionsSlice, [], [], I_ResolutionsSlice> = (set) => ({
  evaluationToResolve: undefined,
  storeEvaluationToResolve: (evaluationToResolve) => set(() => ({ evaluationToResolve })),
})

export { createResolutionsSlice }
export type { I_ResolutionsSlice }
