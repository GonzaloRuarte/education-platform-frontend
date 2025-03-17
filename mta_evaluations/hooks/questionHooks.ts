import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_QuestionAddPageBreakRequestData,
  I_QuestionCreateMultipleChoiceRequestData,
  I_QuestionCreateNumericRequestData,
  I_QuestionCreateResponseData,
  I_QuestionDetail,
  I_QuestionRemovePageBreakRequestData,
  I_QuestionUpdateMultipleChoiceRequestData,
  I_QuestionUpdateNumericRequestData,
  T_QuestionId,
} from '@/mta_evaluations/types'
import { questionCreateMCPath, questionCreateNumericPath, questionEditPath } from '@/pages'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import { actionHook, creationHook, deletionHook, detailHook, dynamicNavigationHook, updateHook } from '@/shared/hooks'
import { T_EmptyPayload } from '@/shared/types'

// Data Service

const QUESTIONS_PATH = '/questions'
const useQuestionDetail = detailHook<T_QuestionId, I_QuestionDetail>(QUESTIONS_PATH, axiosGet, useAuthResources)
const useQuestionDelete = deletionHook<T_QuestionId>(QUESTIONS_PATH, axiosDelete, useAuthResources)
const useQuestionMultipleChoiceUpdate = updateHook<T_QuestionId, I_QuestionUpdateMultipleChoiceRequestData>(
  QUESTIONS_PATH,
  axiosPatch,
  useAuthResources,
  {
    pathSuffix: '/update-multiple-choice',
  },
)
const useQuestionMultipleChoiceCreate = creationHook<
  I_QuestionCreateMultipleChoiceRequestData,
  I_QuestionCreateResponseData
>(`${QUESTIONS_PATH}/create-multiple-choice`, axiosPost, useAuthResources)

const useQuestionNumericUpdate = updateHook<T_QuestionId, I_QuestionUpdateNumericRequestData>(
  QUESTIONS_PATH,
  axiosPatch,
  useAuthResources,
  {
    pathSuffix: '/update-numeric',
  },
)
const useQuestionNumericCreate = creationHook<I_QuestionCreateNumericRequestData, I_QuestionCreateResponseData>(
  `${QUESTIONS_PATH}/create-numeric`,
  axiosPost,
  useAuthResources,
)
const useQuestionMoveBackward = updateHook<T_QuestionId, T_EmptyPayload>(
  `${QUESTIONS_PATH}`,
  axiosPatch,
  useAuthResources,
  { pathSuffix: '/move-backward' },
)
const useQuestionMoveForward = updateHook<T_QuestionId, T_EmptyPayload>(
  `${QUESTIONS_PATH}`,
  axiosPatch,
  useAuthResources,
  { pathSuffix: '/move-forward' },
)
const useAddPageBreak = actionHook<I_QuestionAddPageBreakRequestData, T_EmptyPayload>(
  `${QUESTIONS_PATH}/add-page-break`,
  axiosPost,
  useAuthResources,
)
const useRemovePageBreak = actionHook<I_QuestionRemovePageBreakRequestData, T_EmptyPayload>(
  `${QUESTIONS_PATH}/remove-page-break`,
  axiosPost,
  useAuthResources,
)

// Navigation
const useNavigateToQuestionEdit = dynamicNavigationHook(questionEditPath)
const useNavigateToQuestionCreateMultipleChoice = dynamicNavigationHook(questionCreateMCPath)
const useNavigateToQuestionCreateNumeric = dynamicNavigationHook(questionCreateNumericPath)

export {
  QUESTIONS_PATH,
  useAddPageBreak,
  useNavigateToQuestionCreateMultipleChoice,
  useNavigateToQuestionCreateNumeric,
  useNavigateToQuestionEdit,
  useQuestionDelete,
  useQuestionDetail,
  useQuestionMoveBackward,
  useQuestionMoveForward,
  useQuestionMultipleChoiceUpdate,
  useQuestionNumericUpdate,
  useRemovePageBreak,
  useQuestionMultipleChoiceCreate,
  useQuestionNumericCreate,
}
