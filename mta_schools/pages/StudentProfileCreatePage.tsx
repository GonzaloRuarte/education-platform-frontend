'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import StudentProfileCreateForm from '@/mta_schools/components/StudentProfileCreateForm'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToStudentProfileList, useSchoolAllNames } from '@/mta_schools/hooks'
import { useSchoolScopeResources } from '@/mta_schools/hooks/state'
import Spinner from '@/shared/components/Spinner'
import CreationPage from '@/shared/pages/CreationPage'

const StudentProfileCreatePage = () => {
  const navToList = useNavigateToStudentProfileList()
  const { isLoading, selectedSchool } = useSchoolScopeResources()
  const { data: schools, isLoading: isSchoolsLoading } = useSchoolAllNames()

  if (isLoading || isSchoolsLoading || schools === undefined || selectedSchool === undefined) return <Spinner />

  return (
    <CreationPage
      CreationForm={() => (
        <StudentProfileCreateForm
          selectedSchool={selectedSchool}
          availableSchools={schools}
          lockSchool={schools.length === 1}
        />
      )}
      entityName={STUDENT_PROFILE_NAME}
      onCancel={navToList}
    />
  )
}

export default withAuth(StudentProfileCreatePage, {
  allowedCapabilities: ['manage_students'],
  logoutDestination: 'dashboard',
})
