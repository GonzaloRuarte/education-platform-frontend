import { T_UserId } from '@/mta_users/types'
import { I_PaginatedResponse } from '@/shared/data/types'

type T_SchoolId = number
type T_StudentProfileId = number
type T_StudentProfilePersonalId = number

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
type T_SchoolsList = I_PaginatedResponse<I_SchoolListItem>
type T_SchoolNames = Array<{
  id: T_SchoolId
  name: string
}>

interface I_SchoolCreateRequestData {
  name: string
  district: string
  contact_email: string
}
interface I_StudentProfileCreateRequestData {
  cohort: string
  personal_id: number
  school_id: T_SchoolId
}

interface I_SchoolDetail {
  id: number
  name: string
  district: string
  contact_email: string
}

interface I_SchoolUpdateRequestData {
  name: string
  district: string
  contact_email: string
}

interface I_StudentProfileListItem {
  id: T_StudentProfileId
  cohort: string
  created_at: string
  updated_at: string
  school: string
  personal_id: T_StudentProfileId
}

type T_StudentProfileList = I_PaginatedResponse<I_StudentProfileListItem>

export type {
  T_SchoolId,
  T_StudentProfileId,
  T_StudentProfilePersonalId,
  I_SchoolDetail,
  I_SchoolListItem,
  I_StudentProfileListItem,
  T_SchoolsList,
  T_StudentProfileList,
  I_SchoolCreateRequestData,
  I_SchoolUpdateRequestData,
  T_SchoolNames,
  I_StudentProfileCreateRequestData,
}
