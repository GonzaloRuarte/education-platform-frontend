import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_ReportDetail,
  I_ReportUpdateRequestData,
  I_ReportCreateRequestData,
  T_ReportId,
} from '@/mta_reports/types'
import { axiosPatch, axiosPost } from '@/shared/data/axios'
import { creationHook, updateHook, navigationHook } from '@/shared/hooks'
import pages from '@/pages'

const useReportCreate = creationHook<I_ReportCreateRequestData, I_ReportDetail>(
  '/reports',
  axiosPost,
  useAuthResources,
)
const useReportUpdate = updateHook<T_ReportId, I_ReportUpdateRequestData, I_ReportDetail>(
  '/reports',
  axiosPatch,
  useAuthResources,
)
const useNavigateToReportList = navigationHook(pages.D._.reportes.path)

export { useReportCreate, useReportUpdate, useNavigateToReportList }
