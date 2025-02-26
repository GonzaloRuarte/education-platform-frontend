import { T_UserId } from '@/mta_users/types'
import { I_PaginatedResponse } from '@/shared/data/types'

type T_SchoolId = number

interface I_SchoolListItem {
  id: T_SchoolId
  name: string
  district: string
  staff: Array<{
    user_id: T_UserId
    full_name: string
    email: string
  }>
  contact_email: string
}
type T_GetSchoolsListResponse = I_PaginatedResponse<I_SchoolListItem>

interface I_StudentProfileListItem {
  id: number
  cohort: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
  school: string
  personal_id: number
}

type T_GetStudentProfileListResponse = I_PaginatedResponse<I_StudentProfileListItem>

interface I_CreateSchoolRequestData {
  name: string
  district: string
  contact_email: string
}

export type {
  T_SchoolId,
  I_SchoolListItem,
  I_StudentProfileListItem,
  T_GetSchoolsListResponse,
  T_GetStudentProfileListResponse,
  I_CreateSchoolRequestData,
}
