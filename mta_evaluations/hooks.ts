import { useAuthResources } from '@/mta_auth/hooks'
import { T_GetSchoolsListResponse } from '@/mta_schools/types'
import { axiosGet } from '@/shared/data/axios'
import { listHook } from '@/shared/hooks'

const useEvaluationList = listHook<T_GetSchoolsListResponse>(
  'http://127.0.0.1:8000/api/evaluations',
  axiosGet,
  useAuthResources,
)

export { useEvaluationList }
