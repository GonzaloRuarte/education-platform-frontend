'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import { REPORT_NAME } from '@/mta_reports/constants'
import { useSchoolScopeResources } from '@/mta_schools/hooks/state'
import Spinner from '@/shared/components/Spinner'
import Page from '@/shared/components/Page'
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
import { Alert } from '@mui/material'

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
  const canManageReports = useHasCapabilities(['manage_reports'])
  const { selectedSchool, shouldSelectSchool, isLoading } = useSchoolScopeResources()

  if (isLoading) return <Spinner />

  if (!canManageReports && shouldSelectSchool && selectedSchool === null) {
    return (
      <Page>
        <Page.Title>Listado de {REPORT_NAME.plural}</Page.Title>
        <Page.Content>
          <Alert severity="info">Seleccioná una escuela para ver los reportes disponibles.</Alert>
        </Page.Content>
      </Page>
    )
  }

  const useReportListHook = canManageReports ? useReportList : useReportListByUserSchool

  const handleRowClick = canManageReports
    ? (params: any) => navigateToReportEdit({ reportId: params.id })
    : undefined

  const createProp = canManageReports ? { onCreate: navigateToReportCreate } : {}
  const batchDeleteProp = canManageReports ? { useBatchDelete: useReportBatchDelete } : {}
  const filtersData = !canManageReports && selectedSchool !== null ? { school_id: selectedSchool?.id } : undefined
  const stateKey = !canManageReports ? `scope-${selectedSchool?.id ?? 'all-accessible'}` : undefined

  return (
    <ListPage
      columns={columns}
      useList={useReportListHook}
      filtersData={filtersData}
      stateKey={stateKey}
      entityName={REPORT_NAME}
      onRowClick={handleRowClick}
      {...batchDeleteProp}
      {...createProp}
    />
  )
}

export default withAuth(ReportsListPage, {
  allowedCapabilities: ['view_reports'],
  logoutDestination: 'dashboard',
})