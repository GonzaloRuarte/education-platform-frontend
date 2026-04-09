'use client'

import { I_EvaluationToResolve, I_ResolutionState } from '@/mta_resolutions/types'
import { StateCreator } from 'zustand'

export type T_ResolutionRuntimeStatus =
  | 'idle'
  | 'resuming'
  | 'active'
  | 'offline_recovery'
  | 'verifying_timeout'
  | 'timeout_pending_confirmation'
  | 'expired'
  | 'resume_error'

interface I_ResolutionSliceDataFields {
  resolution_evaluation: I_EvaluationToResolve | null
  resolution_currentPage: number
  resolution_requiresAccessibility: boolean
  resolution_state: I_ResolutionState | null
  resolution_lastUpload: string | null
  resolution_startedAt: string | null
  resolution_maxDurationMinutes: number | null
  resolution_submitByTime: string | null
  resolution_serverNowAtSync: string | null
  resolution_timerSyncedClientEpochMs: number | null
  resolution_remainingTimeWarningAlreadyDisplayed: boolean
  resolution_pin: number | null
  resolution_offlineSubmitted: boolean
  resolution_runtimeStatus: T_ResolutionRuntimeStatus
  resolution_runtimeMessage: string | null
}

interface I_ResolutionsSlice extends I_ResolutionSliceDataFields {
  resolution_storeEvaluation: (resolution_evaluation: I_EvaluationToResolve | null) => void
  resolution_storeCurrentPage: (resolution_currentPage: number) => void
  resolution_storeRequiresAccessibility: (resolution_requiresAccessibility: boolean) => void
  resolution_storeState: (resolutionState: I_ResolutionState | null) => void
  resolution_storeLastUpload: (lastUpload: string | null) => void
  resolution_setRemainingTimeWarningAsDisplayed: () => void
  resolution_storeMetadata: (args: {
    resolution_startedAt: string
    resolution_submitByTime: string
    resolution_serverNowAtSync: string
    resolution_maxDurationMinutes: number
    resolution_pin: number | null
  }) => void
  resolution_setOfflineSubmitted: (value: boolean) => void
  resolution_storeRuntime: (args: {
    status: T_ResolutionRuntimeStatus
    message?: string | null
  }) => void
  resolution_resetState: () => void
}

const initialState: I_ResolutionSliceDataFields = {
  resolution_requiresAccessibility: false,
  resolution_evaluation: null,
  resolution_currentPage: 1,
  resolution_state: null,
  resolution_lastUpload: null,
  resolution_startedAt: null,
  resolution_maxDurationMinutes: null,
  resolution_submitByTime: null,
  resolution_serverNowAtSync: null,
  resolution_timerSyncedClientEpochMs: null,
  resolution_remainingTimeWarningAlreadyDisplayed: false,
  resolution_pin: null,
  resolution_offlineSubmitted: false,
  resolution_runtimeStatus: 'idle',
  resolution_runtimeMessage: null,
}

const createResolutionsSlice: StateCreator<I_ResolutionsSlice, [], [], I_ResolutionsSlice> = (set) => ({
  ...initialState,
  resolution_setOfflineSubmitted: (value) => set(() => ({ resolution_offlineSubmitted: value })),
  resolution_resetState: () => set(() => initialState),
  resolution_storeEvaluation: (resolution_evaluation) => set(() => ({ resolution_evaluation })),
  resolution_storeCurrentPage: (resolution_currentPage) => set(() => ({ resolution_currentPage })),
  resolution_storeRequiresAccessibility: (resolution_requiresAccessibility) =>
    set(() => ({ resolution_requiresAccessibility })),
  resolution_storeState: (resolution_state) => set(() => ({ resolution_state })),
  resolution_storeLastUpload: (resolution_lastUpload) => set(() => ({ resolution_lastUpload })),
  resolution_setRemainingTimeWarningAsDisplayed: () =>
    set(() => ({ resolution_remainingTimeWarningAlreadyDisplayed: true })),
  resolution_storeMetadata: (args: {
    resolution_startedAt: string
    resolution_submitByTime: string
    resolution_serverNowAtSync: string
    resolution_maxDurationMinutes: number
    resolution_pin: number | null
  }) =>
    set(() => ({ ...args, resolution_timerSyncedClientEpochMs: Date.now() })),
  resolution_storeRuntime: ({ status, message = null }) =>
    set(() => ({ resolution_runtimeStatus: status, resolution_runtimeMessage: message })),
})

export { createResolutionsSlice }
export type { I_ResolutionsSlice }
