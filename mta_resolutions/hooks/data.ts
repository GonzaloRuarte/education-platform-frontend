'use client'

import { ErrorCode } from '@/config'
import { flushPendingResolutionEdits } from '@/mta_resolutions/flushPendingResolutionEdits'
import { useAuthResources, useRequestSetupWithMultipart } from '@/mta_auth/hooks'
import { I_AuthorizeStudentResponseData } from '@/mta_auth/types'
import { T_AnswerId, T_AnswerType, T_QuestionId } from '@/mta_evaluations/types'
import {
  buildResolutionOfflineKey,
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
  I_ResolutionUploadStateResponse,
  I_ResumeResolutionResponse,
  T_ResolutionState_MultipleChoiceAnswerData,
} from '@/mta_resolutions/types'
import { T_AppointmentId } from '@/mta_schedule/types'
import { axiosPost } from '@/shared/data/axios'
import ApiError from '@/shared/data/errors'
import { actionHook, creationHook, useInProgress } from '@/shared/hooks'
import { useNetworkStatus } from '@/shared/offline/hooks'
import { useNavigateToResolutionSubmittedPage } from '@/mta_resolutions/hooks/navigation'
import { handleServiceError, postService } from '@/shared/service'
import { useStore } from '@/shared/state'
import { errorToast, warningToast } from '@/shared/toasts'
import { I_CreationCommonResponse, T_EmptyPayload } from '@/shared/types'
import { useCallback } from 'react'

const STARTUP_BACKGROUND_RESUME_TIMEOUT_MS = 4000

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

const _useResolutionUploadState = actionHook<I_ResolutionState, I_ResolutionUploadStateResponse>(
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
const useResolutionTimerSyncedMonotonicMs = () => useStore((state) => state.resolution_timerSyncedMonotonicMs)
const useResolutionPin = () => useStore((state) => state.resolution_pin)
const useResolutionState = () => useStore((state) => state.resolution_state)
const useResolutionLastUploadDatetime = () => useStore((state) => state.resolution_lastUpload)
const useResolutionStoreLastUpload = () => useStore((state) => state.resolution_storeLastUpload)
const useResolutionServerStateToken = () => useStore((state) => state.resolution_serverStateToken)
const useResolutionHasUnsyncedLocalChanges = () => useStore((state) => state.resolution_hasUnsyncedLocalChanges)
const useResolutionRequiresFinalizationOnAction = () => useStore((state) => state.resolution_requiresFinalizationOnAction)
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

const _buildSuccessfulResumeIdentityKey = (appointmentId: T_AppointmentId, studentPersonalId: string) =>
  buildResolutionOfflineKey(appointmentId, studentPersonalId)

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

const _snapshotHasCompleteServerTimingMetadata = (snapshot: I_ResolutionOfflineSnapshot): boolean => {
  return (
    snapshot.metadata.resolution_startedAt !== null &&
    snapshot.metadata.resolution_submitByTime !== null &&
    snapshot.metadata.resolution_serverNowAtSync !== null &&
    snapshot.metadata.resolution_maxDurationMinutes !== null
  )
}

const _snapshotMatchesSuccessfulResumeIdentity = (snapshot: I_ResolutionOfflineSnapshot): boolean => {
  return snapshot.metadata.resolution_successfulResumeIdentityKey === snapshot.key
}

const _hasCompleteServerTimingData = (timing: {
  started_at?: string | null
  submit_by_time?: string | null
  server_now?: string | null
  max_duration_minutes?: number | null
}) => {
  return (
    typeof timing.started_at === 'string' &&
    typeof timing.submit_by_time === 'string' &&
    typeof timing.server_now === 'string' &&
    typeof timing.max_duration_minutes === 'number'
  )
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
      resolution_serverStateToken: string | null
      resolution_hasUnsyncedLocalChanges: boolean
      resolution_successfulResumeIdentityKey: string | null
    }) => void
    storeLastUpload: (value: string | null) => void
  },
) => {
  if (!_snapshotHasCompleteServerTimingMetadata(snapshot)) {
    throw new Error('Missing required server timing metadata in local snapshot')
  }

  if (snapshot.state) {
    actions.storeResolutionState(snapshot.state)
  }

  if (snapshot.evaluation) {
    actions.storeEvaluationToResolve(snapshot.evaluation)
  }

  actions.storeMetadata({
    resolution_startedAt: snapshot.metadata.resolution_startedAt!,
    resolution_submitByTime: snapshot.metadata.resolution_submitByTime!,
    resolution_serverNowAtSync: snapshot.metadata.resolution_serverNowAtSync!,
    resolution_maxDurationMinutes: snapshot.metadata.resolution_maxDurationMinutes!,
    resolution_pin: snapshot.metadata.resolution_pin,
    resolution_serverStateToken: snapshot.metadata.resolution_serverStateToken,
    resolution_hasUnsyncedLocalChanges: snapshot.metadata.resolution_hasUnsyncedLocalChanges,
    resolution_successfulResumeIdentityKey: snapshot.metadata.resolution_successfulResumeIdentityKey,
  })

  actions.storeLastUpload(snapshot.metadata.resolution_lastUpload)
}

const getUsableLocalStartupSnapshot = async (): Promise<I_ResolutionOfflineSnapshot | null> => {
  const snapshot = await getStrictActiveResolutionSnapshot()
  if (!snapshot?.state || !snapshot?.evaluation) return null
  if (!_snapshotMatchesSuccessfulResumeIdentity(snapshot)) return null
  if (!_snapshotHasCompleteServerTimingMetadata(snapshot)) return null
  return snapshot
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
    resolution_serverStateToken: state.resolution_serverStateToken,
    resolution_hasUnsyncedLocalChanges: state.resolution_hasUnsyncedLocalChanges,
    resolution_successfulResumeIdentityKey: state.resolution_successfulResumeIdentityKey,
  }
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

const _shouldPreferLocalState = (
  response: I_ResumeResolutionResponse,
  localResolutionState: I_ResolutionState | null,
  metadata: ReturnType<typeof getCurrentSnapshotMetadata> | I_ResolutionOfflineSnapshot['metadata'] | null,
) => {
  if (localResolutionState === null || metadata === null) return false

  const serverToken = response.resolution.last_uploaded_state_server_created_at
  const localBaseToken = metadata.resolution_serverStateToken
  const localIsDirty = metadata.resolution_hasUnsyncedLocalChanges

  if (!localIsDirty) return false
  if (serverToken === null) return true
  return localBaseToken === serverToken
}

type T_ResolutionResumeOutcome = 'active' | 'offline_recovery' | 'awaiting_server_validation' | 'timeout_pending_confirmation' | 'expired' | 'resume_error'

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
  const setRequiresFinalizationOnAction = useStore((state) => state.resolution_setRequiresFinalizationOnAction)
  const storeNewPage = useStore((state) => state.resolution_storeCurrentPage)
  const { setIsNotInProgress, setIsInProgress } = useInProgress()
  const { storeRuntime } = useResolutionRuntime()

  const requestResumeWithBackgroundTimeout = useCallback(async () => {
    return await Promise.race([
      requestResume({}),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Resume request timed out')), STARTUP_BACKGROUND_RESUME_TIMEOUT_MS)
      }),
    ])
  }, [requestResume])

  const applyResumeResponse = useCallback(
    async (response: I_ResumeResolutionResponse, options?: { preserveCurrentPage?: boolean }) => {
      const { preserveCurrentPage = true } = options ?? {}

      if (!_hasCompleteServerTimingData(response.resolution)) {
        throw new Error('Missing required server timing metadata in resume response')
      }

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

      const candidateLocalMetadata =
        candidateLocalState === inMemoryState ? getCurrentSnapshotMetadata() : offlineSnapshot?.metadata ?? null

      const uploadedState = response.resolution.last_uploaded_state
      const alreadyHasAnUploadedState = uploadedState !== null
      const preferLocalState = _shouldPreferLocalState(response, candidateLocalState, candidateLocalMetadata)

      const chosenState: I_ResolutionState =
        preferLocalState && candidateLocalState !== null
          ? candidateLocalState
          : uploadedState !== null
            ? uploadedState
            : candidateLocalState ?? initialState(response.student_personal_id, response.appointment_id)

      const metadata = {
        resolution_startedAt: response.resolution.started_at,
        resolution_submitByTime: response.resolution.submit_by_time,
        resolution_serverNowAtSync: response.resolution.server_now,
        resolution_maxDurationMinutes: response.resolution.max_duration_minutes,
        resolution_pin: response.appointment_pin,
        resolution_serverStateToken: response.resolution.last_uploaded_state_server_created_at,
        resolution_hasUnsyncedLocalChanges:
          preferLocalState && candidateLocalMetadata
            ? candidateLocalMetadata.resolution_hasUnsyncedLocalChanges
            : false,
        resolution_successfulResumeIdentityKey: _buildSuccessfulResumeIdentityKey(response.appointment_id, response.student_personal_id),
      }

      const hydratedLastUpload = alreadyHasAnUploadedState
        ? response.resolution.last_uploaded_state_server_created_at
        : null

      storeResolutionState(chosenState)
      storeEvaluationToResolve(response.evaluation)
      storeMetadata(metadata)
      storeLastUpload(hydratedLastUpload)
      setRequiresFinalizationOnAction(false)
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

      return 'active' as T_ResolutionResumeOutcome
    },
    [
      setRequiresFinalizationOnAction,
      storeEvaluationToResolve,
      storeLastUpload,
      storeMetadata,
      storeNewPage,
      storeResolutionState,
      storeRuntime,
    ],
  )

  const resumeAgainstServerInBackground = useCallback(
    async () => {
      try {
        const response = await requestResumeWithBackgroundTimeout()
        await applyResumeResponse(response, { preserveCurrentPage: true })
      } catch (err: any) {
        if (err instanceof ApiError && ApiError.errorCode(err) === ErrorCode.RESOLUTION_ALREADY_SUBMITTED) {
          setRequiresFinalizationOnAction(true)
          warningToast(
            'El servidor indicó que la evaluación ya no está activa. Al tocar Siguiente, Anterior o Entregar intentaremos enviar lo guardado.',
          )
          return
        }

        warningToast('No se pudo validar con el servidor. Se continúa con las respuestas guardadas localmente en este dispositivo.')
      }
    },
    [applyResumeResponse, requestResumeWithBackgroundTimeout, setRequiresFinalizationOnAction],
  )

  const hydrateOfflineSnapshot = useCallback(
    async (options?: {
      statusOnHydrate?: 'offline_recovery' | 'awaiting_server_validation' | 'timeout_pending_confirmation'
      message?: string | null
      requireSuccessfulResumeForCurrentIdentity?: boolean
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

      if (options?.requireSuccessfulResumeForCurrentIdentity && !_snapshotMatchesSuccessfulResumeIdentity(snapshot)) {
        storeRuntime({
          status: 'resume_error',
          message: 'No es posible iniciar la evaluación sin validar primero el turno actual con el servidor. Revisá tu conexión y reintentá.',
        })
        warningToast('No es posible iniciar la evaluación sin validar primero con el servidor')
        return { outcome: 'resume_error', snapshot: null }
      }

      if (!_snapshotHasCompleteServerTimingMetadata(snapshot)) {
        storeRuntime({
          status: 'resume_error',
          message: 'La resolución guardada localmente no tiene metadatos de tiempo válidos del servidor. Reintentá con conexión para recuperar el estado correcto.',
        })
        errorToast('La resolución guardada localmente no tiene metadatos de tiempo válidos del servidor')
        return { outcome: 'resume_error', snapshot: null }
      }

      hydrateStoreFromSnapshot(snapshot, {
        storeEvaluationToResolve,
        storeResolutionState,
        storeMetadata,
        storeLastUpload,
      })

      const nextStatus = options?.statusOnHydrate ?? 'offline_recovery'
      storeRuntime({ status: nextStatus, message: options?.message ?? null })
      return { outcome: nextStatus, snapshot }
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
          if (!_hasCompleteServerTimingData(result.resolution)) {
            throw new Error('Missing required server timing metadata in finalize-timeout response')
          }

          const pin = snapshot.metadata.resolution_pin ?? useStore.getState().resolution_pin
          storeMetadata({
            resolution_startedAt: result.resolution.started_at,
            resolution_submitByTime: result.resolution.submit_by_time,
            resolution_serverNowAtSync: result.resolution.server_now,
            resolution_maxDurationMinutes: result.resolution.max_duration_minutes,
            resolution_pin: pin,
            resolution_serverStateToken: result.resolution.last_uploaded_state_server_created_at,
            resolution_hasUnsyncedLocalChanges: false,
            resolution_successfulResumeIdentityKey: _buildSuccessfulResumeIdentityKey(result.appointment_id, result.student_personal_id),
          })
          setRequiresFinalizationOnAction(false)
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
              resolution_serverStateToken: result.resolution.last_uploaded_state_server_created_at,
              resolution_hasUnsyncedLocalChanges: false,
              resolution_successfulResumeIdentityKey: _buildSuccessfulResumeIdentityKey(result.appointment_id, result.student_personal_id),
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

      if (reason === 'startup') {
        const startupSnapshot = await getUsableLocalStartupSnapshot()

        if (startupSnapshot) {
          hydrateStoreFromSnapshot(startupSnapshot, {
            storeEvaluationToResolve,
            storeResolutionState,
            storeMetadata,
            storeLastUpload,
          })
          storeRuntime({ status: 'offline_recovery', message: null })

          if (isOnline) {
            void resumeAgainstServerInBackground()
          } else {
            warningToast('No hay conexión con el servidor. Se continúa con las respuestas guardadas localmente en este dispositivo.')
          }

          return 'offline_recovery'
        }
      }

      if (isOfflineSubmitted) {
        try {
          const hydrated = await hydrateOfflineSnapshot({ statusOnHydrate: 'offline_recovery' })
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
            statusOnHydrate: 'offline_recovery',
            message:
              'No hay conexión con el servidor para validar el estado actual. Se continúa con las respuestas guardadas localmente en este dispositivo.',
            requireSuccessfulResumeForCurrentIdentity: true,
          })
          if (hydrated.snapshot) {
            warningToast('No hay conexión con el servidor. Se continúa con las respuestas guardadas localmente en este dispositivo.')
          }
          return hydrated.outcome
        } catch {
          storeRuntime({
            status: 'resume_error',
            message: 'No hay conexión con el servidor para iniciar o recuperar la evaluación. Revisá tu conexión y reintentá.',
          })
          warningToast('No hay conexión con el servidor para iniciar o recuperar la evaluación')
          return 'resume_error'
        }
      }

      storeRuntime({ status: 'resuming', message: null })
      if (setGlobalInProgress) setIsInProgress()

      try {
        const response = await requestResumeWithBackgroundTimeout()
        return await applyResumeResponse(response, { preserveCurrentPage })
      } catch (err: any) {
        if (err instanceof ApiError && ApiError.errorCode(err) === ErrorCode.RESOLUTION_ALREADY_SUBMITTED) {
          try {
            const hydrated = await hydrateOfflineSnapshot({
              statusOnHydrate: 'offline_recovery',
              message:
                ApiError.message(err) ||
                'El servidor indicó que la evaluación ya no está activa. Podés seguir revisando localmente y al tocar Siguiente, Anterior o Entregar intentaremos enviar lo guardado.',
              requireSuccessfulResumeForCurrentIdentity: true,
            })

            if (hydrated.snapshot) {
              setRequiresFinalizationOnAction(true)
              warningToast('El servidor indicó que la evaluación ya no está activa. Al tocar Siguiente, Anterior o Entregar intentaremos enviar lo guardado.')
              return 'offline_recovery'
            }
          } catch {
            // fall through to expired terminal state
          }

          storeRuntime({
            status: 'expired',
            message: ApiError.message(err),
          })
          errorToast(ApiError.message(err))
          return 'expired'
        }

        try {
          const hydrated = await hydrateOfflineSnapshot({
            statusOnHydrate: 'offline_recovery',
            message: 'No se pudo validar con el servidor el estado actual. Se continúa con las respuestas guardadas localmente en este dispositivo.',
            requireSuccessfulResumeForCurrentIdentity: true,
          })

          if (hydrated.snapshot) {
            warningToast('No se pudo validar con el servidor. Se continúa con las respuestas guardadas localmente en este dispositivo.')
            return hydrated.outcome
          }
        } catch {
          // no local snapshot available, fall through to blocking error
        }

        storeRuntime({
          status: 'resume_error',
          message:
            reason === 'startup'
              ? 'No es posible conectarse al servidor para iniciar o recuperar la evaluación. Revisá tu conexión y reintentá.'
              : 'No se pudo validar el estado actual de la evaluación con el servidor.',
        })

        if (!(err instanceof ApiError && err.status === -1)) {
          handleServiceError(err)
        }
        return 'resume_error'
      } finally {
        if (setGlobalInProgress) setIsNotInProgress()
      }
    },
    [
      applyResumeResponse,
      clearRecoveredResolutionAndNavigateToSubmitted,
      finalizeTimeout,
      hydrateOfflineSnapshot,
      isOnline,
      navigateToResolutionSubmittedPage,
      requestResume,
      requestResumeWithBackgroundTimeout,
      requestSubmit,
      resumeAgainstServerInBackground,
      setIsInProgress,
      setIsNotInProgress,
      setOfflineSubmitted,
      setRequiresFinalizationOnAction,
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
  const markLocalChangesDirty = useStore((state) => state.resolution_markLocalChangesDirty)

  const commitState = useCallback(
    (nextState: I_ResolutionState) => {
      markLocalChangesDirty()
      storeResolutionState(nextState)
      void persistResolutionStateSnapshot(nextState, {
        resolution_hasUnsyncedLocalChanges: true,
      }).catch(() => undefined)
    },
    [markLocalChangesDirty, storeResolutionState],
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
  const storeServerSync = useStore((state) => state.resolution_storeServerSync)

  const manageUpload = useCallback(() => {
    if (!isOnline) return

    const resolutionState = useStore.getState().resolution_state
    const hasUnsyncedLocalChanges = useStore.getState().resolution_hasUnsyncedLocalChanges

    if (resolutionState === null) return
    if (resolutionState.last_update_datetime === null) return
    if (!hasUnsyncedLocalChanges) return

    void (async () => {
      try {
        const result = await uploadState(resolutionState)

        const uploadedAt = result.last_uploaded_state_server_created_at
        storeLastUpload(uploadedAt)
        storeServerSync({
          resolution_serverStateToken: result.last_uploaded_state_server_created_at,
          resolution_serverNowAtSync: result.server_now,
          resolution_lastUpload: uploadedAt,
        })

        await persistCurrentResolutionContext({
          state: resolutionState,
          metadata: {
            resolution_lastUpload: uploadedAt,
            resolution_serverStateToken: result.last_uploaded_state_server_created_at,
            resolution_hasUnsyncedLocalChanges: false,
            resolution_serverNowAtSync: result.server_now,
          },
        })
      } catch {
        // no-op
      }
    })()
  }, [isOnline, storeLastUpload, storeServerSync, uploadState])

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
  useResolutionTimerSyncedMonotonicMs,
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
  useResolutionServerStateToken,
  useResolutionHasUnsyncedLocalChanges,
  useResolutionRequiresFinalizationOnAction,
}