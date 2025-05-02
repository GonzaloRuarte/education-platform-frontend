'use client'

import { T_EvaluationSubjectList } from '@/mta_evaluations/types'
import { StateCreator } from 'zustand'

interface I_EvaluationsSlice {
  evaluations_storeSubjects: (subjects: T_EvaluationSubjectList) => void
  evaluations_subjects: T_EvaluationSubjectList | undefined
}

const createEvaluationsSlice: StateCreator<I_EvaluationsSlice, [], [], I_EvaluationsSlice> = (set) => ({
  evaluations_subjects: undefined,
  evaluations_storeSubjects: (subjects) => set(() => ({ evaluations_subjects: subjects })),
})

export { createEvaluationsSlice }
export type { I_EvaluationsSlice }
