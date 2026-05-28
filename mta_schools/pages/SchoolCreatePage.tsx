'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { SCHOOL_NAME } from '@/mta_schools/constants'
import { useNavigateToSchoolList, useSchoolCreate } from '@/mta_schools/hooks'
import ResourceCreationPage from '@/shared/resources/ResourceCreationPage'

const SchoolCreatePage = () => {
  const navigateToSchoolList = useNavigateToSchoolList()

  return (
    <ResourceCreationPage
      resourceKey="school"
      entityName={SCHOOL_NAME}
      useCreate={useSchoolCreate}
      onCancel={navigateToSchoolList}
      onCreated={navigateToSchoolList}
    />
  )
}

export default withAuth(SchoolCreatePage, {
  allowedCapabilities: ['manage_schools'],
  logoutDestination: 'dashboard',
})
