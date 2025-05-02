'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { REPORT_NAME } from '@/mta_reports/constants'
import { useReportList } from '@/mta_reports/hooks'
import { SCHOOL_NAME } from '@/mta_schools/constants'
import {
  useNavigateToSchoolCreate,
  useNavigateToSchoolDetail,
  useSchoolBatchDelete,
  useSchoolList,
} from '@/mta_schools/hooks'
import ListPage from '@/shared/pages/ListPage'
import { Chip } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'title', headerName: 'Título', flex: 1.5 },
  { field: 'url', headerName: 'Link', flex: 1 },
]

const ReportsListPage = () => {
  // const navigateToSchoolDetail = useNavigateToSchoolDetail()
  const navigateToSchoolCreate = useNavigateToSchoolCreate()

  return (
    <ListPage
      columns={columns}
      useList={useReportList}
      entityName={REPORT_NAME}
      // onRowClick={ListPage.mapNavToOnRowClick(navigateToSchoolDetail)}
      // onCreate={navigateToSchoolCreate}
      // useBatchDelete={useSchoolBatchDelete}
    />
  )
}

export default withAuth(ReportsListPage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
