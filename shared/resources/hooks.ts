'use client'

import { apiUrl } from '@/config'
import { useAuthResources } from '@/mta_auth/hooks'
import { axiosGet } from '@/shared/data/axios'
import { useInProgressLocal } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { T_VoidFn } from '@/shared/types'
import { useCallback, useEffect, useState } from 'react'

import { I_ResourceDefinition } from './types'

interface I_ResourceSchemaHookResources {
  data: I_ResourceDefinition | undefined
  reload: T_VoidFn
  isLoading: boolean
}

const useResourceSchema = (resourceKey: string): I_ResourceSchemaHookResources => {
  const authResources = useAuthResources()
  const [data, setData] = useState<I_ResourceDefinition | undefined>(undefined)
  const { isInProgress, setInProgressStatus } = useInProgressLocal()

  const reload = useCallback(() => {
    if (!resourceKey) return

    setInProgressStatus(true)
    axiosGet<I_ResourceDefinition>({
      url: apiUrl(`/resources/${resourceKey}/`),
      requestSetup: authResources,
      options: {},
    })
      .then(setData)
      .catch(handleServiceError)
      .finally(() => setInProgressStatus(false))
  }, [resourceKey, authResources.accessToken, authResources.refreshToken])

  useEffect(reload, [reload])

  return { data, reload, isLoading: isInProgress }
}

export { useResourceSchema }
