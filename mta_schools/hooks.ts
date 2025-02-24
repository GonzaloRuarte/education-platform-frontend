import { useAuthResources } from '@/mta_auth/hooks'
import { T_GetSchoolsListResponse, T_GetStudentProfileListResponse } from '@/mta_schools/types'
import { axiosGet } from '@/shared/data/axios'
import { listHook } from '@/shared/hooks'

const useSchoolList = listHook<T_GetSchoolsListResponse>(
  'http://127.0.0.1:8000/api/schools',
  axiosGet,
  useAuthResources,
)

const useStudentProfileList = listHook<T_GetStudentProfileListResponse>(
  'http://127.0.0.1:8000/api/student-profile',
  axiosGet,
  useAuthResources,
)

export { useSchoolList, useStudentProfileList }
