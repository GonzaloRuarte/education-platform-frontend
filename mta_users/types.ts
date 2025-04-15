import { I_PaginatedResponse } from '@/shared/data/types'

type T_UserId = number

interface I_UserListItem {
  id: T_UserId
  username: string
  email: string
  is_active: boolean
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

export type { T_UserId, T_UserList, I_UserListItem, I_UserDetail }
