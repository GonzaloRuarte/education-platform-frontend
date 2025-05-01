'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import SchoolCreateForm from '@/mta_schools/components/SchoolCreateForm'
import { SCHOOL_NAME } from '@/mta_schools/constants'
import { useNavigateToSchoolList } from '@/mta_schools/hooks'
import CreationPage from '@/shared/pages/CreationPage'

const SchoolCreatePage = () => {
  const navigateToSchoolList = useNavigateToSchoolList()

  return <CreationPage CreationForm={SchoolCreateForm} entityName={SCHOOL_NAME} onCancel={navigateToSchoolList} />
}

export default withAuth(SchoolCreatePage, {
  allowedUserProfiles: ['admin'],
  logoutDestination: 'dashboard',
})
