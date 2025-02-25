import { apiUrl } from '@/config'
import { useAuthResources } from '@/mta_auth/hooks'
import { T_GetSchoolsListResponse, T_GetStudentProfileListResponse } from '@/mta_schools/types'
import { axiosGet } from '@/shared/data/axios'
import { listHook } from '@/shared/hooks'

const useSchoolList = listHook<T_GetSchoolsListResponse>(apiUrl('/schools'), axiosGet, useAuthResources)

const useStudentProfileList = listHook<T_GetStudentProfileListResponse>(
  apiUrl('/student-profile'),
  axiosGet,
  useAuthResources,
)

export { useSchoolList, useStudentProfileList }
