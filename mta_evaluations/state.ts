'use client'

import { T_EvaluationSubjectList } from '@/mta_evaluations/types'
import { StateCreator } from 'zustand'

interface I_EvaluationsSlice {
  evaluations_subjects: T_EvaluationSubjectList | undefined;
  evaluations_subjectLabels: Record<string, string>;     // ← NEW
  evaluations_storeSubjects: (subjects: T_EvaluationSubjectList) => void;
}

const createEvaluationsSlice: StateCreator<I_EvaluationsSlice> = (set) => ({
  evaluations_subjects: undefined,
  evaluations_subjectLabels: {},                         // ← NEW
  evaluations_storeSubjects: (subjects) =>
    set(() => ({
      evaluations_subjects: subjects,
      evaluations_subjectLabels: Object.fromEntries(
        subjects.map(({ id, name }) => [id, name]),
      ),
    })),
});

export { createEvaluationsSlice }
export type { I_EvaluationsSlice }
