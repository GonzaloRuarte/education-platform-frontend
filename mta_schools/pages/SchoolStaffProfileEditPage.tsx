'use client'

import SchoolStaffProfileUpdateForm from '@/mta_schools/components/SchoolStaffProfileUpdateForm'
import { SCHOOL_STAFF_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useNavigateToSchoolStaffProfileList,
  useSchoolStaffProfileDelete,
  useSchoolStaffProfileDetail,
} from '@/mta_schools/hooks'
import EditionPage from '@/shared/pages/EditionPage'

const SchoolStaffProfileEditPage = () => {
  const navToList = useNavigateToSchoolStaffProfileList()

  return (
    <EditionPage
      EditionForm={SchoolStaffProfileUpdateForm}
      entityName={SCHOOL_STAFF_PROFILE_NAME}
      onExit={navToList}
      useDetail={useSchoolStaffProfileDetail}
      useDelete={useSchoolStaffProfileDelete}
    />
  )
}

export default SchoolStaffProfileEditPage
