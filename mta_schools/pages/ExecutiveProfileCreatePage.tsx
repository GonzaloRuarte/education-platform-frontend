'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import ExecutiveProfileCreateForm from '@/mta_schools/components/ExecutiveProfileCreateForm'
import { EXECUTIVE_PROFILE_NAME, STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToSchoolList, useNavigateToExecutiveProfileList } from '@/mta_schools/hooks'
import CreationPage from '@/shared/pages/CreationPage'

const ExecutiveProfileCreatePage = () => {
  const navToList = useNavigateToExecutiveProfileList()

  return (
    <CreationPage
      CreationForm={ExecutiveProfileCreateForm}
      entityName={EXECUTIVE_PROFILE_NAME}
      onCancel={navToList}
    />
  )
}

export default withAuth(ExecutiveProfileCreatePage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
