import { createAuthSlice, I_AuthSlice } from '@/mta_auth/state/slice'
import { create, StateCreator } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface I_CoreSlice {
  currentPage: string | undefined
  setCurrentPage: (newPage: string) => void
  isInProgress: boolean
  setIsInProgress: (status: boolean) => void
}

const createCoreSlice: StateCreator<I_CoreSlice, [], [], I_CoreSlice> = (set) => ({
  currentPage: undefined,
  setCurrentPage: (newPage) => set(() => ({ currentPage: newPage })),
  isInProgress: false,
  setIsInProgress: (status) => set(() => ({ isInProgress: status })),
})

type T_CombinedSlices = I_AuthSlice & I_CoreSlice

const excludeForPartialize = (state: T_CombinedSlices, fields: Array<keyof T_CombinedSlices>) =>
  Object.fromEntries<T_CombinedSlices>(
    Object.entries(state).filter(([key]) => !fields.includes(key as keyof T_CombinedSlices)),
  )

const useStore = create<T_CombinedSlices>()(
  devtools(
    persist(
      (...args) => ({
        ...createAuthSlice(...args),
        ...createCoreSlice(...args),
      }),
      {
        name: 'meta_system-data',
        partialize: (state) => excludeForPartialize(state, ['isInProgress']),
      },
    ),
  ),
)

export { useStore }
