'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { GROUPING_NAME } from '@/mta_schools/constants'
import { useGroupingDelete, useGroupingDetail, useGroupingUpdate, useNavigateToGroupingList } from '@/mta_schools/hooks'
import ResourceEditionPage from '@/shared/resources/ResourceEditionPage'

const GroupingEditPage = () => (
  <ResourceEditionPage
    resourceKey="grouping"
    entityName={GROUPING_NAME}
    useDelete={useGroupingDelete}
    useDetail={useGroupingDetail}
    useUpdate={useGroupingUpdate}
    onExit={useNavigateToGroupingList()}
  />
)

export default withAuth(GroupingEditPage, {
  allowedCapabilities: ['manage_groupings'],
  logoutDestination: 'dashboard',
})
