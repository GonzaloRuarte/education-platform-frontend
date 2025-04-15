import { T_StudentProfilePersonalId } from '@/mta_schools/types'
import { T_Fatal401Handler, T_TokenRefresher } from '@/shared/data/types'

type T_AccessGroup = 'admin' | 'school_staff' | 'evaluator' | 'student'
type T_AllowedAccessGroups = Array<T_AccessGroup> | undefined

interface I_AuthData {
  accessToken?: string
  refreshToken?: string
  accessGroups?: Array<T_AccessGroup>
}

interface I_AuthResources extends I_AuthData {
  refresh: T_TokenRefresher
  handleFatal401Error: T_Fatal401Handler
}

interface I_AuthorizeRequestData {
  username: string
  password: string
}
interface I_AuthorizeResponseData {
  access: string
  refresh: string
}

export type {
  T_AccessGroup,
  T_AllowedAccessGroups,
  I_AuthData,
  I_AuthResources,
  I_AuthorizeRequestData,
  I_AuthorizeResponseData,
}
export type T_LoginZone = 'dashboard' | 'resolutions'
