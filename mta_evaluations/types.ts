import { I_PaginatedResponse } from '@/shared/data/types';

interface I_EvaluationListItem {
  id: number
  created_at: string
  updated_at: string
  title: string
  header: string
  questions_per_page: number
}
type T_GetEvaluationListResponse = I_PaginatedResponse<I_EvaluationListItem>

export type {
  I_EvaluationListItem,
  T_GetEvaluationListResponse,
}