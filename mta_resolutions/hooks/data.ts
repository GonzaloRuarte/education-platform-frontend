'use client'

import { ErrorCode } from '@/config'
import { flushPendingResolutionEdits } from '@/mta_resolutions/flushPendingResolutionEdits'
import { useAuthResources, useRequestSetupWithMultipart } from '@/mta_auth/hooks'
import { I_AuthorizeStudentResponseData } from '@/mta_auth/types'
import { T_AnswerId, T_AnswerType, T_QuestionId } from '@/mta_evaluations/types'
import {
  buildResolutionOfflineKeyFromState,
  clearCurrentResolutionOfflineData,
  getStrictActiveResolutionSnapshot,
  getResolutionSnapshotByIdentity,
  I_ResolutionOfflineSnapshot,
  persistResolutionSnapshot,
  persistResolutionStateSnapshot,
} from '@/mta_resolutions/offlineStorage'
import {
  I_AuthorizeStudentRequestData,
  I_FinalizeTimeoutResponse,
  I_ResolutionState,
  I_ResumeResolutionResponse,
  T_ResolutionState_MultipleChoiceAnswerData,
} from '@/mta_resolutions/types'
import { T_AppointmentId } from '@/mta_schedule/types'
import { axiosPost } from '@/shared/data/axios'
import ApiError from '@/shared/data/errors'
import { actionHook, creationHook, useInProgress } from '@/shared/hooks'
import { useNetworkStatus } from '@/shared/offline/hooks'
import { useNavigateToResolutionSubmittedPage } from '@/mta_resolutions/hooks/navigation'
import { postService } from '@/shared/service'
import { useStore } from '@/shared/state'
import { errorToast, warningToast } from '@/shared/toasts'
import { I_CreationCommonResponse, T_EmptyPayload } from '@/shared/types'
import { useCallback } from 'react'

const RESOLUTIONS_PATH = '/resolutions'

const useResolutionAuthorizeStudent = () => {
  return postService<I_AuthorizeStudentRequestData, I_AuthorizeStudentResponseData>(
    `${RESOLUTIONS_PATH}/authorize`,
    axiosPost,
  )()
}

const _useResolutionRequestResume = actionHook<T_EmptyPayload, I_ResumeResolutionResponse>(
  `${RESOLUTIONS_PATH}/resume`,
  axiosPost,
  useAuthResources,
)

const _useResolutionUploadState = actionHook<I_ResolutionState, T_EmptyPayload>(
  `${RESOLUTIONS_PATH}/upload-state`,
  axiosPost,
  useAuthResources,
)


const useResolutionFinalizeTimeout = actionHook<I_ResolutionState, I_FinalizeTimeoutResponse>(
  `${RESOLUTIONS_PATH}/finalize-timeout`,
  axiosPost,
  useAuthResources,
)

const useResolutionRequestSubmit = actionHook<I_ResolutionState, T_EmptyPayload>(
  `${RESOLUTIONS_PATH}/submit`,
  axiosPost,
  useAuthResources,
)

export type T_ResolutionUploadOfflineData = FormData

export const useResolutionUploadOfflineState = creationHook<T_ResolutionUploadOfflineData, I_CreationCommonResponse>(
  `${RESOLUTIONS_PATH}/upload-offline-state`,
  axiosPost,
  useRequestSetupWithMultipart,
)

const useResolutionStoreEvaluation = () => useStore((state) => state.resolution_storeEvaluation)
const useResolutionStoreMetadata = () => useStore((state) => state.resolution_storeMetadata)
const useResolutionStoreState = () => useStore((state) => state.resolution_storeState)
const useResolutionResetStateStore = () => useStore((state) => state.resolution_resetState)
const useResolutionEvaluationToResolve = () => useStore((state) => state.resolution_evaluation)
const useResolutionRemainingTimeWarningAlreadyDisplayed = () => {
  const warningAlreadyDisplayed = useStore((state) => state.resolution_remainingTimeWarningAlreadyDisplayed)
  const setWarningAsAlreadyDisplayed = useStore((state) => state.resolution_setRemainingTimeWarningAsDisplayed)
  return { warningAlreadyDisplayed, setWarningAsAlreadyDisplayed }
}
const useResolutionMaxDurationMinutes = () => useStore((state) => state.resolution_maxDurationMinutes)
const useResolutionSubmitByTime = () => useStore((state) => state.resolution_submitByTime)
const useResolutionServerNowAtSync = () => useStore((state) => state.resolution_serverNowAtSync)
const useResolutionTimerSyncedClientEpochMs = () => useStore((state) => state.resolution_timerSyncedClientEpochMs)
const useResolutionPin = () => useStore((state) => state.resolution_pin)
const useResolutionState = () => useStore((state) => state.resolution_state)
const useResolutionLastUploadDatetime = () => useStore((state) => state.resolution_lastUpload)
const useResolutionStoreLastUpload = () => useStore((state) => state.resolution_storeLastUpload)
const useResolutionRuntime = () => {
  const runtimeStatus = useStore((state) => state.resolution_runtimeStatus)
  const runtimeMessage = useStore((state) => state.resolution_runtimeMessage)
  const storeRuntime = useStore((state) => state.resolution_storeRuntime)
  return { runtimeStatus, runtimeMessage, storeRuntime }
}

const useResolutionUpdateLastUploadDatetime = () => {
  const storeLastUpload = useResolutionStoreLastUpload()
  return () => {
    storeLastUpload(new Date().toISOString())
  }
}

const initialState = (personal_id: string, appointment_id: T_AppointmentId): I_ResolutionState => {
  const now = new Date().toISOString()
  return {
    student_personal_id: personal_id,
    appointment_id,
    last_login_datetime: now,
    last_update_datetime: null,
    answers: {},
  }
}

const hydrateStoreFromSnapshot = (
  snapshot: I_ResolutionOfflineSnapshot,
  actions: {
    storeEvaluationToResolve: (evaluation: I_ResolutionOfflineSnapshot['evaluation']) => void
    storeResolutionState: (state: I_ResolutionState | null) => void
    storeMetadata: (args: {
      resolution_startedAt: string
      resolution_submitByTime: string
      resolution_serverNowAtSync: string
      resolution_maxDurationMinutes: number
      resolution_pin: number | null
    }) => void
    storeLastUpload: (value: string | null) => void
  },
) => {
  if (snapshot.state) {
    actions.storeResolutionState(snapshot.state)
  }

  if (snapshot.evaluation) {
    actions.storeEvaluationToResolve(snapshot.evaluation)
  }

  if (
    snapshot.metadata.resolution_startedAt !== null &&
    snapshot.metadata.resolution_maxDurationMinutes !== null
  ) {
    const fallbackSubmitByTime = snapshot.metadata.resolution_submitByTime
      ?? new Date(
        new Date(snapshot.metadata.resolution_startedAt).getTime() +
          snapshot.metadata.resolution_maxDurationMinutes * 60 * 1000,
      ).toISOString()

    actions.storeMetadata({
      resolution_startedAt: snapshot.metadata.resolution_startedAt,
      resolution_submitByTime: fallbackSubmitByTime,
      resolution_serverNowAtSync: snapshot.metadata.resolution_serverNowAtSync ?? new Date().toISOString(),
      resolution_maxDurationMinutes: snapshot.metadata.resolution_maxDurationMinutes,
      resolution_pin: snapshot.metadata.resolution_pin,
    })
  }

  actions.storeLastUpload(snapshot.metadata.resolution_lastUpload)
}

const getCurrentSnapshotMetadata = () => {
  const state = useStore.getState()
  return {
    resolution_startedAt: state.resolution_startedAt,
    resolution_maxDurationMinutes: state.resolution_maxDurationMinutes,
    resolution_submitByTime: state.resolution_submitByTime,
    resolution_serverNowAtSync: state.resolution_serverNowAtSync,
    resolution_pin: state.resolution_pin,
    resolution_lastUpload: state.resolution_lastUpload,
  }
}


const _snapshotSubmitByTime = (snapshot: I_ResolutionOfflineSnapshot): string | null => {
  if (snapshot.metadata.resolution_submitByTime) return snapshot.metadata.resolution_submitByTime

  if (snapshot.metadata.resolution_startedAt && snapshot.metadata.resolution_maxDurationMinutes !== null) {
    return new Date(
      new Date(snapshot.metadata.resolution_startedAt).getTime() +
        snapshot.metadata.resolution_maxDurationMinutes * 60 * 1000,
    ).toISOString()
  }

  return null
}

const _snapshotLooksExpiredLocally = (snapshot: I_ResolutionOfflineSnapshot): boolean => {
  const submitByTime = _snapshotSubmitByTime(snapshot)
  if (!submitByTime) return false
  return new Date(submitByTime).getTime() <= Date.now()
}

const persistCurrentResolutionContext = async (args?: {
  state?: I_ResolutionState | null
  evaluation?: I_ResolutionOfflineSnapshot['evaluation']
  metadata?: Partial<ReturnType<typeof getCurrentSnapshotMetadata>>
}) => {
  const storeState = useStore.getState()
  const resolutionState = args?.state ?? storeState.resolution_state

  if (!resolutionState) return

  await persistResolutionSnapshot({
    key: buildResolutionOfflineKeyFromState(resolutionState),
    state: resolutionState,
    evaluation: args?.evaluation ?? storeState.resolution_evaluation,
    metadata: {
      ...getCurrentSnapshotMetadata(),
      ...(args?.metadata ?? {}),
    },
  })
}

const _lastUploadedStateIsOlderThanLocal = (
  response: I_ResumeResolutionResponse,
  localResolutionState: I_ResolutionState | null,
) =>
  response.resolution.last_uploaded_state !== null &&
  localResolutionState !== null &&
  localResolutionState.last_update_datetime !== null &&
  response.resolution.last_uploaded_state.last_update_datetime !== null &&
  new Date(localResolutionState.last_update_datetime) >
    new Date(response.resolution.last_uploaded_state.last_update_datetime)

type T_ResolutionResumeOutcome = 'active' | 'offline_recovery' | 'timeout_pending_confirmation' | 'expired' | 'resume_error'

const useResolutionResume = () => {
  const { isOnline } = useNetworkStatus()
  const requestResume = _useResolutionRequestResume()
  const requestSubmit = useResolutionRequestSubmit()
  const finalizeTimeout = useResolutionFinalizeTimeout()
  const navigateToResolutionSubmittedPage = useNavigateToResolutionSubmittedPage()
  const storeEvaluationToResolve = useResolutionStoreEvaluation()
  const storeResolutionState = useResolutionStoreState()
  const storeMetadata = useResolutionStoreMetadata()
  const storeLastUpload = useResolutionStoreLastUpload()
  const resetStateStore = useResolutionResetStateStore()
  const setOfflineSubmitted = useStore((state) => state.resolution_setOfflineSubmitted)
  const storeNewPage = useStore((state) => state.resolution_storeCurrentPage)
  const { setIsNotInProgress, setIsInProgress } = useInProgress()
  const { storeRuntime } = useResolutionRuntime()

  const hydrateOfflineSnapshot = useCallback(
    async (options?: {
      whenExpiredStatus?: 'offline_recovery' | 'timeout_pending_confirmation'
      expiredMessage?: string | null
    }): Promise<{ outcome: T_ResolutionResumeOutcome; snapshot: I_ResolutionOfflineSnapshot | null }> => {
      const snapshot = await getStrictActiveResolutionSnapshot()

      if (!snapshot?.state || !snapshot?.evaluation) {
        storeRuntime({
          status: 'resume_error',
          message: 'No hay una resolución local recuperable en este dispositivo.',
        })
        warningToast('No hay una resolución guardada en este dispositivo para recuperar')
        return { outcome: 'resume_error', snapshot: null }
      }

      hydrateStoreFromSnapshot(snapshot, {
        storeEvaluationToResolve,
        storeResolutionState,
        storeMetadata,
        storeLastUpload,
      })

      const whenExpiredStatus = options?.whenExpiredStatus ?? 'timeout_pending_confirmation'
      const expiredMessage =
        options?.expiredMessage ??
        'Se alcanzó el tiempo límite. La evaluación quedó pausada en este dispositivo y vamos a reintentar el envío automáticamente cuando haya conexión.'

      if (!useStore.getState().resolution_offlineSubmitted && _snapshotLooksExpiredLocally(snapshot)) {
        storeRuntime({ status: whenExpiredStatus, message: expiredMessage })
        return { outcome: whenExpiredStatus, snapshot }
      }

      storeRuntime({ status: 'offline_recovery', message: null })
      return { outcome: 'offline_recovery', snapshot }
    },
    [storeEvaluationToResolve, storeResolutionState, storeMetadata, storeLastUpload, storeRuntime],
  )

  const clearRecoveredResolutionAndNavigateToSubmitted = useCallback(
    async (resolutionState: I_ResolutionState | null | undefined) => {
      resetStateStore()
      setOfflineSubmitted(false)
      await clearCurrentResolutionOfflineData(resolutionState ?? null)
      navigateToResolutionSubmittedPage()
    },
    [navigateToResolutionSubmittedPage, resetStateStore, setOfflineSubmitted],
  )

  const trySubmitRecoveredSnapshot = useCallback(
    async (snapshot: I_ResolutionOfflineSnapshot): Promise<T_ResolutionResumeOutcome> => {
      if (!snapshot.state) {
        storeRuntime({
          status: 'resume_error',
          message: 'No hay respuestas locales para enviar al servidor.',
        })
        return 'resume_error'
      }

      try {
        await requestSubmit(snapshot.state)
        await clearRecoveredResolutionAndNavigateToSubmitted(snapshot.state)
        return 'expired'
      } catch (err: any) {
        if (err instanceof ApiError && ApiError.errorCode(err) === 'RESOLUTION_ALREADY_SUBMITTED') {
          await clearRecoveredResolutionAndNavigateToSubmitted(snapshot.state)
          return 'expired'
        }

        if (err instanceof ApiError && err.status === -1) {
          storeRuntime({ status: 'offline_recovery', message: null })
          return 'offline_recovery'
        }

        storeRuntime({
          status: 'resume_error',
          message: 'No se pudo enviar automáticamente la resolución recuperada al servidor.',
        })
        return 'resume_error'
      }
    },
    [clearRecoveredResolutionAndNavigateToSubmitted, requestSubmit, storeRuntime],
  )

  const tryFinalizeRecoveredExpiredSnapshot = useCallback(
    async (snapshot: I_ResolutionOfflineSnapshot): Promise<T_ResolutionResumeOutcome> => {
      if (!snapshot.state) {
        storeRuntime({
          status: 'expired',
          message: 'El tiempo de la evaluación terminó y no hay respuestas locales para enviar.',
        })
        return 'expired'
      }

      try {
        const result = await finalizeTimeout(snapshot.state)

        if (result.result === 'ACTIVE') {
          const pin = snapshot.metadata.resolution_pin ?? useStore.getState().resolution_pin
          storeMetadata({
            resolution_startedAt: result.resolution.started_at,
            resolution_submitByTime: result.resolution.submit_by_time,
            resolution_serverNowAtSync: result.resolution.server_now,
            resolution_maxDurationMinutes: result.resolution.max_duration_minutes,
            resolution_pin: pin,
          })
          storeRuntime({ status: 'active', message: null })
          await persistResolutionSnapshot({
            key: snapshot.key,
            state: snapshot.state,
            evaluation: snapshot.evaluation,
            metadata: {
              ...snapshot.metadata,
              resolution_startedAt: result.resolution.started_at,
              resolution_submitByTime: result.resolution.submit_by_time,
              resolution_serverNowAtSync: result.resolution.server_now,
              resolution_maxDurationMinutes: result.resolution.max_duration_minutes,
              resolution_pin: pin,
            },
          })
          return 'active'
        }

        await clearRecoveredResolutionAndNavigateToSubmitted(snapshot.state)
        return 'expired'
      } catch (err: any) {
        if (err instanceof ApiError && ApiError.errorCode(err) === 'RESOLUTION_ALREADY_SUBMITTED') {
          await clearRecoveredResolutionAndNavigateToSubmitted(snapshot.state)
          return 'expired'
        }

        if (err instanceof ApiError && err.status === -1) {
          storeRuntime({
            status: 'timeout_pending_confirmation',
            message:
              'El tiempo de la evaluación terminó y todavía no pudimos confirmar el envío con el servidor. Vamos a reintentar automáticamente cuando haya conexión. Podés descargar las respuestas por seguridad.',
          })
          return 'timeout_pending_confirmation'
        }

        storeRuntime({
          status: 'timeout_pending_confirmation',
          message:
            'El tiempo de la evaluación terminó y todavía no pudimos confirmar el estado final con el servidor. Vamos a reintentar automáticamente.',
        })
        return 'timeout_pending_confirmation'
      }
    },
    [clearRecoveredResolutionAndNavigateToSubmitted, finalizeTimeout, storeMetadata, storeRuntime],
  )

  const resume = useCallback(
    async (options?: {
      reason?: 'startup' | 'manual_retry'
      preserveCurrentPage?: boolean
      setGlobalInProgress?: boolean
    }): Promise<T_ResolutionResumeOutcome> => {
      const {
        reason = 'startup',
        preserveCurrentPage = reason !== 'startup',
        setGlobalInProgress = reason === 'startup',
      } = options ?? {}

      const isOfflineSubmitted = useStore.getState().resolution_offlineSubmitted

      if (isOfflineSubmitted) {
        try {
          const hydrated = await hydrateOfflineSnapshot({ whenExpiredStatus: 'offline_recovery' })
          if (hydrated.outcome === 'resume_error' || !hydrated.snapshot) return hydrated.outcome
          if (isOnline) {
            return await trySubmitRecoveredSnapshot(hydrated.snapshot)
          }
          return hydrated.outcome
        } catch {
          storeRuntime({
            status: 'resume_error',
            message: 'No se pudo recuperar la resolución local guardada.',
          })
          warningToast('No se pudo recuperar la resolución local guardada')
          return 'resume_error'
        }
      }

      if (!isOnline) {
        try {
          const hydrated = await hydrateOfflineSnapshot({
            whenExpiredStatus: 'timeout_pending_confirmation',
            expiredMessage:
              'Se alcanzó el tiempo límite y este dispositivo no tiene conexión. La evaluación quedó pausada y vamos a reintentar el envío automáticamente cuando vuelva la conexión. Podés descargar las respuestas por seguridad.',
          })
          return hydrated.outcome
        } catch {
          storeRuntime({
            status: 'resume_error',
            message: 'No hay conexión a internet y no hay una resolución guardada en este dispositivo.',
          })
          warningToast('No hay conexión a internet y no hay una resolución guardada en este dispositivo')
          return 'resume_error'
        }
      }

      storeRuntime({ status: 'resuming', message: null })
      if (setGlobalInProgress) setIsInProgress()

      try {
        const response = await requestResume({})
        const inMemoryState = useStore.getState().resolution_state
        const offlineSnapshot = await getResolutionSnapshotByIdentity(
          response.appointment_id,
          response.student_personal_id,
        )

        const candidateLocalState =
          inMemoryState &&
          inMemoryState.appointment_id === response.appointment_id &&
          inMemoryState.student_personal_id === response.student_personal_id
            ? inMemoryState
            : offlineSnapshot?.state ?? null

        const uploadedState = response.resolution.last_uploaded_state
        const alreadyHasAnUploadedState = uploadedState !== null
        const localStateIsNewer = _lastUploadedStateIsOlderThanLocal(response, candidateLocalState)

        const chosenState: I_ResolutionState =
          localStateIsNewer && candidateLocalState !== null
            ? candidateLocalState
            : uploadedState !== null
              ? uploadedState
              : initialState(response.student_personal_id, response.appointment_id)

        const metadata = {
          resolution_startedAt: response.resolution.started_at,
          resolution_submitByTime: response.resolution.submit_by_time,
          resolution_serverNowAtSync: response.resolution.server_now,
          resolution_maxDurationMinutes: response.resolution.max_duration_minutes,
          resolution_pin: response.appointment_pin,
        }

        const hydratedLastUpload =
          !localStateIsNewer && alreadyHasAnUploadedState
            ? response.resolution.last_uploaded_state?.last_update_datetime ?? null
            : offlineSnapshot?.metadata.resolution_lastUpload ?? useStore.getState().resolution_lastUpload

        storeResolutionState(chosenState)
        storeEvaluationToResolve(response.evaluation)
        storeMetadata(metadata)
        storeLastUpload(hydratedLastUpload)
        storeRuntime({ status: 'active', message: null })


        if (!preserveCurrentPage) {
          storeNewPage(1)
        }

        await persistResolutionSnapshot({
          key: buildResolutionOfflineKeyFromState(chosenState),
          state: chosenState,
          evaluation: response.evaluation,
          metadata: {
            ...metadata,
            resolution_lastUpload: hydratedLastUpload,
          },
        })

        return 'active'
      } catch (err: any) {
        if (err.status !== -1 && ApiError.errorCode(err) === ErrorCode.RESOLUTION_ALREADY_SUBMITTED) {
          try {
            const hydrated = await hydrateOfflineSnapshot({
              whenExpiredStatus: 'timeout_pending_confirmation',
              expiredMessage:
                ApiError.message(err) ||
                'El tiempo de la evaluación terminó. Vamos a intentar enviar automáticamente las respuestas guardadas en este dispositivo.',
            })


            if (hydrated.snapshot) {
              return await tryFinalizeRecoveredExpiredSnapshot(hydrated.snapshot)
            }
          } catch {}

          storeRuntime({
            status: 'expired',
            message: ApiError.message(err),
          })
          errorToast(ApiError.message(err))
          return 'expired'
        }

        storeRuntime({
          status: 'resume_error',
          message: 'No se pudo validar el estado actual de la resolución con el servidor.',
        })
        errorToast('No se pudo validar el estado actual de la resolución con el servidor.')
        return 'resume_error'
      } finally {
        if (setGlobalInProgress) setIsNotInProgress()
      }
    },
    [
      clearRecoveredResolutionAndNavigateToSubmitted,
      finalizeTimeout,
      hydrateOfflineSnapshot,
      isOnline,
      navigateToResolutionSubmittedPage,
      requestResume,
      requestSubmit,
      setIsInProgress,
      setIsNotInProgress,
      setOfflineSubmitted,
      storeEvaluationToResolve,
      storeLastUpload,
      storeMetadata,
      storeNewPage,
      storeResolutionState,
      storeRuntime,
      tryFinalizeRecoveredExpiredSnapshot,
      trySubmitRecoveredSnapshot,
      resetStateStore,
    ],
  )

  return { resume }
}

const _resolutionStateWithoutNullAnswer = (
  resolutionState: I_ResolutionState,
  questionId: T_QuestionId,
): I_ResolutionState => {
  const now = new Date().toISOString()
  const newResolutionState: I_ResolutionState = {
    ...resolutionState,
    last_update_datetime: now,
    answers: {
      ...resolutionState.answers,
    },
  }

  delete newResolutionState.answers[questionId]
  return newResolutionState
}

const _resolutionStateWithNewAnswer = (
  resolutionState: I_ResolutionState,
  questionId: T_QuestionId,
  answerId: T_AnswerId,
  value: number,
): I_ResolutionState => {
  const now = new Date().toISOString()
  const existing = resolutionState.answers[questionId]
  return {
    ...resolutionState,
    last_update_datetime: now,
    answers: {
      ...resolutionState.answers,
      [questionId]: {
        id: answerId,
        first_touched_datetime: existing?.first_touched_datetime ?? now,
        last_update_datetime: now,
        change_count: (existing?.change_count ?? 0) + 1,
        resource_type: 'Numeric',
        specific_data: { value },
      },
    },
  }
}

const useResolutionStateUpdateAnswer = () => {
  const storeResolutionState = useStore((state) => state.resolution_storeState)

  const commitState = useCallback(
    (nextState: I_ResolutionState) => {
      storeResolutionState(nextState)
      void persistResolutionStateSnapshot(nextState).catch(() => undefined)
    },
    [storeResolutionState],
  )

  const Numeric = useCallback(
    (questionId: T_QuestionId, answerId: T_AnswerId, value: number | null) => {
      const resolutionState = useStore.getState().resolution_state
      if (resolutionState === null) return

      const newResolutionState: I_ResolutionState =
        value === null
          ? _resolutionStateWithoutNullAnswer(resolutionState, questionId)
          : _resolutionStateWithNewAnswer(resolutionState, questionId, answerId, value)

      commitState(newResolutionState)
    },
    [commitState],
  )

  const MultipleChoice = useCallback(
    (questionId: T_QuestionId, answerId: T_AnswerId, chosen_options: Array<string>) => {
      const resolutionState = useStore.getState().resolution_state
      if (resolutionState === null) return

      const now = new Date().toISOString()
      const existing = resolutionState.answers[questionId]

      const answerData: T_ResolutionState_MultipleChoiceAnswerData = {
        id: answerId,
        first_touched_datetime: existing?.first_touched_datetime ?? now,
        last_update_datetime: now,
        change_count: (existing?.change_count ?? 0) + 1,
        resource_type: 'MultipleChoice',
        specific_data: { chosen_options },
      }

      commitState({
        ...resolutionState,
        last_update_datetime: now,
        answers: {
          ...resolutionState.answers,
          [questionId]: answerData,
        },
      })
    },
    [commitState],
  )

  const OpenEnded = useCallback(
    (questionId: T_QuestionId, answerId: T_AnswerId, value: string) => {
      const resolutionState = useStore.getState().resolution_state
      if (resolutionState === null) return

      const now = new Date().toISOString()
      const existing = resolutionState.answers[questionId]

      commitState({
        ...resolutionState,
        last_update_datetime: now,
        answers: {
          ...resolutionState.answers,
          [questionId]: {
            id: answerId,
            first_touched_datetime: existing?.first_touched_datetime ?? now,
            last_update_datetime: now,
            change_count: (existing?.change_count ?? 0) + 1,
            resource_type: 'OpenEnded',
            specific_data: { value },
          },
        },
      })
    },
    [commitState],
  )

  const _: Record<T_AnswerType, any> = {
    Numeric,
    MultipleChoice,
    OpenEnded,
  }

  return { updateMultipleChoice: MultipleChoice, updateNumeric: Numeric, updateOpenEnded: OpenEnded }
}

const useResolutionManageUploadState = () => {
  const { isOnline } = useNetworkStatus()
  const uploadState = _useResolutionUploadState()
  const storeLastUpload = useResolutionStoreLastUpload()

  const manageUpload = useCallback(() => {
    if (!isOnline) return

    const resolutionState = useStore.getState().resolution_state
    const lastUploadDatetime = useStore.getState().resolution_lastUpload

    if (resolutionState === null) return
    if (resolutionState.last_update_datetime === null) return

    if (
      lastUploadDatetime !== null &&
      new Date(resolutionState.last_update_datetime) <= new Date(lastUploadDatetime)
    ) {
      return
    }

    void (async () => {
      try {
        await uploadState(resolutionState)

        const uploadedAt = new Date().toISOString()
        storeLastUpload(uploadedAt)

        await persistCurrentResolutionContext({
          state: resolutionState,
          metadata: {
            resolution_lastUpload: uploadedAt,
          },
        })
      } catch {
        // no-op
      }
    })()
  }, [isOnline, storeLastUpload, uploadState])

  return manageUpload
}

const useResolutionDownloadState = () => {
  const downloadResolutionState = useCallback(async () => {
    await flushPendingResolutionEdits()

    const inMemoryState = useStore.getState().resolution_state
    const snapshot = inMemoryState ? null : await getStrictActiveResolutionSnapshot()
    const resolutionState = inMemoryState ?? snapshot?.state ?? null

    if (!resolutionState) {
      return
    }

    const jsonString = JSON.stringify(resolutionState, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `MetaResolucion--turno_${resolutionState.appointment_id}-estudiante_${resolutionState.student_personal_id}-${new Date().toISOString()}.json`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }, [])

  return { downloadResolutionState }
}

const useResolutionResetState = () => {
  const resetState = useResolutionResetStateStore()

  return useCallback(async () => {
    const currentResolutionState = useStore.getState().resolution_state
    resetState()
    await clearCurrentResolutionOfflineData(currentResolutionState)
  }, [resetState])
}

const useResolutionAccessibility = () => {
  const storeRequiresAccessibility = useStore((state) => state.resolution_storeRequiresAccessibility)
  const requiresAccessibility = useStore((state) => state.resolution_requiresAccessibility)

  return { requiresAccessibility, storeRequiresAccessibility }
}

export {
  useResolutionAccessibility,
  useResolutionAuthorizeStudent,
  useResolutionDownloadState,
  useResolutionEvaluationToResolve,
  useResolutionLastUploadDatetime,
  useResolutionManageUploadState,
  useResolutionMaxDurationMinutes,
  useResolutionFinalizeTimeout,
  useResolutionSubmitByTime,
  useResolutionServerNowAtSync,
  useResolutionTimerSyncedClientEpochMs,
  useResolutionPin,
  useResolutionRemainingTimeWarningAlreadyDisplayed,
  useResolutionRequestSubmit,
  useResolutionResetState,
  useResolutionResume,
  useResolutionRuntime,
  useResolutionState,
  useResolutionStateUpdateAnswer,
  useResolutionStoreEvaluation,
  useResolutionStoreMetadata,
  useResolutionUpdateLastUploadDatetime,
}