'use client'

import { I_SchoolName, T_SchoolNames } from '@/mta_schools/types'
import { T_VoidFn } from '@/shared/types'
import { StateCreator } from 'zustand'

interface I_SchoolSliceDataFields {
  school_accessibleSchools: T_SchoolNames | undefined
  school_selectedSchool: I_SchoolName | undefined | null
}

interface I_SchoolSlice extends I_SchoolSliceDataFields {
  school_resetState: T_VoidFn
  school_storeSchoolScope: (data: { accessibleSchools: T_SchoolNames; selectedSchool: I_SchoolName | null }) => void
  school_setSelectedSchool: (data: I_SchoolName | null) => void
}

const initialState: I_SchoolSliceDataFields = {
  school_accessibleSchools: undefined,
  school_selectedSchool: undefined,
}

const createSchoolSlice: StateCreator<I_SchoolSlice, [], [], I_SchoolSlice> = (set) => ({
  ...initialState,
  school_resetState: () => set(() => ({ ...initialState })),
  school_storeSchoolScope: ({ accessibleSchools, selectedSchool }) =>
    set(() => ({ school_accessibleSchools: accessibleSchools, school_selectedSchool: selectedSchool })),
  school_setSelectedSchool: (data) => set(() => ({ school_selectedSchool: data })),
})

export { createSchoolSlice }
export type { I_SchoolSlice }
