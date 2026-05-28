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
import {
  resourceRecordBatchDeleteHook,
  resourceRecordCreateHook,
  resourceRecordDeleteHook,
  resourceRecordDetailHook,
  resourceRecordListHook,
  resourceRecordUpdateHook,
} from '@/shared/resources/hooks'
import { I_CreationCommonResponse, T_EmptyPayload } from '@/shared/types'

const SCHOOL_RESOURCE_KEY = 'school'
const GROUPING_RESOURCE_KEY = 'grouping'
const STUDENT_PROFILE_RESOURCE_KEY = 'student_profile'
const GROUPING_STAFF_PROFILE = '/grouping-staff-profiles'
const GROUPING_STAFF_ANON_PROFILE = '/grouping-staff-anonymized-profiles'

const useSchoolList = resourceRecordListHook<T_SchoolsList>(SCHOOL_RESOURCE_KEY)
const useSchoolAllNames = (options?: Parameters<typeof useSchoolList>[0]) => {
  const result = useSchoolList({ page_size: 1000, ...options })
  return {
    ...result,
    data: result.data?.results.map((school) => ({
      id: school.id,
      name: school.name,
    })),
  }
}
const useSchoolCreate = resourceRecordCreateHook<I_SchoolCreateRequestData, I_CreationCommonResponse>(SCHOOL_RESOURCE_KEY)
const useSchoolDelete = resourceRecordDeleteHook<T_SchoolId>(SCHOOL_RESOURCE_KEY)
const useSchoolBatchDelete = resourceRecordBatchDeleteHook<T_SchoolId>(SCHOOL_RESOURCE_KEY)
const useSchoolDetail = resourceRecordDetailHook<T_SchoolId, I_SchoolDetail>(SCHOOL_RESOURCE_KEY)
const useSchoolUpdate = resourceRecordUpdateHook<T_SchoolId, I_SchoolUpdateRequestData, I_SchoolDetail>(SCHOOL_RESOURCE_KEY)

const useGroupingList = resourceRecordListHook<T_GroupingList>(GROUPING_RESOURCE_KEY)
const useGroupingCreate = resourceRecordCreateHook<I_GroupingCreateRequestData, I_CreationCommonResponse>(GROUPING_RESOURCE_KEY)
const useGroupingDelete = resourceRecordDeleteHook<T_GroupingId>(GROUPING_RESOURCE_KEY)
const useGroupingBatchDelete = resourceRecordBatchDeleteHook<T_GroupingId>(GROUPING_RESOURCE_KEY)
const useGroupingDetail = resourceRecordDetailHook<T_GroupingId, I_GroupingDetail>(GROUPING_RESOURCE_KEY)
const useGroupingUpdate = resourceRecordUpdateHook<T_GroupingId, I_GroupingCreateRequestData, I_GroupingDetail>(GROUPING_RESOURCE_KEY)
const useGroupingAllNames = (...args: Parameters<typeof useGroupingList>) => {
  const result = useGroupingList(...args)
  return {
    ...result,
    data: result.data?.results.map((grouping) => ({
      id: grouping.id,
      name: grouping.name,
    })),
  }
}

const STUDENT_PROFILE_PATH = '/student-profiles'
const STUDENTS_BY_SCHOOL_PATH = '/student-profiles/list-by-school/{schoolId:string}'
const useStudentProfileDetail = resourceRecordDetailHook<T_StudentProfileId, I_StudentProfileDetail>(STUDENT_PROFILE_RESOURCE_KEY)
const useStudentProfileList = resourceRecordListHook<T_StudentProfileList>(STUDENT_PROFILE_RESOURCE_KEY)
const useStudentProfileListBySchool = listHookV3<typeof STUDENTS_BY_SCHOOL_PATH, T_StudentProfileList>(STUDENTS_BY_SCHOOL_PATH, axiosGet, useAuthResources)
const useStudentProfileCreate = resourceRecordCreateHook<I_StudentProfileCreateRequestData, I_CreationCommonResponse>(STUDENT_PROFILE_RESOURCE_KEY)
const useStudentProfileUpdate = resourceRecordUpdateHook<T_StudentProfileId, I_StudentProfileCreateRequestData, I_CreationCommonResponse>(STUDENT_PROFILE_RESOURCE_KEY)
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
