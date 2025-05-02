'use client'

import { I_UserWhoIAmData } from '@/mta_users/types'
import { T_VoidFn } from '@/shared/types'
import { StateCreator } from 'zustand'

interface I_UserSliceDataFields {
  user_whoIAmData: I_UserWhoIAmData | undefined
}

interface I_UserSlice extends I_UserSliceDataFields {
  user_resetState: T_VoidFn
  user_storeWhoIAmData: (data: I_UserWhoIAmData) => void
}

const initialState: I_UserSliceDataFields = {
  user_whoIAmData: undefined,
}

const createUserSlice: StateCreator<I_UserSlice, [], [], I_UserSlice> = (set) => ({
  ...initialState,
  user_resetState: () => set(() => ({ ...initialState })),
  user_storeWhoIAmData: (data: I_UserWhoIAmData) => set(() => ({ user_whoIAmData: data })),
})

export { createUserSlice }
export type { I_UserSlice }
