'use client'

import { apiUrl } from '@/config'
import { useAuthResources } from '@/mta_auth/hooks'
import { I_UseConfirm } from '@/shared/confirm'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import { I_PaginatedResponse } from '@/shared/data/types'
import { useInProgress, useInProgressLocal } from '@/shared/hooks'
import { creationHook, deletionHook, detailHook, listHook, updateHook } from '@/shared/hooks/dataServices'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import {
  I_CreationCommonResponse,
  I_DeletionCommonResponse,
  T_BatchDeletionCommonRequestData,
  T_BatchDeletionServiceHook,
  T_CreateServiceHook,
  T_DeletionServiceHook,
  T_DetailServiceHook,
  T_ListServiceHook,
  T_UpdateServiceHook,
  T_VoidFn,
} from '@/shared/types'
import { EntityName, sentence } from '@/shared/utils'
import { useCallback, useEffect, useState } from 'react'

import { I_ResourceDefinition, T_ResourceRecord } from './types'
import { I_ResourceStaticOption } from './types'

interface I_ResourceSchemaHookResources {
  data: I_ResourceDefinition | undefined
  reload: T_VoidFn
  isLoading: boolean
}

interface I_ResourceFieldOptionsHookResources {
  data: Array<I_ResourceStaticOption>
  reload: T_VoidFn
  isLoading: boolean
}

interface I_ResourceFieldOptionsResponse {
  options: Array<I_ResourceStaticOption>
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

const resourceRecordsPath = (resourceKey: string) => `/resources/${resourceKey}/records`
const resourceFieldOptionsPath = (resourceKey: string, fieldKey: string) => `/resources/${resourceKey}/options/${fieldKey}`

const useResourceFieldOptions = (
  resourceKey: string,
  fieldKey: string,
): I_ResourceFieldOptionsHookResources => {
  const authResources = useAuthResources()
  const [data, setData] = useState<Array<I_ResourceStaticOption>>([])
  const { isInProgress, setInProgressStatus } = useInProgressLocal()

  const reload = useCallback(() => {
    if (!resourceKey || !fieldKey) return

    setInProgressStatus(true)
    axiosGet<I_ResourceFieldOptionsResponse>({
      url: apiUrl(resourceFieldOptionsPath(resourceKey, fieldKey)),
      requestSetup: authResources,
      options: {},
    })
      .then((response) => setData(response.options))
      .catch(handleServiceError)
      .finally(() => setInProgressStatus(false))
  }, [resourceKey, fieldKey, authResources.accessToken, authResources.refreshToken])

  useEffect(reload, [reload])

  return { data, reload, isLoading: isInProgress }
}

const resourceRecordListHook = <T_Response extends I_PaginatedResponse = I_PaginatedResponse<T_ResourceRecord>>(
  resourceKey: string,
): T_ListServiceHook<T_Response> =>
  listHook<T_Response>(resourceRecordsPath(resourceKey), axiosGet, useAuthResources)

const resourceRecordCreateHook = <
  T_RequestData = T_ResourceRecord,
  T_Response = I_CreationCommonResponse,
>(
  resourceKey: string,
): T_CreateServiceHook<T_RequestData, T_Response> =>
  creationHook<T_RequestData, T_Response>(resourceRecordsPath(resourceKey), axiosPost, useAuthResources)

const resourceRecordDetailHook = <
  T_Id extends number | string = number,
  T_Response = T_ResourceRecord,
>(
  resourceKey: string,
): T_DetailServiceHook<T_Id, T_Response> =>
  detailHook<T_Id, T_Response>(resourceRecordsPath(resourceKey), axiosGet, useAuthResources)

const resourceRecordUpdateHook = <
  T_Id extends number | string = number,
  T_RequestData = T_ResourceRecord,
  T_Response = T_ResourceRecord,
>(
  resourceKey: string,
): T_UpdateServiceHook<T_Id, T_RequestData, T_Response> =>
  updateHook<T_Id, T_RequestData, T_Response>(resourceRecordsPath(resourceKey), axiosPatch, useAuthResources)

const resourceRecordDeleteHook = <
  T_Id extends number | string = number,
  T_Response = I_DeletionCommonResponse,
>(
  resourceKey: string,
): T_DeletionServiceHook<T_Id, T_Response> =>
  deletionHook<T_Id, T_Response>(resourceRecordsPath(resourceKey), axiosDelete, useAuthResources)

const resourceRecordBatchDeleteHook = <T_Id extends number | string = number>(
  resourceKey: string,
): T_BatchDeletionServiceHook<T_Id> => {
  const path = resourceRecordsPath(resourceKey)
  return (d: {
    entityName: EntityName
    showConfirm: I_UseConfirm['showConfirm']
    reload: T_VoidFn
  }) => {
    const authResources = useAuthResources()
    const { setIsInProgress, setIsNotInProgress } = useInProgress()

    return (ids: Array<T_Id>) => {
      const isJustOne = ids.length === 1
      const title = isJustOne
        ? `Eliminar ${d.entityName.singular} con ID# ${ids}.`
        : `Eliminar ${d.entityName.plural} con IDs# ${ids.join(', ')}.`

      d.showConfirm(title, '¿Estás seguro/a que querés proceder?').then(() => {
        setIsInProgress()
        axiosDelete<I_DeletionCommonResponse, T_BatchDeletionCommonRequestData<T_Id>>({
          url: `${apiUrl(path)}/`,
          requestSetup: authResources,
          data: { ids },
        })
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
}

export {
  resourceRecordsPath,
  resourceFieldOptionsPath,
  resourceRecordBatchDeleteHook,
  resourceRecordCreateHook,
  resourceRecordDeleteHook,
  resourceRecordDetailHook,
  resourceRecordListHook,
  resourceRecordUpdateHook,
  useResourceFieldOptions,
  useResourceSchema,
}
