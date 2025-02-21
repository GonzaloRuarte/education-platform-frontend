
import { createAuthSlice, I_AuthSlice } from '@/mta_auth/state/slice'
import { create, StateCreator } from 'zustand'
import { devtools, persist } from 'zustand/middleware'


interface I_CoreSlice {
  currentPage: string | undefined
  setCurrentPage: (newPage: string) => void
}



const createCoreSlice: StateCreator<
  I_CoreSlice,
  [],
  [],
  I_CoreSlice
> = (set) => ({
  currentPage: undefined,
  setCurrentPage: (newPage) => set(() => ({ currentPage: newPage }))
})

type T_CombinedSlices = I_AuthSlice & I_CoreSlice

const useStore = create<T_CombinedSlices>()(
  devtools(
    persist(
      (...args) => ({
        ...createAuthSlice(...args),
        ...createCoreSlice(...args),
      }),
      {
        name: 'meta_system-data'
      }
    )
  )
)




export {
  useStore
}
