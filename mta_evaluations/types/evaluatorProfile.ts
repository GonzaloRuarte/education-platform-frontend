import { T_UserId } from '@/mta_users/types'

type T_EvaluatorProfileId = number
interface I_EvaluatorProfileListItem {
  id: T_EvaluatorProfileId
  user_id: T_UserId
  username: string
  first_name: string | null
  last_name: string | null
  email: string
}
type T_EvaluatorProfileList = Array<I_EvaluatorProfileListItem>
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
  T_EvaluatorProfileId,
  I_EvaluatorProfileListItem,
  T_EvaluatorProfileList,
  I_EvaluatorProfileCreateRequestData,
  I_EvaluatorProfileUpdateRequestData,
  I_EvaluatorProfileDetail,
}
