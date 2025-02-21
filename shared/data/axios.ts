import { SERVER_ERROR } from '@/shared/data/constants'
import ApiError from '@/shared/data/errors'
import { I_FetchOptions, I_RequestSetup } from '@/shared/data/types'
import axios, { AxiosError } from 'axios'

const _axiosBaseHeaders = (requestSetup?: I_RequestSetup) => ({
  'Content-Type': 'application/json',
  ...(requestSetup?.accessToken && {
    Authorization: `Bearer ${requestSetup?.accessToken}`,
  }),
})

const _handledAxiosError = (error: AxiosError<{ detail: string }>) => {
  throw new ApiError({
    message: error.response?.data.detail || SERVER_ERROR,
    status: error.response?.status,
    rawError: error,
  })
}

interface I_CommonFetcherArgs {
  requestSetup?: I_RequestSetup
}

function with401Handling<T_Fetcher extends (args: I_CommonFetcherArgs) => Promise<any>>(fetcher: T_Fetcher): T_Fetcher {
  return ((args) =>
    fetcher(args).catch((error) => {
      if (error instanceof ApiError) {
        if (args.requestSetup?.refresh !== undefined && args.requestSetup.refreshToken !== undefined) {
          args.requestSetup.refresh(axios.post)({
            refresh: args.requestSetup.refreshToken,
          })
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

const axiosPost = async <T_RequestData, T_Response>(args: {
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
}

export { axiosGet, axiosPost }
