'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import AdminProfileUpdateForm from '@/mta_users/components/AdminProfileUpdateForm'
import { ADMIN_PROFILE_NAME } from '@/mta_users/constants'
import {
  useAdminProfileDelete,
  useNavigateToAdminProfileList,
  useNavigateToUserChangePassword,
  useUserDetail,
} from '@/mta_users/hooks'
import { I_UserDetail, T_UserId } from '@/mta_users/types'
import { ChangePasswordButton } from '@/shared/components/buttons'
import EditionPage from '@/shared/pages/EditionPage'

const AdminProfileEditPage = () => {
  const navToList = useNavigateToAdminProfileList()
  const navigateToChangePassword = useNavigateToUserChangePassword()

  return (
    <EditionPage<T_UserId, I_UserDetail>
      EditionForm={AdminProfileUpdateForm}
      entityName={ADMIN_PROFILE_NAME}
      onExit={navToList}
      useDetail={useUserDetail}
      useDelete={useAdminProfileDelete}
      customButtons={(data) => (
        <>
          <ChangePasswordButton onClick={() => navigateToChangePassword({ userId: data.id })} />
        </>
      )}
    />
  )
}

export default withAuth(AdminProfileEditPage, {
  allowedCapabilities: ['manage_admin_users'],
  logoutDestination: 'dashboard',
})
