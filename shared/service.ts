import { apiUrl } from '@/config'
import ApiError from '@/shared/data/errors'
import { I_FetchOptions, I_RequestSetup, T_DeleteMethod, T_GetMethod, T_PatchMethod, T_PostMethod } from '@/shared/data/types'
import log from '@/shared/log'
import { errorToast } from '@/shared/toasts'
import { T_BatchDeletionCommonRequestData } from '@/shared/types'

const listService = <T_Response>(entityPath: string, getMethod: T_GetMethod) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (options?: I_FetchOptions) => {
      return getMethod<T_Response>({ endpoint: apiUrl(entityPath), requestSetup, options })
    }
  }
}
const detailService = <T_Id, T_Response>(entityPath: string, getMethod: T_GetMethod) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (id: T_Id) => {
      return getMethod<T_Response>({ endpoint: apiUrl(`${entityPath}/${id}`), requestSetup })
    }
  }
}

const postService = <T_RequestData, T_Response>(entityPath: string, postMethod: T_PostMethod) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (data: T_RequestData) => {
      return postMethod<T_RequestData, T_Response>({ endpoint: `${apiUrl(entityPath)}/`, requestSetup, data })
    }
  }
}

const deletionService = <T_Id, T_Response>(entityPath: string, deleteMethod: T_DeleteMethod) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (id: T_Id) => {
      return deleteMethod<T_Response>({ endpoint: apiUrl(`${entityPath}/${id}/`), requestSetup })
    }
  }
}
const batchDeletionService = <T_Id, T_Response>(entityPath: string, deleteMethod: T_DeleteMethod) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (ids: Array<T_Id>) => {
      return deleteMethod<T_Response, T_BatchDeletionCommonRequestData<T_Id>>({
        endpoint: apiUrl(`${entityPath}/batch-delete/`),
        requestSetup,
        data: { ids: ids },
      })
    }
  }
}

const updateService = <T_Id, T_RequestData, T_Response>(entityPath: string, patchMethod: T_PatchMethod) => {
  return (requestSetup?: I_RequestSetup) => {
    return async (id: T_Id, data: T_RequestData) => {
      return patchMethod<T_RequestData, T_Response>({ endpoint: `${apiUrl(entityPath)}/${id}/`, requestSetup, data })
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

export { deletionService, handleError, handleServiceError, listService, postService, detailService, updateService, batchDeletionService }
