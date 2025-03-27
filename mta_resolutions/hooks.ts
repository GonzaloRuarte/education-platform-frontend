import { useAuthResources, useLogout } from '@/mta_auth/hooks'
import { T_AnswerId, T_AnswerType, T_QuestionId } from '@/mta_evaluations/types'
import {
  I_ResumeResolutionResponse,
  T_ResolutionState_MultipleChoiceAnswerData,
  T_ResolutionState_NumericAnswerData,
} from '@/mta_resolutions/types'
import pages from '@/pages'
import { axiosPost } from '@/shared/data/axios'
import { actionHook, navigationHook, useInProgress } from '@/shared/hooks'
import { useStore } from '@/shared/state'
import useToasts from '@/shared/toasts'
import { T_EmptyPayload } from '@/shared/types'

const useNavigateToResolutionPage = navigationHook(pages.R._.resolverEvaluacion.path)
// const useNavigateToResolutionLogin = navigationHook(pages.R._.login.path)

// Data Service
const RESOLUTIONS_PATH = '/resolutions'

const _useRequestResume = actionHook<T_EmptyPayload, I_ResumeResolutionResponse>(
  `${RESOLUTIONS_PATH}/resume`,
  axiosPost,
  useAuthResources,
)

const _useStoreEvaluationToResolve = () => {
  return useStore((state) => state.storeEvaluationToResolve)
}

const useResolutionResume = () => {
  const requestResume = _useRequestResume()
  const storeEvaluationToResolve = _useStoreEvaluationToResolve()
  const storeResolutionState = useStore((state) => state.storeResolutionState)
  const { setIsNotInProgress, setIsInProgress } = useInProgress()
  const { errorToast } = useToasts()

  const resume = () => {
    setIsInProgress()
    requestResume({})
      .then((data) => {
        storeEvaluationToResolve(data)
        storeResolutionState({
          student_pesonal_id: data.student_personal_id,
          appointment_id: data.appointment_id,
          last_login_datetime: new Date().toISOString(),
          answers: {},
        })
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
const useResolutionStateUpdateAnswer = () => {
  const resolutionState = useResolutionState()
  const storeResolutionState = useStore((state) => state.storeResolutionState)
  if (resolutionState === undefined) throw new Error('Resolution local state not initialized')
  const Numeric = (questionId: T_QuestionId, answerId: T_AnswerId, value: number) => {
    const answerData: T_ResolutionState_NumericAnswerData = {
      id: answerId,
      last_update_datetime: new Date().toISOString(),
      resource_type: 'Numeric',
      specific_data: { value },
    }
    storeResolutionState({
      ...resolutionState,
      answers: {
        ...resolutionState.answers,
        [questionId]: answerData,
      },
    })
  }
  const MultipleChoice = (questionId: T_QuestionId, answerId: T_AnswerId, choosed_options: Array<string>) => {
    const answerData: T_ResolutionState_MultipleChoiceAnswerData = {
      id: answerId,
      last_update_datetime: new Date().toISOString(),
      resource_type: 'MultipleChoice',
      specific_data: { choosed_options },
    }
    storeResolutionState({
      ...resolutionState,
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
const useResolutionPagination = () => {
  return {
    currentPage: useStore((state) => state.resolutionCurrentPage),
    pagesQuantity: useStore((state) => state.evaluationToResolve?.pages_quantity),
    storeNewPage: useStore((state) => state.storeResolutionCurrentPage),
  }
}

const useResolutionExit = () => {
  const logOut = useLogout(pages.R._.login.path)
  const storeEvaluationToResolve = _useStoreEvaluationToResolve()

  return () => {
    logOut()
    storeEvaluationToResolve(undefined)
  }
}

export {
  useNavigateToResolutionPage,
  useResolutionResume,
  useResolutionEvaluationToResolve,
  useResolutionExit,
  useResolutionPagination,
  useResolutionState,
  useResolutionStateUpdateAnswer,
}
