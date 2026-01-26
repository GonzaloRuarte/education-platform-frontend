import { I_PaginatedResponse } from '@/shared/data/types'

// ----------------------------
// Micro bundles (legacy)
// ----------------------------

type T_MetaReportBundleId = number

type T_MetaReportBundleStatus = 'P' | 'R' | 'D' | 'F'

interface I_MetaReportBundleListItem {
  id: T_MetaReportBundleId
  arp_id: number
  appointment_id?: number | null
  school_id?: number | null
  grade?: string | number | null
  subject?: string | number | null

  status: T_MetaReportBundleStatus
  version: number
  storage_prefix?: string
  manifest_path?: string
  generated_at?: string | null
  error_message?: string
  created_at?: string
  updated_at?: string

  // Your backend may include extra denormalized fields for display
  [key: string]: any
}

type T_MetaReportBundleList = I_PaginatedResponse<I_MetaReportBundleListItem>

type T_MetaReportManifest = {
  arp_id: number
  storage_prefix: string
  grades: number[]
  files: {
    manifest?: string
    full_data_2?: string
    summaries?: string
    questions_stats?: string
    students_stats?: string
    datasets?: any
    [key: string]: any
  }
  [key: string]: any
}

// ----------------------------
// Global bundles (new)
// ----------------------------

type T_MetaReportGlobalBundleId = number

interface I_MetaReportGlobalBundleListItem {
  id: T_MetaReportGlobalBundleId
  scope_key: string
  school_id?: number | null

  status: T_MetaReportBundleStatus
  version: number
  storage_prefix?: string
  manifest_path?: string
  generated_at?: string | null
  error_message?: string
  created_at?: string
  updated_at?: string

  // Extra fields may be included by the API
  [key: string]: any
}

export type {
  // Micro
  T_MetaReportBundleId,
  T_MetaReportBundleStatus,
  I_MetaReportBundleListItem,
  T_MetaReportBundleList,
  T_MetaReportManifest,

  // Global
  T_MetaReportGlobalBundleId,
  I_MetaReportGlobalBundleListItem,
}
