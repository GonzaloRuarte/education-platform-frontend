'use client'

import { useMemo, useRef, useState } from 'react'
import { Box, Button, MenuItem, Select, Stack } from '@mui/material'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
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
  useAuroraReportPublish,
  useAuroraReportRegenerateAll,
  useAuroraReportUnpublish,
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
  const publish = useAuroraReportPublish()
  const unpublish = useAuroraReportUnpublish()
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const reloadRef = useRef<(() => void) | null>(null)

  const handleChangeStatus = async (
    row: I_AuroraReportListItem,
    nextStatus: 'draft' | 'published',
  ) => {
    if (busyId !== null) return
    if (nextStatus === row.status) return
    setBusyId(row.id)
    try {
      if (nextStatus === 'published') {
        await publish(row.id)
        successToast('Reporte publicado.')
      } else {
        await unpublish(row.id)
        successToast('Reporte despublicado.')
      }
      reloadRef.current?.()
    } catch (err) {
      handleServiceError(err)
    } finally {
      setBusyId(null)
    }
  }

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
    const statusColumn: GridColDef<I_AuroraReportListItem> = {
      field: 'status',
      headerName: 'Estado',
      flex: 0.6,
      renderCell: ({ row }) => (
        <Select
          size="small"
          value={row.status}
          disabled={!canEdit || busyId === row.id}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            handleChangeStatus(row, e.target.value as 'draft' | 'published')
          }
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '& .MuiSelect-icon': { color: 'primary.contrastText' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
            '&:hover': { bgcolor: 'primary.dark' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.dark' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
          }}
        >
          <MenuItem value="draft">
            <Stack direction="row" spacing={1} alignItems="center">
              <EditIcon fontSize="small" />
              <span>Borrador</span>
            </Stack>
          </MenuItem>
          <MenuItem value="published">
            <Stack direction="row" spacing={1} alignItems="center">
              <VisibilityIcon fontSize="small" />
              <span>Publicado</span>
            </Stack>
          </MenuItem>
        </Select>
      ),
    }
    const cols = [...baseColumns, statusColumn]
    if (!canEdit) return cols
    return [
      ...cols,
      {
        field: 'actions',
        headerName: 'Acciones',
        flex: 0.6,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1}>
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
          </Stack>
        ),
      },
    ]
  }, [canEdit, busyId])

  const customButtons = canEdit
    ? ({ reload }: { reload: () => void }) => {
      reloadRef.current = reload
      return (
        <Button
          onClick={() => handleRegenerateAll(reload)}
          startIcon={<AutorenewIcon />}
          disabled={isRegenerating}
        >
          {isRegenerating ? 'Generando…' : 'Generar reportes faltantes'}
        </Button>
      )
    }
    : undefined

  return (
    <Box sx={{ height: '100%' }}>
      <ListPage
        columns={columns}
        useList={useAuroraReportList}
        useBatchDelete={useAuroraReportBatchDelete}
        entityName={AURORA_REPORT_NAME}
        onCreate={navigateToAuroraReportCreate}
        customButtons={customButtons}
        onRowClick={handleRowClick}
      />
    </Box>
  )
}

export default withAuth(ReportesAuroraListPage, {
  allowedCapabilities: ['manage_admin_users'],
  logoutDestination: 'dashboard',
})
