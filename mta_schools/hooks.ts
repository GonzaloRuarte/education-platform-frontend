import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_CreateSchoolRequestData,
  I_SchoolDetail,
  I_SchoolUpdateRequestData,
  T_GetSchoolsListResponse,
  T_GetStudentProfileListResponse,
  T_SchoolId,
} from '@/mta_schools/types'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import {
  creationHook,
  deletionHook,
  detailHook,
  listHook,
  navigationHook,
  navigationWithIdHook,
  updateHook,
} from '@/shared/hooks'

import pages from '@/pages'
import { I_CreationCommonResponse } from '@/shared/types'

const SCHOOLS_PATH = '/schools'

const useSchoolList = listHook<T_GetSchoolsListResponse>(SCHOOLS_PATH, axiosGet, useAuthResources)
const useSchoolCreate = creationHook<I_CreateSchoolRequestData, I_CreationCommonResponse>(
  SCHOOLS_PATH,
  axiosPost,
  useAuthResources,
)
const useSchoolDelete = deletionHook<T_SchoolId, I_CreationCommonResponse>(SCHOOLS_PATH, axiosDelete, useAuthResources)
const useSchoolDetail = detailHook<T_SchoolId, I_SchoolDetail>(SCHOOLS_PATH, axiosGet, useAuthResources)
const useSchoolUpdate = updateHook<T_SchoolId, I_SchoolUpdateRequestData, I_SchoolDetail>(
  SCHOOLS_PATH,
  axiosPatch,
  useAuthResources,
)

const useStudentProfileList = listHook<T_GetStudentProfileListResponse>('/student-profile', axiosGet, useAuthResources)

const useNavigateToSchoolList = navigationHook(pages.D._.escuelas.path)
const useNavigateToSchoolDetail = navigationWithIdHook(pages.D._.escuelas.path)
const useNavigateToSchoolCreate = navigationHook(pages.D._.escuelas._.agregarEscuela.path)

export {
  useNavigateToSchoolDetail,
  useNavigateToSchoolList,
  useSchoolCreate,
  useSchoolDelete,
  useSchoolDetail,
  useSchoolList,
  useSchoolUpdate,
  useStudentProfileList,
  useNavigateToSchoolCreate,
}
