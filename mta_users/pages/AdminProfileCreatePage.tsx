'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import AdminProfileCreateForm from '@/mta_users/components/AdminProfileCreateForm'
import { ADMIN_PROFILE_NAME } from '@/mta_users/constants'
import { useNavigateToAdminProfileList } from '@/mta_users/hooks'
import CreationPage from '@/shared/pages/CreationPage'

const AdminProfileCreatePage = () => {
  const navToList = useNavigateToAdminProfileList()

  return <CreationPage CreationForm={AdminProfileCreateForm} entityName={ADMIN_PROFILE_NAME} onCancel={navToList} />
}

export default withAuth(AdminProfileCreatePage, {
  allowedUserProfiles: ['admin'],
  logoutDestination: 'dashboard',
})
