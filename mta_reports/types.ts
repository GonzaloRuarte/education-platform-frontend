import { I_PaginatedResponse } from '@/shared/data/types'

export type T_ReportId = number
export interface I_ReportListItem {
  id: T_ReportId
  school: number
  title: string
}
export type T_ReportList = I_PaginatedResponse<I_ReportListItem>

export interface I_ReportDetail {
  id: T_ReportId
  school: number
  title: string
  power_bi_link: string
  config: string
}

export interface I_ReportCreateRequestData {
  school: number
  title: string
  power_bi_link: string
  config: string
}

export interface I_ReportUpdateRequestData {
  school: number
  title: string
  power_bi_link: string
  config: string
}
