'use client'

import SchoolStaffProfileCreateForm from '@/mta_schools/components/SchoolStaffProfileCreateForm'
import { SCHOOL_STAFF_PROFILE_NAME, STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import { useNavigateToSchoolList, useNavigateToSchoolStaffProfileList } from '@/mta_schools/hooks'
import CreationPage from '@/shared/pages/CreationPage'

const SchoolStaffProfileCreatePage = () => {
  const navToList = useNavigateToSchoolStaffProfileList()

  return (
    <CreationPage
      CreationForm={SchoolStaffProfileCreateForm}
      entityName={SCHOOL_STAFF_PROFILE_NAME}
      onCancel={navToList}
    />
  )
}

export default SchoolStaffProfileCreatePage
