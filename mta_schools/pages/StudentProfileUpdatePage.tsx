'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import SelectedSchoolMismatchAlert from '@/mta_schools/components/SelectedSchoolMismatchAlert'
import StudentProfileUpdateForm from '@/mta_schools/components/StudentProfileUpdateForm'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToStudentProfileList, useSchoolAllNames, useStudentProfileDetail } from '@/mta_schools/hooks'
import { useSchoolScopeResources } from '@/mta_schools/hooks/state'
import Spinner from '@/shared/components/Spinner'
import EditionPage from '@/shared/pages/EditionPage'

const StudentProfileUpdatePage = () => {
  const navToList = useNavigateToStudentProfileList()
  const { isLoading, selectedSchool } = useSchoolScopeResources()
  const { data: schools, isLoading: isSchoolsLoading } = useSchoolAllNames()

  if (isLoading || isSchoolsLoading || schools === undefined || selectedSchool === undefined) return <Spinner />

  return (
    <EditionPage
      onExit={navToList}
      useDetail={useStudentProfileDetail}
      EditionForm={({ data }) => (
        <>
          <SelectedSchoolMismatchAlert
            entitySchool={schools.find((school) => school.id === data.school_id) ?? { id: data.school_id, name: `Escuela ${data.school_id}` }}
            entityLabel="estudiante"
          />
          <StudentProfileUpdateForm
            selectedSchool={selectedSchool}
            availableSchools={schools}
            lockSchool={schools.length === 1}
            studentProfileData={data}
          />
        </>
      )}
      entityName={STUDENT_PROFILE_NAME}
    />
  )
}

export default withAuth(StudentProfileUpdatePage, {
  allowedCapabilities: ['manage_students'],
  logoutDestination: 'dashboard',
})
