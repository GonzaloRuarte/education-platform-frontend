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
    window.open(`/reports/escuela/${params.row.school}/toma/${params.row.toma}`, '_blank')
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
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}
        >
          <Select
            size="small"
            value={row.status}
            disabled={!canEdit || busyId === row.id}
            onChange={(e) =>
              handleChangeStatus(row, e.target.value as 'draft' | 'published')
            }
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: 999,
              '& .MuiSelect-icon': { color: 'primary.contrastText', fontSize: '1.25rem' },
              '& .MuiSelect-select': { py: '6px', pl: '12px', pr: '32px !important' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
              '&:hover': { bgcolor: 'primary.dark' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.dark' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
            }}
          >
            <MenuItem value="draft" sx={{ fontSize: '0.875rem' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EditIcon sx={{ fontSize: '1.125rem' }} />
                <span>Borrador</span>
              </Stack>
            </MenuItem>
            <MenuItem value="published" sx={{ fontSize: '0.875rem' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <VisibilityIcon sx={{ fontSize: '1.125rem' }} />
                <span>Publicado</span>
              </Stack>
            </MenuItem>
          </Select>
        </Box>
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
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Button
              size="medium"
              variant="contained"
              onClick={() => {
                window.open(`/reports/escuela/${row.school}/toma/${row.toma}?edit=1`, '_blank')
              }}
            >
              Editar
            </Button>
          </Box>
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
