import { I_AuthResources } from '@/mta_auth/types'
import { I_FetchOptions, T_DeleteMethod, T_GetMethod, T_PatchMethod, T_PostMethod } from '@/shared/data/types'
import { batchDeletionService, deletionService, detailService, detailService2, listService, listService2, postService, updateService } from '@/shared/service'
import {
  I_DeletionCommonResponse,
  T_BatchDeletionServiceHook,
  T_CreateServiceHook,
  T_DeletionServiceHook,
  T_DetailServiceHook,
  T_DetailServiceHookV2,
  T_ListServiceHook,
  T_ListServiceHookV2,
  T_UpdateServiceHook,
} from '@/shared/types'

import { useEffect, useState } from 'react'

const listHook = <T_Response>(entityPath: string, getMethod: T_GetMethod, useAuthResources: () => I_AuthResources) => {
  const useList: T_ListServiceHook<T_Response> = () => {
    return listService<T_Response>(entityPath, getMethod)(useAuthResources())
  }
  return useList
}

const listHookV2 = <T_Response>(entityPath: string, getMethod: T_GetMethod, useAuthResources: () => I_AuthResources) => {
  const useList: T_ListServiceHookV2<T_Response> = (options?: I_FetchOptions) => {
    const [data, setData] = useState<undefined | T_Response>(undefined)
    const fetcher = listService2<T_Response>(entityPath, getMethod)(useAuthResources(), options)
    const reload = () => {
      fetcher().then((res) => setData(res))
    }
    useEffect(reload, [options, entityPath])

    return { data, reload }
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
  const useList: T_DetailServiceHookV2<T_Id, T_Response> = (id: T_Id, options?: I_FetchOptions) => {
    const [data, setData] = useState<undefined | T_Response>(undefined)
    const fetcher = detailService2<T_Id, T_Response>(entityPath, getMethod)(id, useAuthResources(), options)
    const reload = () => {
      fetcher().then((res) => setData(res))
    }
    useEffect(reload, [options, entityPath])

    return { data, reload }
  }
  return useList
}

const updateHook = <T_Id, T_RequestData, T_Response>(entityPath: string, patchMethod: T_PatchMethod, useAuthResources: () => I_AuthResources) => {
  const useUpdate: T_UpdateServiceHook<T_Id, T_RequestData, T_Response> = () => {
    return updateService<T_Id, T_RequestData, T_Response>(entityPath, patchMethod)(useAuthResources())
  }
  return useUpdate
}

export { batchDeletionHook, creationHook, deletionHook, detailHook, listHook, listHookV2, detailHookV2, updateHook }
