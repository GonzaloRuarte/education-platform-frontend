'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import StudentProfileUpdateForm from '@/mta_schools/components/StudentProfileUpdateForm'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToStudentProfileList, useStudentProfileDetail } from '@/mta_schools/hooks'
import { useSchoolOwnSchool } from '@/mta_schools/hooks/state'
import Spinner from '@/shared/components/Spinner'
import EditionPage from '@/shared/pages/EditionPage'

const StudentProfileUpdatePage = () => {
  const navToList = useNavigateToStudentProfileList()
  const ownSchool = useSchoolOwnSchool()

  if (ownSchool === undefined) return <Spinner />

  return (
    <EditionPage
      onExit={navToList}
      useDetail={useStudentProfileDetail}
      EditionForm={({ data }) => <StudentProfileUpdateForm ownSchoolData={ownSchool} studentProfileData={data} />}
      entityName={STUDENT_PROFILE_NAME}
    />
  )
}

export default withAuth(StudentProfileUpdatePage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
