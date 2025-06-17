import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_QuestionCreateMultipleChoiceRequestData,
  I_QuestionCreateNumericRequestData,
  I_QuestionCreateOpenEndedRequestData,
  I_QuestionCreateResponseData,
  I_QuestionDetail,
  I_QuestionUpdateMultipleChoiceRequestData,
  I_QuestionUpdateNumericRequestData,
  I_QuestionUpdateOpenEndedRequestData,
  T_QuestionId,
} from '@/mta_evaluations/types'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import { creationHook, deletionHook, detailHook, updateHook } from '@/shared/hooks'
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

const useQuestionOpenEndedUpdate = updateHook<T_QuestionId, I_QuestionUpdateOpenEndedRequestData>(
  QUESTIONS_PATH,
  axiosPatch,
  useAuthResources,
  {
    pathSuffix: '/update-open-ended',
  },
)

const useQuestionOpenEndedCreate = creationHook<I_QuestionCreateOpenEndedRequestData, I_QuestionCreateResponseData>(
  `${QUESTIONS_PATH}/create-open-ended`,
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

// Navigation


export {
  QUESTIONS_PATH,
  useQuestionDelete,
  useQuestionDetail,
  useQuestionMoveBackward,
  useQuestionMoveForward,
  useQuestionMultipleChoiceUpdate,
  useQuestionNumericUpdate,
  useQuestionMultipleChoiceCreate,
  useQuestionNumericCreate,
  useQuestionOpenEndedUpdate,
  useQuestionOpenEndedCreate,
}
