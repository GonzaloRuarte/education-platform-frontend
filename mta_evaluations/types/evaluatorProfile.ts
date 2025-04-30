import { T_UserId } from '@/mta_users/types'
import { I_PaginatedResponse } from '@/shared/data/types'

type T_EvaluatorProfileId = number
interface I_EvaluatorProfileListItem {
  id: T_EvaluatorProfileId
  user_id: T_UserId
  username: string
  first_name: string | null
  last_name: string | null
  email: string
}
type T_EvaluatorProfileList = I_PaginatedResponse<I_EvaluatorProfileListItem>
interface I_EvaluatorProfileCreateRequestData {
  username: string
  first_name: string
  last_name: string
  email: string
  password: string
}
interface I_EvaluatorProfileUpdateRequestData {
  username: string
  first_name: string
  last_name: string
  email: string
}
interface I_EvaluatorProfileDetail {
  id: T_EvaluatorProfileId
  user_id: T_UserId
  username: string
  first_name: string | null
  last_name: string | null
  email: string
  school_name: string
}

export type {
  I_EvaluatorProfileCreateRequestData,
  I_EvaluatorProfileDetail,
  I_EvaluatorProfileListItem,
  I_EvaluatorProfileUpdateRequestData,
  T_EvaluatorProfileId,
  T_EvaluatorProfileList,
}
