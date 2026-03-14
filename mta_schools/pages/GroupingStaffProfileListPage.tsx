'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { GROUPING_STAFF_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useGroupingStaffProfileBatchDelete,
  useGroupingStaffProfileList,
  useNavigateToGroupingStaffProfileCreate,
  useNavigateToGroupingStaffProfileDetail,
} from '@/mta_schools/hooks'
import { I_GroupingStaffProfileListItem } from '@/mta_schools/types'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef<I_GroupingStaffProfileListItem>> = [
  idExposeColumn({ field: 'username', headerName: 'Usuario', flex: 1.2 }),
  { field: 'grouping_name', headerName: 'Agrupamiento', flex: 1.5 },
  { field: 'email', headerName: 'Email', flex: 1.4 },
  { field: 'first_name', headerName: 'Nombre', flex: 1 },
  { field: 'last_name', headerName: 'Apellido', flex: 1 },
]

const GroupingStaffProfileListPage = () => {
  const navToDetail = useNavigateToGroupingStaffProfileDetail()
  const navToCreate = useNavigateToGroupingStaffProfileCreate()

  return (
    <ListPage
      columns={columns}
      useList={useGroupingStaffProfileList}
      entityName={GROUPING_STAFF_PROFILE_NAME}
      onRowClick={ListPage.mapNavToOnRowClick(navToDetail)}
      onCreate={navToCreate}
      useBatchDelete={useGroupingStaffProfileBatchDelete}
    />
  )
}

export default withAuth(GroupingStaffProfileListPage, {
  allowedCapabilities: ['manage_groupings'],
  logoutDestination: 'dashboard',
})
