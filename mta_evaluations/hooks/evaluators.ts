import {
  listHook,
  batchDeletionHook,
  creationHook,
  updateHook,
  detailHook,
  deletionHook,
} from '@/shared/hooks/dataServices'

import {
  T_EvaluatorProfileId,
  T_EvaluatorProfileList,
  I_EvaluatorProfileCreateRequestData,
  I_EvaluatorProfileUpdateRequestData,
  I_EvaluatorProfileDetail,
} from '@/mta_evaluations/types/evaluatorProfile'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import { useAuthResources } from '@/mta_auth/hooks'
import { I_CreationCommonResponse } from '@/shared/types'

const EVALUATOR_PROFILE = '/evaluator-profiles'

export const useEvaluatorProfileList = listHook<T_EvaluatorProfileList>(EVALUATOR_PROFILE, axiosGet, useAuthResources)

export const useEvaluatorProfileBatchDelete = batchDeletionHook<T_EvaluatorProfileId>(
  EVALUATOR_PROFILE,
  axiosDelete,
  useAuthResources,
)

export const useEvaluatorProfileCreate = creationHook<I_EvaluatorProfileCreateRequestData, I_CreationCommonResponse>(
  EVALUATOR_PROFILE,
  axiosPost,
  useAuthResources,
)

export const useEvaluatorProfileUpdate = updateHook<
  T_EvaluatorProfileId,
  I_EvaluatorProfileUpdateRequestData,
  I_CreationCommonResponse
>(EVALUATOR_PROFILE, axiosPatch, useAuthResources)

export const useEvaluatorProfileDetail = detailHook<T_EvaluatorProfileId, I_EvaluatorProfileDetail>(
  EVALUATOR_PROFILE,
  axiosGet,
  useAuthResources,
)

export const useEvaluatorProfileDelete = deletionHook<T_EvaluatorProfileId>(
  EVALUATOR_PROFILE,
  axiosDelete,
  useAuthResources,
)
