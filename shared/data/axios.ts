import { SERVER_ERROR } from '@/shared/data/constants'
import ApiError from '@/shared/data/errors'
import { I_FetchOptions, I_RequestSetup, T_401Handler, T_BaseFetcher, T_DeleteMethod } from '@/shared/data/types'
import axios, { AxiosError } from 'axios'

const _authHeader = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
})

const _axiosBaseHeaders = (requestSetup?: I_RequestSetup) => ({
  'Content-Type': 'application/json',
  ...(requestSetup?.accessToken && _authHeader(requestSetup.accessToken)),
})

const _handledAxiosError = (error: AxiosError<{ detail: string }>) => {
  throw new ApiError<AxiosError>({
    message: error.response?.data.detail || SERVER_ERROR,
    status: error.response?.status || -1,
    rawError: error,
  })
}

const axiosRefreshPostMethod: (url: string, data: object) => Promise<{ access: string }> = async (url, data) => {
  const res = await axios.post(url, data)
  return res.data
}

/**
 * High order function that adds 401 (unauthorized) status handling to a AXIOS BASED fetcher
 * @param fetcher
 * @returns
 */
const with401Handling: T_401Handler = <T_Fetcher extends T_BaseFetcher>(fetcher: T_Fetcher): T_Fetcher => {
  return ((args) =>
    fetcher(args).catch((error: ApiError<AxiosError>) => {
      if (error instanceof ApiError) {
        if (
          args.requestSetup?.refresh !== undefined &&
          args.requestSetup.refreshToken !== undefined &&
          error.status === 401
        ) {
          return args.requestSetup
            .refresh(axiosRefreshPostMethod)({
              refresh: args.requestSetup.refreshToken,
            })
            .then(async (res) => {
              const response = await axios.request({
                ...error.rawError.config,
                headers: {
                  ...error.rawError.config?.headers,
                  ..._authHeader(res.access),
                },
              })
              return response.data
            })
            .catch(args.requestSetup?.handleFatal401Error)
        }
      }
      throw error
    })) as T_Fetcher
}

const axiosGet = with401Handling(
  async <T_Response>(args: { endpoint: string; requestSetup?: I_RequestSetup; options: I_FetchOptions }) => {
    return axios
      .get<T_Response>(args.endpoint, {
        params: args.options,
        headers: {
          ..._axiosBaseHeaders(args.requestSetup),
        },
      })
      .then((response) => {
        return response.data
      })
      .catch(_handledAxiosError)
  },
)

const axiosPost = with401Handling(
  async <T_RequestData, T_Response>(args: {
    endpoint: string
    requestSetup?: I_RequestSetup
    options: I_FetchOptions
    data: T_RequestData
  }) => {
    return axios
      .post<T_Response>(args.endpoint, args.data, {
        headers: {
          ..._axiosBaseHeaders(args.requestSetup),
        },
      })
      .then((response) => {
        return response.data
      })
      .catch(_handledAxiosError)
  },
)

const axiosPatch = with401Handling(
  async <T_RequestData, T_Response>(args: {
    endpoint: string
    requestSetup?: I_RequestSetup
    options: I_FetchOptions
    data: T_RequestData
  }) => {
    return axios
      .patch<T_Response>(args.endpoint, args.data, {
        headers: {
          ..._axiosBaseHeaders(args.requestSetup),
        },
      })
      .then((response) => {
        return response.data
      })
      .catch(_handledAxiosError)
  },
)

const axiosDelete: T_DeleteMethod = with401Handling(
  async <T_Response, T_Data = object>(args: { endpoint: string; requestSetup?: I_RequestSetup; data?: T_Data }) => {
    return axios
      .delete<T_Response>(args.endpoint, {
        headers: {
          ..._axiosBaseHeaders(args.requestSetup),
        },
        data: args?.data,
      })
      .then((response) => {
        return response.data
      })
      .catch(_handledAxiosError)
  },
)

export { axiosGet, axiosPost, axiosDelete, axiosPatch }
