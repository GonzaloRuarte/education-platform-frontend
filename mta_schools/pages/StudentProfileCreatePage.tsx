'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToStudentProfileList, useStudentProfileCreate } from '@/mta_schools/hooks'
import { useSchoolScopeResources } from '@/mta_schools/hooks/state'
import Spinner from '@/shared/components/Spinner'
import ResourceCreationPage from '@/shared/resources/ResourceCreationPage'

const StudentProfileCreatePage = () => {
  const navToList = useNavigateToStudentProfileList()
  const { isLoading, selectedSchool } = useSchoolScopeResources()

  if (isLoading || selectedSchool === undefined) return <Spinner />

  return (
    <ResourceCreationPage
      resourceKey="student_profile"
      entityName={STUDENT_PROFILE_NAME}
      useCreate={useStudentProfileCreate}
      onCancel={navToList}
      onCreated={navToList}
      initialData={selectedSchool !== null ? { school: selectedSchool.id } : undefined}
    />
  )
}

export default withAuth(StudentProfileCreatePage, {
  allowedCapabilities: ['manage_students'],
  logoutDestination: 'dashboard',
})
