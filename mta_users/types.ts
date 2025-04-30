import { I_PaginatedResponse } from '@/shared/data/types'

type T_UserId = number
type T_UserProfiles = 'admin' | 'school_staff' | 'evaluator' | 'student'
type T_AllowedUserProfiles = Array<T_UserProfiles> | undefined

interface I_UserProfilesFlags {
  has_student_profile: boolean
  has_school_staff_profile: boolean
  has_evaluator_profile: boolean
  is_admin: boolean
}
interface I_UserListItemBaseFields {
  id: T_UserId
  username: string
  email: string
  is_active: boolean
}
interface I_UserListItem extends I_UserListItemBaseFields, I_UserProfilesFlags {}
interface I_UserListItemWithProfiles extends I_UserListItemBaseFields {
  profiles: Array<T_UserProfiles | null>
}

type T_UserList = I_PaginatedResponse<I_UserListItem>
type T_UserListWithProfiles = I_PaginatedResponse<I_UserListItemWithProfiles>

interface I_UserDetail {
  id: T_UserId
  username: string
  email: string
  first_name: string | null
  last_name: string | null
  is_active: boolean
  date_joined: string
}

interface I_UserChangePasswordRequest {
  old_password: string
  new_password: string
}

export type {
  T_UserId,
  T_UserProfiles,
  T_AllowedUserProfiles,
  T_UserList,
  T_UserListWithProfiles,
  I_UserListItem,
  I_UserDetail,
  I_UserListItemWithProfiles,
  I_UserChangePasswordRequest,
}
