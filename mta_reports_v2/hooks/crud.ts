import pages from '@/pages'
import { useAuthResources } from '@/mta_auth/hooks'
import { axiosDelete, axiosGet, axiosPost } from '@/shared/data/axios'
import { actionHook, batchDeletionHook, creationHook, listHook, navigationHook } from '@/shared/hooks'
import { I_CreationCommonResponse, T_EmptyPayload } from '@/shared/types'
import type { I_AuroraReportCreateRequestData, T_AuroraReportList } from '@/mta_reports_v2/types'

type T_AuroraReportRegenerateAllResponse = {
  status: 'generated' | 'already_complete' | 'no_eligible_schools'
  created_count?: number
}

const AURORA_REPORTS_PATH = '/reportes-aurora'

const useAuroraReportList = listHook<T_AuroraReportList>(AURORA_REPORTS_PATH, axiosGet, useAuthResources)
const useAuroraReportCreate = creationHook<I_AuroraReportCreateRequestData, I_CreationCommonResponse>(
  AURORA_REPORTS_PATH,
  axiosPost,
  useAuthResources,
)
const useAuroraReportBatchDelete = batchDeletionHook<number>(AURORA_REPORTS_PATH, axiosDelete, useAuthResources)
const useAuroraReportRegenerateAll = actionHook<T_EmptyPayload, T_AuroraReportRegenerateAllResponse>(
  `${AURORA_REPORTS_PATH}/regenerate-all-missing`,
  axiosPost,
  useAuthResources,
)

const useNavigateToAuroraReportList = navigationHook(pages.D._.reportesAurora.path)
const useNavigateToAuroraReportCreate = navigationHook(pages.D._.reportesAurora._.agregar.path)

export {
  useAuroraReportList,
  useAuroraReportCreate,
  useAuroraReportBatchDelete,
  useAuroraReportRegenerateAll,
  useNavigateToAuroraReportList,
  useNavigateToAuroraReportCreate,
}
