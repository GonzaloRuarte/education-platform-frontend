'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import GroupingStaffAnonymizedProfileCreateForm from '@/mta_schools/components/GroupingStaffAnonymizedProfileCreateForm'
import { GROUPING_STAFF_ANON_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToGroupingStaffAnonymizedProfileList } from '@/mta_schools/hooks'
import CreationPage from '@/shared/pages/CreationPage'

const GroupingStaffAnonymizedProfileCreatePage = () => {
  const navToList = useNavigateToGroupingStaffAnonymizedProfileList()

  return (
    <CreationPage
      CreationForm={GroupingStaffAnonymizedProfileCreateForm}
      entityName={GROUPING_STAFF_ANON_PROFILE_NAME}
      onCancel={navToList}
    />
  )
}

export default withAuth(GroupingStaffAnonymizedProfileCreatePage, {
  allowedCapabilities: ['manage_groupings'],
  logoutDestination: 'dashboard',
})
