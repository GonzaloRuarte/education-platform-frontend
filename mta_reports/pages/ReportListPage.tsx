'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useUserProfilesResources } from '@/mta_auth/hooks'
import { REPORT_NAME } from '@/mta_reports/constants'
import {
  useReportList,
  useReportBatchDelete,
  useNavigateToReportEdit,
  useNavigateToReportCreate,
  useReportListByUserSchool,
} from '@/mta_reports/hooks'
import Button from '@/shared/components/Button'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
  idExposeColumn({ field: 'title', headerName: 'Título', flex: 1.5 }),
  {
    field: 'power_bi_link',
    headerName: 'Link',
    flex: 1,
    renderCell: ({ row }) => (
      <Button
        size="small"
        onClick={(event) => {
          event.stopPropagation()
          window.open(row.power_bi_link, '_blank', 'noopener,noreferrer')
        }}
      >
        Ver reporte
      </Button>
    ),
  },
]

const ReportsListPage = () => {
  const navigateToReportEdit = useNavigateToReportEdit()
  const navigateToReportCreate = useNavigateToReportCreate()
  const { isAdmin } = useUserProfilesResources()

  const useReportListHook = isAdmin ? useReportList : useReportListByUserSchool

  // Only enable row click for admins
  const handleRowClick = isAdmin
    ? (params: any) => navigateToReportEdit({ reportId: params.id })
    : undefined

  // Only show "Agregar" for admins
  const createProp = isAdmin ? { onCreate: navigateToReportCreate } : {}

  return (
    <ListPage
      columns={columns}
      useList={useReportListHook}
      entityName={REPORT_NAME}
      onRowClick={handleRowClick}
      useBatchDelete={useReportBatchDelete}
      {...createProp}
    />
  )
}

export default withAuth(ReportsListPage, {
  allowedUserProfiles: ['admin', 'school_staff', 'executive'],
  logoutDestination: 'dashboard',
})