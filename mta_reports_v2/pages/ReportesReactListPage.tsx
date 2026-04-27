'use client'

import { Stack, Chip } from '@mui/material'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import Button from '@/shared/components/Button'
import ListPage from '@/shared/pages/ListPage'
import { ESCUELA_REPORTE_NAME } from '@/mta_reports_v2/constants'
import { useEscuelaReporteReactListForPage, useBustCacheEscuela, useNavigateToEscuelaReporte } from '@/mta_reports_v2/hooks'
import type { I_EscuelaListItem } from '@/mta_reports_v2/types'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef<I_EscuelaListItem>> = [
  { field: 'nombre', headerName: 'Escuela', flex: 2 },
  {
    field: 'tomas',
    headerName: 'Tomas disponibles',
    flex: 2,
    renderCell: (p) => (
      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
        {p.value?.map((t: string) => (
          <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 24 }} />
        ))}
      </Stack>
    ),
  },
  { field: 'ultima_toma', headerName: 'Última toma', flex: 1 },
]

function ReportesReactListPage() {
  const navToEscuela = useNavigateToEscuelaReporte()
  const { bust, bustingId } = useBustCacheEscuela()
  const canManage = useHasCapabilities(['manage_reports'])

  return (
    <ListPage
      columns={columns}
      useList={useEscuelaReporteReactListForPage}
      entityName={ESCUELA_REPORTE_NAME}
      onRowClick={ListPage.mapNavToOnRowClick((id) => navToEscuela({ escuelaId: id as number }))}
      singleSelectionButtons={(id) =>
        canManage ? (
          <Button
            size="small"
            variant="outlined"
            disabled={bustingId === id}
            onClick={() => bust(id as number)}
          >
            {bustingId === id ? 'Regenerando…' : 'Regenerar'}
          </Button>
        ) : null
      }
    />
  )
}

export default withAuth(ReportesReactListPage, {
  allowedCapabilities: ['view_reports'],
  logoutDestination: 'dashboard',
})
