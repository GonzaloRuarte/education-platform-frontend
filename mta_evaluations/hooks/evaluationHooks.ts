import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_EvaluationCreateRequestData,
  I_EvaluationPageCreateRequestData,
  I_EvaluationPageEditRequestData,
  I_EvaluationDetail,
  I_EvaluationSetStatusRequestData,
  T_EvaluationId,
  T_EvaluationPageId,
  T_EvaluationList,
  T_EvaluationSubjectList,
} from '@/mta_evaluations/types'
import { I_EvaluationToResolve } from '@/mta_resolutions/types'
import pages, { evaluationsEditContentPath, evaluationsPreviewPath } from '@/pages'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import {
  actionHook,
  batchDeletionHook,
  creationHook,
  deletionHook,
  detailHook,
  dynamicNavigationHook,
  listHook,
  navigationHook,
  navigationWithIdHook,
  updateHook,
} from '@/shared/hooks'
import { actionDataHookV3 } from '@/shared/hooks/dataServices/v3'
import { listService } from '@/shared/service'
import { useStore } from '@/shared/state'
import { I_CreationCommonResponse, T_EmptyPayload } from '@/shared/types'

// Data Service
const EVALUATIONS_PATH = '/evaluations'
const useEvaluationList = listHook<T_EvaluationList>(EVALUATIONS_PATH, axiosGet, useAuthResources)
const useEvaluationCreate = creationHook<I_EvaluationCreateRequestData, I_CreationCommonResponse>(
  EVALUATIONS_PATH,
  axiosPost,
  useAuthResources,
)
const useEvaluationUpdate = updateHook<T_EvaluationId, I_EvaluationCreateRequestData, I_CreationCommonResponse>(
  EVALUATIONS_PATH,
  axiosPatch,
  useAuthResources,
)
const useEvaluationDelete = deletionHook<T_EvaluationId>(EVALUATIONS_PATH, axiosDelete, useAuthResources)
const useEvaluationBatchDelete = batchDeletionHook<T_EvaluationId>(EVALUATIONS_PATH, axiosDelete, useAuthResources)
const useEvaluationDetail = detailHook<T_EvaluationId, I_EvaluationDetail>(EVALUATIONS_PATH, axiosGet, useAuthResources)
const useEvaluationSetStatus = actionHook<I_EvaluationSetStatusRequestData, T_EmptyPayload>(
  `${EVALUATIONS_PATH}/set-status`,
  axiosPost,
  useAuthResources,
)
const useEvaluationSubjects = () => useStore((state) => state.evaluations_subjects)
const useRecoverAndStoreEvaluationSubjects = () => {
  const recover = listService<T_EvaluationSubjectList>('/evaluation-subjects', axiosGet)(useAuthResources())
  const store = useStore((state) => state.evaluations_storeSubjects)
  return async () =>
    recover().then((res) => {
      store(res)
      return res
    })
}
const EVALUATION_PAGE_PATH = '/evaluation-pages'
const useEvaluationPageCreate = creationHook<I_EvaluationPageCreateRequestData, I_CreationCommonResponse>(
  EVALUATION_PAGE_PATH,
  axiosPost,
  useAuthResources,
)
const useEvaluationPageUpdate = updateHook<T_EvaluationPageId, I_EvaluationPageEditRequestData, I_CreationCommonResponse>(
  EVALUATION_PAGE_PATH,
  axiosPatch,
  useAuthResources,
)
const useEvaluationPageDelete = deletionHook<T_EvaluationPageId>(EVALUATION_PAGE_PATH, axiosDelete, useAuthResources)


const EVALUATION_PREVIEW_PATH = '/evaluations/{evaluationId:number}/preview'
const useEvaluationPreview = actionDataHookV3<typeof EVALUATION_PREVIEW_PATH, T_EmptyPayload, I_EvaluationToResolve>(
  EVALUATION_PREVIEW_PATH,
  axiosGet,
  useAuthResources,
)

// Navigation
const useNavigateToEvaluationList = navigationHook(pages.D._.evaluaciones.path)
const useNavigateToEvaluationDetail = navigationWithIdHook(pages.D._.evaluaciones.path)
const useNavigateToEvaluationCreate = navigationHook(pages.D._.evaluaciones._.agregar.path)
const useNavigateToEvaluationContentEdit = dynamicNavigationHook(evaluationsEditContentPath)
const useNavigateToEvaluationPreview = dynamicNavigationHook(evaluationsPreviewPath)

export {
  useEvaluationBatchDelete,
  useEvaluationCreate,
  useEvaluationDelete,
  useEvaluationDetail,
  useEvaluationList,
  useEvaluationSubjects,
  useEvaluationUpdate,
  useNavigateToEvaluationContentEdit,
  useNavigateToEvaluationPreview,
  useNavigateToEvaluationCreate,
  useNavigateToEvaluationDetail,
  useNavigateToEvaluationList,
  useRecoverAndStoreEvaluationSubjects,
  useEvaluationSetStatus,
  useEvaluationPreview,
  useEvaluationPageCreate,
  useEvaluationPageUpdate,
  useEvaluationPageDelete,
}
