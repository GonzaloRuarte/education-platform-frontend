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
import { useRouter } from 'next/navigation'

const EVALUATOR_PROFILE = '/evaluator-profiles'

// Data hooks
const useEvaluatorProfileList = listHook<T_EvaluatorProfileList>(EVALUATOR_PROFILE, axiosGet, useAuthResources)

const useEvaluatorProfileBatchDelete = batchDeletionHook<T_EvaluatorProfileId>(
  EVALUATOR_PROFILE,
  axiosDelete,
  useAuthResources,
)

const useEvaluatorProfileCreate = creationHook<I_EvaluatorProfileCreateRequestData, I_CreationCommonResponse>(
  EVALUATOR_PROFILE,
  axiosPost,
  useAuthResources,
)

const useEvaluatorProfileUpdate = updateHook<
  T_EvaluatorProfileId,
  I_EvaluatorProfileUpdateRequestData,
  I_CreationCommonResponse
>(EVALUATOR_PROFILE, axiosPatch, useAuthResources)

const useEvaluatorProfileDetail = detailHook<T_EvaluatorProfileId, I_EvaluatorProfileDetail>(
  EVALUATOR_PROFILE,
  axiosGet,
  useAuthResources,
)

const useEvaluatorProfileDelete = deletionHook<T_EvaluatorProfileId>(EVALUATOR_PROFILE, axiosDelete, useAuthResources)

// Navigation hooks
const useNavigateToEvaluatorProfileList = () => {
  const router = useRouter()
  return () => router.push('/evaluators')
}

const useNavigateToEvaluatorProfileCreate = () => {
  const router = useRouter()
  return () => router.push('/evaluators/create')
}

const useNavigateToEvaluatorProfileDetail = () => {
  const router = useRouter()
  return (id: T_EvaluatorProfileId) => router.push(`/evaluators/${id}`)
}

// Export all resources
export {
  useEvaluatorProfileList,
  useEvaluatorProfileBatchDelete,
  useEvaluatorProfileCreate,
  useEvaluatorProfileUpdate,
  useEvaluatorProfileDetail,
  useEvaluatorProfileDelete,
  useNavigateToEvaluatorProfileList,
  useNavigateToEvaluatorProfileCreate,
  useNavigateToEvaluatorProfileDetail,
}
