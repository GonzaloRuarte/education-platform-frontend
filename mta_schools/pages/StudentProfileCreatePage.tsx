'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import StudentProfileCreateForm from '@/mta_schools/components/StudentProfileCreateForm'
import { SCHOOL_NAME, STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToSchoolList } from '@/mta_schools/hooks'
import CreationPage from '@/shared/pages/CreationPage'

const StudentProfileCreatePage = () => {
  const navigateToSchoolList = useNavigateToSchoolList()

  return (
    <CreationPage
      CreationForm={StudentProfileCreateForm}
      entityName={STUDENT_PROFILE_NAME}
      onCancel={navigateToSchoolList}
    />
  )
}

export default withAuth(StudentProfileCreatePage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
