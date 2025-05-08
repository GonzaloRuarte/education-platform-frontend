'use client'

import { I_UseConfirm } from '@/shared/confirm'
import {
  I_FetchOptions,
  I_RequestSetup,
  T_DeleteMethod,
  T_GetMethod,
  T_HttpMethod,
  T_PatchMethod,
  T_PostMethod,
} from '@/shared/data/types'
import { useInProgress, useInProgressLocal } from '@/shared/hooks/utils'
import {
  batchDeletionService,
  deletionService,
  detailService,
  handleServiceError,
  listService,
  postService,
  updateService,
} from '@/shared/service'
import { successToast } from '@/shared/toasts'
import {
  I_DeletionCommonResponse,
  T_ActionServiceHook,
  T_BatchDeletionServiceHook,
  T_CreateServiceHook,
  T_DeletionServiceHook,
  T_DetailServiceHook,
  T_InProgressHook,
  T_ListServiceHook,
  T_UpdateServiceHook,
  T_VoidFn,
} from '@/shared/types'
import { EntityName, sentence } from '@/shared/utils'
import debounce from 'debounce'

import { useCallback, useEffect, useState } from 'react'

const listHook = <T_Response>(
  path: string,
  getMethod: T_GetMethod,
  useRequestSetup: () => I_RequestSetup,
  config?: { dataPostProcessor?: any },
) => {
  const useList: T_ListServiceHook<T_Response> = (
    options?: I_FetchOptions,
    useInProgress: T_InProgressHook = useInProgressLocal,
  ) => {
    const [data, setData] = useState<undefined | T_Response>(undefined)
    const { isInProgress, setInProgressStatus } = useInProgress()
    const fetcher = listService<T_Response>(path, getMethod)(useRequestSetup(), options)
    const reload = useCallback(() => {
      setInProgressStatus(true)
      fetcher()
        .then((res) => setData(config?.dataPostProcessor !== undefined ? config.dataPostProcessor(res) : res))
        .finally(() => {
          setInProgressStatus(false)
        })
    }, [options?.page, options?.page_size, options?.filters])

    useEffect(debounce(reload), [path, options?.page, options?.page_size, options?.filters])

    return { data, reload, isLoading: isInProgress }
  }
  return useList
}

const getHook = <T_Response, T_QueryParams = {}>(
  path: string,
  getMethod: T_GetMethod,
  useRequestSetup: () => I_RequestSetup,
) => {
  const useGet = (
    queryParams?: T_QueryParams, // Optional query parameters
    options?: I_FetchOptions, // Optional fetch options
    useInProgress: T_InProgressHook = useInProgressLocal,
  ) => {
    const [data, setData] = useState<undefined | T_Response>(undefined)
    const { isInProgress, setInProgressStatus } = useInProgress()

    // Build the full path with query parameters
    const queryString = queryParams
      ? '?' +
        Object.entries(queryParams)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string | number | boolean)}`)
          .join('&')
      : ''
    const fullPath = `${path}${queryString}`

    const fetcher = listService<T_Response>(fullPath, getMethod)(useRequestSetup(), options)

    const reload = () => {
      setInProgressStatus(true)
      fetcher()
        .then((res) => setData(res))
        .finally(() => {
          setInProgressStatus(false)
        })
    }

    useEffect(debounce(reload), [fullPath, options?.page, options?.page_size])

    return { data, reload, isLoading: isInProgress }
  }
  return useGet
}

const creationHook = <T_RequestData, T_Response>(
  path: string,
  postMethod: T_PostMethod,
  useRequestSetup: () => I_RequestSetup,
) => {
  const useCreate: T_CreateServiceHook<T_RequestData, T_Response> = () => {
    return postService<T_RequestData, T_Response>(path, postMethod)(useRequestSetup())
  }
  return useCreate
}

const actionHook = <T_RequestData, T_Response>(
  path: string,
  httpMethod: T_HttpMethod,
  useRequestSetup: () => I_RequestSetup,
) => {
  const useAction: T_ActionServiceHook<T_RequestData, T_Response> = () => {
    return postService<T_RequestData, T_Response>(path, httpMethod)(useRequestSetup())
  }
  return useAction
}

const deletionHook = <T_Id, T_Response = I_DeletionCommonResponse>(
  path: string,
  deleteMethod: T_DeleteMethod,
  useRequestSetup: () => I_RequestSetup,
): T_DeletionServiceHook<T_Id, T_Response> => {
  return () => deletionService<T_Id, T_Response>(path, deleteMethod)(useRequestSetup())
}

const batchDeletionHook = <T_Id, T_Response = I_DeletionCommonResponse>(
  entityPath: string,
  deleteMethod: T_DeleteMethod,
  useRequestSetup: () => I_RequestSetup,
): T_BatchDeletionServiceHook<T_Id> => {
  const useBatchDelete = (d: {
    entityName: EntityName
    showConfirm: I_UseConfirm['showConfirm']
    reload: T_VoidFn
  }) => {
    const authResources = useRequestSetup()
    const { setIsInProgress, setIsNotInProgress } = useInProgress()

    return (ids: Array<T_Id>) => {
      const isJustOne = ids.length === 1
      const batchDeleteRaw = batchDeletionService<T_Id, T_Response>(entityPath, deleteMethod)(authResources)
      const title = isJustOne
        ? `Eliminar ${d.entityName.singular} con ID# ${ids}.`
        : `Eliminar ${d.entityName.plural} con IDs# ${ids.join(', ')}.`

      d.showConfirm(title, '¿Estás seguro/a que querés proceder?').then(() => {
        setIsInProgress()
        batchDeleteRaw(ids)
          .then(() => {
            successToast(
              sentence(`${d.entityName.plural} ${d.entityName.gs({ m: 'eliminados', f: 'eliminadas' })} correctamente`),
            )
          })
          .catch(handleServiceError)
          .finally(() => {
            setIsNotInProgress()
            d.reload()
          })
      })
    }
  }
  return useBatchDelete
}

const detailHook = <T_Id, T_Response>(path: string, getMethod: T_GetMethod, useRequestSetup: () => I_RequestSetup) => {
  const useDetail: T_DetailServiceHook<T_Id, T_Response> = (
    id: T_Id,
    options?: I_FetchOptions,
    useInProgress: T_InProgressHook = useInProgressLocal,
  ) => {
    const [data, setData] = useState<undefined | T_Response>(undefined)
    const { isInProgress, setInProgressStatus } = useInProgress()
    const fetcher = detailService<T_Id, T_Response>(path, getMethod)(id, useRequestSetup(), options)
    const reload = () => {
      setInProgressStatus(true)
      fetcher()
        .then((res) => setData(res))
        .finally(() => {
          setInProgressStatus(false)
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
  useRequestSetup: () => I_RequestSetup,
  options?: { pathSuffix?: string },
) => {
  const useUpdate: T_UpdateServiceHook<T_Id, T_RequestData, T_Response> = () => {
    return updateService<T_Id, T_RequestData, T_Response>(entityPath, patchMethod, options)(useRequestSetup())
  }
  return useUpdate
}

export { actionHook, batchDeletionHook, creationHook, deletionHook, detailHook, getHook, listHook, updateHook }
