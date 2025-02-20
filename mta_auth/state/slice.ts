'use client'

import { I_AuthData, T_Permissions } from '@/mta_auth/types';
import { StateCreator } from "zustand"

interface I_AuthSlice extends I_AuthData {
  storeAuthData: (data: { accessToken: string; refreshToken: string }) => void;
  clearAuthData: () => void
  isAuthorized: () => boolean
  authData: () => I_AuthData
}

const createAuthSlice: StateCreator<I_AuthSlice, [], [], I_AuthSlice> = (set, get) => ({
  accessToken: undefined,
  refreshToken: undefined,
  permissions: ['admin'],
  storeAuthData: ({ accessToken, refreshToken }) =>
    set(() => ({ accessToken, refreshToken })),
  clearAuthData: () =>
    set(() => ({
      accessToken: undefined,
      refreshToken: undefined,
    })),
  isAuthorized: () => {
    return get().accessToken !== undefined
  },
  authData() {
    const { accessToken, refreshToken, permissions } = get()
    return { accessToken, refreshToken, permissions }
  },
})

export { createAuthSlice }
export type {
  I_AuthSlice
}