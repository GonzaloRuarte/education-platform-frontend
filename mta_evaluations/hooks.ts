import { apiUrl } from '@/config'
import { useAuthResources } from '@/mta_auth/hooks'
import { T_GetSchoolsListResponse } from '@/mta_schools/types'
import { axiosGet } from '@/shared/data/axios'
import { listHook } from '@/shared/hooks'

const useEvaluationList = listHook<T_GetSchoolsListResponse>(apiUrl('/evaluations'), axiosGet, useAuthResources)

export { useEvaluationList }
