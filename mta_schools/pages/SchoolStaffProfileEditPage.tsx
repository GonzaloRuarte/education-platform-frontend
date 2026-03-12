'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import SelectedSchoolMismatchAlert from '@/mta_schools/components/SelectedSchoolMismatchAlert'
import SchoolStaffProfileUpdateForm from '@/mta_schools/components/SchoolStaffProfileUpdateForm'
import { SCHOOL_STAFF_PROFILE_NAME } from '@/mta_schools/constants'
import {
  useNavigateToSchoolStaffProfileList,
  useSchoolStaffProfileDelete,
  useSchoolStaffProfileDetail,
} from '@/mta_schools/hooks'
import { I_SchoolStaffProfileDetail, T_SchoolStaffProfileId } from '@/mta_schools/types'
import { useNavigateToUserChangePassword } from '@/mta_users/hooks'
import { ChangePasswordButton } from '@/shared/components/buttons'
import EditionPage from '@/shared/pages/EditionPage'

const SchoolStaffProfileEditPage = () => {
  const navToList = useNavigateToSchoolStaffProfileList()
  const navigateToChangePassword = useNavigateToUserChangePassword()

  return (
    <EditionPage<T_SchoolStaffProfileId, I_SchoolStaffProfileDetail>
      EditionForm={(dataProps) => (
        <>
          <SelectedSchoolMismatchAlert
            entitySchool={{ id: dataProps.data.school_id, name: dataProps.data.school_name }}
            entityLabel="responsable institucional"
          />
          <SchoolStaffProfileUpdateForm {...dataProps} />
        </>
      )}
      entityName={SCHOOL_STAFF_PROFILE_NAME}
      onExit={navToList}
      useDetail={useSchoolStaffProfileDetail}
      useDelete={useSchoolStaffProfileDelete}
      customButtons={(data) => <ChangePasswordButton onClick={() => navigateToChangePassword({ userId: data.user_id })} />}
    />
  )
}

export default withAuth(SchoolStaffProfileEditPage, {
  allowedCapabilities: ['manage_school_staff'],
  logoutDestination: 'dashboard',
})
