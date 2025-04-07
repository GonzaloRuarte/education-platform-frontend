import { T_EvaluationId } from '@/mta_evaluations/types'
import { T_SchoolId, T_StudentProfileId, T_StudentProfilePersonalId } from '@/mta_schools/types'
import { I_PaginatedResponse } from '@/shared/data/types'

type T_AppointmentId = number
type T_AppointmentStatus = 'F' | 'P' | 'A' | 'R'

interface I_AppointmentDetail {
  begins_at: string
  ends_at: string
  school: {
    id: T_SchoolId
    name: string
  }
  evaluation_origin: {
    id: T_EvaluationId
    code: string
    title: string
  }
  status: T_AppointmentStatus
  students: Array<{
    id: T_StudentProfileId
    personal_id: T_StudentProfilePersonalId
    cohort: string
  }>
}
interface I_AppointmentListItem {
  id: T_AppointmentId
  begins_at: string
  ends_at: string
  school: null | {
    id: T_SchoolId
    name: string
  }
  status: T_AppointmentStatus
}
type T_AppointmentList = I_PaginatedResponse<I_AppointmentListItem>

interface I_AppointmentCreateRequestData {
  begins_at: string
  quantity: number
}

export type {
  T_AppointmentId,
  T_AppointmentStatus,
  I_AppointmentListItem,
  T_AppointmentList,
  I_AppointmentDetail,
  I_AppointmentCreateRequestData,
}
