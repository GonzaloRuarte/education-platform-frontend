'use client'

import { I_AuthData } from '@/mta_auth/types'
import { T_VoidFn } from '@/shared/types'
import { StateCreator } from 'zustand'

interface I_AuthSliceDataFields {
  auth_accessToken: I_AuthData['accessToken']
  auth_refreshToken: I_AuthData['refreshToken']
  auth_profiles: I_AuthData['profiles']
}
interface I_AuthSlice extends I_AuthSliceDataFields {
  auth_storeAuthData: (data: I_AuthData) => void
  auth_storeRefreshedToken: (accessToken: string) => void
  auth_clearAuthData: T_VoidFn
}

const initialState: I_AuthSliceDataFields = {
  auth_accessToken: undefined,
  auth_refreshToken: undefined,
  auth_profiles: undefined,
}

const createAuthSlice: StateCreator<I_AuthSlice, [], [], I_AuthSlice> = (set) => ({
  ...initialState,

  auth_storeAuthData: (data) =>
    set(() => ({
      auth_accessToken: data.accessToken,
      auth_refreshToken: data.refreshToken,
      auth_profiles: data.profiles,
    })),
  auth_storeRefreshedToken: (accessToken) => set(() => ({ auth_accessToken: accessToken })),
  auth_clearAuthData: () => set(() => initialState),
})

export { createAuthSlice }
export type { I_AuthSlice }
