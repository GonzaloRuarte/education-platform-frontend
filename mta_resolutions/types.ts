import { T_AnswerId, T_AnswerType, T_EvaluationId, T_QuestionId } from '@/mta_evaluations/types'

interface I_EvaluationToResolve {
  evaluation_data: {
    id: T_EvaluationId
    code: string
    title: string
    header: string
    subject: string
    questions: Array<{
      id: T_QuestionId
      order: number
      answer: {
        id: T_AnswerId
        resource_type: T_AnswerType
        specific_data: null | {
          id: number
          options: Array<{
            id: number
            content: string
            name: string
          }>
          resource_type: T_AnswerType
        }
      }
      content: string
      is_mandatory: boolean
      breaks_page_after: boolean
    }>
  }
}

export type { I_EvaluationToResolve }
