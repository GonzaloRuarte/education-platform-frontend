import { T_ResolutionId } from '@/mta_resolutions/types'
import { I_AppointmentDetail, T_AppointmentId } from '@/mta_schedule/types'
import { T_StudentProfileId } from '@/mta_schools/types'
import { I_PaginatedResponse } from '@/shared/data/types'

type T_AppointmentResolutionProcessId = number

interface I_AppointmentResolutionProcessListItem {
  id: T_AppointmentResolutionProcessId
  appointment_id: T_AppointmentId
  resolutions_count: number
  created_at: string
}

interface I_AppointmentResolutionProcessDetail {
  id: number
  appointment: I_AppointmentDetail
  resolutions: Array<{
    id: T_ResolutionId
    student_id: T_StudentProfileId
    student_personal_id: number
    right_resolutions: string
    total_question_resolutions: number
    started_at: string
    finished_at: string
    elapsed_time: string
  }>
}

type T_AppointmentResolutionProcessList = I_PaginatedResponse<I_AppointmentResolutionProcessListItem>

export type {
  I_AppointmentResolutionProcessDetail,
  I_AppointmentResolutionProcessListItem,
  T_AppointmentResolutionProcessId,
  T_AppointmentResolutionProcessList,
}
