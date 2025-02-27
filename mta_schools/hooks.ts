import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_CreateSchoolRequestData,
  I_GetSchoolDetailResponse,
  T_GetSchoolsListResponse,
  T_GetStudentProfileListResponse,
  T_SchoolId,
} from '@/mta_schools/types'
import { axiosDelete, axiosGet, axiosPost } from '@/shared/data/axios'
import { creationHook, deletionHook, detailHook, listHook } from '@/shared/hooks'

import pages from '@/pages'
import { I_CreationCommonResponse } from '@/shared/types'
import { useRouter } from 'next/navigation'

const useSchoolList = listHook<T_GetSchoolsListResponse>('/schools', axiosGet, useAuthResources)

const useStudentProfileList = listHook<T_GetStudentProfileListResponse>('/student-profile', axiosGet, useAuthResources)

const useSchoolCreate = creationHook<I_CreateSchoolRequestData, I_CreationCommonResponse>(
  '/schools',
  axiosPost,
  useAuthResources,
)
const useSchoolDelete = deletionHook<T_SchoolId, I_CreationCommonResponse>('/schools', axiosDelete, useAuthResources)
const useSchoolDetail = detailHook<T_SchoolId, I_GetSchoolDetailResponse>('/schools', axiosGet, useAuthResources)

const useNavigateToSchoolList = () => {
  const router = useRouter()

  return () => {
    router.push(pages.D._.escuelas.path)
  }
}

export {
  useNavigateToSchoolList,
  useSchoolCreate,
  useSchoolDelete,
  useSchoolList,
  useStudentProfileList,
  useSchoolDetail,
}
