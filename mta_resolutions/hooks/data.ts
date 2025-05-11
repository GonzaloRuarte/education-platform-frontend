'use client'

import { ErrorCode } from '@/config'
import { useAuthResources } from '@/mta_auth/hooks'
import { I_AuthorizeStudentResponseData } from '@/mta_auth/types'
import { T_AnswerId, T_AnswerType, T_QuestionId } from '@/mta_evaluations/types'
import { useResolutionLogout, useResolutionPagination } from '@/mta_resolutions/hooks'
import {
  I_AuthorizeStudentRequestData,
  I_ResolutionState,
  I_ResumeResolutionResponse,
  T_ResolutionState_MultipleChoiceAnswerData,
} from '@/mta_resolutions/types'
import { T_AppointmentId } from '@/mta_schedule/types'
import { T_StudentProfilePersonalId } from '@/mta_schools/types'
import { axiosPost } from '@/shared/data/axios'
import ApiError from '@/shared/data/errors'
import { actionHook, useInProgress } from '@/shared/hooks'
import log, { logInfo, logWarning } from '@/shared/log'
import { useNetworkStatus } from '@/shared/offline/hooks'
import { postService } from '@/shared/service'
import { useStore } from '@/shared/state'
import useToasts, { warningToast } from '@/shared/toasts'
import { T_EmptyPayload } from '@/shared/types'
import { useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useRequestSetupWithMultipart } from '@/mta_auth/hooks'
import { creationHook } from '@/shared/hooks'
import { I_CreationCommonResponse } from '@/shared/types'

// Data Service
const RESOLUTIONS_PATH = '/resolutions'

/**
 * Authorize student to access evaluation zone (login)
 */
const useResolutionAuthorizeStudent = () => {
  return postService<I_AuthorizeStudentRequestData, I_AuthorizeStudentResponseData>(
    `${RESOLUTIONS_PATH}/authorize`,
    axiosPost,
  )()
}

/**
 * (Private hook) for request a resolution start/resume
 */
const _useResolutionRequestResume = actionHook<T_EmptyPayload, I_ResumeResolutionResponse>(
  `${RESOLUTIONS_PATH}/resume`,
  axiosPost,
  useAuthResources,
)

/**
 * (Private hook) for upload ongoing resolution state
 */
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

// STATE HOOKS - - -
const useResolutionStoreEvaluation = () => useStore((state) => state.resolution_storeEvaluation)
const useResolutionStoreMetadata = () => useStore((state) => state.resolution_storeMetadata)
const useResolutionStoreState = () => useStore((state) => state.resolution_storeState)
const useResolutionResetState = () => useStore((state) => state.resolution_resetState)
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
const useResolutionUpdateLastUploadDatetime = () => {
  const storeLastUpload = useStore((state) => state.resolution_storeLastUpload)
  return () => {
    storeLastUpload(new Date().toISOString())
  }
}
const initialState = (personal_id: T_StudentProfilePersonalId, appointment_id: T_AppointmentId) => {
  const now = new Date().toISOString()
  return {
    student_personal_id: personal_id,
    appointment_id: appointment_id,
    last_login_datetime: now,
    last_update_datetime: null,
    answers: {},
  }
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
  const localResolutionState = useResolutionState()
  const storeMetadata = useResolutionStoreMetadata()
  const { storeNewPage } = useResolutionPagination()
  const { setIsNotInProgress, setIsInProgress } = useInProgress()
  const { errorToast, dismissAll } = useToasts()
  const logout = useResolutionLogout()

  const resume = useDebouncedCallback(() => {
    if (!isOnline) {
      logWarning('Resolution resume skipped: offline')
      warningToast('No hay conexión a internet')
      return
    }

    setIsInProgress()
    requestResume({})
      .then((response) => {
        response.resolution.last_uploaded_state?.last_update_datetime
        const alreadyHasAnUploadedState = response.resolution.last_uploaded_state !== null
        const lastUploadedStateIsOlderThanLocalState = _lastUploadedStateIsOlderThanLocal(
          response,
          localResolutionState,
        )

        if (!lastUploadedStateIsOlderThanLocalState) {
          storeResolutionState(
            alreadyHasAnUploadedState
              ? response.resolution.last_uploaded_state
              : initialState(response.student_personal_id, response.appointment_id),
          )
        } else {
          logInfo('>>>>>> Resolution state is older than the last uploaded state')
        }

        storeEvaluationToResolve(response.evaluation)

        storeMetadata({
          resolution_maxDurationMinutes: response.resolution.max_duration_minutes,
          resolution_startedAt: response.resolution.started_at,
          resolution_pin: response.appointment_pin,
        })

        storeNewPage(1)
      })
      .catch((err) => {
        if (ApiError.errorCode(err) === ErrorCode.RESOLUTION_ALREADY_SUBMITTED) {
          logout()
          dismissAll()
          errorToast(ApiError.message(err))
          return
        }

        errorToast('Hubo un error iniciando la evaluación. ')
      })
      .finally(setIsNotInProgress)
  }, 100)
  return { resume }
}
const _resolutionStateWithoutNullAnswer = (
  resolutionState: I_ResolutionState,
  questionId: T_QuestionId,
): I_ResolutionState => {
  const now = new Date().toISOString()
  const newResolutionState = {
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
  return {
    ...resolutionState,
    last_update_datetime: now,
    answers: {
      ...resolutionState.answers,
      [questionId]: {
        id: answerId,
        last_update_datetime: now,
        resource_type: 'Numeric',
        specific_data: { value },
      },
    },
  }
}
const useResolutionStateUpdateAnswer = () => {
  const resolutionState = useResolutionState()
  const storeResolutionState = useStore((state) => state.resolution_storeState)
  if (resolutionState === null) {
    logWarning('Resolution local state not initialized')
  }

  const Numeric = (questionId: T_QuestionId, answerId: T_AnswerId, value: number | null) => {
    if (resolutionState === null) return

    const now = new Date().toISOString()

    const newResolutionState: I_ResolutionState =
      value === null
        ? _resolutionStateWithoutNullAnswer(resolutionState, questionId)
        : _resolutionStateWithNewAnswer(resolutionState, questionId, answerId, value)

    storeResolutionState(newResolutionState)
  }
  const MultipleChoice = (questionId: T_QuestionId, answerId: T_AnswerId, choosed_options: Array<string>) => {
    if (resolutionState === null) return

    const now = new Date().toISOString()
    const answerData: T_ResolutionState_MultipleChoiceAnswerData = {
      id: answerId,
      last_update_datetime: now,
      resource_type: 'MultipleChoice',
      specific_data: { choosed_options },
    }
    storeResolutionState({
      ...resolutionState,
      last_update_datetime: now,
      answers: {
        ...resolutionState.answers,
        [questionId]: answerData,
      },
    })
  }

  const _: Record<T_AnswerType, any> = {
    Numeric,
    MultipleChoice,
  }
  return { updateMultipleChoice: MultipleChoice, updateNumeric: Numeric }
}

const useResolutionManageUploadState = () => {
  const { isOnline } = useNetworkStatus()
  const uploadState = _useResolutionUploadState()
  const resolutionState = useResolutionState()
  const lastUploadDatetime = useResolutionLastUploadDatetime()
  const updateLastUploadDatetime = useResolutionUpdateLastUploadDatetime()

  const executeUploadingTasks = (_resolutionState: I_ResolutionState) => {
    uploadState(_resolutionState).then(updateLastUploadDatetime)
  }

  const manageUpload = () => {
    if (!isOnline) {
      logWarning('Resolution state upload skipped: offline')
      return
    }
    if (resolutionState === null) return
    if (resolutionState.last_update_datetime === null) return
    if (lastUploadDatetime !== null && new Date(resolutionState.last_update_datetime) < new Date(lastUploadDatetime))
      return

    log.info('Uploading resolution state', new Date().toISOString())
    executeUploadingTasks(resolutionState)
  }
  return manageUpload
}

const useResolutionDownloadState = () => {
  const resolutionState = useResolutionState()

  const downloadResolutionState = useCallback(() => {
    if (!resolutionState) {
      log.error('Resolution state is not available')
      return
    }

    // Convert the resolution state to a JSON string
    const jsonString = JSON.stringify(resolutionState, null, 2)

    // Create a Blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' })

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob)

    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a')
    link.href = url
    link.download = `MetaResolucion--turno_${resolutionState.appointment_id}-estudiante_${resolutionState.student_personal_id}-${new Date().toISOString()}.json`

    // Append the link to the document, trigger the download, and remove the link
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Revoke the Blob URL to free up memory
    URL.revokeObjectURL(url)
  }, [resolutionState])

  return { downloadResolutionState }
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
