type T_AccessGroup = 'admin' | 'school_staff' | 'evaluator' | 'student'
type T_AllowedAccessGroups = Array<T_AccessGroup> | undefined

interface I_AuthData {
  accessToken?: string
  refreshToken?: string
  accessGroups: Array<T_AccessGroup>
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
  I_AuthorizeRequestData,
  I_AuthorizeResponseData,
}
