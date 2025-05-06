'use client'

import { I_SchoolName } from '@/mta_schools/types'
import { T_VoidFn } from '@/shared/types'
import { StateCreator } from 'zustand'

interface I_SchoolSliceDataFields {
  school_ownSchool: I_SchoolName | undefined | null
}

interface I_SchoolSlice extends I_SchoolSliceDataFields {
  school_resetState: T_VoidFn
  school_storeOwnSchool: (data: I_SchoolName | null) => void
}

const initialState: I_SchoolSliceDataFields = {
  school_ownSchool: undefined,
}

const createSchoolSlice: StateCreator<I_SchoolSlice, [], [], I_SchoolSlice> = (set) => ({
  ...initialState,
  school_resetState: () => set(() => ({ ...initialState })),
  school_storeOwnSchool: (data: I_SchoolName | null) => set(() => ({ school_ownSchool: data })),
})

export { createSchoolSlice }
export type { I_SchoolSlice }
