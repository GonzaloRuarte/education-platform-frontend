import { createAuthSlice, I_AuthSlice } from '@/mta_auth/state'
import { createEvaluationsSlice, I_EvaluationsSlice } from '@/mta_evaluations/state'
import { createResolutionsSlice, I_ResolutionsSlice } from '@/mta_resolutions/state'
import { create, StateCreator } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface I_CoreSlice {
  isInProgress: boolean
  setIsInProgress: (status: boolean) => void
}

const createCoreSlice: StateCreator<I_CoreSlice, [], [], I_CoreSlice> = (set) => ({
  isInProgress: false,
  setIsInProgress: (status) => set(() => ({ isInProgress: status })),
})

type T_CombinedSlices = I_AuthSlice & I_CoreSlice & I_EvaluationsSlice & I_ResolutionsSlice

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
        ...createCoreSlice(...args),
      }),
      {
        name: 'meta_system-data',
        partialize: (state) =>
          excludeForPartialize(state, ['isInProgress', 'subjects', 'resolution_remainingTimeWarningAlreadyDisplayed']),
      },
    ),
  ),
)

export { useStore }
