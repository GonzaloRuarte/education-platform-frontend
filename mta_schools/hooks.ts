import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_CohortsDistinctBySchool,
  I_SchoolCreateRequestData,
  I_SchoolDetail,
  I_SchoolStaffProfileCreateRequestData,
  I_SchoolStaffProfileDetail,
  I_SchoolStaffProfileUpdateRequestData,
  I_SchoolUpdateRequestData,
  I_StudentProfileCreateRequestData,
  T_SchoolId,
  T_SchoolNames,
  T_SchoolsList,
  T_SchoolStaffProfileId,
  T_SchoolStaffProfileList,
  T_StudentProfileBatchCreateRequestData,
  T_StudentProfileList,
} from '@/mta_schools/types'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import {
  batchDeletionHook,
  creationHook,
  deletionHook,
  detailHook,
  listHook,
  navigationHook,
  navigationWithIdHook,
  updateHook,
} from '@/shared/hooks'

import pages from '@/pages'
import { I_RequestSetup } from '@/shared/data/types'
import { actionHookV3, listHookV3 } from '@/shared/hooks/dataServices/v3'
import { I_CreationCommonResponse, T_EmptyPayload } from '@/shared/types'

const SCHOOLS_PATH = '/schools'
const useSchoolList = listHook<T_SchoolsList>(SCHOOLS_PATH, axiosGet, useAuthResources)
const useSchoolAllNames = listHook<T_SchoolNames>(`${SCHOOLS_PATH}/all-names`, axiosGet, useAuthResources)
const useSchoolCreate = creationHook<I_SchoolCreateRequestData, I_CreationCommonResponse>(
  SCHOOLS_PATH,
  axiosPost,
  useAuthResources,
)
const useSchoolDelete = deletionHook<T_SchoolId>(SCHOOLS_PATH, axiosDelete, useAuthResources)
const useSchoolBatchDelete = batchDeletionHook<T_SchoolId>(SCHOOLS_PATH, axiosDelete, useAuthResources)
const useSchoolDetail = detailHook<T_SchoolId, I_SchoolDetail>(SCHOOLS_PATH, axiosGet, useAuthResources)
const useSchoolUpdate = updateHook<T_SchoolId, I_SchoolUpdateRequestData, I_SchoolDetail>(
  SCHOOLS_PATH,
  axiosPatch,
  useAuthResources,
)

const STUDENT_PROFILE_PATH = '/student-profiles'
const STUDENTS_BY_SCHOOL_PATH = '/student-profiles/list-by-school/{schoolId:string}'
const useStudentProfileList = listHook<T_StudentProfileList>(STUDENT_PROFILE_PATH, axiosGet, useAuthResources)
const useStudentProfileListBySchool = listHookV3<typeof STUDENTS_BY_SCHOOL_PATH, T_StudentProfileList>(
  STUDENTS_BY_SCHOOL_PATH,
  axiosGet,
  useAuthResources,
)
const useStudentProfileCreate = creationHook<I_StudentProfileCreateRequestData, I_CreationCommonResponse>(
  STUDENT_PROFILE_PATH,
  axiosPost,
  useAuthResources,
)

const _useRequestSetup = (): I_RequestSetup => {
  const authResources = useAuthResources()
  return { ...authResources, 'Content-Type': 'multipart/form-data' }
}
const useStudentProfileBatchCreate = creationHook<T_StudentProfileBatchCreateRequestData, I_CreationCommonResponse>(
  `${STUDENT_PROFILE_PATH}/batch-create`,
  axiosPost,
  _useRequestSetup,
)

const COHORTS_BY_SCHOOL_PATH = '/cohorts/distinct-by-school/{schoolId:string}'
const useCohortsDistinctBySchool = actionHookV3<
  typeof COHORTS_BY_SCHOOL_PATH,
  T_EmptyPayload,
  I_CohortsDistinctBySchool
>(COHORTS_BY_SCHOOL_PATH, axiosGet, useAuthResources)

const SCHOOL_STAFF_PROFILE = '/school-staff-profiles'
const useSchoolStaffProfileList = listHook<T_SchoolStaffProfileList>(SCHOOL_STAFF_PROFILE, axiosGet, useAuthResources)
const useSchoolStaffProfileBatchDelete = batchDeletionHook<T_SchoolStaffProfileId>(
  SCHOOL_STAFF_PROFILE,
  axiosDelete,
  useAuthResources,
)
const useSchoolStaffProfileCreate = creationHook<I_SchoolStaffProfileCreateRequestData, I_CreationCommonResponse>(
  SCHOOL_STAFF_PROFILE,
  axiosPost,
  useAuthResources,
)
const useSchoolStaffProfileUpdate = updateHook<
  T_SchoolStaffProfileId,
  I_SchoolStaffProfileUpdateRequestData,
  I_CreationCommonResponse
>(SCHOOL_STAFF_PROFILE, axiosPatch, useAuthResources)
const useSchoolStaffProfileDetail = detailHook<T_SchoolStaffProfileId, I_SchoolStaffProfileDetail>(
  SCHOOL_STAFF_PROFILE,
  axiosGet,
  useAuthResources,
)
const useSchoolStaffProfileDelete = deletionHook<T_SchoolStaffProfileId>(
  SCHOOL_STAFF_PROFILE,
  axiosDelete,
  useAuthResources,
)

// Navigation
const useNavigateToSchoolList = navigationHook(pages.D._.escuelas.path)
const useNavigateToSchoolDetail = navigationWithIdHook(pages.D._.escuelas.path)
const useNavigateToSchoolCreate = navigationHook(pages.D._.escuelas._.agregar.path)
const useNavigateToStudentProfileList = navigationHook(pages.D._.estudiantes.path)

const useNavigateToStudentProfileCreate = navigationHook(pages.D._.estudiantes._.agregar.path)
const useNavigateToStudentProfileBatchCreate = navigationHook(pages.D._.estudiantes._.cargaMasiva.path)
const useNavigateToStudentProfileDetail = navigationWithIdHook(pages.D._.estudiantes.path)
const useNavigateToSchoolStaffProfileList = navigationHook(pages.D._.usuarios._.staffEscuela.path)
const useNavigateToSchoolStaffProfileCreate = navigationHook(pages.D._.usuarios._.staffEscuela._.agregar.path)
const useNavigateToSchoolStaffProfileDetail = navigationWithIdHook(pages.D._.usuarios._.staffEscuela.path)

export {
  useCohortsDistinctBySchool,
  useNavigateToSchoolCreate,
  useNavigateToSchoolDetail,
  useNavigateToSchoolList,
  useNavigateToStudentProfileBatchCreate,
  useNavigateToStudentProfileCreate,
  useNavigateToStudentProfileDetail,
  useNavigateToStudentProfileList,
  useSchoolAllNames,
  useSchoolBatchDelete,
  useSchoolCreate,
  useSchoolDelete,
  useSchoolDetail,
  useSchoolList,
  useSchoolUpdate,
  useStudentProfileBatchCreate,
  useStudentProfileCreate,
  useStudentProfileList,
  useStudentProfileListBySchool,
  useSchoolStaffProfileList,
  useSchoolStaffProfileBatchDelete,
  useSchoolStaffProfileCreate,
  useNavigateToSchoolStaffProfileList,
  useNavigateToSchoolStaffProfileCreate,
  useSchoolStaffProfileDetail,
  useSchoolStaffProfileUpdate,
  useNavigateToSchoolStaffProfileDetail,
  useSchoolStaffProfileDelete,
}
