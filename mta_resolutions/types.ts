import { T_AnswerId, T_AnswerType, T_EvaluationId, T_QuestionId } from '@/mta_evaluations/types'

type T_SerializedEvaluationVersion = '1'

interface I_EvaluationToResolve {
  version: T_SerializedEvaluationVersion
  data: {
    id: T_EvaluationId
    title: string
    code: string
    subject: string
    header: string
    questions: Array<{
      id: T_QuestionId
      content: string
      order: number
      breaks_page_after: boolean
      is_mandatory: boolean
      answer: {
        id: T_AnswerId
        resource_type: T_AnswerType
        specific_data: {
          id: number
          options?: Array<{
            id: number
            name: string
            content: string
          }>
        }
      }
    }>
  }
}

export type { I_EvaluationToResolve }
