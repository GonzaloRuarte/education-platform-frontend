import ApiError from '@/shared/data/errors'
import { I_FetchOptions, I_RequestSetup, T_GetMethod, T_PostMethod } from '@/shared/data/types'
import { errorToast } from '@/shared/toasts'

const listService = <T_Response>(endpoint: string, getMethod: T_GetMethod) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (options: I_FetchOptions) => {
      return getMethod<T_Response>({ endpoint, requestSetup, options })
    }
  }
}

const postService = <T_RequestData, T_Response>(endpoint: string, postMethod: T_PostMethod) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (data: T_RequestData) => {
      return postMethod<T_RequestData, T_Response>({ endpoint, requestSetup, data })
    }
  }
}

const handleServiceError = (error: ApiError<Error>) => {
  errorToast(error.message)
  // console.log('handleServiceError', error.rawError)
}

const handleError = (msg: string) => (errorReason: any) => {
  errorToast(msg)
  console.log(errorReason)
}

export { handleError, handleServiceError, listService, postService }
