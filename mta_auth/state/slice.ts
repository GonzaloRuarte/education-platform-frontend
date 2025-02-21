'use client'

import { I_AuthData } from '@/mta_auth/types';
import { StateCreator } from "zustand"

interface I_AuthSlice extends I_AuthData {
  storeAuthData: (data: { accessToken: string; refreshToken: string }) => void;
  clearAuthData: () => void
}

const createAuthSlice: StateCreator<I_AuthSlice, [], [], I_AuthSlice> = (set, get) => ({
  accessToken: undefined,
  refreshToken: undefined,
  accessGroups: ['admin'],
  storeAuthData: ({ accessToken, refreshToken }) =>
    set(() => ({ accessToken, refreshToken })),
  clearAuthData: () =>
    set(() => ({
      accessToken: undefined,
      refreshToken: undefined,
    })),
})

export { createAuthSlice }
export type {
  I_AuthSlice
}