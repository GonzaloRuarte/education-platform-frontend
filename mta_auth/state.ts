'use client'

import { I_AuthData } from '@/mta_auth/types'
import { T_VoidFn } from '@/shared/types'
import { StateCreator } from 'zustand'

interface I_AuthSlice {
  auth_storeAuthData: (data: I_AuthData) => void
  auth_storeRefreshedToken: (accessToken: string) => void
  auth_clearAuthData: T_VoidFn
  auth_accessToken: I_AuthData['accessToken']
  auth_refreshToken: I_AuthData['refreshToken']
  auth_profiles: I_AuthData['profiles']
}

const createAuthSlice: StateCreator<I_AuthSlice, [], [], I_AuthSlice> = (set) => ({
  auth_accessToken: undefined,
  auth_refreshToken: undefined,
  auth_profiles: undefined,
  auth_storeAuthData: (data) =>
    set(() => ({
      auth_accessToken: data.accessToken,
      auth_refreshToken: data.refreshToken,
      auth_profiles: data.profiles,
    })),
  auth_storeRefreshedToken: (accessToken) => set(() => ({ auth_accessToken: accessToken })),
  auth_clearAuthData: () =>
    set(() => ({
      auth_accessToken: undefined,
      auth_refreshToken: undefined,
      auth_profiles: undefined,
    })),
})

export { createAuthSlice }
export type { I_AuthSlice }
