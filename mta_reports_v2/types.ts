import { I_PaginatedResponse } from '@/shared/data/types'

type T_ReportId = number
interface I_ReportListItem {
  id: T_ReportId
  school: number
  title: string
}
type T_ReportList = I_PaginatedResponse<I_ReportListItem>

interface I_ReportDetail {
  id: T_ReportId
  school: number
  title: string
  power_bi_link: string | URL
}

interface I_ReportCreateRequestData {
  school: number
  title: string
  power_bi_link: string | URL
}

interface I_ReportUpdateRequestData {
  school: number
  title: string
  power_bi_link: string | URL
}

export type {
  T_ReportId,
  I_ReportListItem,
  I_ReportDetail,
  I_ReportCreateRequestData,
  I_ReportUpdateRequestData,
  T_ReportList,
}