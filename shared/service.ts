import { apiUrl } from '@/config'
import ApiError from '@/shared/data/errors'
import { I_FetchOptions, I_RequestSetup, T_DeleteMethod, T_GetMethod, T_PatchMethod, T_PostMethod } from '@/shared/data/types'
import log from '@/shared/log'
import { errorToast } from '@/shared/toasts'
import { T_BatchDeletionCommonRequestData } from '@/shared/types'

const listService = <T_Response>(path: string, getMethod: T_GetMethod) => {
  return (requestSetup?: I_RequestSetup, options?: I_FetchOptions) => {
    return async () => {
      return getMethod<T_Response>({ url: apiUrl(path), requestSetup, options })
    }
  }
}
const detailService = <T_Id, T_Response>(path: string, getMethod: T_GetMethod) => {
  return (id: T_Id, requestSetup?: I_RequestSetup, options?: I_FetchOptions) => {
    return async () => {
      return getMethod<T_Response>({ url: apiUrl(`${path}/${id}`), requestSetup, options })
    }
  }
}

const postService = <T_RequestData, T_Response>(path: string, postMethod: T_PostMethod) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (data: T_RequestData) => {
      return postMethod<T_RequestData, T_Response>({ url: `${apiUrl(path)}/`, requestSetup, data })
    }
  }
}

const deletionService = <T_Id, T_Response>(path: string, deleteMethod: T_DeleteMethod) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (id: T_Id) => {
      return deleteMethod<T_Response>({ url: apiUrl(`${path}/${id}/`), requestSetup })
    }
  }
}
const batchDeletionService = <T_Id, T_Response>(path: string, deleteMethod: T_DeleteMethod) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (ids: Array<T_Id>) => {
      return deleteMethod<T_Response, T_BatchDeletionCommonRequestData<T_Id>>({
        url: apiUrl(`${path}/batch-delete/`),
        requestSetup,
        data: { ids: ids },
      })
    }
  }
}

/**
 *
 * @param path
 * @param patchMethod
 * @param options {pathSuffix} adds a suffix in the path after the id
 * @returns
 */
const updateService = <T_Id, T_RequestData, T_Response>(path: string, patchMethod: T_PatchMethod, options?: { pathSuffix?: string }) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (id: T_Id, data: T_RequestData) => {
      return patchMethod<T_RequestData, T_Response>({
        url: `${apiUrl(path)}/${id}${options?.pathSuffix !== undefined ? options.pathSuffix : ''}/`,
        requestSetup,
        data,
      })
    }
  }
}

const handleServiceError = (error: ApiError<Error>) => {
  errorToast(error.message)
}

const handleError = (msg: string) => (errorReason: any) => {
  errorToast(msg)
  log.error(errorReason)
}

export { batchDeletionService, deletionService, detailService, handleError, handleServiceError, listService, postService, updateService }
