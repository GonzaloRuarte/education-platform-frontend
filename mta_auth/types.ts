type T_Permissions = 'admin' | 'school_staff' | 'evaluator' | 'student'


interface I_AuthData {
  accessToken?: string
  refreshToken?: string
  permissions: Array<T_Permissions>
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
  T_Permissions,
  I_AuthData,
  I_AuthorizeRequestData,
  I_AuthorizeResponseData,
}