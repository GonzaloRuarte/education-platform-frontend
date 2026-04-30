import pages from '@/pages'
import { useAuthResources } from '@/mta_auth/hooks'
import { axiosDelete, axiosGet, axiosPost } from '@/shared/data/axios'
import { batchDeletionHook, creationHook, listHook, navigationHook } from '@/shared/hooks'
import { I_CreationCommonResponse } from '@/shared/types'
import type { I_AuroraReportCreateRequestData, T_AuroraReportList } from '@/mta_reports_v2/types'

const AURORA_REPORTS_PATH = '/reportes-aurora'

const useAuroraReportList = listHook<T_AuroraReportList>(AURORA_REPORTS_PATH, axiosGet, useAuthResources)
const useAuroraReportCreate = creationHook<I_AuroraReportCreateRequestData, I_CreationCommonResponse>(
  AURORA_REPORTS_PATH,
  axiosPost,
  useAuthResources,
)
const useAuroraReportBatchDelete = batchDeletionHook<number>(AURORA_REPORTS_PATH, axiosDelete, useAuthResources)

const useNavigateToAuroraReportList = navigationHook(pages.D._.reportesAurora.path)
const useNavigateToAuroraReportCreate = navigationHook(pages.D._.reportesAurora._.agregar.path)

export {
  useAuroraReportList,
  useAuroraReportCreate,
  useAuroraReportBatchDelete,
  useNavigateToAuroraReportList,
  useNavigateToAuroraReportCreate,
  AURORA_REPORTS_PATH,
}
