import { I_AuthResources } from '@/mta_auth/types'
import { I_FetchOptions, T_DeleteMethod, T_GetMethod, T_HttpMethod, T_PatchMethod, T_PostMethod } from '@/shared/data/types'
import { useInProgressLocal } from '@/shared/hooks/utils'
import { batchDeletionService, deletionService, detailService, listService, postService, updateService } from '@/shared/service'
import {
  I_DeletionCommonResponse,
  T_ActionServiceHook,
  T_BatchDeletionServiceHook,
  T_CreateServiceHook,
  T_DeletionServiceHook,
  T_DetailServiceHookV2,
  T_InProgressHook,
  T_ListServiceHookV2,
  T_UpdateServiceHook,
} from '@/shared/types'
import debounce from 'debounce'

import { useCallback, useEffect, useState } from 'react'

const listHook = <T_Response>(path: string, getMethod: T_GetMethod, useAuthResources: () => I_AuthResources) => {
  const useList: T_ListServiceHookV2<T_Response> = (options?: I_FetchOptions, useInProgress: T_InProgressHook = useInProgressLocal) => {
    const [data, setData] = useState<undefined | T_Response>(undefined)
    const { isInProgress, setIsInProgress } = useInProgress()
    const fetcher = listService<T_Response>(path, getMethod)(useAuthResources(), options)
    const reload = useCallback(() => {
      setIsInProgress(true)
      fetcher()
        .then((res) => setData(res))
        .finally(() => {
          setIsInProgress(false)
        })
    }, [options?.page, options?.page_size])

    useEffect(debounce(reload), [path, options?.page, options?.page_size])

    return { data, reload, isLoading: isInProgress }
  }
  return useList
}

const creationHook = <T_RequestData, T_Response>(path: string, postMethod: T_PostMethod, useAuthResources: () => I_AuthResources) => {
  const useCreate: T_CreateServiceHook<T_RequestData, T_Response> = () => {
    return postService<T_RequestData, T_Response>(path, postMethod)(useAuthResources())
  }
  return useCreate
}

const actionHook = <T_RequestData, T_Response>(path: string, httpMethod: T_HttpMethod, useAuthResources: () => I_AuthResources) => {
  const useAction: T_ActionServiceHook<T_RequestData, T_Response> = () => {
    return postService<T_RequestData, T_Response>(path, httpMethod)(useAuthResources())
  }
  return useAction
}

const deletionHook = <T_Id, T_Response = I_DeletionCommonResponse>(
  path: string,
  deleteMethod: T_DeleteMethod,
  useAuthResources: () => I_AuthResources,
): T_DeletionServiceHook<T_Id, T_Response> => {
  return () => deletionService<T_Id, T_Response>(path, deleteMethod)(useAuthResources())
}

const batchDeletionHook = <T_Id, T_Response = I_DeletionCommonResponse>(
  entityPath: string,
  deleteMethod: T_DeleteMethod,
  useAuthResources: () => I_AuthResources,
): T_BatchDeletionServiceHook<T_Id, T_Response> => {
  return () => batchDeletionService<T_Id, T_Response>(entityPath, deleteMethod)(useAuthResources())
}

const detailHook = <T_Id, T_Response>(path: string, getMethod: T_GetMethod, useAuthResources: () => I_AuthResources) => {
  const useDetail: T_DetailServiceHookV2<T_Id, T_Response> = (id: T_Id, options?: I_FetchOptions, useInProgress: T_InProgressHook = useInProgressLocal) => {
    const [data, setData] = useState<undefined | T_Response>(undefined)
    const { isInProgress, setIsInProgress } = useInProgress()
    const fetcher = detailService<T_Id, T_Response>(path, getMethod)(id, useAuthResources(), options)
    const reload = () => {
      setIsInProgress(true)
      fetcher()
        .then((res) => setData(res))
        .finally(() => {
          setIsInProgress(false)
        })
    }
    useEffect(reload, [options, path])

    return { data, reload, isLoading: isInProgress }
  }
  return useDetail
}

const updateHook = <T_Id, T_RequestData, T_Response = {}>(
  entityPath: string,
  patchMethod: T_PatchMethod,
  useAuthResources: () => I_AuthResources,
  options?: { pathSuffix?: string },
) => {
  const useUpdate: T_UpdateServiceHook<T_Id, T_RequestData, T_Response> = () => {
    return updateService<T_Id, T_RequestData, T_Response>(entityPath, patchMethod, options)(useAuthResources())
  }
  return useUpdate
}

export { batchDeletionHook, creationHook, deletionHook, detailHook, listHook, updateHook, actionHook }
