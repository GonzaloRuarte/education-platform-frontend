interface I_FetchOptions {
  page: number;
  page_size: number;
  filters?: Record<string, any>;
}

interface I_RequestSetup {
  accessToken?: string
  refreshToken?: string
  headers?: object
}

type T_GetMethod = <T_Response>(args: {
  endpoint: string;
  requestSetup?: I_RequestSetup;
  options: I_FetchOptions;
}) => Promise<T_Response>

type T_PostMethod = <T_RequestData, T_Response>(args: {
  endpoint: string;
  requestSetup?: I_RequestSetup;
  // options: I_FetchOptions;
  data: T_RequestData;
}) => Promise<T_Response>

interface I_PaginatedResponse<T_ResultsInstance = unknown> {
  count: number
  next: string
  previous: string
  results: Array<T_ResultsInstance>
}

export type {
  I_FetchOptions,
  I_RequestSetup,
  T_GetMethod,
  I_PaginatedResponse,
  T_PostMethod,
}