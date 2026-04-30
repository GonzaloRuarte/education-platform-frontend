import pages from '@/pages'
import { useAuthResources } from '@/mta_auth/hooks'
import { axiosGet, axiosPost } from '@/shared/data/axios'
import { creationHook, listHook, navigationHook } from '@/shared/hooks'
import { I_CreationCommonResponse } from '@/shared/types'
import type { I_AuroraReportCreateRequestData, T_AuroraReportList } from '@/mta_reports_v2/types'

const AURORA_REPORTS_PATH = '/aurora-reports'

const useAuroraReportList = listHook<T_AuroraReportList>(AURORA_REPORTS_PATH, axiosGet, useAuthResources)
const useAuroraReportCreate = creationHook<I_AuroraReportCreateRequestData, I_CreationCommonResponse>(
  AURORA_REPORTS_PATH,
  axiosPost,
  useAuthResources,
)

const useNavigateToAuroraReportList = navigationHook(pages.D._.reportesAurora.path)
const useNavigateToAuroraReportCreate = navigationHook(pages.D._.reportesAurora._.agregar.path)

export {
  useAuroraReportList,
  useAuroraReportCreate,
  useNavigateToAuroraReportList,
  useNavigateToAuroraReportCreate,
  AURORA_REPORTS_PATH,
}
