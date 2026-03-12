import { I_SchoolName, T_SchoolNames } from '@/mta_schools/types'
import { T_UserProfiles } from '@/mta_users/types'
import { T_Fatal401Handler, T_TokenRefresher } from '@/shared/data/types'

export type T_UserCapability =
  | 'access_dashboard'
  | 'view_school_scope'
  | 'request_appointment'
  | 'list_appointments'
  | 'view_appointment_detail'
  | 'edit_appointment_students'
  | 'upload_offline_resolutions'
  | 'manage_appointment_slots'
  | 'manage_school_staff'
  | 'manage_executives'
  | 'view_reports'
  | 'manage_reports'
  | 'manage_students'
  | 'view_student_dni'
  | 'manage_groupings'
  | 'manage_schools'
  | 'manage_admin_users'
  | 'change_user_passwords'
  | 'manage_evaluators'
  | 'manage_evaluation_content'
  | 'manage_evaluation_workflow'
  | 'resolve_evaluations'
  | 'dev_access'

interface I_AuthData {
  accessToken?: string
  refreshToken?: string
  profiles?: Array<T_UserProfiles>
  capabilities?: Array<T_UserCapability>
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
  capabilities: Array<T_UserCapability>
  school: null | I_SchoolName
  schools: T_SchoolNames
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
