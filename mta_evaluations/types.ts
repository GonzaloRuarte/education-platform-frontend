import { I_PaginatedResponse } from '@/shared/data/types'

type T_EvaluationId = number
type T_QuestionId = number
type T_AnswerId = number
type T_MultiplChoiceId = number
type T_MultiplChoiceOptionId = number

type T_EvaluationSubjectId = string

type T_EvaluationStatusCode = 'P' | 'D'
type T_AnswerType = 'Numeric' | 'MultipleChoice'
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

interface I_EvaluationDetail_Answer {
  id: T_AnswerId
  resource_type: T_AnswerType
}
interface I_EvaluationDetail_NumericAnswer extends I_EvaluationDetail_Answer {
  value: number
  is_int: boolean
}
interface I_EvaluationDetail_MultipleChoiceAnswer extends I_EvaluationDetail_Answer {
  options: Array<{
    id: number
    name: string
    content: string
    is_true: boolean
  }>
}

interface I_QuestionDetail {
  id: T_QuestionId
  order: number
  content: string
  is_mandatory: boolean
  breaks_page_after: boolean
  answer: I_EvaluationDetail_NumericAnswer | I_EvaluationDetail_MultipleChoiceAnswer
}

interface I_EvaluationDetail {
  id: T_EvaluationId
  questions: Array<I_QuestionDetail>
  subject_id: T_EvaluationSubjectId
  created_at: string
  updated_at: string
  title: string
  code: string
  header: string
  status: T_EvaluationStatusCode
  subject: string
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

interface I_QuestionEditRequestData {
  title: string
  content: string
  is_mandatory: boolean
}

interface I_MultipleChoiceOptionCreateRequestData {
  multiple_choice_id: T_MultiplChoiceId
  is_true: boolean
  name: string
  content: string
}

interface I_MultipleChoiceOptionEditIsTrueRequestData {
  is_true: boolean
}

interface I_MultipleChoiceOptionEditIsTrueResponseData {
  multiple_choice_id: T_MultiplChoiceId
  is_true: boolean
  name: string
  content: string
}

export type {
  T_EvaluationId,
  T_QuestionId,
  T_AnswerId,
  T_EvaluationSubjectId,
  I_EvaluationListItem,
  T_EvaluationList,
  I_EvaluationDetail,
  T_EvaluationStatusCode,
  I_EvaluationCreateRequestData,
  T_EvaluationSubjectList,
  I_EvaluationSubject,
  T_AnswerType,
  I_EvaluationDetail_NumericAnswer,
  I_EvaluationDetail_MultipleChoiceAnswer,
  I_QuestionDetail,
  I_QuestionEditRequestData,
  T_MultiplChoiceId,
  T_MultiplChoiceOptionId,
  I_MultipleChoiceOptionCreateRequestData,
  I_MultipleChoiceOptionEditIsTrueRequestData,
  I_MultipleChoiceOptionEditIsTrueResponseData,
}
export { EvaluationStatus }
