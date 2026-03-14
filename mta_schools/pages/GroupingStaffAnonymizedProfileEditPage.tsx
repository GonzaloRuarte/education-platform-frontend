'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import GroupingStaffAnonymizedProfileUpdateForm from '@/mta_schools/components/GroupingStaffAnonymizedProfileUpdateForm'
import { GROUPING_STAFF_ANON_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useGroupingStaffAnonymizedProfileDelete,
  useGroupingStaffAnonymizedProfileDetail,
  useNavigateToGroupingStaffAnonymizedProfileList,
} from '@/mta_schools/hooks'
import { I_GroupingStaffProfileDetail, T_GroupingStaffAnonymizedProfileId } from '@/mta_schools/types'
import { useNavigateToUserChangePassword } from '@/mta_users/hooks'
import { ChangePasswordButton } from '@/shared/components/buttons'
import EditionPage from '@/shared/pages/EditionPage'

const GroupingStaffAnonymizedProfileEditPage = () => {
  const navToList = useNavigateToGroupingStaffAnonymizedProfileList()
  const navigateToChangePassword = useNavigateToUserChangePassword()

  return (
    <EditionPage<T_GroupingStaffAnonymizedProfileId, I_GroupingStaffProfileDetail>
      EditionForm={GroupingStaffAnonymizedProfileUpdateForm}
      entityName={GROUPING_STAFF_ANON_PROFILE_NAME}
      onExit={navToList}
      useDetail={useGroupingStaffAnonymizedProfileDetail}
      useDelete={useGroupingStaffAnonymizedProfileDelete}
      customButtons={(data) => <ChangePasswordButton onClick={() => navigateToChangePassword({ userId: data.user_id })} />}
    />
  )
}

export default withAuth(GroupingStaffAnonymizedProfileEditPage, {
  allowedCapabilities: ['manage_groupings'],
  logoutDestination: 'dashboard',
})
