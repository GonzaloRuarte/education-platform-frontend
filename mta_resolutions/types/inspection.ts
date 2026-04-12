import { I_ResolutionState } from '@/mta_resolutions/types'
import { T_AppointmentId, T_AppointmentStatus, I_AppointmentEvaluationBrief } from '@/mta_schedule/types'
import { I_SchoolName, T_StudentProfileId, T_StudentProfilePersonalId } from '@/mta_schools/types'

export interface I_ResolutionInspectionStudent {
  id: T_StudentProfileId
  cohort: string
  personal_id: T_StudentProfilePersonalId
  school: I_SchoolName | null
  nee: boolean
  nee_comments?: string
}

export interface I_ResolutionInspectionAppointment {
  id: T_AppointmentId
  begins_at: string
  ends_at: string
  status: T_AppointmentStatus
  school: I_SchoolName | null
  evaluation: I_AppointmentEvaluationBrief | null
}

export interface I_ResolutionInspectionStateHistoryItem {
  id: number
  server_created_at: string
  client_datetime: string | null
  answers_count: number
  data: I_ResolutionState
}

export interface I_ResolutionInspectionResolution {
  id: number
  created_at: string
  updated_at: string
  started_at: string
  submit_by_time: string
  finished_at: string | null
  status: 'IN_PROCESS' | 'FINISHED'
  appointment: I_ResolutionInspectionAppointment | null
  total_uploaded_states: number
  latest_state_server_created_at: string | null
  latest_state_client_datetime: string | null
  latest_state: I_ResolutionState | null
}

export interface I_ResolutionInspectionResponse {
  student: I_ResolutionInspectionStudent
  resolution: I_ResolutionInspectionResolution
  states: Array<I_ResolutionInspectionStateHistoryItem>
}

export interface I_ResolutionInspectionQuery {
  personal_id: string
  appointment_id?: number
}
