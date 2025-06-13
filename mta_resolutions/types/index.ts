import { T_AnswerId, T_AnswerType, T_EvaluationId, T_QuestionId } from '@/mta_evaluations/types'
import { T_AppointmentId } from '@/mta_schedule/types'
import { T_StudentProfilePersonalId } from '@/mta_schools/types'

type T_ResolutionId = number

interface I_AuthorizeStudentRequestData {
  personal_id: T_StudentProfilePersonalId
}

interface I_EvaluationToResolve_BaseAnswer<T_SpecificData> {
  id: T_AnswerId
  resource_type: T_AnswerType
  specific_data: T_SpecificData
}
type T_EvaluationToResolve_NumericAnswer = I_EvaluationToResolve_BaseAnswer<null>
type T_EvaluationToResolve_MultipleChoiceAnswer = I_EvaluationToResolve_BaseAnswer<{
  options: Array<{
    id: number
    content: string
    name: string
  }>
  is_multiselect: boolean
}>
interface I_ResumeResolutionResponse {
  evaluation: I_EvaluationToResolve
  appointment_id: T_AppointmentId
  appointment_pin: number | null
  student_personal_id: number
  resolution: {
    last_uploaded_state: null | I_ResolutionState
    started_at: string
    max_duration_minutes: number
  }
}





interface I_ResolutionState_BaseAnswer<T extends T_AnswerType, T_SpecificData> {
  id: T_AnswerId
  last_update_datetime: string
  resource_type: T
  specific_data: T_SpecificData
}
type T_ResolutionState_NumericAnswerData = I_ResolutionState_BaseAnswer<
  'Numeric',
  {
    value: number
  }
>
type T_ResolutionState_MultipleChoiceAnswerData = I_ResolutionState_BaseAnswer<
  'MultipleChoice',
  {
    choosed_options: Array<string>
  }
>
interface I_ResolutionState {
  appointment_id: T_AppointmentId
  student_personal_id: number
  last_login_datetime: string
  last_update_datetime: string | null
  answers: Record<T_QuestionId, T_ResolutionState_NumericAnswerData | T_ResolutionState_MultipleChoiceAnswerData>
}

interface I_OngoingResolution {
  state: I_ResolutionState | null
  started_at: string
  max_duration_minutes: number
}

export interface I_Option   { id: number; name: string; content: string }
export interface I_Answer   { id: number; resource_type: 'Numeric' | 'MultipleChoice'; specific_data: any }
export interface I_Question { id: number; order: number; content: string; is_mandatory: boolean; answer: I_Answer }

export interface I_Page {
  pinned_text: string | null;
  questions: I_Question[];
}

interface I_EvaluationToResolve {
  id: number;
  code: string;
  title: string;
  header: string;
  subject: string;
  pages_quantity: number;
  pages: I_Page[];
}


export type {
  T_ResolutionId,
  I_AuthorizeStudentRequestData,
  I_ResumeResolutionResponse,
  T_EvaluationToResolve_NumericAnswer,
  T_EvaluationToResolve_MultipleChoiceAnswer,
  I_ResolutionState,
  T_ResolutionState_NumericAnswerData,
  T_ResolutionState_MultipleChoiceAnswerData,
  I_OngoingResolution,
  I_EvaluationToResolve,
}
