'use client'

import { StateCreator } from "zustand"

interface I_AuthSlice {
  accessToken: string | undefined
  refreshToken: string | undefined
  storeAuthData: (data: { accessToken: string; refreshToken: string }) => void;
  clearAuthData: () => void
  isAuthorized: () => boolean
}

const createAuthSlice: StateCreator<I_AuthSlice, [], [], I_AuthSlice> = (set, get) => ({
  accessToken: undefined,
  refreshToken: undefined,
  storeAuthData: ({ accessToken, refreshToken }) =>
    set(() => ({ accessToken, refreshToken })),
  clearAuthData: () =>
    set(() => ({
      accessToken: undefined,
      refreshToken: undefined,
    })),
  isAuthorized: () => {
    const state = get()
    return state.accessToken !== undefined
  }
})

export { createAuthSlice }
export type {
  I_AuthSlice
}