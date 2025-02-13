interface I_FetchOptions {
  page: number;
  page_size: number;
  filters?: Record<string, any>;
}

interface I_SessionSetup {
  accessToken?: string
  refreshToken?: string
  headers?: object
}

type T_GetMethod = <T_Response>(args: {
  endpoint: string;
  sessionSetup?: I_SessionSetup;
  options: I_FetchOptions;
}) => Promise<T_Response>

interface I_PaginatedResponse<T_ResultsInstance = unknown> {
  count: number
  next: string
  previous: string
  results: Array<T_ResultsInstance>
}

export type {
  I_FetchOptions,
  I_SessionSetup,
  T_GetMethod,
  I_PaginatedResponse,
}