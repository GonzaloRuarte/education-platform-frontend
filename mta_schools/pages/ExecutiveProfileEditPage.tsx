'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import ExecutiveProfileUpdateForm from '@/mta_schools/components/ExecutiveProfileUpdateForm'
import { EXECUTIVE_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useNavigateToExecutiveProfileList,
  useExecutiveProfileDelete,
  useExecutiveProfileDetail,
} from '@/mta_schools/hooks'
import { I_ExecutiveProfileDetail, T_ExecutiveProfileId } from '@/mta_schools/types'
import { useNavigateToUserChangePassword } from '@/mta_users/hooks'
import { ChangePasswordButton } from '@/shared/components/buttons'
import EditionPage from '@/shared/pages/EditionPage'

const ExecutiveProfileEditPage = () => {
  const navToList = useNavigateToExecutiveProfileList()
  const navigateToChangePassword = useNavigateToUserChangePassword()

  return (
    <EditionPage<T_ExecutiveProfileId, I_ExecutiveProfileDetail>
      EditionForm={ExecutiveProfileUpdateForm}
      entityName={EXECUTIVE_PROFILE_NAME}
      onExit={navToList}
      useDetail={useExecutiveProfileDetail}
      useDelete={useExecutiveProfileDelete}
      customButtons={(data) => (
        <>
          <ChangePasswordButton onClick={() => navigateToChangePassword({ userId: data.user_id })} />
        </>
      )}
    />
  )
}

export default withAuth(ExecutiveProfileEditPage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
