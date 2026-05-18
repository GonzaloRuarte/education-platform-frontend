'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { GROUPING_NAME } from '@/mta_schools/constants'
import {
  useGroupingBatchDelete,
  useGroupingList,
  useNavigateToGroupingCreate,
  useNavigateToGroupingDetail,
} from '@/mta_schools/hooks'
import ResourceListPage from '@/shared/resources/ResourceListPage'

const GroupingListPage = () => {
  const navToDetail = useNavigateToGroupingDetail()
  const navToCreate = useNavigateToGroupingCreate()

  return (
    <ResourceListPage
      resourceKey="grouping"
      useList={useGroupingList}
      entityName={GROUPING_NAME}
      onRowClickId={navToDetail}
      onCreate={navToCreate}
      useBatchDelete={useGroupingBatchDelete}
    />
  )
}

export default withAuth(GroupingListPage, {
  allowedCapabilities: ['manage_groupings'],
  logoutDestination: 'dashboard',
})
