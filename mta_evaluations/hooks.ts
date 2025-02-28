import { useAuthResources } from '@/mta_auth/hooks'
import { T_EvaluationId } from '@/mta_evaluations/types'
import { T_GetSchoolsListResponse } from '@/mta_schools/types'
import pages from '@/pages'
import { axiosDelete, axiosGet } from '@/shared/data/axios'
import { batchDeletionHook, deletionHook, listHook, navigationHook, navigationWithIdHook } from '@/shared/hooks'

const useEvaluationList = listHook<T_GetSchoolsListResponse>('/evaluations', axiosGet, useAuthResources)
const useEvaluationDelete = deletionHook<T_EvaluationId>('/evaluations', axiosDelete, useAuthResources)
const useEvaluationBatchDelete = batchDeletionHook<T_EvaluationId>('/evaluations', axiosDelete, useAuthResources)

const useNavigateToEvaluationList = navigationHook(pages.D._.evaluaciones.path)
const useNavigateToEvaluationDetail = navigationWithIdHook(pages.D._.evaluaciones.path)
const useNavigateToEvaluationCreate = navigationHook(pages.D._.evaluaciones._.agregar.path)

export {
  useEvaluationBatchDelete,
  useEvaluationDelete,
  useEvaluationList,
  useNavigateToEvaluationList,
  useNavigateToEvaluationDetail,
  useNavigateToEvaluationCreate,
}
