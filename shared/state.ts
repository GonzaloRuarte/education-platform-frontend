import { createAuthSlice, I_AuthSlice } from '@/mta_auth/state'
import { createEvaluationsSlice, I_EvaluationsSlice } from '@/mta_evaluations/state'
import { createResolutionsSlice, I_ResolutionsSlice } from '@/mta_resolutions/state'
import { createSchoolSlice, I_SchoolSlice } from '@/mta_schools/state'
import { createUserSlice, I_UserSlice } from '@/mta_users/state'
import { create, StateCreator } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

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

const PERSIST_KEY = 'meta_system-data'
const PERSIST_VERSION = 8

const excludeForPartialize = (state: T_CombinedSlices, fields: Array<keyof T_CombinedSlices>) =>
  Object.fromEntries<T_CombinedSlices>(
    Object.entries(state).filter(([key]) => !fields.includes(key as keyof T_CombinedSlices)),
  )

const cleanupLegacyOversizedPersistedState = () => {
  if (typeof window === 'undefined') return

  try {
    const raw = window.localStorage.getItem(PERSIST_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw)

    if (!parsed || typeof parsed !== 'object') {
      window.localStorage.removeItem(PERSIST_KEY)
      return
    }

    if (parsed.state && typeof parsed.state === 'object') {
      delete parsed.state.resolution_evaluation
      delete parsed.state.resolution_state
      window.localStorage.setItem(PERSIST_KEY, JSON.stringify(parsed))
    }
  } catch {
    window.localStorage.removeItem(PERSIST_KEY)
  }
}

cleanupLegacyOversizedPersistedState()

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
        name: PERSIST_KEY,
        version: PERSIST_VERSION,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) =>
          excludeForPartialize(state, [
            'core_isInProgress',
            'evaluations_subjects',
            'evaluations_subjectLabels',
            'resolution_remainingTimeWarningAlreadyDisplayed',
            'resolution_evaluation',
            'resolution_state',
            'resolution_runtimeStatus',
            'resolution_runtimeMessage',
            'resolution_timerSyncedMonotonicMs',
          ]),
        migrate: (persistedState) => {
          const next = (persistedState ?? {}) as Partial<T_CombinedSlices>

          delete (next as any).resolution_evaluation
          delete (next as any).resolution_state
          delete (next as any).resolution_runtimeStatus
          delete (next as any).resolution_runtimeMessage
          delete (next as any).resolution_timerSyncedClientEpochMs
          delete (next as any).resolution_timerSyncedMonotonicMs

          delete (next as any).resolution_hasSuccessfulResumeForCurrentIdentity

          if ((next as any).resolution_successfulResumeIdentityKey === undefined) {
            ;(next as any).resolution_successfulResumeIdentityKey = null
          }

          if ((next as any).resolution_requiresFinalizationOnAction === undefined) {
            ;(next as any).resolution_requiresFinalizationOnAction = false
          }

          return next as T_CombinedSlices
        },
      },
    ),
  ),
)

export { useStore }