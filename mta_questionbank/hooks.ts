import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_MultipleChoiceOptionCreateRequestData,
  I_MultipleChoiceOptionEditIsTrueRequestData,
  T_MultipleChoiceOptionId,   // ← OK (you renamed in types)
  T_QuestionId,
  I_QuestionDetail,
  I_QuestionCreateMultipleChoiceRequestData,
  I_QuestionCreateNumericRequestData,
  I_QuestionUpdateMultipleChoiceRequestData,
  I_QuestionUpdateNumericRequestData,
  I_QuestionCreateResponseData,
  T_QuestionTemplateList,
} from '@/mta_questionbank/types'

import { axiosDelete, axiosPatch, axiosPost, axiosGet } from '@/shared/data/axios'
import { I_CreationCommonResponse } from '@/shared/types'

import { questionBankEditPath } from '@/pages'
import { creationHook, deletionHook, detailHook, dynamicNavigationHook, updateHook, navigationHook, listHook, batchDeletionHook } from '@/shared/hooks'
import pages from '@/pages'



const MULTIPLE_CHOICE_PATH = '/multiple-choice-qb'
const useMultipleChoiceOptionDelete = deletionHook<T_MultipleChoiceOptionId>(`${MULTIPLE_CHOICE_PATH}/delete-option`, axiosDelete, useAuthResources)
const useMultipleChoiceOptionCreate = creationHook<I_MultipleChoiceOptionCreateRequestData, I_CreationCommonResponse>(
  `${MULTIPLE_CHOICE_PATH}/create-option`,
  axiosPost,
  useAuthResources,
)
const useMultipleChoiceOptionEditIsTrue = updateHook<
  T_MultipleChoiceOptionId,
  I_MultipleChoiceOptionEditIsTrueRequestData,
  I_MultipleChoiceOptionCreateRequestData
>(`${MULTIPLE_CHOICE_PATH}/option`, axiosPatch, useAuthResources, { pathSuffix: '/edit-is-true' })

const QUESTIONS_PATH = '/question-bank'
const useQuestionList = listHook<T_QuestionTemplateList>(QUESTIONS_PATH, axiosGet, useAuthResources)
const useQuestionDetail = detailHook<T_QuestionId, I_QuestionDetail>(QUESTIONS_PATH, axiosGet, useAuthResources)
const useQuestionDelete = deletionHook<T_QuestionId>(QUESTIONS_PATH, axiosDelete, useAuthResources)
const useQuestionBatchDelete = batchDeletionHook<T_QuestionId>(QUESTIONS_PATH, axiosDelete, useAuthResources)
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

// Navigation
const useNavigateToQuestionCreate = navigationHook(pages.D._.bancoDePreguntas._.agregar.path)
const useNavigateToQuestionEdit = dynamicNavigationHook(questionBankEditPath)

const useNavigateToQuestionBankList = navigationHook(pages.D._.bancoDePreguntas.path)

export {
  QUESTIONS_PATH,
  useNavigateToQuestionCreate,
  useNavigateToQuestionEdit,
  useQuestionDelete,
  useQuestionBatchDelete,
  useQuestionDetail,
  useQuestionMultipleChoiceUpdate,
  useQuestionNumericUpdate,
  useQuestionMultipleChoiceCreate,
  useQuestionNumericCreate,
  useMultipleChoiceOptionCreate, 
  useMultipleChoiceOptionDelete,
  useMultipleChoiceOptionEditIsTrue,
  useNavigateToQuestionBankList,
  useQuestionList
}

