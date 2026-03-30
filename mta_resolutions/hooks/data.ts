'use client'

import { ErrorCode } from '@/config'
import { useAuthResources, useRequestSetupWithMultipart } from '@/mta_auth/hooks'
import { I_AuthorizeStudentResponseData } from '@/mta_auth/types'
import { T_AnswerId, T_AnswerType, T_QuestionId } from '@/mta_evaluations/types'
import {
  buildResolutionOfflineKeyFromState,
  clearAllResolutionOfflineData,
  getActiveResolutionSnapshot,
  getResolutionSnapshotByIdentity,
  I_ResolutionOfflineSnapshot,
  persistResolutionSnapshot,
  persistResolutionStateSnapshot,
} from '@/mta_resolutions/offlineStorage'
import { useResolutionLogout, useResolutionPagination } from '@/mta_resolutions/hooks'
import {
  I_AuthorizeStudentRequestData,
  I_ResolutionState,
  I_ResumeResolutionResponse,
  T_ResolutionState_MultipleChoiceAnswerData,
} from '@/mta_resolutions/types'
import { T_AppointmentId } from '@/mta_schedule/types'
import { axiosPost } from '@/shared/data/axios'
import ApiError from '@/shared/data/errors'
import { actionHook, creationHook, useInProgress } from '@/shared/hooks'
import { useNetworkStatus } from '@/shared/offline/hooks'
import { postService } from '@/shared/service'
import { useStore } from '@/shared/state'
import useToasts, { warningToast } from '@/shared/toasts'
import { I_CreationCommonResponse, T_EmptyPayload } from '@/shared/types'
import { useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'

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
const useResolutionPin = () => useStore((state) => state.resolution_pin)
const useResolutionState = () => useStore((state) => state.resolution_state)
const useResolutionLastUploadDatetime = () => useStore((state) => state.resolution_lastUpload)
const useResolutionStoreLastUpload = () => useStore((state) => state.resolution_storeLastUpload)

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
    actions.storeMetadata({
      resolution_startedAt: snapshot.metadata.resolution_startedAt,
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
    resolution_pin: state.resolution_pin,
    resolution_lastUpload: state.resolution_lastUpload,
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

const useResolutionResume = () => {
  const { isOnline } = useNetworkStatus()
  const requestResume = _useResolutionRequestResume()
  const storeEvaluationToResolve = useResolutionStoreEvaluation()
  const storeResolutionState = useResolutionStoreState()
  const storeMetadata = useResolutionStoreMetadata()
  const storeLastUpload = useResolutionStoreLastUpload()
  const { storeNewPage } = useResolutionPagination()
  const { setIsNotInProgress, setIsInProgress } = useInProgress()
  const { errorToast, dismissAll } = useToasts()
  const logout = useResolutionLogout()

  const hydrateOfflineSnapshot = useCallback(async () => {
    const snapshot = await getActiveResolutionSnapshot()

    if (!snapshot?.state || !snapshot?.evaluation) {
      warningToast('No hay conexión a internet y no hay una resolución guardada en este dispositivo')
      return
    }

    hydrateStoreFromSnapshot(snapshot, {
      storeEvaluationToResolve,
      storeResolutionState,
      storeMetadata,
      storeLastUpload,
    })
  }, [storeEvaluationToResolve, storeResolutionState, storeMetadata, storeLastUpload])

  const resume = useDebouncedCallback(async () => {
    const isOfflineSubmitted = useStore.getState().resolution_offlineSubmitted

    if (isOfflineSubmitted) {
      try {
        await hydrateOfflineSnapshot()
      } catch {
        warningToast('No se pudo recuperar la resolución local guardada')
      }
      return
    }

    if (!isOnline) {
      try {
        await hydrateOfflineSnapshot()
      } catch {
        warningToast('No hay conexión a internet y no hay una resolución guardada en este dispositivo')
      }
      return
    }

    setIsInProgress()

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

      const alreadyHasAnUploadedState = response.resolution.last_uploaded_state !== null
      const localStateIsNewer = _lastUploadedStateIsOlderThanLocal(response, candidateLocalState)

      const chosenState =
        localStateIsNewer && candidateLocalState !== null
          ? candidateLocalState
          : alreadyHasAnUploadedState
            ? response.resolution.last_uploaded_state
            : initialState(response.student_personal_id, response.appointment_id)

      const metadata = {
        resolution_startedAt: response.resolution.started_at,
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
      storeNewPage(1)

      await persistResolutionSnapshot({
        key: buildResolutionOfflineKeyFromState(chosenState),
        state: chosenState,
        evaluation: response.evaluation,
        metadata: {
          ...metadata,
          resolution_lastUpload: hydratedLastUpload,
        },
      })
    } catch (err: any) {
      if (err.status !== -1 && ApiError.errorCode(err) === ErrorCode.RESOLUTION_ALREADY_SUBMITTED) {
        logout()
        dismissAll()
        errorToast(ApiError.message(err))
        return
      }

      logout()
    } finally {
      setIsNotInProgress()
    }
  }, 100)

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
    const inMemoryState = useStore.getState().resolution_state
    const snapshot = inMemoryState ? null : await getActiveResolutionSnapshot()
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
    resetState()
    await clearAllResolutionOfflineData()
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
  useResolutionPin,
  useResolutionRemainingTimeWarningAlreadyDisplayed,
  useResolutionRequestSubmit,
  useResolutionResetState,
  useResolutionResume,
  useResolutionState,
  useResolutionStateUpdateAnswer,
  useResolutionStoreEvaluation,
  useResolutionStoreMetadata,
  useResolutionUpdateLastUploadDatetime,
}