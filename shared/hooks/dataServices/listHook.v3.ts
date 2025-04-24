import { I_AuthResources } from '@/mta_auth/types'
import { I_FetchOptions, T_GetMethod } from '@/shared/data/types'
import { useInProgressLocal } from '@/shared/hooks/utils'
import { listService } from '@/shared/service'
import { I_FetchingHookResources, T_InProgressHook, T_VoidFn } from '@/shared/types'
import { randomInt } from '@/shared/utils'
import debounce, { DebouncedFunction } from 'debounce'
import { useDebouncedCallback } from 'use-debounce'

import { useCallback, useEffect, useState } from 'react'

type T_ExtractPathParams<T extends string> = T extends `${infer _Start}{${infer Param}:${infer _Type}}${infer Rest}`
  ? Param | T_ExtractPathParams<Rest>
  : never

type T_ListServiceHookV3<T_Response, T_PathParams> = (
  options?: I_FetchOptions,
  pathParams?: T_PathParams,
) => I_FetchingHookResources<T_Response>

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

    // Build the query string
    const queryString = options?.filters
      ? '?' +
        Object.entries(options.filters)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string | number | boolean)}`)
          .join('&')
      : ''

    const fullPath = `${resolvedPath}${queryString}`

    const fetcher = listService<T_Response>(fullPath, getMethod)(useAuthResources(), options)

    const reload = useDebouncedCallback(
      useCallback(() => {
        setIsInProgress()
        fetcher()
          .then((res) => setData(res))
          .finally(setIsNotInProgress)
      }, [fullPath, options?.page, options?.page_size]),
      250,
    )

    useEffect(() => {
      setIsInProgress()
      reload.cancel()
      reload()
    }, [fullPath, options?.page, options?.page_size])

    return { data, reload, isLoading: isInProgress }
  }
  return useList
}

export { listHookV3 }
