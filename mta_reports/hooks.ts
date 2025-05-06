import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_ReportCreateRequestData,
  I_ReportDetail,
  I_ReportUpdateRequestData,
  T_ReportId,
  T_ReportList,
} from '@/mta_reports/types'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import { creationHook, deletionHook, detailHook, listHook, updateHook } from '@/shared/hooks'

const REPORTS_PATH = '/reports'

export const useReportList = listHook<T_ReportList>(REPORTS_PATH, axiosGet, useAuthResources)
export const useReportDetail = detailHook<T_ReportId, I_ReportDetail>(REPORTS_PATH, axiosGet, useAuthResources)
export const useReportCreate = creationHook<I_ReportCreateRequestData, I_ReportDetail>(
  REPORTS_PATH,
  axiosPost,
  useAuthResources,
)
export const useReportUpdate = updateHook<T_ReportId, I_ReportUpdateRequestData, I_ReportDetail>(
  REPORTS_PATH,
  axiosPatch,
  useAuthResources,
)
export const useReportDelete = deletionHook<T_ReportId>(REPORTS_PATH, axiosDelete, useAuthResources)
