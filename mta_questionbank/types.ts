/** mta_questionbank/types/index.ts */
import { FC } from 'react'
import { I_PaginatedResponse } from '@/shared/data/types'
import { T_VoidFn } from '@/shared/types'

/* ------------------------------------------------------------------ */
/*  Scalar aliases                                                    */
/* ------------------------------------------------------------------ */
type T_QuestionId            = number
type T_AnswerId              = number
type T_MultipleChoiceOptionId = number
type T_MultipleChoiceId      = number
type T_EvaluationSubjectId   = string

/* ------------------------------------------------------------------ */
/*  Answer polymorphism                                               */
/* ------------------------------------------------------------------ */
type T_AnswerType          = 'NumericTemplate' | 'MultipleChoiceTemplate'
type T_AnswerTypeUrlParams = 'numerica' | 'multiple-choice'

interface I_BaseAnswerDetail {
  id: T_AnswerId
  resource_type: T_AnswerType
}

interface I_AnswerNumericDetail extends I_BaseAnswerDetail {

  value: number
}

interface I_AnswerMultipleChoiceDetail extends I_BaseAnswerDetail {
  options: Array<{
    id: T_MultipleChoiceOptionId
    name: string
    content: string
    is_true: boolean
  }>
}

type T_AnswerPolymorphicDetail =
  | I_AnswerNumericDetail
  | I_AnswerMultipleChoiceDetail

/* ------------------------------------------------------------------ */
/*  Question (template)                                               */
/* ------------------------------------------------------------------ */
interface I_QuestionDetail {
  id: T_QuestionId
  content: string
  difficulty: number
  subject_id: string
  answer: T_AnswerPolymorphicDetail
}

interface I_QuestionDetailSpecific<
  T_Answer extends T_AnswerPolymorphicDetail,
> {
  id: T_QuestionId
  content: string
  difficulty: number
  subject_id: string
  answer: T_Answer
}

/* Paginated list
   ------------------------------------------------------------------ */
type T_QuestionTemplateList = I_PaginatedResponse<I_QuestionDetail>


/* ------------------------------------------------------------------ */
/*  Mutations                                                         */
/* ------------------------------------------------------------------ */
interface I_MultipleChoiceOptionCreateRequestData {
  multiple_choice_id: T_MultipleChoiceId
  is_true: boolean
  name: string
  content: string
}

interface I_MultipleChoiceOptionEditIsTrueRequestData {
  is_true: boolean
}

interface I_MultipleChoiceOptionEditIsTrueResponseData {
  multiple_choice_id: T_MultipleChoiceId
  is_true: boolean
  name: string
  content: string
}

/* Question CRUD */
interface I_QuestionUpdateMultipleChoiceRequestData {
  content: string
  difficulty: number
  subject_id: string
}

interface I_QuestionUpdateNumericRequestData {
  content: string
  value: number
  difficulty: number
  subject_id: string
}

interface I_QuestionCreateMultipleChoiceRequestData {
  content: string
  difficulty: number
  subject_id: T_EvaluationSubjectId
}

interface I_QuestionCreateNumericRequestData {
  content: string
  value: number
  difficulty: number
  subject_id: T_EvaluationSubjectId
}

interface I_QuestionCreateResponseData {
  question_id: T_QuestionId
}


/* ------------------------------------------------------------------ */
/*  React helpers                                                     */
/* ------------------------------------------------------------------ */
type T_QuestionForm<T_Data extends T_AnswerPolymorphicDetail> = FC<{
  data: I_QuestionDetailSpecific<T_Data>
  reload: T_VoidFn
}>

/* ------------------------------------------------------------------ */
/*  Exports                                                           */
/* ------------------------------------------------------------------ */
export type {
  /* ids */
  T_QuestionId,
  T_AnswerId,
  T_MultipleChoiceOptionId,
  T_MultipleChoiceId,
  /* answer polymorphism */
  T_AnswerType,
  T_AnswerTypeUrlParams,
  I_AnswerNumericDetail,
  I_AnswerMultipleChoiceDetail,
  T_AnswerPolymorphicDetail,
  /* question */
  I_QuestionDetail,
  I_QuestionDetailSpecific,
  T_QuestionTemplateList,
  /* mutations */
  I_MultipleChoiceOptionCreateRequestData,
  I_MultipleChoiceOptionEditIsTrueRequestData,
  I_MultipleChoiceOptionEditIsTrueResponseData,
  I_QuestionUpdateMultipleChoiceRequestData,
  I_QuestionUpdateNumericRequestData,
  I_QuestionCreateMultipleChoiceRequestData,
  I_QuestionCreateNumericRequestData,
  I_QuestionCreateResponseData,
  /* form helper */
  T_QuestionForm,
}
