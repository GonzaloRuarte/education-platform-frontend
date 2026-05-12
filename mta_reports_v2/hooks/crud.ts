import { useCallback } from 'react'
import pages from '@/pages'
import { apiUrl } from '@/config'
import { useAuthResources } from '@/mta_auth/hooks'
import { axiosDelete, axiosGet, axiosPost } from '@/shared/data/axios'
import { actionHook, batchDeletionHook, creationHook, listHook, navigationHook } from '@/shared/hooks'
import { I_CreationCommonResponse, T_EmptyPayload } from '@/shared/types'
import type {
  I_AuroraReportCreateRequestData,
  I_AuroraReportListItem,
  T_AuroraReportList,
} from '@/mta_reports_v2/types'

type T_AuroraReportRegenerateAllRequestData = {
  // True = sólo generar pares faltantes (no toca blobs ya generados).
  // False / ausente = regenerar TODOS los reportes (palanca para refrescar blobs stale).
  only_missing?: boolean
}

type T_AuroraReportRegenerateAllResponse = {
  status: 'generated' | 'already_complete' | 'no_eligible_schools'
  created_count?: number
  groupings_created?: number
  groupings_enqueued?: number
  only_missing?: boolean
}

export type T_AuroraReportRegenerateStatus =
  | { status: 'never'; year: number }
  | {
      status: 'running' | 'done' | 'failed' | 'cancelled'
      year: number
      run_id?: string
      started_at?: string
      finished_at?: string | null
      schools_total?: number
      schools_written?: number
      // Progreso de agrupamientos. Se popula al disparar "Generar reportes faltantes":
      // `groupings_total` cuenta los pares (grouping, toma) elegibles, `groupings_written`
      // los que ya escribieron blob en este run (filtrado por `groupings_started_at`).
      groupings_total?: number
      groupings_written?: number
      groupings_started_at?: string | null
      cancel_requested_at?: string | null
      // True si el run activo es "Generar reportes faltantes". El front lo usa para
      // mostrar la etiqueta de progreso sólo sobre el botón clickeado.
      only_missing?: boolean
      error?: string | null
      traceback?: string | null
    }

const AURORA_REPORTS_PATH = '/reportes-aurora'

const useAuroraReportList = listHook<T_AuroraReportList>(AURORA_REPORTS_PATH, axiosGet, useAuthResources)
const useAuroraReportCreate = creationHook<I_AuroraReportCreateRequestData, I_CreationCommonResponse>(
  AURORA_REPORTS_PATH,
  axiosPost,
  useAuthResources,
)
const useAuroraReportBatchDelete = batchDeletionHook<number>(AURORA_REPORTS_PATH, axiosDelete, useAuthResources)
const useAuroraReportRegenerateAll = actionHook<T_AuroraReportRegenerateAllRequestData, T_AuroraReportRegenerateAllResponse>(
  `${AURORA_REPORTS_PATH}/regenerate-all-missing`,
  axiosPost,
  useAuthResources,
)
const useAuroraReportCancelRegenerate = actionHook<T_EmptyPayload, T_AuroraReportRegenerateStatus>(
  `${AURORA_REPORTS_PATH}/cancel-regenerate`,
  axiosPost,
  useAuthResources,
)

const useAuroraReportRegenerateStatus = () => {
  const auth = useAuthResources()
  return useCallback(
    () =>
      axiosGet<T_AuroraReportRegenerateStatus>({
        url: apiUrl(`${AURORA_REPORTS_PATH}/regenerate-status/`),
        requestSetup: auth,
        options: {},
      }),
    [auth],
  )
}

const useAuroraReportPublish = () => {
  const auth = useAuthResources()
  return useCallback(
    (id: number) =>
      axiosPost<unknown, I_AuroraReportListItem>({
        url: apiUrl(`${AURORA_REPORTS_PATH}/${id}/publish/`),
        requestSetup: auth,
        options: {},
        data: {},
      }),
    [auth],
  )
}

const useAuroraReportUnpublish = () => {
  const auth = useAuthResources()
  return useCallback(
    (id: number) =>
      axiosPost<unknown, I_AuroraReportListItem>({
        url: apiUrl(`${AURORA_REPORTS_PATH}/${id}/unpublish/`),
        requestSetup: auth,
        options: {},
        data: {},
      }),
    [auth],
  )
}

const useNavigateToAuroraReportList = navigationHook(pages.D._.reportesAurora.path)
const useNavigateToAuroraReportCreate = navigationHook(pages.D._.reportesAurora._.agregar.path)

export {
  useAuroraReportList,
  useAuroraReportCreate,
  useAuroraReportBatchDelete,
  useAuroraReportRegenerateAll,
  useAuroraReportCancelRegenerate,
  useAuroraReportRegenerateStatus,
  useAuroraReportPublish,
  useAuroraReportUnpublish,
  useNavigateToAuroraReportList,
  useNavigateToAuroraReportCreate,
}
