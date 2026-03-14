'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import GroupingStaffProfileUpdateForm from '@/mta_schools/components/GroupingStaffProfileUpdateForm'
import { GROUPING_STAFF_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useGroupingStaffProfileDelete,
  useGroupingStaffProfileDetail,
  useNavigateToGroupingStaffProfileList,
} from '@/mta_schools/hooks'
import { I_GroupingStaffProfileDetail, T_GroupingStaffProfileId } from '@/mta_schools/types'
import { useNavigateToUserChangePassword } from '@/mta_users/hooks'
import { ChangePasswordButton } from '@/shared/components/buttons'
import EditionPage from '@/shared/pages/EditionPage'

const GroupingStaffProfileEditPage = () => {
  const navToList = useNavigateToGroupingStaffProfileList()
  const navigateToChangePassword = useNavigateToUserChangePassword()

  return (
    <EditionPage<T_GroupingStaffProfileId, I_GroupingStaffProfileDetail>
      EditionForm={GroupingStaffProfileUpdateForm}
      entityName={GROUPING_STAFF_PROFILE_NAME}
      onExit={navToList}
      useDetail={useGroupingStaffProfileDetail}
      useDelete={useGroupingStaffProfileDelete}
      customButtons={(data) => <ChangePasswordButton onClick={() => navigateToChangePassword({ userId: data.user_id })} />}
    />
  )
}

export default withAuth(GroupingStaffProfileEditPage, {
  allowedCapabilities: ['manage_groupings'],
  logoutDestination: 'dashboard',
})
