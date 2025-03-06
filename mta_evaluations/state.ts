'use client'

import { T_EvaluationSubjectList } from '@/mta_evaluations/types'
import { StateCreator } from 'zustand'

interface I_EvaluationsSlice {
  storeSubjects: (subjects: T_EvaluationSubjectList) => void
  subjects: T_EvaluationSubjectList | undefined
}

const createEvaluationsSlice: StateCreator<I_EvaluationsSlice, [], [], I_EvaluationsSlice> = (set) => ({
  subjects: undefined,
  storeSubjects: (subjects) => set(() => ({ subjects })),
})

export { createEvaluationsSlice }
export type { I_EvaluationsSlice }
