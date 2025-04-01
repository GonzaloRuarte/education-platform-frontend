import { ErrorCode } from '@/config'
import { useAuthResources } from '@/mta_auth/hooks'
import { I_AuthorizeResponseData } from '@/mta_auth/types'
import { T_AnswerId, T_AnswerType, T_QuestionId } from '@/mta_evaluations/types'
import { useResolutionLogout } from '@/mta_resolutions/hooks'
import {
  I_AuthorizeStudentRequestData,
  I_ResolutionState,
  I_ResumeResolutionResponse,
  T_ResolutionState_MultipleChoiceAnswerData,
  T_ResolutionState_NumericAnswerData,
} from '@/mta_resolutions/types'
import { axiosPost } from '@/shared/data/axios'
import ApiError from '@/shared/data/errors'
import { actionHook, useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { postService } from '@/shared/service'
import { useStore } from '@/shared/state'
import useToasts from '@/shared/toasts'
import { T_EmptyPayload } from '@/shared/types'
import { useCallback } from 'react'

// Data Service
const RESOLUTIONS_PATH = '/resolutions'

/**
 * Authorize student to access evaluation zone (login)
 */
const useResolutionAuthorizeStudent = () => {
  return postService<I_AuthorizeStudentRequestData, I_AuthorizeResponseData>(
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

// STATE HOOKS - - -
const useResolutionStoreEvaluation = () => useStore((state) => state.resolution_storeEvaluation)
const useResolutionClearEvaluation = () => useStore((state) => state.resolution_clearEvaluation)
const useResolutionStoreMetadata = () => useStore((state) => state.resolution_storeMetadata)
const useResolutionClearMetadata = () => useStore((state) => state.resolution_clearMetadata)
const useStoreResolutionState = () => useStore((state) => state.resolution_storeState)
const useResolutionEvaluationToResolve = () => useStore((state) => state.resolution_evaluation)
const useResolutionState = () => useStore((state) => state.resolution_state)
const useResolutionLastUploadDatetime = () => useStore((state) => state.resolution_lastUpload)
const useResolutionClearLastUploadDatetime = () => useStore((state) => state.resolution_clearLastUpload)
const useResolutionClearState = () => useStore((state) => state.resolution_clearState)
const useResolutionUpdateLastUploadDatetime = () => {
  const storeLastUpload = useStore((state) => state.resolution_storeLastUpload)
  return () => {
    storeLastUpload(new Date().toISOString())
  }
}

const useResolutionResume = () => {
  const requestResume = _useResolutionRequestResume()
  const storeEvaluationToResolve = useResolutionStoreEvaluation()
  const storeResolutionState = useStoreResolutionState()
  const storeMetadata = useResolutionStoreMetadata()
  const { setIsNotInProgress, setIsInProgress } = useInProgress()
  const { errorToast, dismissAll } = useToasts()
  const logout = useResolutionLogout()

  const resume = () => {
    setIsInProgress()
    requestResume({})
      .then((response) => {
        const now = new Date().toISOString()
        storeResolutionState(
          response.resolution.last_uploaded_state !== null
            ? response.resolution.last_uploaded_state
            : {
                student_personal_id: response.student_personal_id,
                appointment_id: response.appointment_id,
                last_login_datetime: now,
                last_update_datetime: null,
                answers: {},
              },
        )
        storeEvaluationToResolve(response.evaluation)
        storeMetadata({
          resolution_maxDurationMinutes: response.resolution.max_duration_minutes,
          resolution_startedAt: response.resolution.started_at,
        })
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
  }
  return { resume }
}

const useResolutionStateUpdateAnswer = () => {
  const resolutionState = useResolutionState()
  const storeResolutionState = useStore((state) => state.resolution_storeState)
  if (resolutionState === null) throw new Error('Resolution local state not initialized')

  const Numeric = (questionId: T_QuestionId, answerId: T_AnswerId, value: number) => {
    const now = new Date().toISOString()
    const answerData: T_ResolutionState_NumericAnswerData = {
      id: answerId,
      last_update_datetime: now,
      resource_type: 'Numeric',
      specific_data: { value },
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
  const MultipleChoice = (questionId: T_QuestionId, answerId: T_AnswerId, choosed_options: Array<string>) => {
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
  const uploadState = _useResolutionUploadState()
  const resolutionState = useResolutionState()
  const lastUploadDatetime = useResolutionLastUploadDatetime()
  const updateLastUploadDatetime = useResolutionUpdateLastUploadDatetime()

  const executeUploadingTasks = (_resolutionState: I_ResolutionState) => {
    uploadState(_resolutionState).then(updateLastUploadDatetime)
  }

  const manageUpload = () => {
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

export {
  useResolutionAuthorizeStudent,
  useResolutionClearEvaluation,
  useResolutionClearLastUploadDatetime,
  useResolutionClearMetadata,
  useResolutionClearState,
  useResolutionEvaluationToResolve,
  useResolutionLastUploadDatetime,
  useResolutionManageUploadState,
  useResolutionRequestSubmit,
  useResolutionResume,
  useResolutionState,
  useResolutionStateUpdateAnswer,
  useResolutionStoreEvaluation,
  useResolutionStoreMetadata,
  useResolutionUpdateLastUploadDatetime,
  useResolutionDownloadState,
}
