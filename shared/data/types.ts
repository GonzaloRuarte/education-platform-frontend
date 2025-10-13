import { T_VoidFn } from '@/shared/types'
import { GridFilterModel, GridSortModel } from '@mui/x-data-grid'

interface I_FetchPaginationOptions {
  page?: number
  page_size?: number
}
interface I_FetchOptions extends I_FetchPaginationOptions {
  filters?: GridFilterModel        // full MUI filter model
  sort?: GridSortModel             // array of sort descriptors
  externalFilters?: Record<string, any> // optional, for your own custom filters
}

interface I_RefreshRequestData {
  refresh: string
}
interface I_RefreshResponseData {
  access: string
}
type T_TokenRefresher = (
  postMethod: (url: string, data: object) => Promise<{ access: string }>,
) => (data: I_RefreshRequestData) => Promise<any>
type T_Fatal401Handler = T_VoidFn

interface I_RequestSetup {
  accessToken?: string
  refreshToken?: string
  headers?: object
  refresh?: T_TokenRefresher
  handleFatal401Error?: T_Fatal401Handler
  'Content-Type'?: string
}

type T_GetMethod = <T_Response>(args: {
  url: string
  requestSetup?: I_RequestSetup
  options?: I_FetchOptions
}) => Promise<T_Response>
type T_PostMethod = <T_RequestData, T_Response>(args: {
  url: string
  requestSetup?: I_RequestSetup
  data: T_RequestData
}) => Promise<T_Response>
type T_DeleteMethod = <T_Response, T_Data = object>(args: {
  url: string
  requestSetup?: I_RequestSetup
  data?: T_Data
}) => Promise<T_Response>
type T_PatchMethod = <T_RequestData, T_Response>(args: {
  url: string
  requestSetup?: I_RequestSetup
  data: T_RequestData
}) => Promise<T_Response>

type T_HttpMethod = T_GetMethod | T_PostMethod | T_DeleteMethod | T_PatchMethod

interface I_PaginatedResponse<T_ResultsInstance = unknown> {
  count: number
  next: string
  previous: string
  results: Array<T_ResultsInstance>
}

interface I_CommonFetcherArgs {
  requestSetup?: I_RequestSetup
}
type T_BaseFetcher = (args: I_CommonFetcherArgs) => Promise<any>
type T_401Handler = <T_Fetcher extends T_BaseFetcher>(fetcher: T_Fetcher) => T_Fetcher

export type {
  I_FetchOptions,
  I_FetchPaginationOptions,
  I_RequestSetup,
  T_GetMethod,
  I_PaginatedResponse,
  T_PostMethod,
  T_DeleteMethod,
  T_PatchMethod,
  T_HttpMethod,

  // Refresh
  T_TokenRefresher,
  I_RefreshRequestData,
  I_RefreshResponseData,
  T_401Handler,
  T_BaseFetcher,
  T_Fatal401Handler,
}
