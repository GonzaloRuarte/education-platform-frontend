'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import StudentProfileCreateForm from '@/mta_schools/components/StudentProfileCreateForm'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToSchoolList } from '@/mta_schools/hooks'
import { useSchoolOwnSchool } from '@/mta_schools/hooks/state'
import Spinner from '@/shared/components/Spinner'
import CreationPage from '@/shared/pages/CreationPage'

const StudentProfileCreatePage = () => {
  const navigateToSchoolList = useNavigateToSchoolList()
  const ownSchool = useSchoolOwnSchool()

  if (ownSchool === undefined) return <Spinner />

  return (
    <CreationPage
      CreationForm={() => <StudentProfileCreateForm ownSchoolData={ownSchool} />}
      entityName={STUDENT_PROFILE_NAME}
      onCancel={navigateToSchoolList}
    />
  )
}

export default withAuth(StudentProfileCreatePage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
