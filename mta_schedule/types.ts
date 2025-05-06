import { T_EvaluationId, T_EvaluationSubjectId } from '@/mta_evaluations/types'
import { SchoolGrade } from '@/mta_schools/constants'
import { T_SchoolId, T_StudentProfileId, T_StudentProfilePersonalId } from '@/mta_schools/types'
import { I_PaginatedResponse } from '@/shared/data/types'

type T_AppointmentId = number
type T_AppointmentStatus = 'F' | 'P' | 'A' | 'R'
type T_AppointmentOccurrenceStatus = 'PAST' | 'ONGOING' | 'UPCOMING'

enum AppointmentStatus {
  free = 'F',
  pending = 'P',
  approved = 'A',
  rejected = 'R',
}
enum AppointmentOccurrenceStatus {
  past = 'PAST',
  ongoing = 'ONGOING',
  upcoming = 'UPCOMING',
}

interface I_AppointmentDetail {
  id: T_AppointmentId
  begins_at: string
  ends_at: string
  school: {
    id: T_SchoolId
    name: string
  } | null
  evaluation_brief: I_AppointmentEvaluationBrief | null
  status: T_AppointmentStatus
  occurrence_status: T_AppointmentOccurrenceStatus
  students: Array<{
    id: T_StudentProfileId
    personal_id: T_StudentProfilePersonalId
    cohort: string
  }>
  requested_evaluation_subject: null | {
    id: string
    name: string
    prefix: string
  }
  requested_evaluation_grade: null | SchoolGrade
}
interface I_AppointmentEvaluationBrief {
  id: T_EvaluationId
  code: string
  title: string
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
  occurrence_status: T_AppointmentOccurrenceStatus
  student_count: number
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
interface I_AppointmentApprove_RequestData {
  appointment_id: T_AppointmentId
  evaluation_id: T_EvaluationId
}
interface I_AppointmentReject_RequestData {
  appointment_id: T_AppointmentId
}
interface I_AppointmentAddStudents_RequestData {
  appointment_id: T_AppointmentId
  student_profile_ids: Array<T_StudentProfileId>
}

export type {
  I_AppointmentAvailable,
  I_AppointmentCreateRequestData,
  I_AppointmentDetail,
  I_AppointmentListItem,
  I_AppointmentRequest_RequestData,
  I_AppointmentsByMonthResponseData,
  T_AppointmentId,
  T_AppointmentList,
  T_AppointmentsAvailableList,
  T_AppointmentStatus,
  I_AppointmentApprove_RequestData,
  I_AppointmentReject_RequestData,
  I_AppointmentEvaluationBrief,
  I_AppointmentAddStudents_RequestData,
  T_AppointmentOccurrenceStatus,
}

export { AppointmentStatus, AppointmentOccurrenceStatus }
