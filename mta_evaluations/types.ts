import { I_PaginatedResponse } from '@/shared/data/types'

type T_EvaluationId = number
type T_EvaluationSubjectId = string

type T_EvaluationStatusCode = 'P' | 'D'
enum EvaluationStatus {
  Published = 'P',
  Draft = 'D',
}

interface I_EvaluationListItem {
  id: T_EvaluationId
  title: string
  code: string
  questions_per_page: number
  status: T_EvaluationStatusCode
  created_by: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
}
type T_EvaluationList = I_PaginatedResponse<I_EvaluationListItem>

interface I_EvaluationDetail {
  id: T_EvaluationId
  questions: Array<{
    id: number
    order: number
    content: string
    is_mandatory: boolean
    break_page_after: boolean
  }>
  created_at: string
  updated_at: string
  title: string
  code: string
  header: string
  questions_per_page: number
  status: T_EvaluationStatusCode
  subject_id: T_EvaluationSubjectId
  created_by: number
}

interface I_EvaluationSubject {
  id: T_EvaluationSubjectId
  name: string
  prefix: string
}

type T_EvaluationSubjectList = Array<I_EvaluationSubject>

interface I_EvaluationCreateRequestData {
  title: string
  code: string
  subject_id: T_EvaluationSubjectId
  header: string
  status: T_EvaluationStatusCode
}

export type {
  T_EvaluationId,
  I_EvaluationListItem,
  T_EvaluationList,
  I_EvaluationDetail,
  T_EvaluationStatusCode,
  I_EvaluationCreateRequestData,
  T_EvaluationSubjectList,
  I_EvaluationSubject,
}
export { EvaluationStatus }
