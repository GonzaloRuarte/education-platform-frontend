import { I_AuthResources } from '@/mta_auth/types'
import { I_FetchOptions, T_DeleteMethod, T_GetMethod, T_PatchMethod, T_PostMethod } from '@/shared/data/types'
import { useInProgressLocal } from '@/shared/hooks/utils'
import { batchDeletionService, deletionService, detailService, detailService2, listService, listService2, postService, updateService } from '@/shared/service'
import {
  I_DeletionCommonResponse,
  T_BatchDeletionServiceHook,
  T_CreateServiceHook,
  T_DeletionServiceHook,
  T_DetailServiceHook,
  T_DetailServiceHookV2,
  T_InProgressHook,
  T_ListServiceHook,
  T_ListServiceHookV2,
  T_UpdateServiceHook,
} from '@/shared/types'
import debounce from 'debounce'

import { useCallback, useEffect, useState } from 'react'

const listHook = <T_Response>(entityPath: string, getMethod: T_GetMethod, useAuthResources: () => I_AuthResources) => {
  const useList: T_ListServiceHook<T_Response> = () => {
    return listService<T_Response>(entityPath, getMethod)(useAuthResources())
  }
  return useList
}

const listHookV2 = <T_Response>(entityPath: string, getMethod: T_GetMethod, useAuthResources: () => I_AuthResources) => {
  const useList: T_ListServiceHookV2<T_Response> = (options?: I_FetchOptions, useInProgress: T_InProgressHook = useInProgressLocal) => {
    const [data, setData] = useState<undefined | T_Response>(undefined)
    const { isInProgress, setIsInProgress } = useInProgress()
    const fetcher = listService2<T_Response>(entityPath, getMethod)(useAuthResources(), options)
    const reload = useCallback(() => {
      setIsInProgress(true)
      fetcher()
        .then((res) => setData(res))
        .finally(() => {
          setIsInProgress(false)
        })
    }, [options?.page, options?.page_size])

    useEffect(debounce(reload), [entityPath, options?.page, options?.page_size])

    return { data, reload, isLoading: isInProgress }
  }
  return useList
}

const creationHook = <T_RequestData, T_Response>(entityPath: string, postMethod: T_PostMethod, useAuthResources: () => I_AuthResources) => {
  const useCreate: T_CreateServiceHook<T_RequestData, T_Response> = () => {
    return postService<T_RequestData, T_Response>(entityPath, postMethod)(useAuthResources())
  }
  return useCreate
}

const deletionHook = <T_Id, T_Response = I_DeletionCommonResponse>(
  entityPath: string,
  deleteMethod: T_DeleteMethod,
  useAuthResources: () => I_AuthResources,
): T_DeletionServiceHook<T_Id, T_Response> => {
  return () => deletionService<T_Id, T_Response>(entityPath, deleteMethod)(useAuthResources())
}

const batchDeletionHook = <T_Id, T_Response = I_DeletionCommonResponse>(
  entityPath: string,
  deleteMethod: T_DeleteMethod,
  useAuthResources: () => I_AuthResources,
): T_BatchDeletionServiceHook<T_Id, T_Response> => {
  return () => batchDeletionService<T_Id, T_Response>(entityPath, deleteMethod)(useAuthResources())
}

const detailHook = <T_Id, T_Response>(entityPath: string, getMethod: T_DeleteMethod, useAuthResources: () => I_AuthResources) => {
  const useDetail: T_DetailServiceHook<T_Id, T_Response> = () => {
    return detailService<T_Id, T_Response>(entityPath, getMethod)(useAuthResources())
  }
  return useDetail
}

const detailHookV2 = <T_Id, T_Response>(entityPath: string, getMethod: T_GetMethod, useAuthResources: () => I_AuthResources) => {
  const useDetail: T_DetailServiceHookV2<T_Id, T_Response> = (id: T_Id, options?: I_FetchOptions, useInProgress: T_InProgressHook = useInProgressLocal) => {
    const [data, setData] = useState<undefined | T_Response>(undefined)
    const { isInProgress, setIsInProgress } = useInProgress()
    const fetcher = detailService2<T_Id, T_Response>(entityPath, getMethod)(id, useAuthResources(), options)
    const reload = () => {
      setIsInProgress(true)
      fetcher()
        .then((res) => setData(res))
        .finally(() => {
          setIsInProgress(false)
        })
    }
    useEffect(reload, [options, entityPath])

    return { data, reload, isLoading: isInProgress }
  }
  return useDetail
}

const updateHook = <T_Id, T_RequestData, T_Response>(entityPath: string, patchMethod: T_PatchMethod, useAuthResources: () => I_AuthResources) => {
  const useUpdate: T_UpdateServiceHook<T_Id, T_RequestData, T_Response> = () => {
    return updateService<T_Id, T_RequestData, T_Response>(entityPath, patchMethod)(useAuthResources())
  }
  return useUpdate
}

export { batchDeletionHook, creationHook, deletionHook, detailHook, listHook, listHookV2, detailHookV2, updateHook }
