import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_MultipleChoiceOptionCreateRequestData,
  I_MultipleChoiceOptionEditIsTrueRequestData,
  I_QuestionAddPageBreakRequestData,
  I_QuestionDetail,
  I_QuestionRemovePageBreakRequestData,
  I_QuestionUpdateRequestData,
  T_MultiplChoiceOptionId,
  T_QuestionId,
} from '@/mta_evaluations/types'
import { questionEditPath } from '@/pages'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import { actionHook, creationHook, deletionHook, detailHook, dynamicNavigationHook, updateHook } from '@/shared/hooks'
import { I_CreationCommonResponse, T_EmptyResponse } from '@/shared/types'

// Data Service

const QUESTIONS_PATH = '/questions'
const useQuestionDetail = detailHook<T_QuestionId, I_QuestionDetail>(QUESTIONS_PATH, axiosGet, useAuthResources)
const useQuestionDelete = deletionHook<T_QuestionId>(QUESTIONS_PATH, axiosDelete, useAuthResources)
const useQuestionUpdate = updateHook<T_QuestionId, I_QuestionUpdateRequestData>(QUESTIONS_PATH, axiosPatch, useAuthResources)
const useAddPageBreak = actionHook<I_QuestionAddPageBreakRequestData, T_EmptyResponse>(`${QUESTIONS_PATH}/add-page-break`, axiosPost, useAuthResources)
const useRemovePageBreak = actionHook<I_QuestionRemovePageBreakRequestData, T_EmptyResponse>(`${QUESTIONS_PATH}/remove-page-break`, axiosPost, useAuthResources)

const MULTIPLE_CHOICE_PATH = '/multiple-choice'
const useMultipleChoiceOptionDelete = deletionHook<T_MultiplChoiceOptionId>(`${MULTIPLE_CHOICE_PATH}/delete-option`, axiosDelete, useAuthResources)
const useMultipleChoiceOptionCreate = creationHook<I_MultipleChoiceOptionCreateRequestData, I_CreationCommonResponse>(
  `${MULTIPLE_CHOICE_PATH}/create-option`,
  axiosPost,
  useAuthResources,
)
const useMultipleChoiceOptionEditIsTrue = updateHook<
  T_MultiplChoiceOptionId,
  I_MultipleChoiceOptionEditIsTrueRequestData,
  I_MultipleChoiceOptionCreateRequestData
>(`${MULTIPLE_CHOICE_PATH}/option`, axiosPatch, useAuthResources, { pathSuffix: '/edit-is-true' })

// Navigation
const useNavigateToQuestionEdit = dynamicNavigationHook(questionEditPath)

export * from './evaluationHooks'
export {
  useAddPageBreak,
  useMultipleChoiceOptionCreate,
  useMultipleChoiceOptionDelete,
  useMultipleChoiceOptionEditIsTrue,
  useNavigateToQuestionEdit,
  useQuestionDelete,
  useQuestionDetail,
  useQuestionUpdate,
  useRemovePageBreak,
}
