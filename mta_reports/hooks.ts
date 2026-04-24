import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_ReportDetail,
  I_ReportUpdateRequestData,
  I_ReportCreateRequestData,
  T_ReportId,
  T_ReportList,
} from '@/mta_reports/types'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import { creationHook, deletionHook, detailHook, listHook, updateHook, batchDeletionHook, dynamicNavigationHook, navigationHook } from '@/shared/hooks'
import pages from '@/pages'
import { reportEditPath } from '@/pages'

const REPORTS_PATH = '/reports'

const useReportList = listHook<T_ReportList>(REPORTS_PATH, axiosGet, useAuthResources)
const useReportListByUserSchool = listHook<T_ReportList>(
  `${REPORTS_PATH}/list-by-user-school`,
  axiosGet,
  useAuthResources,
)



const useReportDetail = detailHook<T_ReportId, I_ReportDetail>(REPORTS_PATH, axiosGet, useAuthResources)

const useReportCreate = creationHook<I_ReportCreateRequestData, I_ReportDetail>(
  REPORTS_PATH,
  axiosPost,
  useAuthResources,
)
const useReportUpdate = updateHook<T_ReportId, I_ReportUpdateRequestData, I_ReportDetail>(
  REPORTS_PATH,
  axiosPatch,
  useAuthResources,
)
const useReportDelete = deletionHook<T_ReportId>(REPORTS_PATH, axiosDelete, useAuthResources)
const useReportBatchDelete = batchDeletionHook<T_ReportId>(REPORTS_PATH, axiosDelete, useAuthResources)

const useNavigateToReportCreate = navigationHook(pages.D._.reportes._.agregar.path)
const useNavigateToReportEdit = dynamicNavigationHook(reportEditPath)
const useNavigateToReportList = navigationHook(pages.D._.reportes.path)

export { useReportCreate, useReportList, useReportListByUserSchool, useReportDetail, useReportUpdate, useReportDelete, useReportBatchDelete, useNavigateToReportCreate, useNavigateToReportEdit, useNavigateToReportList, REPORTS_PATH }