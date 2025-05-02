import { T_UserId } from '@/mta_users/types'
import { I_PaginatedResponse } from '@/shared/data/types'

type T_SchoolId = number
type T_StudentProfileId = number
type T_SchoolStaffProfileId = number
type T_StudentProfilePersonalId = number

interface I_SchoolStaffListItem {
  school_staff_id: T_SchoolStaffProfileId
  user_id: T_UserId
  full_name: string
  email: string
}
interface I_SchoolListItem {
  id: T_SchoolId
  name: string
  district: string
  staff: Array<I_SchoolStaffListItem>
  contact_email: string
}
type T_SchoolsList = I_PaginatedResponse<I_SchoolListItem>
interface I_SchoolName {
  id: T_SchoolId
  name: string
}
type T_SchoolNames = Array<I_SchoolName>

interface I_StudentProfileDetail {
  id: T_StudentProfileId
  personal_id: number
  cohort: string
  user_id: T_UserId
  school_id: T_SchoolId
}
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
type T_StudentProfileBatchCreateRequestData = FormData

interface I_SchoolDetail {
  id: number
  name: string
  district: string
  contact_email: string
  staff: Array<I_SchoolStaffListItem>
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

interface I_CohortsDistinctBySchool {
  school_id: T_SchoolId
  cohorts: Array<string>
}

interface I_SchoolStaffProfileListItem {
  id: T_SchoolStaffProfileId
  user_id: T_UserId
  username: string
  first_name: string | null
  last_name: string | null
  email: string
  school_id: T_SchoolId
  school_name: string
}
type T_SchoolStaffProfileList = I_PaginatedResponse<I_SchoolStaffProfileListItem>

interface I_SchoolStaffProfileCreateRequestData {
  school_id: T_SchoolId
  username: string
  first_name: string
  last_name: string
  email: string
  password: string
}
interface I_SchoolStaffProfileUpdateRequestData {
  school_id: T_SchoolId
  username: string
  first_name: string
  last_name: string
  email: string
}

interface I_SchoolStaffProfileDetail {
  id: T_SchoolStaffProfileId
  user_id: T_UserId
  username: string
  first_name: string | null
  last_name: string | null
  email: string
  school_id: T_SchoolId
  school_name: string
}
export type {
  T_SchoolId,
  I_SchoolName,
  T_StudentProfileId,
  T_StudentProfilePersonalId,
  T_SchoolStaffProfileId,
  I_SchoolDetail,
  I_SchoolListItem,
  I_StudentProfileListItem,
  T_SchoolsList,
  T_StudentProfileList,
  I_SchoolCreateRequestData,
  I_SchoolUpdateRequestData,
  T_SchoolNames,
  I_StudentProfileCreateRequestData,
  I_CohortsDistinctBySchool,
  T_StudentProfileBatchCreateRequestData,
  T_SchoolStaffProfileList,
  I_SchoolStaffProfileListItem,
  I_SchoolStaffProfileCreateRequestData,
  I_SchoolStaffProfileDetail,
  I_SchoolStaffProfileUpdateRequestData,
  I_StudentProfileDetail,
}
