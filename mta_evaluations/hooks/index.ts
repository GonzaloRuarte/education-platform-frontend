import { useAuthResources } from '@/mta_auth/hooks'
import { I_MultipleChoiceOptionCreateRequestData, I_QuestionDetail, T_MultiplChoiceOptionId, T_QuestionId } from '@/mta_evaluations/types'
import { questionEditPath } from '@/pages'
import { axiosDelete, axiosGet, axiosPost } from '@/shared/data/axios'
import { creationHook, deletionHook, detailHookV2, dynamicNavigationHook } from '@/shared/hooks'
import { I_CreationCommonResponse } from '@/shared/types'

// Data Service

const QUESTIONS_PATH = '/questions'
const useQuestionDetail = detailHookV2<T_QuestionId, I_QuestionDetail>(QUESTIONS_PATH, axiosGet, useAuthResources)
const useQuestionDelete = deletionHook<T_QuestionId>(QUESTIONS_PATH, axiosDelete, useAuthResources)

const MULTIPLE_CHOICE_PATH = '/multiple-choice'
const useMultipleChoiceOptionDelete = deletionHook<T_MultiplChoiceOptionId>(`${MULTIPLE_CHOICE_PATH}/delete-option`, axiosDelete, useAuthResources)
const useMultipleChoiceOptionCreate = creationHook<I_MultipleChoiceOptionCreateRequestData, I_CreationCommonResponse>(
  `${MULTIPLE_CHOICE_PATH}/create-option`,
  axiosPost,
  useAuthResources,
)

// Navigation
const useNavigateToQuestionEdit = dynamicNavigationHook(questionEditPath)

export { useMultipleChoiceOptionCreate, useMultipleChoiceOptionDelete, useNavigateToQuestionEdit, useQuestionDetail, useQuestionDelete }
export * from './evaluationHooks'
