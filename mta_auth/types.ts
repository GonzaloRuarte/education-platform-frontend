import { I_SchoolName } from '@/mta_schools/types'
import { T_UserProfiles } from '@/mta_users/types'
import { T_Fatal401Handler, T_TokenRefresher } from '@/shared/data/types'

interface I_AuthData {
  accessToken?: string
  refreshToken?: string
  profiles?: Array<T_UserProfiles>
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
  token: {
    refresh: string
    access: string
  }
  user: {
    username: string
    first_name: string
    last_name: string
  }
  profiles: Array<T_UserProfiles>
  school: null | I_SchoolName
}

interface I_AuthorizeStudentResponseData {
  refresh: string
  access: string
}

interface I_ForgotAccessRequestData {
  email: string
}

interface I_ForgotAccessResponseData {
  message: string
}

interface I_PasswordResetConfirmRequestData {
  uid: string
  token: string
  new_password: string
}

interface I_PasswordResetConfirmResponseData {
  message: string
}

export type {
  I_AuthData,
  I_AuthorizeRequestData,
  I_AuthorizeResponseData,
  I_AuthorizeStudentResponseData,
  I_AuthResources,
  T_UserProfiles,
  I_ForgotAccessRequestData,
  I_ForgotAccessResponseData,
  I_PasswordResetConfirmRequestData,
  I_PasswordResetConfirmResponseData,
}
export type T_LoginZone = 'dashboard' | 'resolutions'
