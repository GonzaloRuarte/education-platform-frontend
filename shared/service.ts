import { I_FetchOptions, I_SessionSetup, T_GetMethod } from '@/shared/data/types';





const listService = <T_Response>(endpoint: string, getMethod: T_GetMethod) => {
  return (sessionSetup?: I_SessionSetup) => {
    return async (options: I_FetchOptions) => {
      return getMethod<T_Response>({ endpoint, sessionSetup, options })
    }
  }
}

export {
  listService,
}
export type {
  I_SessionSetup,
  I_FetchOptions,
}