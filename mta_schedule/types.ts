import { T_EvaluationId, T_EvaluationSubjectId } from '@/mta_evaluations/types'
import { SchoolGrade } from '@/mta_schools/constants'
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
  requested_evaluation_subject: {
    id: string
    name: string
    prefix: string
  }
  requested_evaluation_grade: SchoolGrade
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

interface I_AppointmentAvailable {
  id: number
  begins_at: string
  status: string
}
type T_AppointmentsAvailableList = Array<I_AppointmentAvailable>
interface I_AppointmentsByMonthResponseData extends Record<T_AppointmentId, T_AppointmentsAvailableList> {}
interface I_AppointmentRequest_RequestData {
  appointment_id: T_AppointmentId
  school_id: T_SchoolId
  pin: number
  evaluation_subject_id: T_EvaluationSubjectId | null
  grade: SchoolGrade
}

export type {
  T_AppointmentId,
  T_AppointmentStatus,
  I_AppointmentListItem,
  T_AppointmentList,
  I_AppointmentDetail,
  I_AppointmentCreateRequestData,
  I_AppointmentsByMonthResponseData,
  I_AppointmentAvailable,
  T_AppointmentsAvailableList,
  I_AppointmentRequest_RequestData,
}
