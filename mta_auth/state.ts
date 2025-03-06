'use client'

import { I_AuthData } from '@/mta_auth/types'
import { StateCreator } from 'zustand'

interface I_AuthSlice extends I_AuthData {
  storeAuthData: (data: I_AuthData) => void
  storeRefreshedToken: (accessToken: string) => void
  clearAuthData: () => void
}

const createAuthSlice: StateCreator<I_AuthSlice, [], [], I_AuthSlice> = (set) => ({
  accessToken: undefined,
  refreshToken: undefined,
  accessGroups: undefined,
  storeAuthData: (data) => set(() => data),
  storeRefreshedToken: (accessToken) => set(() => ({ accessToken: accessToken })),
  clearAuthData: () =>
    set(() => ({
      accessToken: undefined,
      refreshToken: undefined,
      accessGroups: undefined,
    })),
})

export { createAuthSlice }
export type { I_AuthSlice }
