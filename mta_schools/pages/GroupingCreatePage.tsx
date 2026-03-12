'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import GroupingCreateForm from '@/mta_schools/components/GroupingCreateForm'
import { GROUPING_NAME } from '@/mta_schools/constants'
import { useNavigateToGroupingList } from '@/mta_schools/hooks'
import CreationPage from '@/shared/pages/CreationPage'

const GroupingCreatePage = () => {
  const navToList = useNavigateToGroupingList()

  return <CreationPage CreationForm={GroupingCreateForm} entityName={GROUPING_NAME} onCancel={navToList} />
}

export default withAuth(GroupingCreatePage, {
  allowedCapabilities: ['manage_groupings'],
  logoutDestination: 'dashboard',
})
