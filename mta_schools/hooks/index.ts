import { useAuthResources, useRequestSetupWithMultipart } from '@/mta_auth/hooks'
import {
  I_CohortsDistinctBySchool,
  I_GroupingCreateRequestData,
  I_GroupingDetail,
  I_GroupingStaffProfileCreateRequestData,
  I_GroupingStaffProfileDetail,
  I_GroupingStaffProfileUpdateRequestData,
  I_SchoolCreateRequestData,
  I_SchoolDetail,
  I_SchoolName,
  I_SchoolStaffProfileCreateRequestData,
  I_SchoolStaffProfileDetail,
  I_SchoolStaffProfileUpdateRequestData,
  I_ExecutiveProfileCreateRequestData,
  I_ExecutiveProfileDetail,
  I_ExecutiveProfileUpdateRequestData,
  I_SchoolUpdateRequestData,
  I_StudentProfileCreateRequestData,
  I_StudentProfileDetail,
  T_ExecutiveProfileId,
  T_GroupingId,
  T_GroupingList,
  T_GroupingNames,
  T_GroupingStaffProfileId,
  T_SchoolId,
  T_SchoolNames,
  T_SchoolsList,
  T_SchoolStaffProfileId,
  T_SchoolStaffProfileList,
  T_ExecutiveProfileList,
  T_GroupingStaffProfileList,
  T_StudentProfileBatchCreateRequestData,
  T_StudentProfileId,
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
import { actionDataHookV3, listHookV3 } from '@/shared/hooks/dataServices/v3'
import { httpService } from '@/shared/service'
import { I_CreationCommonResponse, T_EmptyPayload } from '@/shared/types'

const SCHOOLS_PATH = '/schools'
const GROUPINGS_PATH = '/groupings'
const GROUPING_STAFF_PROFILE = '/grouping-staff-profiles'
const GROUPING_STAFF_ANON_PROFILE = '/grouping-staff-anonymized-profiles'

const useSchoolList = listHook<T_SchoolsList>(SCHOOLS_PATH, axiosGet, useAuthResources)
const useSchoolAllNames = listHook<T_SchoolNames>(`${SCHOOLS_PATH}/all-names`, axiosGet, useAuthResources)
const useSchoolCreate = creationHook<I_SchoolCreateRequestData, I_CreationCommonResponse>(SCHOOLS_PATH, axiosPost, useAuthResources)
const useSchoolDelete = deletionHook<T_SchoolId>(SCHOOLS_PATH, axiosDelete, useAuthResources)
const useSchoolBatchDelete = batchDeletionHook<T_SchoolId>(SCHOOLS_PATH, axiosDelete, useAuthResources)
const useSchoolDetail = detailHook<T_SchoolId, I_SchoolDetail>(SCHOOLS_PATH, axiosGet, useAuthResources)
const useSchoolUpdate = updateHook<T_SchoolId, I_SchoolUpdateRequestData, I_SchoolDetail>(SCHOOLS_PATH, axiosPatch, useAuthResources)

const useGroupingList = listHook<T_GroupingList>(GROUPINGS_PATH, axiosGet, useAuthResources)
const useGroupingCreate = creationHook<I_GroupingCreateRequestData, I_CreationCommonResponse>(GROUPINGS_PATH, axiosPost, useAuthResources)
const useGroupingDelete = deletionHook<T_GroupingId>(GROUPINGS_PATH, axiosDelete, useAuthResources)
const useGroupingBatchDelete = batchDeletionHook<T_GroupingId>(GROUPINGS_PATH, axiosDelete, useAuthResources)
const useGroupingDetail = detailHook<T_GroupingId, I_GroupingDetail>(GROUPINGS_PATH, axiosGet, useAuthResources)
const useGroupingUpdate = updateHook<T_GroupingId, I_GroupingCreateRequestData, I_GroupingDetail>(GROUPINGS_PATH, axiosPatch, useAuthResources)
const useGroupingAllNames = listHook<T_GroupingNames>(GROUPINGS_PATH, axiosGet, useAuthResources)

const STUDENT_PROFILE_PATH = '/student-profiles'
const STUDENTS_BY_SCHOOL_PATH = '/student-profiles/list-by-school/{schoolId:string}'
const useStudentProfileDetail = detailHook<T_StudentProfileId, I_StudentProfileDetail>(STUDENT_PROFILE_PATH, axiosGet, useAuthResources)
const useStudentProfileList = listHook<T_StudentProfileList>(STUDENT_PROFILE_PATH, axiosGet, useAuthResources)
const useStudentProfileListBySchool = listHookV3<typeof STUDENTS_BY_SCHOOL_PATH, T_StudentProfileList>(STUDENTS_BY_SCHOOL_PATH, axiosGet, useAuthResources)
const useStudentProfileCreate = creationHook<I_StudentProfileCreateRequestData, I_CreationCommonResponse>(STUDENT_PROFILE_PATH, axiosPost, useAuthResources)
const useStudentProfileUpdate = updateHook<T_StudentProfileId, I_StudentProfileCreateRequestData, I_CreationCommonResponse>(STUDENT_PROFILE_PATH, axiosPatch, useAuthResources)
const useStudentProfileBatchDelete = batchDeletionHook<T_StudentProfileId>(STUDENT_PROFILE_PATH, axiosDelete, useAuthResources)
const useStudentProfileBatchCreate = creationHook<T_StudentProfileBatchCreateRequestData, I_CreationCommonResponse>(`${STUDENT_PROFILE_PATH}/batch-create`, axiosPost, useRequestSetupWithMultipart)

const COHORTS_BY_SCHOOL_PATH = '/cohorts/distinct-by-school/{schoolId:string}'
const useCohortsDistinctBySchool = actionDataHookV3<typeof COHORTS_BY_SCHOOL_PATH, T_EmptyPayload, I_CohortsDistinctBySchool>(COHORTS_BY_SCHOOL_PATH, axiosGet, useAuthResources)

const SCHOOL_STAFF_PROFILE = '/school-staff-profiles'
const EXECUTIVE_PROFILE = '/executive-profiles'
const useSchoolStaffProfileList = listHook<T_SchoolStaffProfileList>(SCHOOL_STAFF_PROFILE, axiosGet, useAuthResources)
const useSchoolStaffProfileListByUserSchool = listHook<T_SchoolStaffProfileList>(`${SCHOOL_STAFF_PROFILE}/list-by-user-school`, axiosGet, useAuthResources)
const useExecutiveProfileList = listHook<T_ExecutiveProfileList>(EXECUTIVE_PROFILE, axiosGet, useAuthResources)
const useExecutiveProfileListByUserSchool = listHook<T_ExecutiveProfileList>(`${EXECUTIVE_PROFILE}/list-by-user-school`, axiosGet, useAuthResources)
const useSchoolStaffProfileBatchDelete = batchDeletionHook<T_SchoolStaffProfileId>(SCHOOL_STAFF_PROFILE, axiosDelete, useAuthResources)
const useExecutiveProfileBatchDelete = batchDeletionHook<T_ExecutiveProfileId>(EXECUTIVE_PROFILE, axiosDelete, useAuthResources)
const useSchoolStaffProfileCreate = creationHook<I_SchoolStaffProfileCreateRequestData, I_CreationCommonResponse>(SCHOOL_STAFF_PROFILE, axiosPost, useAuthResources)
const useExecutiveProfileCreate = creationHook<I_ExecutiveProfileCreateRequestData, I_CreationCommonResponse>(EXECUTIVE_PROFILE, axiosPost, useAuthResources)
const useSchoolStaffProfileUpdate = updateHook<T_SchoolStaffProfileId, I_SchoolStaffProfileUpdateRequestData, I_CreationCommonResponse>(SCHOOL_STAFF_PROFILE, axiosPatch, useAuthResources)
const useExecutiveProfileUpdate = updateHook<T_ExecutiveProfileId, I_ExecutiveProfileUpdateRequestData, I_CreationCommonResponse>(EXECUTIVE_PROFILE, axiosPatch, useAuthResources)
const useSchoolStaffProfileDetail = detailHook<T_SchoolStaffProfileId, I_SchoolStaffProfileDetail>(SCHOOL_STAFF_PROFILE, axiosGet, useAuthResources)
const useExecutiveProfileDetail = detailHook<T_ExecutiveProfileId, I_ExecutiveProfileDetail>(EXECUTIVE_PROFILE, axiosGet, useAuthResources)
const useSchoolStaffProfileDelete = deletionHook<T_SchoolStaffProfileId>(SCHOOL_STAFF_PROFILE, axiosDelete, useAuthResources)
const useExecutiveProfileDelete = deletionHook<T_ExecutiveProfileId>(EXECUTIVE_PROFILE, axiosDelete, useAuthResources)

const useGroupingStaffProfileList = listHook<T_GroupingStaffProfileList>(GROUPING_STAFF_PROFILE, axiosGet, useAuthResources)
const useGroupingStaffProfileCreate = creationHook<I_GroupingStaffProfileCreateRequestData, I_CreationCommonResponse>(GROUPING_STAFF_PROFILE, axiosPost, useAuthResources)
const useGroupingStaffProfileUpdate = updateHook<T_GroupingStaffProfileId, I_GroupingStaffProfileUpdateRequestData, I_CreationCommonResponse>(GROUPING_STAFF_PROFILE, axiosPatch, useAuthResources)
const useGroupingStaffProfileDetail = detailHook<T_GroupingStaffProfileId, I_GroupingStaffProfileDetail>(GROUPING_STAFF_PROFILE, axiosGet, useAuthResources)
const useGroupingStaffProfileDelete = deletionHook<T_GroupingStaffProfileId>(GROUPING_STAFF_PROFILE, axiosDelete, useAuthResources)
const useGroupingStaffProfileBatchDelete = batchDeletionHook<T_GroupingStaffProfileId>(GROUPING_STAFF_PROFILE, axiosDelete, useAuthResources)

const useGroupingStaffAnonymizedProfileList = listHook<T_GroupingStaffProfileList>(GROUPING_STAFF_ANON_PROFILE, axiosGet, useAuthResources)
const useGroupingStaffAnonymizedProfileCreate = creationHook<I_GroupingStaffProfileCreateRequestData, I_CreationCommonResponse>(GROUPING_STAFF_ANON_PROFILE, axiosPost, useAuthResources)
const useGroupingStaffAnonymizedProfileUpdate = updateHook<T_GroupingStaffProfileId, I_GroupingStaffProfileUpdateRequestData, I_CreationCommonResponse>(GROUPING_STAFF_ANON_PROFILE, axiosPatch, useAuthResources)
const useGroupingStaffAnonymizedProfileDetail = detailHook<T_GroupingStaffProfileId, I_GroupingStaffProfileDetail>(GROUPING_STAFF_ANON_PROFILE, axiosGet, useAuthResources)
const useGroupingStaffAnonymizedProfileDelete = deletionHook<T_GroupingStaffProfileId>(GROUPING_STAFF_ANON_PROFILE, axiosDelete, useAuthResources)
const useGroupingStaffAnonymizedProfileBatchDelete = batchDeletionHook<T_GroupingStaffProfileId>(GROUPING_STAFF_ANON_PROFILE, axiosDelete, useAuthResources)


// Navigation
const useNavigateToSchoolList = navigationHook(pages.D._.escuelas.path)
const useNavigateToSchoolDetail = navigationWithIdHook(pages.D._.escuelas.path)
const useNavigateToSchoolCreate = navigationHook(pages.D._.escuelas._.agregar.path)

const useNavigateToGroupingList = navigationHook(pages.D._.escuelas._.agrupamientos.path)
const useNavigateToGroupingDetail = navigationWithIdHook(pages.D._.escuelas._.agrupamientos.path)
const useNavigateToGroupingCreate = navigationHook(pages.D._.escuelas._.agrupamientos._.agregar.path)

const useNavigateToStudentProfileList = navigationHook(pages.D._.estudiantes.path)
const useNavigateToStudentProfileCreate = navigationHook(pages.D._.estudiantes._.agregar.path)
const useNavigateToStudentProfileBatchCreate = navigationHook(pages.D._.estudiantes._.cargaMasiva.path)
const useNavigateToStudentProfileDetail = navigationWithIdHook(pages.D._.estudiantes.path)

const useNavigateToSchoolStaffProfileList = navigationHook(pages.D._.usuarios._.responsableInstitucional.path)
const useNavigateToSchoolStaffProfileCreate = navigationHook(pages.D._.usuarios._.responsableInstitucional._.agregar.path)
const useNavigateToSchoolStaffProfileDetail = navigationWithIdHook(pages.D._.usuarios._.responsableInstitucional.path)

const useNavigateToExecutiveProfileList = navigationHook(pages.D._.usuarios._.responsableEjecutivo.path)
const useNavigateToExecutiveProfileCreate = navigationHook(pages.D._.usuarios._.responsableEjecutivo._.agregar.path)
const useNavigateToExecutiveProfileDetail = navigationWithIdHook(pages.D._.usuarios._.responsableEjecutivo.path)

const useNavigateToGroupingStaffProfileList = navigationHook(pages.D._.usuarios._.responsableAgrupamiento.path)
const useNavigateToGroupingStaffProfileCreate = navigationHook(pages.D._.usuarios._.responsableAgrupamiento._.agregar.path)
const useNavigateToGroupingStaffProfileDetail = navigationWithIdHook(pages.D._.usuarios._.responsableAgrupamiento.path)

const useNavigateToGroupingStaffAnonymizedProfileList = navigationHook(pages.D._.usuarios._.responsableAgrupamientoAnon.path)
const useNavigateToGroupingStaffAnonymizedProfileCreate = navigationHook(pages.D._.usuarios._.responsableAgrupamientoAnon._.agregar.path)
const useNavigateToGroupingStaffAnonymizedProfileDetail = navigationWithIdHook(pages.D._.usuarios._.responsableAgrupamientoAnon.path)

export {
  useCohortsDistinctBySchool,
  useNavigateToSchoolCreate,
  useNavigateToSchoolDetail,
  useNavigateToSchoolList,
  useNavigateToGroupingCreate,
  useNavigateToGroupingDetail,
  useNavigateToGroupingList,
  useNavigateToSchoolStaffProfileCreate,
  useNavigateToSchoolStaffProfileDetail,
  useNavigateToSchoolStaffProfileList,
  useNavigateToExecutiveProfileCreate,
  useNavigateToExecutiveProfileDetail,
  useNavigateToExecutiveProfileList,
  useNavigateToGroupingStaffProfileCreate,
  useNavigateToGroupingStaffProfileDetail,
  useNavigateToGroupingStaffProfileList,
  useNavigateToGroupingStaffAnonymizedProfileCreate,
  useNavigateToGroupingStaffAnonymizedProfileDetail,
  useNavigateToGroupingStaffAnonymizedProfileList,
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
  useGroupingAllNames,
  useGroupingBatchDelete,
  useGroupingCreate,
  useGroupingDelete,
  useGroupingDetail,
  useGroupingList,
  useGroupingUpdate,
  useSchoolStaffProfileBatchDelete,
  useSchoolStaffProfileCreate,
  useSchoolStaffProfileDelete,
  useSchoolStaffProfileDetail,
  useSchoolStaffProfileList,
  useSchoolStaffProfileListByUserSchool,
  useSchoolStaffProfileUpdate,
  useExecutiveProfileBatchDelete,
  useExecutiveProfileCreate,
  useExecutiveProfileDelete,
  useExecutiveProfileDetail,
  useExecutiveProfileList,
  useExecutiveProfileUpdate,
  useSchoolUpdate,
  useStudentProfileBatchCreate,
  useStudentProfileCreate,
  useStudentProfileList,
  useStudentProfileListBySchool,
  useStudentProfileUpdate,
  useStudentProfileDetail,
  useStudentProfileBatchDelete,
  useExecutiveProfileListByUserSchool,
  useGroupingStaffProfileList,
  useGroupingStaffProfileCreate,
  useGroupingStaffProfileUpdate,
  useGroupingStaffProfileDetail,
  useGroupingStaffProfileDelete,
  useGroupingStaffProfileBatchDelete,
  useGroupingStaffAnonymizedProfileList,
  useGroupingStaffAnonymizedProfileCreate,
  useGroupingStaffAnonymizedProfileUpdate,
  useGroupingStaffAnonymizedProfileDetail,
  useGroupingStaffAnonymizedProfileDelete,
  useGroupingStaffAnonymizedProfileBatchDelete,
}
