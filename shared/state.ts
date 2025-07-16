import { createAuthSlice, I_AuthSlice } from '@/mta_auth/state'
import { createEvaluationsSlice, I_EvaluationsSlice } from '@/mta_evaluations/state'
import { createResolutionsSlice, I_ResolutionsSlice } from '@/mta_resolutions/state'
import { createSchoolSlice, I_SchoolSlice } from '@/mta_schools/state'
import { createUserSlice, I_UserSlice } from '@/mta_users/state'
import { create, StateCreator } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface I_CoreSlice {
  core_isInProgress: boolean
  core_setIsInProgress: (status: boolean) => void
}

const createCoreSlice: StateCreator<I_CoreSlice, [], [], I_CoreSlice> = (set) => ({
  core_isInProgress: false,
  core_setIsInProgress: (status) => set(() => ({ core_isInProgress: status })),
})

type T_CombinedSlices = I_AuthSlice &
  I_CoreSlice &
  I_EvaluationsSlice &
  I_ResolutionsSlice &
  I_UserSlice &
  I_SchoolSlice

const excludeForPartialize = (state: T_CombinedSlices, fields: Array<keyof T_CombinedSlices>) =>
  Object.fromEntries<T_CombinedSlices>(
    Object.entries(state).filter(([key]) => !fields.includes(key as keyof T_CombinedSlices)),
  )

const useStore = create<T_CombinedSlices>()(
  devtools(
    persist(
      (...args) => ({
        ...createAuthSlice(...args),
        ...createEvaluationsSlice(...args),
        ...createResolutionsSlice(...args),
        ...createUserSlice(...args),
        ...createSchoolSlice(...args),
        ...createCoreSlice(...args),
      }),
      {
        name: 'meta_system-data',
        partialize: (state) =>
          excludeForPartialize(state, [
            'core_isInProgress',
            'evaluations_subjects',
            'evaluations_subjectLabels',          // ← NEW
            'resolution_remainingTimeWarningAlreadyDisplayed',
          ]),
      },
    ),
  ),
)

export { useStore }
