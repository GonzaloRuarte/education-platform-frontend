import { T_EvaluationId } from '@/mta_evaluations/types'
import { T_SchoolId } from '@/mta_schools/types'
import { I_PaginatedResponse } from '@/shared/data/types'

type T_AppointmentId = number
type T_AppointmentStatus = 'F' | 'P' | 'A' | 'R'
interface I_AppointmentCreateRequestData {}
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

export type {
  T_AppointmentId,
  T_AppointmentStatus,
  I_AppointmentListItem,
  T_AppointmentList,
  I_AppointmentCreateRequestData,
  I_AppointmentDetail,
}
