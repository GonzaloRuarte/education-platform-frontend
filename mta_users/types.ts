import { I_PaginatedResponse } from '@/shared/data/types'

type T_UserId = number
type T_UserProfiles = 'admin' | 'school_staff' | 'evaluator' | 'student'
type T_AllowedUserProfiles = Array<T_UserProfiles> | undefined

interface I_UserListItem {
  id: T_UserId
  username: string
  email: string
  is_active: boolean
  is_admin: boolean
  profiles: Array<T_UserProfiles | null>
}

type T_UserList = I_PaginatedResponse<I_UserListItem>

interface I_UserDetail {
  id: T_UserId
  username: string
  email: string
  first_name: string | null
  last_name: string | null
  is_active: boolean
  date_joined: string
}

export type { T_UserId, T_UserProfiles, T_AllowedUserProfiles, T_UserList, I_UserListItem, I_UserDetail }
