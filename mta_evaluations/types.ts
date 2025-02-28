import { I_PaginatedResponse } from '@/shared/data/types'

type T_EvaluationId = number

type T_EvaluationStatusCode = 'P' | 'D'
interface I_EvaluationListItem {
  id: T_EvaluationId
  title: string
  code: string
  questions_per_page: number
  status: string
  created_by: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
}
type T_GetEvaluationListResponse = I_PaginatedResponse<I_EvaluationListItem>

export type { T_EvaluationId, I_EvaluationListItem, T_GetEvaluationListResponse, T_EvaluationStatusCode }
