'use client'

import { useMemo, useState } from 'react'
import { Button } from '@mui/material'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { handleServiceError } from '@/shared/service'
import { successToast, warningToast } from '@/shared/toasts'
import { AURORA_REPORT_NAME } from '@/mta_reports_v2/constants'
import {
  useAuroraReportBatchDelete,
  useAuroraReportList,
  useAuroraReportRegenerateAll,
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
  const regenerateAll = useAuroraReportRegenerateAll()
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleRowClick = (params: GridRowParams<I_AuroraReportListItem>) => {
    window.open(`/reports/escuela/${params.row.school}`, '_blank')
  }

  const handleRegenerateAll = (reload: () => void) => {
    if (isRegenerating) return
    setIsRegenerating(true)
    regenerateAll()
      .then((res) => {
        if (res.status === 'generated') {
          successToast('Se generaron los reportes.')
          reload()
        } else if (res.status === 'already_complete') {
          warningToast('Ya se generaron todos los reportes.')
        } else if (res.status === 'no_eligible_schools') {
          warningToast('No hay escuelas con datos para reportar.')
        }
      })
      .catch(handleServiceError)
      .finally(() => {
        setIsRegenerating(false)
      })
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

  const customButtons = canEdit
    ? ({ reload }: { reload: () => void }) => (
      <Button
        onClick={() => handleRegenerateAll(reload)}
        startIcon={<AutorenewIcon />}
        disabled={isRegenerating}
      >
        {isRegenerating ? 'Generando…' : 'Generar reportes faltantes'}
      </Button>
    )
    : undefined

  return (
    <ListPage
      columns={columns}
      useList={useAuroraReportList}
      useBatchDelete={useAuroraReportBatchDelete}
      entityName={AURORA_REPORT_NAME}
      onCreate={navigateToAuroraReportCreate}
      customButtons={customButtons}
      onRowClick={handleRowClick}
    />
  )
}

export default withAuth(ReportesAuroraListPage, {
  allowedCapabilities: ['manage_admin_users'],
  logoutDestination: 'dashboard',
})
