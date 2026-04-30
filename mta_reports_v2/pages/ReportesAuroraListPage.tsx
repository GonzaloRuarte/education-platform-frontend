'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { AURORA_REPORT_NAME } from '@/mta_reports_v2/constants'
import {
  useAuroraReportBatchDelete,
  useAuroraReportList,
  useNavigateToAuroraReportCreate,
  useNavigateToEscuelaReporte,
} from '@/mta_reports_v2/hooks'
import type { I_AuroraReportListItem } from '@/mta_reports_v2/types'
import { GridColDef, GridRowParams } from '@mui/x-data-grid'

const formatDateTime = (value: string | null): string => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('es-AR')
}

const columns: Array<GridColDef<I_AuroraReportListItem>> = [
  idExposeColumn({ field: 'school_name', headerName: 'Escuela', flex: 1.6 }),
  { field: 'toma', headerName: 'Toma', flex: 0.6 },
  {
    field: 'last_generated_at',
    headerName: 'Última generación',
    flex: 1,
    renderCell: ({ value }) => <>{formatDateTime(value as string | null)}</>,
  },
]

function ReportesAuroraListPage() {
  const navigateToAuroraReportCreate = useNavigateToAuroraReportCreate()
  const navigateToEscuelaReporte = useNavigateToEscuelaReporte()

  const handleRowClick = (params: GridRowParams<I_AuroraReportListItem>) => {
    navigateToEscuelaReporte({ escuelaId: params.row.school })
  }

  return (
    <ListPage
      columns={columns}
      useList={useAuroraReportList}
      useBatchDelete={useAuroraReportBatchDelete}
      entityName={AURORA_REPORT_NAME}
      onCreate={navigateToAuroraReportCreate}
      onRowClick={handleRowClick}
    />
  )
}

export default withAuth(ReportesAuroraListPage, {
  allowedCapabilities: ['manage_admin_users'],
  logoutDestination: 'dashboard',
})
