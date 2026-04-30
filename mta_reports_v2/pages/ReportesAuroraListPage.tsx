'use client'

import { useMemo } from 'react'
import { Button } from '@mui/material'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { AURORA_REPORT_NAME } from '@/mta_reports_v2/constants'
import {
  useAuroraReportBatchDelete,
  useAuroraReportList,
  useNavigateToAuroraReportCreate,
} from '@/mta_reports_v2/hooks'
import type { I_AuroraReportListItem } from '@/mta_reports_v2/types'
import { GridColDef, GridRowParams } from '@mui/x-data-grid'

const baseColumns: Array<GridColDef<I_AuroraReportListItem>> = [
  idExposeColumn({ field: 'school_name', headerName: 'Escuela', flex: 1.6 }),
  { field: 'toma', headerName: 'Toma', flex: 0.6 },
]

function ReportesAuroraListPage() {
  const navigateToAuroraReportCreate = useNavigateToAuroraReportCreate()
  const canEdit = useHasCapabilities(['manage_reports'])

  const handleRowClick = (params: GridRowParams<I_AuroraReportListItem>) => {
    window.open(`/reports/escuela/${params.row.school}`, '_blank')
  }

  const columns = useMemo<Array<GridColDef<I_AuroraReportListItem>>>(() => {
    if (!canEdit) return baseColumns
    return [
      ...baseColumns,
      {
        field: 'actions',
        headerName: 'Acciones',
        flex: 0.4,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Button
            size="medium"
            variant="contained"
            onClick={(e) => {
              e.stopPropagation()
              window.open(`/reports/escuela/${row.school}?edit=1`, '_blank')
            }}
          >
            Editar
          </Button>
        ),
      },
    ]
  }, [canEdit])

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
