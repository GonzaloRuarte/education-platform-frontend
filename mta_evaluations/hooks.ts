import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_EvaluationCreateRequestData,
  I_EvaluationDetail,
  I_QuestionDetail,
  T_EvaluationId,
  T_EvaluationList,
  T_EvaluationSubjectList,
  T_QuestionId,
} from '@/mta_evaluations/types'
import pages, { evaluationsEditContentPath } from '@/pages'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import {
  batchDeletionHook,
  creationHook,
  deletionHook,
  detailHook,
  detailHookV2,
  dynamicNavigationHook,
  listHook,
  navigationHook,
  navigationWithIdHook,
  updateHook,
} from '@/shared/hooks'
import { useStore } from '@/shared/state'
import { I_CreationCommonResponse } from '@/shared/types'

// Data Service
const EVALUATIONS_PATH = '/evaluations'
const useEvaluationList = listHook<T_EvaluationList>(EVALUATIONS_PATH, axiosGet, useAuthResources)
const useEvaluationCreate = creationHook<I_EvaluationCreateRequestData, I_CreationCommonResponse>(EVALUATIONS_PATH, axiosPost, useAuthResources)
const useEvaluationUpdate = updateHook<T_EvaluationId, I_EvaluationCreateRequestData, I_CreationCommonResponse>(EVALUATIONS_PATH, axiosPatch, useAuthResources)
const useEvaluationDelete = deletionHook<T_EvaluationId>(EVALUATIONS_PATH, axiosDelete, useAuthResources)
const useEvaluationBatchDelete = batchDeletionHook<T_EvaluationId>(EVALUATIONS_PATH, axiosDelete, useAuthResources)
const useEvaluationDetail = detailHook<T_EvaluationId, I_EvaluationDetail>(EVALUATIONS_PATH, axiosGet, useAuthResources)
const useEvaluationSubjects = () => useStore((state) => state.subjects)
const useRecoverAndStoreEvaluationSubjects = () => {
  const useRecover = listHook<T_EvaluationSubjectList>('/evaluation-subjects', axiosGet, useAuthResources)
  const recover = useRecover()
  const store = useStore((state) => state.storeSubjects)
  return async () =>
    recover().then((res) => {
      store(res)
      return res
    })
}
const QUESTIONS_PATH = '/questions'
const useQuestionDetail = detailHookV2<T_QuestionId, I_QuestionDetail>(QUESTIONS_PATH, axiosGet, useAuthResources)

// Navigation
const useNavigateToEvaluationList = navigationHook(pages.D._.evaluaciones.path)
const useNavigateToEvaluationDetail = navigationWithIdHook(pages.D._.evaluaciones.path)
const useNavigateToEvaluationCreate = navigationHook(pages.D._.evaluaciones._.agregar.path)
const useNavigateToEvaluationContentEdit = dynamicNavigationHook(evaluationsEditContentPath)

export {
  useEvaluationBatchDelete,
  useEvaluationCreate,
  useEvaluationDelete,
  useEvaluationDetail,
  useEvaluationList,
  useEvaluationSubjects,
  useEvaluationUpdate,
  useNavigateToEvaluationContentEdit,
  useNavigateToEvaluationCreate,
  useNavigateToEvaluationDetail,
  useNavigateToEvaluationList,
  useRecoverAndStoreEvaluationSubjects,
  useQuestionDetail,
}
