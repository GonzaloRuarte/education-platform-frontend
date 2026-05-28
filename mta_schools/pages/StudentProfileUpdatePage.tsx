'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToStudentProfileList, useStudentProfileDetail, useStudentProfileUpdate } from '@/mta_schools/hooks'
import ResourceEditionPage from '@/shared/resources/ResourceEditionPage'

const StudentProfileUpdatePage = () => {
  const navToList = useNavigateToStudentProfileList()

  return (
    <ResourceEditionPage
      resourceKey="student_profile"
      entityName={STUDENT_PROFILE_NAME}
      useDetail={useStudentProfileDetail}
      useUpdate={useStudentProfileUpdate}
      onExit={navToList}
    />
  )
}

export default withAuth(StudentProfileUpdatePage, {
  allowedCapabilities: ['manage_students'],
  logoutDestination: 'dashboard',
})
