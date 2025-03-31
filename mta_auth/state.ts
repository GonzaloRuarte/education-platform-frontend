'use client'

import { I_AuthData } from '@/mta_auth/types'
import { T_VoidFn } from '@/shared/types'
import { StateCreator } from 'zustand'

interface I_AuthSlice extends I_AuthData {
  storeAuthData: (data: I_AuthData) => void
  storeRefreshedToken: (accessToken: string) => void
  clearAuthData: T_VoidFn
}

const createAuthSlice: StateCreator<I_AuthSlice, [], [], I_AuthSlice> = (set) => ({
  accessToken: undefined,
  refreshToken: undefined,
  accessGroups: undefined,
  storeAuthData: (data) => set(() => data),
  storeRefreshedToken: (accessToken) => set(() => ({ accessToken })),
  clearAuthData: () =>
    set(() => ({
      accessToken: undefined,
      refreshToken: undefined,
      accessGroups: undefined,
    })),
})

export { createAuthSlice }
export type { I_AuthSlice }
