import { I_AuthResources } from '@/mta_auth/types'
import { I_FetchOptions, I_RequestSetup, T_GetMethod, T_HttpMethod } from '@/shared/data/types'
import { useInProgressLocal } from '@/shared/hooks/utils'
import { httpService, listService } from '@/shared/service'
import { I_ActionHookResources, I_FetchingDataHookResources, T_InProgressHook } from '@/shared/types'
import { useDebouncedCallback } from 'use-debounce'

import { useCallback, useEffect, useState } from 'react'

type T_ExtractPathParams<T extends string> = T extends `${infer _Start}{${infer Param}:${infer _Type}}${infer Rest}`
  ? Param | T_ExtractPathParams<Rest>
  : never

type T_ListServiceHookV3<T_Response, T_PathParams> = (
  options?: I_FetchOptions,
  pathParams?: T_PathParams,
) => I_FetchingDataHookResources<T_Response>

type T_PathParams<T_Path extends string> = Record<T_ExtractPathParams<T_Path>, string | number>

const listHookV3 = <T_Path extends string, T_Response>(
  path: T_Path,
  getMethod: T_GetMethod,
  useAuthResources: () => I_AuthResources,
) => {
  const useList: T_ListServiceHookV3<T_Response, T_PathParams<T_Path>> = (
    options?: I_FetchOptions, // Query parameters and other fetch options
    pathParams?: T_PathParams<T_Path>, // Variables for the URL path
    useInProgress: T_InProgressHook = useInProgressLocal,
  ) => {
    const [data, setData] = useState<undefined | T_Response>(undefined)
    const { isInProgress, setIsInProgress, setIsNotInProgress } = useInProgress()

    // Resolve the dynamic path with pathParams
    const resolvedPath = pathParams ? path.replace(/{(\w+):\w+}/g, (_, key) => pathParams[key]?.toString() || '') : path


    const fetcher = listService<T_Response>(resolvedPath, getMethod)(useAuthResources(), options)

    const reload = useDebouncedCallback(
      useCallback(() => {
        setIsInProgress()
        fetcher()
          .then((res) => setData(res))
          .finally(setIsNotInProgress)
      }, [options?.page, options?.page_size, options?.filters, options?.sort, options?.externalFilters]),
      250,
    )

    useEffect(() => {
      setIsInProgress()
      reload.cancel()
      reload()
    }, [
      resolvedPath,
      options?.page,
      options?.page_size,
      JSON.stringify(options?.filters ?? {}),
      JSON.stringify(options?.sort ?? []),
      JSON.stringify(options?.externalFilters ?? {}),
    ])

    return { data, reload, isLoading: isInProgress }
  }
  return useList
}

type T_ActionDataServiceHookV3<T_Response, T_PathParams> = (
  pathParams?: T_PathParams,
  useInProgress?: T_InProgressHook,
) => I_FetchingDataHookResources<T_Response>

/**
 * Data hook that auto-executes the fetching and provides `data`, `reload`, etc. resources
 */
const actionDataHookV3 = <T_Path extends string, T_RequestData, T_Response>(
  path: T_Path,
  httpMethod: T_HttpMethod,
  useRequestSetup: () => I_RequestSetup,
) => {
  const useAction: T_ActionDataServiceHookV3<T_Response, T_PathParams<T_Path>> = (
    pathParams?: T_PathParams<T_Path>,
    useInProgress: T_InProgressHook = useInProgressLocal,
  ) => {
    const [data, setData] = useState<undefined | T_Response>(undefined)
    const { isInProgress, setIsInProgress, setIsNotInProgress } = useInProgress()

    const resolvedPath = pathParams ? path.replace(/{(\w+):\w+}/g, (_, key) => pathParams[key]?.toString() || '') : path

    const fetcher = httpService<T_RequestData, T_Response>(resolvedPath, httpMethod)(useRequestSetup())

    const reload = useDebouncedCallback(
      useCallback(() => {
        setIsInProgress()
        fetcher()
          .then((res) => setData(res))
          .finally(setIsNotInProgress)
      }, [resolvedPath]),
      250,
    )

    useEffect(() => {
      setIsInProgress()
      reload.cancel()
      reload()
    }, [resolvedPath])

    return { data, reload, isLoading: isInProgress }
  }

  return useAction
}

type T_ActionServiceHookV3<T_RequestData, T_Response, T_PathParams> = (
  pathParams?: T_PathParams,
  useInProgress?: T_InProgressHook,
) => I_ActionHookResources<T_RequestData, T_Response>

const actionHookV3 = <T_Path extends string, T_RequestData, T_Response>(
  path: T_Path,
  httpMethod: T_HttpMethod,
  useRequestSetup: () => I_RequestSetup,
) => {
  const useAction: T_ActionServiceHookV3<T_RequestData, T_Response, T_PathParams<T_Path>> = (
    pathParams?: T_PathParams<T_Path>,
    useInProgress: T_InProgressHook = useInProgressLocal,
  ) => {
    const { isInProgress, setIsInProgress, setIsNotInProgress } = useInProgress()

    const resolvedPath = pathParams ? path.replace(/{(\w+):\w+}/g, (_, key) => pathParams[key]?.toString() || '') : path

    const fetcher = httpService<T_RequestData, T_Response>(resolvedPath, httpMethod)(useRequestSetup())

    const executeAction = (requestData?: T_RequestData) => {
      setIsInProgress()
      return fetcher(requestData)
        .then((res) => res)
        .finally(setIsNotInProgress)
    }

    return { executeAction, isInProgress }
  }

  return useAction
}

export { actionDataHookV3, listHookV3, actionHookV3 }
