import { useAuthResources } from '@/mta_auth/hooks'
import { T_AnswerId, T_AnswerType, T_QuestionId } from '@/mta_evaluations/types'
import {
  I_ResolutionState,
  I_ResumeResolutionResponse,
  T_ResolutionState_MultipleChoiceAnswerData,
  T_ResolutionState_NumericAnswerData,
} from '@/mta_resolutions/types'
import { axiosPost } from '@/shared/data/axios'
import { actionHook, useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { useStore } from '@/shared/state'
import useToasts from '@/shared/toasts'
import { T_EmptyPayload } from '@/shared/types'

// Data Service
const RESOLUTIONS_PATH = '/resolutions'

const _useRequestResume = actionHook<T_EmptyPayload, I_ResumeResolutionResponse>(
  `${RESOLUTIONS_PATH}/resume`,
  axiosPost,
  useAuthResources,
)

const useStoreEvaluationToResolve = () => {
  return useStore((state) => state.storeEvaluationToResolve)
}

const useResolutionResume = () => {
  const requestResume = _useRequestResume()
  const storeEvaluationToResolve = useStoreEvaluationToResolve()
  const storeResolutionState = useStore((state) => state.storeResolutionState)
  const { setIsNotInProgress, setIsInProgress } = useInProgress()
  const { errorToast } = useToasts()

  const resume = () => {
    setIsInProgress()
    requestResume({})
      .then((data) => {
        const now = new Date().toISOString()
        storeEvaluationToResolve(data)
        storeResolutionState(
          data.last_uploaded_state !== null
            ? data.last_uploaded_state
            : {
                student_pesonal_id: data.student_personal_id,
                appointment_id: data.appointment_id,
                last_login_datetime: now,
                last_update_datetime: null,
                answers: {},
              },
        )
      })
      .catch((err) => {
        errorToast('Hubo un error iniciando la evaluación. ')
      })
      .finally(setIsNotInProgress)
  }
  return { resume }
}

const useResolutionEvaluationToResolve = () => useStore((state) => state.evaluationToResolve)
const useResolutionState = () => useStore((state) => state.resolutionState)
const useResolutionLastUploadDatetime = () => useStore((state) => state.lastResolutionStateUpload)
const useResolutionUpdateLastUploadDatetime = () => {
  const storeResolutionState = useStore((state) => state.storeLastResolutionStateUpload)
  return () => {
    storeResolutionState(new Date().toISOString())
  }
}
const useResolutionStateUpdateAnswer = () => {
  const resolutionState = useResolutionState()
  const storeResolutionState = useStore((state) => state.storeResolutionState)
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

const _useResolutionUploadState = actionHook<I_ResolutionState, T_EmptyPayload>(
  `${RESOLUTIONS_PATH}/upload-state`,
  axiosPost,
  useAuthResources,
)

const useResolutionManageUploadState = () => {
  const uploadState = _useResolutionUploadState()
  const resolutionState = useResolutionState()
  const lastUploadDatetime = useResolutionLastUploadDatetime()
  const updateLastUploadDatetime = useResolutionUpdateLastUploadDatetime()

  const executeUploadingTasks = (resState: I_ResolutionState) => {
    uploadState(resState).then(updateLastUploadDatetime)
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

export {
  useResolutionEvaluationToResolve,
  useResolutionLastUploadDatetime,
  useResolutionManageUploadState,
  useResolutionResume,
  useResolutionState,
  useResolutionStateUpdateAnswer,
  useResolutionUpdateLastUploadDatetime,
  useStoreEvaluationToResolve,
}
