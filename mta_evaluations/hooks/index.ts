import { useAuthResources } from '@/mta_auth/hooks'
import { I_MultipleChoiceOptionCreateRequestData, I_MultipleChoiceOptionEditIsTrueRequestData, T_MultiplChoiceOptionId } from '@/mta_evaluations/types'
import { axiosDelete, axiosPatch, axiosPost } from '@/shared/data/axios'
import { creationHook, deletionHook, updateHook } from '@/shared/hooks'
import { I_CreationCommonResponse } from '@/shared/types'

// Data Service

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

export * from './evaluationHooks'
export * from './questionHooks'
export * from './importQuestion'
export { useMultipleChoiceOptionCreate, useMultipleChoiceOptionDelete, useMultipleChoiceOptionEditIsTrue }
