import { I_FetchOptions, I_SessionSetup, T_GetMethod } from '@/shared/data/types';
import log from '@/shared/log';
import { errorToast } from '@/shared/toasts';





const listService = <T_Response>(endpoint: string, getMethod: T_GetMethod) => {
  return (sessionSetup?: I_SessionSetup) => {
    return async (options: I_FetchOptions) => {
      return getMethod<T_Response>({ endpoint, sessionSetup, options })
    }
  }
}

const handleServiceError = (errorReason) => {
  errorToast("Error en la interacción con el servidor.")
  log.error(errorReason)
}

export {
  listService,
  handleServiceError
}
export type {
  I_SessionSetup,
  I_FetchOptions,
}