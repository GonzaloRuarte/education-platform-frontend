import { I_PaginatedResponse } from '@/shared/data/types'
import { T_VoidFn } from '@/shared/types'
import { FC } from 'react'

type T_EvaluationId = number
type T_QuestionId = number
type T_AnswerId = number
type T_MultiplChoiceId = number
type T_MultiplChoiceOptionId = number

type T_EvaluationSubjectId = string

type T_EvaluationStatusCode = 'P' | 'D'
type T_AnswerType = 'Numeric' | 'MultipleChoice'
type T_AnswerTypeUrlParams = 'numerica' | 'multiple-choice'
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

interface I_BaseAnswerDetail {
  id: T_AnswerId
  resource_type: T_AnswerType
}
interface I_AnswerNumericDetail extends I_BaseAnswerDetail {
  value: number
  is_int: boolean
}
interface I_AnswerMultipleChoiceDetail extends I_BaseAnswerDetail {
  options: Array<{
    id: number
    name: string
    content: string
    is_true: boolean
  }>
}
type T_AnswerPolymorphicDetail = I_AnswerNumericDetail | I_AnswerMultipleChoiceDetail

interface I_QuestionDetail {
  id: T_QuestionId
  order: number
  content: string
  is_mandatory: boolean
  breaks_page_after: boolean
  answer: T_AnswerPolymorphicDetail
  evaluation_id: T_EvaluationId
}

interface I_QuestionDetailSpecific<T_Answer extends T_AnswerPolymorphicDetail> {
  id: T_QuestionId
  order: number
  content: string
  is_mandatory: boolean
  breaks_page_after: boolean
  answer: T_Answer
  evaluation_id: T_EvaluationId
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
  pinned_text: string | null
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
  pinned_text: string | null
  status: T_EvaluationStatusCode
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

interface I_QuestionUpdateMultipleChoiceRequestData {
  content: string
}
interface I_QuestionUpdateNumericRequestData {
  content: string
  value: number
}
interface I_QuestionCreateMultipleChoiceRequestData {
  evaluation_id: T_EvaluationId
  content: string
}
interface I_QuestionCreateNumericRequestData {
  evaluation_id: T_EvaluationId
  content: string
  value: number
}
interface I_QuestionCreateResponseData {
  evaluation_id: T_EvaluationId
  question_id: T_QuestionId
}
interface I_QuestionAddPageBreakRequestData {
  after_question_id: T_QuestionId
}
interface I_QuestionRemovePageBreakRequestData {
  after_question_id: T_QuestionId
}

type T_QuestionForm<T_Data extends T_AnswerPolymorphicDetail> = FC<{
  data: I_QuestionDetailSpecific<T_Data>
  reload: T_VoidFn
}>

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
  T_AnswerTypeUrlParams,
  I_AnswerNumericDetail,
  I_AnswerMultipleChoiceDetail,
  I_QuestionDetail,
  I_QuestionDetailSpecific,
  T_MultiplChoiceId,
  T_MultiplChoiceOptionId,
  I_MultipleChoiceOptionCreateRequestData,
  I_MultipleChoiceOptionEditIsTrueRequestData,
  I_MultipleChoiceOptionEditIsTrueResponseData,
  I_QuestionUpdateMultipleChoiceRequestData,
  I_QuestionUpdateNumericRequestData,
  I_QuestionAddPageBreakRequestData,
  I_QuestionRemovePageBreakRequestData,
  I_QuestionCreateMultipleChoiceRequestData,
  I_QuestionCreateNumericRequestData,
  T_QuestionForm,
  T_AnswerPolymorphicDetail,
  I_QuestionCreateResponseData,
}
export { EvaluationStatus }
