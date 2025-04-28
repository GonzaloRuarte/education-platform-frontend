import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_SchoolCreateRequestData,
  I_SchoolDetail,
  I_SchoolUpdateRequestData,
  I_StudentProfileCreateRequestData,
  T_SchoolId,
  T_SchoolNames,
  T_SchoolsList,
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
import { I_CreationCommonResponse } from '@/shared/types'
import { listHookV3 } from '@/shared/hooks/dataServices/listHook.v3'

const SCHOOLS_PATH = '/schools'
const STUDENT_PROFILE_PATH = '/student-profile'
const STUDENTS_BY_SCHOOL_PATH = '/student-profile/list-by-school/{schoolId:string}'

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

const useNavigateToSchoolList = navigationHook(pages.D._.escuelas.path)
const useNavigateToSchoolDetail = navigationWithIdHook(pages.D._.escuelas.path)
const useNavigateToSchoolCreate = navigationHook(pages.D._.escuelas._.agregar.path)
const useNavigateToStudentProfileList = navigationHook(pages.D._.estudiantes.path)

const useNavigateToStudentProfileCreate = navigationHook(pages.D._.estudiantes._.agregar.path)
const useNavigateToStudentProfileDetail = navigationWithIdHook(pages.D._.estudiantes.path)

export {
  useNavigateToSchoolCreate,
  useNavigateToSchoolDetail,
  useNavigateToSchoolList,
  useNavigateToStudentProfileList,
  useNavigateToStudentProfileCreate,
  useNavigateToStudentProfileDetail,
  useSchoolBatchDelete,
  useSchoolCreate,
  useSchoolDelete,
  useSchoolDetail,
  useSchoolList,
  useSchoolUpdate,
  useStudentProfileList,
  useSchoolAllNames,
  useStudentProfileListBySchool,
  useStudentProfileCreate,
}
