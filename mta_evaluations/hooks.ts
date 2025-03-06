import { useAuthResources } from '@/mta_auth/hooks'
import { I_EvaluationCreateRequestData, T_EvaluationId, T_EvaluationList, T_EvaluationSubjectList } from '@/mta_evaluations/types'
import pages from '@/pages'
import { axiosDelete, axiosGet, axiosPost } from '@/shared/data/axios'
import { batchDeletionHook, creationHook, deletionHook, listHook, navigationHook, navigationWithIdHook } from '@/shared/hooks'
import { useStore } from '@/shared/state'
import { I_CreationCommonResponse } from '@/shared/types'

const EVALUATIONS_PATH = '/evaluations'

const useEvaluationList = listHook<T_EvaluationList>(EVALUATIONS_PATH, axiosGet, useAuthResources)
const useEvaluationCreate = creationHook<I_EvaluationCreateRequestData, I_CreationCommonResponse>(EVALUATIONS_PATH, axiosPost, useAuthResources)
const useEvaluationDelete = deletionHook<T_EvaluationId>(EVALUATIONS_PATH, axiosDelete, useAuthResources)
const useEvaluationBatchDelete = batchDeletionHook<T_EvaluationId>(EVALUATIONS_PATH, axiosDelete, useAuthResources)

const useNavigateToEvaluationList = navigationHook(pages.D._.evaluaciones.path)
const useNavigateToEvaluationDetail = navigationWithIdHook(pages.D._.evaluaciones.path)
const useNavigateToEvaluationCreate = navigationHook(pages.D._.evaluaciones._.agregar.path)

const useRecoverAndStoreEvaluationSubjects = () => {
  const useRecover = listHook<T_EvaluationSubjectList>('/evaluation-subjects', axiosGet, useAuthResources)
  const recover = useRecover()
  const store = useStore((state) => state.storeSubjects)

  return async () => {
    return recover().then((res) => {
      store(res)
      return res
    })
  }
}

const useEvaluationSubjects = () => {
  return useStore((state) => state.subjects)
}

export {
  useEvaluationBatchDelete,
  useEvaluationDelete,
  useEvaluationList,
  useEvaluationCreate,
  useNavigateToEvaluationCreate,
  useNavigateToEvaluationDetail,
  useNavigateToEvaluationList,
  useRecoverAndStoreEvaluationSubjects,
  useEvaluationSubjects,
}
