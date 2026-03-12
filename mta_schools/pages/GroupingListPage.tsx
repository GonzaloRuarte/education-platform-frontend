'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { GROUPING_NAME } from '@/mta_schools/constants'
import {
  useGroupingBatchDelete,
  useGroupingList,
  useNavigateToGroupingCreate,
  useNavigateToGroupingDetail,
} from '@/mta_schools/hooks'
import { I_GroupingListItem } from '@/mta_schools/types'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef<I_GroupingListItem>> = [
  idExposeColumn({ field: 'name', headerName: 'Nombre', flex: 1.5 }),
  { field: 'schools_count', headerName: 'Cantidad de escuelas', flex: 1 },
]

const GroupingListPage = () => {
  const navToDetail = useNavigateToGroupingDetail()
  const navToCreate = useNavigateToGroupingCreate()

  return (
    <ListPage
      columns={columns}
      useList={useGroupingList}
      entityName={GROUPING_NAME}
      onRowClick={ListPage.mapNavToOnRowClick(navToDetail)}
      onCreate={navToCreate}
      useBatchDelete={useGroupingBatchDelete}
    />
  )
}

export default withAuth(GroupingListPage, {
  allowedCapabilities: ['manage_groupings'],
  logoutDestination: 'dashboard',
})
