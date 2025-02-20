import { I_FetchOptions, I_RequestSetup, T_GetMethod, T_PostMethod } from '@/shared/data/types';
import log from '@/shared/log';
import { errorToast } from '@/shared/toasts';





const listService = <T_Response>(endpoint: string, getMethod: T_GetMethod) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (options: I_FetchOptions) => {
      return getMethod<T_Response>({ endpoint, requestSetup: requestSetup, options })
    }
  }
}

const postService = <T_RequestData, T_Response>(endpoint: string, postMethod: T_PostMethod) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (data: T_RequestData) => {
      return postMethod<T_RequestData, T_Response>({ endpoint, requestSetup: requestSetup, data })
    }
  }
}

const handleServiceError = (errorReason: any) => {
  errorToast("Error en la interacción con el servidor.")
  log.error(errorReason)
}

const handleError = (msg: string) => (errorReason: any) => {
  errorToast(msg)
  log.error(errorReason)
}

export {
  handleServiceError, handleError, listService, postService
}