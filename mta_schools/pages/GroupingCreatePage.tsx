'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { GROUPING_NAME } from '@/mta_schools/constants'
import { useGroupingCreate, useNavigateToGroupingList } from '@/mta_schools/hooks'
import ResourceCreationPage from '@/shared/resources/ResourceCreationPage'

const GroupingCreatePage = () => {
  const navToList = useNavigateToGroupingList()

  return (
    <ResourceCreationPage
      resourceKey="grouping"
      entityName={GROUPING_NAME}
      useCreate={useGroupingCreate}
      onCancel={navToList}
      onCreated={navToList}
    />
  )
}

export default withAuth(GroupingCreatePage, {
  allowedCapabilities: ['manage_groupings'],
  logoutDestination: 'dashboard',
})
