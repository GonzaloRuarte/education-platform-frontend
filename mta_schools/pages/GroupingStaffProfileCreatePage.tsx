'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import GroupingStaffProfileCreateForm from '@/mta_schools/components/GroupingStaffProfileCreateForm'
import { GROUPING_STAFF_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToGroupingStaffProfileList } from '@/mta_schools/hooks'
import CreationPage from '@/shared/pages/CreationPage'

const GroupingStaffProfileCreatePage = () => {
  const navToList = useNavigateToGroupingStaffProfileList()

  return (
    <CreationPage
      CreationForm={GroupingStaffProfileCreateForm}
      entityName={GROUPING_STAFF_PROFILE_NAME}
      onCancel={navToList}
    />
  )
}

export default withAuth(GroupingStaffProfileCreatePage, {
  allowedCapabilities: ['manage_groupings'],
  logoutDestination: 'dashboard',
})
