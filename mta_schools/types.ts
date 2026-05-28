import { T_UserId } from '@/mta_users/types'
import { I_PaginatedResponse } from '@/shared/data/types'

type T_SchoolId = number
type T_GroupingId = number
type T_StudentProfileId = number
type T_SchoolStaffProfileId = number
type T_StudentProfilePersonalId = string | null
type T_ExecutiveProfileId = number
type T_GroupingStaffProfileId = number
type T_GroupingStaffAnonymizedProfileId = number

interface I_GroupingListItem {
  id: T_GroupingId
  name: string
  schools_count: number
}
type T_GroupingList = I_PaginatedResponse<I_GroupingListItem>

interface I_GroupingDetail {
  id: T_GroupingId
  name: string
  school_ids: Array<T_SchoolId>
}

interface I_GroupingCreateRequestData {
  name: string
}

interface I_GroupingName {
  id: T_GroupingId
  name: string
}
type T_GroupingNames = Array<I_GroupingName>

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
  contact_email: string
  groups_count: number
}
type T_SchoolsList = I_PaginatedResponse<I_SchoolListItem>
interface I_SchoolName {
  id: T_SchoolId
  name: string
}
type T_SchoolNames = Array<I_SchoolName>

interface I_StudentProfileDetail {
  id: T_StudentProfileId
  personal_id: T_StudentProfilePersonalId
  cohort: string
  nee: boolean
  nee_comments?: string
  school: T_SchoolId
}
interface I_SchoolCreateRequestData {
  name: string
  district: string
  contact_email: string
  max_executives: number
  groups: Array<T_GroupingId>
}
interface I_StudentProfileCreateRequestData {
  cohort: string
  personal_id: string
  school: T_SchoolId
  nee: boolean
  nee_comments?: string
}
type T_StudentProfileBatchCreateRequestData = FormData

interface I_SchoolDetail {
  id: number
  name: string
  district: string
  contact_email: string
  max_executives: number
  groups: Array<T_GroupingId>
}

interface I_SchoolUpdateRequestData {
  name: string
  district: string
  contact_email: string
  max_executives: number
  groups: Array<T_GroupingId>
}

interface I_StudentProfileListItem {
  id: T_StudentProfileId
  cohort: string
  created_at: string
  updated_at: string
  school: T_SchoolId | I_SchoolName
  personal_id: T_StudentProfilePersonalId
  nee: boolean
}

type T_StudentProfileList = I_PaginatedResponse<I_StudentProfileListItem>

interface I_SchoolStaffProfileListItem {
  id: T_SchoolStaffProfileId
  user_id: T_UserId
  username: string
  first_name: string | null
  last_name: string | null
  email: string
  school_id: T_SchoolId
  school_name: string
  institutional_telephone: string | null
  cellphone: string | null
  position: string | null
}
type T_SchoolStaffProfileList = I_PaginatedResponse<I_SchoolStaffProfileListItem>
type T_ExecutiveProfileList = I_PaginatedResponse<I_ExecutiveProfileListItem>
interface I_ExecutiveProfileListItem {
  id: T_ExecutiveProfileId
  user_id: T_UserId
  username: string
  first_name: string | null
  last_name: string | null
  email: string
  school_id: T_SchoolId
  school_name: string
}
interface I_SchoolStaffProfileCreateRequestData {
  school_id: T_SchoolId
  username: string
  first_name: string
  last_name: string
  email: string
  password: string
  institutional_telephone: string
  cellphone: string
  position: string
}

interface I_ExecutiveProfileCreateRequestData {
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
  institutional_telephone: string
  cellphone: string
  position: string
}

interface I_ExecutiveProfileUpdateRequestData {
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
  institutional_telephone: string | null
  cellphone: string | null
  position: string | null
}

interface I_ExecutiveProfileDetail {
  id: T_ExecutiveProfileId
  user_id: T_UserId
  username: string
  first_name: string | null
  last_name: string | null
  email: string
  school_id: T_SchoolId
  school_name: string
}

interface I_GroupingProfileBase {
  grouping_id: T_GroupingId
  username: string
  first_name: string
  last_name: string
  email: string
}

interface I_GroupingStaffProfileListItem extends I_GroupingProfileBase {
  id: T_GroupingStaffProfileId
  user_id: T_UserId
  grouping_name: string
}
type T_GroupingStaffProfileList = I_PaginatedResponse<I_GroupingStaffProfileListItem>
interface I_GroupingStaffProfileDetail extends I_GroupingStaffProfileListItem {}
interface I_GroupingStaffProfileCreateRequestData extends I_GroupingProfileBase {
  password: string
}
interface I_GroupingStaffProfileUpdateRequestData extends I_GroupingProfileBase {}

export type {
  T_SchoolId,
  T_GroupingId,
  I_GroupingListItem,
  T_GroupingList,
  I_GroupingDetail,
  I_GroupingCreateRequestData,
  I_GroupingName,
  T_GroupingNames,
  I_SchoolName,
  T_StudentProfileId,
  T_StudentProfilePersonalId,
  T_SchoolStaffProfileId,
  T_ExecutiveProfileId,
  T_GroupingStaffProfileId,
  T_GroupingStaffAnonymizedProfileId,
  I_SchoolDetail,
  I_SchoolListItem,
  I_StudentProfileListItem,
  T_SchoolsList,
  T_StudentProfileList,
  I_SchoolCreateRequestData,
  I_SchoolUpdateRequestData,
  T_SchoolNames,
  I_StudentProfileCreateRequestData,
  T_StudentProfileBatchCreateRequestData,
  T_SchoolStaffProfileList,
  I_SchoolStaffProfileListItem,
  I_SchoolStaffProfileCreateRequestData,
  I_SchoolStaffProfileDetail,
  I_SchoolStaffProfileUpdateRequestData,
  I_StudentProfileDetail,
  T_ExecutiveProfileList,
  I_ExecutiveProfileListItem,
  I_ExecutiveProfileDetail,
  I_ExecutiveProfileCreateRequestData,
  I_ExecutiveProfileUpdateRequestData,
  I_GroupingStaffProfileListItem,
  T_GroupingStaffProfileList,
  I_GroupingStaffProfileDetail,
  I_GroupingStaffProfileCreateRequestData,
  I_GroupingStaffProfileUpdateRequestData,
}
