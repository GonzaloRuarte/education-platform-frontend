'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { META_REPORT_BUNDLE_NAME } from '@/mta_meta/constants'
import { useMetaReportListHook, useNavigateToMetaReportDetail } from '@/mta_meta/hooks'
import Chip from '@/shared/components/Chip'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { GridColDef } from '@mui/x-data-grid'

const statusLabel = (s: string) => {
  if (s === 'P') return 'Pendiente'
  if (s === 'R') return 'Procesando'
  if (s === 'D') return 'Listo'
  if (s === 'F') return 'Falló'
  return s
}

const statusColor = (s: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
  if (s === 'D') return 'success'
  if (s === 'R') return 'info'
  if (s === 'P') return 'warning'
  if (s === 'F') return 'error'
  return 'default'
}

const columns: Array<GridColDef> = [
  idExposeColumn({ field: 'id', headerName: 'ID', flex: 0.6 }),
  {
    field: 'status',
    headerName: 'Estado',
    flex: 1,
    sortable: true,
    filterable: true,
    renderCell: ({ value }) => <Chip size="small" label={statusLabel(value)} color={statusColor(value)} />,
  },
  {
    field: 'version',
    headerName: 'Versión',
    flex: 0.8,
    sortable: true,
    filterable: true,
  },
  {
    field: 'arp_id',
    headerName: 'ARP',
    flex: 0.8,
    sortable: true,
    filterable: true,
  },
  {
    field: 'school_id',
    headerName: 'Escuela',
    flex: 1.6,
    sortable: true,
    filterable: true,
  },
  {
    field: 'grade',
    headerName: 'Año',
    flex: 0.8,
    sortable: true,
    filterable: true,
    valueGetter: (_v, row) => (row.grade ? `${row.grade}º` : ''),
  },
  {
    field: 'subject',
    headerName: 'Materia',
    flex: 1.2,
    sortable: true,
    filterable: true,
  },
  {
    field: 'generated_at',
    headerName: 'Generado',
    flex: 1.4,
    sortable: true,
    filterable: false,
    valueGetter: (_v, row) => (row.generated_at ? new Date(row.generated_at).toLocaleString() : ''),
  },
]

const MetaReportBundleListPage = () => {
  const navigateToDetail = useNavigateToMetaReportDetail()
  const useList = useMetaReportListHook()

  // Allow admins to click into details; for other roles, also allow
  const onRowClick = (params: any) => navigateToDetail({ bundleId: params.id })

  return (
    <ListPage
      columns={columns}
      useList={useList}
      entityName={META_REPORT_BUNDLE_NAME}
      onRowClick={onRowClick}
    />
  )
}

export default withAuth(MetaReportBundleListPage, {
  allowedUserProfiles: ['admin', 'school_staff', 'executive'],
  logoutDestination: 'dashboard',
})
