import { SchoolGrade } from '@/mta_schools/constants'
import { I_PaginatedResponse } from '@/shared/data/types'
import { T_VoidFn } from '@/shared/types'
import { FC } from 'react'

type T_EvaluationId = number
type T_QuestionId = number
type T_AnswerId = number
type T_MultiplChoiceId = number
type T_MultiplChoiceOptionId = number
type T_EvaluationPageId = number
type T_EvaluationSubjectId = string

type T_EvaluationStatusCode = 'P' | 'D'
type T_AnswerType = 'Numeric' | 'MultipleChoice' | 'OpenEnded'

enum EvaluationStatus {
  Published = 'P',
  Draft = 'D',
}

interface I_EvaluationListItem {
  id: T_EvaluationId
  title: string
  code: string
  status: T_EvaluationStatusCode

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

interface I_AnswerOpenEndedDetail extends I_BaseAnswerDetail {
  content: string
}

type T_AnswerPolymorphicDetail = I_AnswerNumericDetail | I_AnswerMultipleChoiceDetail | I_AnswerOpenEndedDetail

interface I_QuestionDetail {
  id: T_QuestionId
  order: number
  global_order: number
  content: string
  is_mandatory: boolean
  answer: T_AnswerPolymorphicDetail
  page_id: T_EvaluationPageId
}

interface I_QuestionDetailSpecific<T_Answer extends T_AnswerPolymorphicDetail> {
  id: T_QuestionId
  order: number
  content: string
  is_mandatory: boolean
  answer: T_Answer
  page_id: T_EvaluationPageId
}

interface I_EvaluationPageDetail {
  id: number
  order: number
  questions: Array<I_QuestionDetail>
  pinned_text: string | null
  evaluation_id: T_EvaluationId
}

interface I_EvaluationDetail {
  id: T_EvaluationId
  pages: Array<I_EvaluationPageDetail>
  subject_id: T_EvaluationSubjectId
  grade: SchoolGrade
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
  grade: SchoolGrade
  header: string
  status: T_EvaluationStatusCode
}

interface I_EvaluationPageCreateRequestData {
  evaluation_id: T_EvaluationId
}

interface I_EvaluationPageEditRequestData {
  pinned_text: string | null
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

interface I_QuestionUpdateOpenEndedRequestData {
  content: string
}

interface I_QuestionCreateMultipleChoiceRequestData {
  page_id: T_EvaluationPageId
  content: string
}
interface I_QuestionCreateNumericRequestData {
  page_id: T_EvaluationPageId
  content: string
  value: number
}

interface I_QuestionCreateOpenEndedRequestData {
  page_id: T_EvaluationPageId
  content: string
}

interface I_QuestionCreateResponseData {
  page_id: T_EvaluationPageId
  question_id: T_QuestionId
}

type T_QuestionForm<T_Data extends T_AnswerPolymorphicDetail> = FC<{
  data: I_QuestionDetailSpecific<T_Data>
  onSuccess: T_VoidFn
  onCancel?: T_VoidFn
}>

interface I_EvaluationSetStatusRequestData {
  id: T_EvaluationId
  new_status: T_EvaluationStatusCode
}

interface I_ImportQuestionRequest {
  template_id: number
}
interface I_ImportQuestionResponse {
  id: number               // ← new Question PK inside the evaluation
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
  T_EvaluationPageId,
  I_EvaluationPageDetail,
  I_EvaluationPageCreateRequestData,
  I_EvaluationPageEditRequestData,
  T_AnswerType,
  I_AnswerNumericDetail,
  I_AnswerMultipleChoiceDetail,
  I_AnswerOpenEndedDetail,
  I_QuestionDetail,
  I_QuestionDetailSpecific,
  T_MultiplChoiceId,
  T_MultiplChoiceOptionId,
  I_MultipleChoiceOptionCreateRequestData,
  I_MultipleChoiceOptionEditIsTrueRequestData,
  I_MultipleChoiceOptionEditIsTrueResponseData,
  I_QuestionUpdateMultipleChoiceRequestData,
  I_QuestionUpdateNumericRequestData,
  I_QuestionCreateMultipleChoiceRequestData,
  I_QuestionCreateNumericRequestData,
  I_QuestionUpdateOpenEndedRequestData,
  I_QuestionCreateOpenEndedRequestData,
  T_QuestionForm,
  T_AnswerPolymorphicDetail,
  I_QuestionCreateResponseData,
  I_EvaluationSetStatusRequestData,
  I_ImportQuestionRequest,
  I_ImportQuestionResponse
}
export { EvaluationStatus }
